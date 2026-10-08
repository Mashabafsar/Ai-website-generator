// Outbox job handlers.
//
// Every handler reads current database state at run time instead of trusting a
// payload captured at queue time. That is what keeps an old job from undoing
// newer work: a contact sync queued before a purchase still pushes the
// latest name and website URL, because it looks them up when it runs.

import type { CrmOutbox } from "@prisma/client";
import { after } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  CREDIT_PACKS,
  CreditLedgerReason,
  PackageType,
  PAID_PROJECT_STATUSES,
  PaymentStatus,
  PaymentType,
  ProjectStatus,
} from "@/lib/constants";
import { publicSiteUrl } from "@/lib/deployment/url";
import { parseQuestionnaireAnswers } from "@/lib/questionnaire/schema";
import { CrmJobKind, computeCombinedScore, resolveDealStage } from "@/lib/crm/config";
import { drainCrmOutbox, enqueueCrmJob } from "@/lib/crm/outbox";
import {
  associateContactWithCompany,
  associateDealWithCompany,
  associateDealWithContact,
  associateDealWithLead,
  formatDealName,
  formatProgressNote,
  isHubSpotConfigured,
  splitDealDescription,
  upsertCompany,
  upsertContact,
  upsertContactNote,
  upsertDealNote,
  upsertLead,
  upsertPurchaseDeal,
  type ContactSnapshot,
  type PurchaseDealSnapshot,
} from "@/lib/crm/hubspot";

type QuoteLineItem = { name: string; amount: number };

function splitName(fullName: string): { firstName: string; lastName?: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "" };
  if (parts.length === 1) return { firstName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/** The live site if it has one, otherwise the preview the customer is working in. */
function projectUrl(
  projectId: string,
  deployment: { subdomain: string | null; liveUrl: string | null } | null
): string {
  return (
    publicSiteUrl(deployment) ??
    `${env.appUrl.replace(/\/$/, "")}/app/project/${projectId}/preview`
  );
}

function safeLineItems(json: string | null | undefined): QuoteLineItem[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as QuoteLineItem[]) : [];
  } catch {
    return [];
  }
}

/** Hostname only when it looks like a real customer site, not our preview host. */
function companyDomainFromUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "");
    if (!host || host.includes("localhost") || host.endsWith(".vercel.app")) return undefined;
    const appHost = (() => {
      try {
        return new URL(env.appUrl).hostname.replace(/^www\./i, "");
      } catch {
        return "";
      }
    })();
    if (appHost && (host === appHost || host.endsWith(`.${appHost}`))) return undefined;
    return host;
  } catch {
    return undefined;
  }
}

/** Every paid credit pack for this account, priced from the catalog. */
async function creditPackLineItems(userId: string): Promise<QuoteLineItem[]> {
  const purchases = await prisma.creditLedger.findMany({
    where: { userId, reason: CreditLedgerReason.PURCHASE },
    orderBy: { createdAt: "asc" },
    select: { amount: true },
  });
  return purchases.map((entry) => {
    const pack = CREDIT_PACKS.find((p) => p.credits === entry.amount);
    return {
      name: pack
        ? `${pack.label} credit pack (${pack.credits} credits)`
        : `Credit pack (${entry.amount} credits)`,
      amount: pack?.priceUsd ?? 0,
    };
  });
}

/**
 * Queue a deal sync for an account. One pending job per user — the worker
 * rebuilds the deal from current questionnaire + every paid amount.
 */
export async function enqueueDealSyncForUser(userId: string, projectId?: string | null): Promise<void> {
  await enqueueCrmJob({
    kind: CrmJobKind.PURCHASE_DEAL,
    userId,
    projectId: projectId ?? null,
    dedupeKey: `${CrmJobKind.PURCHASE_DEAL}:${userId}`,
  });
}

/** @deprecated Prefer enqueueDealSyncForUser — kept as an alias for credit-pack callers. */
export async function enqueueDealRefreshForUser(userId: string): Promise<void> {
  await enqueueDealSyncForUser(userId);
}

