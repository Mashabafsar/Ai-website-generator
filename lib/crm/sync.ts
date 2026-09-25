// Outbox job handlers.
//
// Every handler reads current database state at run time instead of trusting a
// payload captured at queue time. That is what keeps an old job from undoing
// newer work: a contact sync queued before a purchase still pushes the
// latest name and website URL, because it looks them up when it runs.

import type { CrmOutbox } from "@prisma/client";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { PackageType } from "@/lib/constants";
import { publicSiteUrl } from "@/lib/deployment/url";
import { parseQuestionnaireAnswers } from "@/lib/questionnaire/schema";
import { CrmJobKind } from "@/lib/crm/config";
import { drainCrmOutbox } from "@/lib/crm/outbox";
import {
  associateDealWithContact,
  isHubSpotConfigured,
  splitDealDescription,
  upsertContact,
  upsertDealNote,
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

/** Everything HubSpot should know about an account, read fresh. */
export async function buildContactSnapshot(userId: string): Promise<ContactSnapshot | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      project: { include: { questionnaire: true, deployment: true } },
    },
  });
  if (!user?.email) return null;

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

  return {
    email: user.email,
    firstName,
    lastName,
    company: project?.businessName || undefined,
    phone,
    website: project ? projectUrl(project.id, project.deployment) : undefined,
  };
}

/** Push an account's contact record and cache the HubSpot id we got back. */
export async function syncContact(userId: string): Promise<string | null> {
  const snapshot = await buildContactSnapshot(userId);
  if (!snapshot) return null;

  const profile = await prisma.crmProfile.findUnique({ where: { userId } });
  const contactId = await upsertContact(snapshot, profile?.hubspotContactId);
  if (contactId) await markContactSynced(userId, contactId);
  return contactId;
}

/**
 * Push a website purchase as a deal associated with the buyer's contact.
 *
 * Amount and breakdown come from the snapshot taken when the payment was
 * confirmed, not from the current quote, so later edits to the project can't
 * rewrite the price the customer was actually charged.
 */
export async function syncPurchaseDeal(paymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      project: {
        include: { user: true, quote: true, deployment: true },
      },
    },
  });
  if (!payment?.project?.user) return;

  const { project } = payment;
  const contactId = await syncContact(project.userId);

  const amount =
    payment.amountCents != null ? payment.amountCents / 100 : payment.amount;
  const lineItems = safeLineItems(payment.breakdown ?? project.quote?.lineItems);
  const monthlyTotal =
    payment.packageType === PackageType.MANAGED_HOSTING
      ? project.quote?.monthlyTotal ?? 0
      : 0;

  const deal: PurchaseDealSnapshot = {
    paymentId: payment.id,
    projectId: project.id,
    dealName: `${project.businessName} — website`,
    amount,
    currency: payment.currency,
    websiteUrl: projectUrl(project.id, project.deployment),
    lineItems,
    monthlyTotal,
  };

  const { description, overflowBody } = splitDealDescription(deal);
  const dealId = await upsertPurchaseDeal(deal, payment.hubspotDealId, description);
  if (!dealId) return;

  let noteId = payment.hubspotNoteId;
  if (overflowBody) {
    noteId = await upsertDealNote({
      dealId,
      body: overflowBody,
      knownNoteId: payment.hubspotNoteId,
    });
  }

  if (dealId !== payment.hubspotDealId || noteId !== payment.hubspotNoteId) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        hubspotDealId: dealId,
        ...(noteId ? { hubspotNoteId: noteId } : {}),
      },
    });
  }

  if (contactId) {
    await associateDealWithContact(dealId, contactId);
  }
}

async function handleCrmJob(job: CrmOutbox): Promise<void> {
  switch (job.kind) {
    case CrmJobKind.CONTACT_SYNC:
      if (job.userId) await syncContact(job.userId);
      return;
    case CrmJobKind.PURCHASE_DEAL:
      if (job.paymentId) await syncPurchaseDeal(job.paymentId);
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
  void runCrmOutbox(limit).catch((err) => {
    console.error("[crm] immediate drain failed:", err instanceof Error ? err.message : err);
  });
}