function projectDetailsFromAnswers(
  answers: ReturnType<typeof parseQuestionnaireAnswers>,
  fallback: { businessName: string; email?: string | null }
): PurchaseDealSnapshot["projectDetails"] {
  return {
    businessName: answers.businessName || fallback.businessName,
    industry: answers.industry,
    description: answers.description,
    location: answers.location || undefined,
    targetAudience: answers.targetAudience,
    demographics: answers.demographics,
    goals: answers.goals,
    services: answers.services,
    tone: answers.tone || undefined,
    visualStyle: answers.visualStyle || undefined,
    colorPreference: answers.colorPreference || undefined,
    brandingNotes: answers.brandingNotes || undefined,
    contactEmail: answers.contactEmail || fallback.email || undefined,
    contactPhone: answers.contactPhone || undefined,
    existingWebsiteUrl:
      answers.hasWebsite === "yes" ? answers.existingWebsiteUrl || undefined : undefined,
  };
}

/**
 * Create or update the HubSpot deal for an account.
 *
 * Opens when the questionnaire is saved. Amount is every credit pack plus the
 * website package once paid. Name is `Company $Amount`. Stage advances on
 * pipeline `941017774`: Preview Generated → Content Generation → Credit Bought
 * → Quotation Generated → Closed Won (website paid).
 */
export async function syncAccountDeal(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      project: {
        include: {
          quote: true,
          deployment: true,
          questionnaire: true,
        },
      },
    },
  });
  if (!user?.project) return;

  const { project } = user;
  if (!project.questionnaire) return;

  const contactId = await syncContact(userId);
  const profile = await prisma.crmProfile.findUnique({
    where: { userId },
    select: {
      hubspotLeadId: true,
      hubspotDealId: true,
      hubspotDealNoteId: true,
    },
  });

  const websitePayment = await prisma.payment.findFirst({
    where: {
      projectId: project.id,
      type: PaymentType.WEBSITE_PACKAGE,
      status: PaymentStatus.PAID,
    },
    orderBy: { createdAt: "desc" },
  });

  let projectDetails: PurchaseDealSnapshot["projectDetails"];
  try {
    const answers = parseQuestionnaireAnswers(project.questionnaire.answers);
    projectDetails = projectDetailsFromAnswers(answers, {
      businessName: project.businessName,
      email: user.email,
    });
  } catch {
    projectDetails = {
      businessName: project.businessName,
      contactEmail: user.email || undefined,
    };
  }

  const creditLineItems = await creditPackLineItems(userId);
  const creditTotal = creditLineItems.reduce((sum, item) => sum + item.amount, 0);

  let websiteAmount = 0;
  let websiteLineItems: QuoteLineItem[] = [];
  let monthlyTotal = 0;
  let packageLabel: string | undefined;
  let quotedWebsiteTotal: number | undefined;

  if (websitePayment) {
    // Prefer Stripe's settled cents when present; `amount` is the quote dollars
    // frozen at checkout and can differ from what was actually charged.
    websiteAmount =
      websitePayment.amountCents != null && websitePayment.amountCents > 0
        ? websitePayment.amountCents / 100
        : websitePayment.amount;
    websiteLineItems = safeLineItems(websitePayment.breakdown ?? project.quote?.lineItems);
    if (websiteLineItems.length === 0 && websiteAmount > 0) {
      websiteLineItems = [{ name: "Website package", amount: websiteAmount }];
    }
    monthlyTotal =
      websitePayment.packageType === PackageType.MANAGED_HOSTING
        ? project.quote?.monthlyTotal ?? 0
        : 0;
    packageLabel =
      websitePayment.packageType === PackageType.MANAGED_HOSTING
        ? "Managed hosting"
        : websitePayment.packageType === PackageType.SELF_HOSTING
          ? "Self hosting"
          : websitePayment.packageType || undefined;
  } else if (project.quote) {
    quotedWebsiteTotal = project.quote.oneTimeTotal;
    packageLabel =
      // Quote stores package on payment usually; businessName path — check quote fields
      undefined;
  }

  const amount = websiteAmount + creditTotal;
  const lineItems = [...websiteLineItems, ...creditLineItems];
  const closedWon = Boolean(websitePayment);
  const hasGeneratedContent = Boolean(
    project.blueprint ||
      project.assembledPages ||
      project.status === ProjectStatus.GENERATED ||
      project.status === ProjectStatus.QUOTED ||
      PAID_PROJECT_STATUSES.has(project.status)
  );
  const dealStage = resolveDealStage({
    websitePaid: closedWon,
    hasQuote: Boolean(project.quote),
    hasCreditPurchase: creditLineItems.length > 0,
    hasGeneratedContent,
  });
  const businessName = projectDetails?.businessName || project.businessName;
  const currency = websitePayment?.currency || project.quote?.currency || "USD";

  const scoreEvents = await prisma.crmScoreEvent.findMany({
    where: { userId },
    select: { action: true, points: true },
  });
  const combined = computeCombinedScore(scoreEvents);

  // Prefer the profile-cached deal id; fall back to an older payment-cached id.
  const knownDealId = profile?.hubspotDealId || websitePayment?.hubspotDealId || null;
  const knownNoteId = profile?.hubspotDealNoteId || websitePayment?.hubspotNoteId || null;

  const deal: PurchaseDealSnapshot = {
    paymentId: websitePayment?.id,
    projectId: project.id,
    dealName: formatDealName(businessName, amount),
    amount,
    currency,
    websiteUrl: projectUrl(project.id, project.deployment),
    lineItems,
    monthlyTotal,
    packageLabel,
    closedWon,
    closeDate: websitePayment?.createdAt,
    dealStage,
    quotedWebsiteTotal,
    score: {
      combined: combined.combined,
      engagement: combined.engagement,
      fit: combined.fit,
      label: combined.dealLabel,
    },
    projectDetails,
  };

  const { description, overflowBody } = splitDealDescription(deal);
  const dealId = await upsertPurchaseDeal(deal, knownDealId, description);
  if (!dealId) return;

  let noteId = knownNoteId;
  if (overflowBody) {
    noteId = await upsertDealNote({
      dealId,
      body: overflowBody,
      knownNoteId,
    });
  }

  await prisma.crmProfile.upsert({
    where: { userId },
    create: {
      userId,
      hubspotDealId: dealId,
      ...(noteId ? { hubspotDealNoteId: noteId } : {}),
    },
    update: {
      hubspotDealId: dealId,
      ...(noteId ? { hubspotDealNoteId: noteId } : {}),
    },
  });

  // Keep payment-cached ids in sync for admin views that still read them.
  if (websitePayment && (dealId !== websitePayment.hubspotDealId || noteId !== websitePayment.hubspotNoteId)) {
    await prisma.payment.update({
      where: { id: websitePayment.id },
      data: {
        hubspotDealId: dealId,
        ...(noteId ? { hubspotNoteId: noteId } : {}),
      },
    });
  }

  if (contactId) {
    await associateDealWithContact(dealId, contactId);
  }
  if (profile?.hubspotLeadId) {
    await associateDealWithLead(dealId, profile.hubspotLeadId);
  }

  const companyId = await upsertCompany({
    name: businessName,
    domain: companyDomainFromUrl(projectDetails?.existingWebsiteUrl),
  });
  if (companyId) {
    await associateDealWithCompany(dealId, companyId);
    if (contactId) {
      await associateContactWithCompany(contactId, companyId);
    }
  }
}

/** Resolve a legacy payment-scoped job onto the account deal sync. */
export async function syncPurchaseDeal(paymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { project: { select: { userId: true } } },
  });
  if (!payment?.project?.userId) return;
  await syncAccountDeal(payment.project.userId);
}

async function markContactSynced(userId: string, contactId: string): Promise<void> {
  await prisma.crmProfile.upsert({
    where: { userId },
    create: {
      userId,
      hubspotContactId: contactId,
      hubspotLastSyncedAt: new Date(),
      hubspotLastError: null,
    },
    update: {
      hubspotContactId: contactId,
      hubspotLastSyncedAt: new Date(),
      hubspotLastError: null,
    },
  });
}

/** RFC 2606 test domains. HubSpot rejects them as invalid emails, forever. */
const RESERVED_EMAIL_TLD = /\.(test|example|invalid|localhost)$/i;

/** Everything HubSpot should know about an account, read fresh. */
export async function buildContactSnapshot(userId: string): Promise<ContactSnapshot | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      project: { include: { questionnaire: true, deployment: true } },
    },
  });
  if (!user?.email || RESERVED_EMAIL_TLD.test(user.email)) return null;

  const project = user.project;
  let phone: string | undefined;
  if (project?.questionnaire) {
    try {
      const answers = parseQuestionnaireAnswers(project.questionnaire.answers);
      phone = answers.contactPhone?.trim() || undefined;
    } catch {
      // The questionnaire is optional colour for the CRM row, never required.
    }
  }

  const { firstName, lastName } = splitName(user.name || user.email.split("@")[0]);

  const paidWebsite = project
    ? await prisma.payment.findFirst({
        where: {
          projectId: project.id,
          type: PaymentType.WEBSITE_PACKAGE,
          status: PaymentStatus.PAID,
        },
        select: { id: true },
      })
    : null;

  return {
    email: user.email,
    firstName,
    lastName,
    company: project?.businessName || undefined,
    phone,
    website: project ? projectUrl(project.id, project.deployment) : undefined,
    lifecycleStage: paidWebsite ? "customer" : "lead",
  };
}

/**
 * Write each unsynced scoring step onto the contact as a HubSpot note so the
 * timeline shows login +5, questionnaire +15, and so on, in order.
 */
export async function syncProgressNotes(userId: string, contactId: string): Promise<void> {
  const events = await prisma.crmScoreEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  let running = 0;
  for (const event of events) {
    running += event.points;
    if (event.hubspotNoteId) continue;

    const noteId = await upsertContactNote({
      contactId,
      body: formatProgressNote({
        action: event.action,
        points: event.points,
        total: running,
      }),
      timestamp: event.createdAt,
    });
    if (noteId) {
      await prisma.crmScoreEvent.update({
        where: { id: event.id },
        data: { hubspotNoteId: noteId },
      });
    }
  }
}

/** Push an account's contact record, its lead, then each new progress note. */
export async function syncContact(userId: string): Promise<string | null> {
  const snapshot = await buildContactSnapshot(userId);
  if (!snapshot) return null;

  const profile = await prisma.crmProfile.findUnique({ where: { userId } });
  const contactId = await upsertContact(snapshot, profile?.hubspotContactId);
  if (contactId) {
    await markContactSynced(userId, contactId);
    await syncLead(userId, contactId, snapshot, profile?.hubspotLeadId);
    await syncProgressNotes(userId, contactId);
  }
  return contactId;
}

/** Keep the HubSpot lead's name, score label, and stage in step with the account. */
async function syncLead(
  userId: string,
  contactId: string,
  contact: ContactSnapshot,
  knownLeadId: string | null | undefined
): Promise<void> {
  const events = await prisma.crmScoreEvent.findMany({
    where: { userId },
    select: { action: true, points: true },
  });
  const combined = computeCombinedScore(events);
  // Persist the HubSpot-capped combined score so admin and HubSpot stay aligned.
  await prisma.crmProfile.upsert({
    where: { userId },
    create: { userId, leadScore: combined.combined },
    update: { leadScore: combined.combined },
  });

  const personName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
  const displayName = contact.company ? `${personName} (${contact.company})` : personName;

  const leadId = await upsertLead(
    {
      contactId,
      displayName: displayName || contact.email,
      score: combined.combined,
      closedWon: contact.lifecycleStage === "customer",
    },
    knownLeadId
  );
  if (leadId && leadId !== knownLeadId) {
    await prisma.crmProfile.update({ where: { userId }, data: { hubspotLeadId: leadId } });
  }
}

async function handleCrmJob(job: CrmOutbox): Promise<void> {
  switch (job.kind) {
    case CrmJobKind.CONTACT_SYNC:
      if (job.userId) await syncContact(job.userId);
      return;
    case CrmJobKind.PURCHASE_DEAL:
      if (job.userId) {
        await syncAccountDeal(job.userId);
      } else if (job.paymentId) {
        await syncPurchaseDeal(job.paymentId);
      }
      return;
    default:
      throw new Error(`Unknown CRM job kind: ${job.kind}`);
  }
}

/** Drain the queue. Used by both the cron route and the post-response nudge. */
export async function runCrmOutbox(limit?: number) {
  if (!isHubSpotConfigured()) {
    return { processed: 0, failed: 0, skipped: 0, disabled: true as const };
  }
  const result = await drainCrmOutbox({ handler: handleCrmJob, limit });
  return { ...result, disabled: false as const };
}

/**
 * Best-effort drain for right after a response is sent, so a healthy HubSpot
 * syncs in seconds instead of waiting for the next cron tick. Failures are
 * swallowed; the queue rows survive and the cron picks them up.
 */
export function scheduleCrmDrain(limit = 5): void {
  const drain = () =>
    runCrmOutbox(limit).then(
      () => undefined,
      (err) => {
        console.error("[crm] immediate drain failed:", err instanceof Error ? err.message : err);
      }
    );

  // A promise nobody awaits is frozen with the serverless function once the
  // response is sent, so the drain has to be registered with `after`.
  try {
    after(drain);
  } catch {
    // Outside a request scope (scripts, tests) there is nothing to extend.
    void drain();
  }
}
