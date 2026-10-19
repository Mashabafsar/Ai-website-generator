// HubSpot CRM service. Every call the app makes to HubSpot goes through here.
//
// Two rules hold throughout: the local database is the source of truth and
// HubSpot is a mirror, and nothing in this file is allowed to decide whether a
// user flow succeeds. Callers enqueue work (see outbox.ts) rather than calling
// these functions inline.
//
// Only HubSpot standard properties are written. Lead score, marketing consent,
// and scoring history stay in Postgres.

import { env } from "@/lib/env";
import {
  CONTACT_ANALYTICS_SOURCE,
  CONTACT_TO_COMPANY_ASSOCIATION_TYPE_ID,
  DEAL_PIPELINE_ID,
  DEAL_TO_COMPANY_ASSOCIATION_TYPE_ID,
  DEAL_TO_CONTACT_ASSOCIATION_TYPE_ID,
  DEAL_TO_LEAD_ASSOCIATION_TYPE_ID,
  DealStage,
  LEAD_CLOSED_WON_STAGE_LABEL,
  LEAD_NEW_STAGE_LABEL,
  LEAD_TO_PRIMARY_CONTACT_ASSOCIATION_TYPE_ID,
  LEAD_TYPE_NEW_BUSINESS,
  NOTE_TO_CONTACT_ASSOCIATION_TYPE_ID,
  NOTE_TO_DEAL_ASSOCIATION_TYPE_ID,
  leadLabel,
  scoreActionLabel,
} from "@/lib/crm/config";
import {
  HubSpotError,
  associationListPath,
  associationPath,
  hubspotRequest,
  isHubSpotConfigured,
  objectPath,
  pipelinesPath,
} from "@/lib/crm/hubspot-client";

export type ContactSnapshot = {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  website?: string;
  /** Standard HubSpot lifecycle. Login drops a lead; a website purchase makes them a customer. */
  lifecycleStage?: "lead" | "customer";
};

export type PurchaseDealSnapshot = {
  /** Present once a website package payment exists. */
  paymentId?: string;
  projectId: string;
  dealName: string;
  /** Sum of every amount the customer has actually paid (credits + website). */
  amount: number;
  currency: string;
  websiteUrl: string;
  lineItems: { name: string; amount: number }[];
  monthlyTotal?: number;
  /** Self-hosting or managed hosting label, once chosen. */
  packageLabel?: string;
  /** True only after the website package is paid — moves the deal to Closed Won. */
  closedWon: boolean;
  /**
   * Stable close timestamp (website payment time). Reused on every Closed Won
   * refresh so later credit packs do not rewrite `closedate` to "now".
   */
  closeDate?: Date;
  /**
   * HubSpot `dealstage` id on pipeline `941017774` (or `HUBSPOT_DEAL_PIPELINE`).
   * Resolved from questionnaire → generate → credits → quote → website paid.
   */
  dealStage: string;
  /** Quoted website total before payment; shown in the description, not in amount. */
  quotedWebsiteTotal?: number;
  /**
   * HubSpot-style combined deal score (engagement + fit with group limits).
   * Threshold label uses A1–C3 (letter = fit, number = engagement).
   */
  score?: {
    combined: number;
    engagement: number;
    fit: number;
    label: string;
  };
  /** Everything the customer entered for this website project. */
  projectDetails?: {
    businessName?: string;
    industry?: string;
    description?: string;
    location?: string;
    targetAudience?: string;
    demographics?: string;
    goals?: string;
    services?: string[];
    tone?: string;
    visualStyle?: string;
    colorPreference?: string;
    brandingNotes?: string;
    contactEmail?: string;
    contactPhone?: string;
    existingWebsiteUrl?: string;
  };
};

type HubSpotRecord = { id?: string };

/** Conservative cap under HubSpot's textarea limit so a huge quote still fits. */
export const DEAL_DESCRIPTION_MAX_CHARS = 60_000;

/**
 * Deal title syntax: `Company $Amount` (e.g. "Frontier Logistics $7659").
 * Amount is whole dollars with no thousands separator, matching HubSpot sales deals.
 */
export function formatDealName(companyName: string, amount: number): string {
  const name = companyName.trim() || "Website";
  const dollars = Math.round(Number.isFinite(amount) ? amount : 0);
  return `${name} $${dollars}`;
}

export function formatPriceBreakdown(deal: PurchaseDealSnapshot): string {
  const currency = deal.currency.toUpperCase();
  const lines: string[] = [];
  if (deal.quotedWebsiteTotal != null && deal.quotedWebsiteTotal > 0 && !deal.closedWon) {
    lines.push(`Quoted website package (unpaid): ${deal.quotedWebsiteTotal} ${currency}`);
  }
  for (const item of deal.lineItems) {
    lines.push(`${item.name}: ${item.amount} ${currency}`);
  }
  if (deal.lineItems.length === 0 && deal.amount === 0) {
    lines.push("No payments yet.");
  } else {
    lines.push(`Total paid: ${deal.amount} ${currency}`);
  }
  if (deal.monthlyTotal && deal.monthlyTotal > 0) {
    lines.push(`Recurring: ${deal.monthlyTotal} ${currency}/month`);
  }
  return lines.join("\n");
}

function line(label: string, value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? `${label}: ${trimmed}` : null;
}

/** Questionnaire and delivery facts for the deal description. */
export function formatProjectDetails(deal: PurchaseDealSnapshot): string {
  const details = deal.projectDetails;
  if (!details) return "";
  const lines = [
    line("Business", details.businessName),
    line("Industry", details.industry),
    line("Description", details.description),
    line("Location", details.location),
    line("Audience", details.targetAudience),
    line("Who they help", details.demographics),
    line("Website goals", details.goals),
    details.services?.length ? `Services: ${details.services.join(", ")}` : null,
    line("Tone", details.tone),
    line("Visual style", details.visualStyle),
    line("Colors", details.colorPreference),
    line("Branding notes", details.brandingNotes),
    line("Contact email", details.contactEmail),
    line("Contact phone", details.contactPhone),
    line("Existing website", details.existingWebsiteUrl),
    line("Package", deal.packageLabel),
  ].filter(Boolean);
  return lines.join("\n");
}

/** HubSpot-style deal score block for the description. */
export function formatDealScore(deal: PurchaseDealSnapshot): string {
  const score = deal.score;
  if (!score) return "";
  return [
    `Deal score: ${score.combined} (${score.label})`,
    `Fit: ${score.fit} / Engagement: ${score.engagement}`,
  ].join("\n");
}

export function formatDealDescription(deal: PurchaseDealSnapshot): string {
  const sections = [
    `Website: ${deal.websiteUrl}`,
    formatDealScore(deal),
    formatProjectDetails(deal),
    formatPriceBreakdown(deal),
  ].filter(Boolean);
  return sections.join("\n\n");
}

export function splitDealDescription(
  deal: PurchaseDealSnapshot,
  maxChars = DEAL_DESCRIPTION_MAX_CHARS
): { description: string; overflowBody: string | null } {
  const full = formatDealDescription(deal);
  if (full.length <= maxChars) {
    return { description: full, overflowBody: null };
  }
  const currency = deal.currency.toUpperCase();
  // Keep score + total on the deal itself when the questionnaire overflows
  // onto a note — operators open the description field first.
  const scoreLine = formatDealScore(deal);
  const description = [
    `Website: ${deal.websiteUrl}`,
    scoreLine,
    `Amount paid: ${deal.amount} ${currency}`,
    "Full project details and itemized breakdown attached as a note.",
  ]
    .filter(Boolean)
    .join("\n");
  return { description, overflowBody: full };
}

/**
 * Look up a contact by email address.
 *
 * Uses the read-by-unique-property endpoint rather than the search API: search
 * is eventually consistent, so a contact created moments earlier can be missing
 * from its results and produce a duplicate.
 */
export async function findContactIdByEmail(email: string): Promise<string | null> {
  const path = `${objectPath("contacts", encodeURIComponent(email))}?idProperty=email&properties=email`;
  try {
    const found = await hubspotRequest<HubSpotRecord>(path, { method: "GET" });
    return found?.id ?? null;
  } catch (err) {
    if (err instanceof HubSpotError && err.status === 404) return null;
    throw err;
  }
}

function contactProperties(contact: ContactSnapshot): Record<string, string> {
  const properties: Record<string, string> = {
    email: contact.email,
    // API creates default to Offline Sources; attribute signups as Direct Traffic.
    hs_analytics_source: CONTACT_ANALYTICS_SOURCE,
  };
  if (contact.firstName) properties.firstname = contact.firstName;
  if (contact.lastName) properties.lastname = contact.lastName;
  if (contact.company) properties.company = contact.company;
  if (contact.phone) properties.phone = contact.phone;
  if (contact.website) properties.website = contact.website;
  if (contact.lifecycleStage) properties.lifecyclestage = contact.lifecycleStage;
  return properties;
}

export function formatProgressNote(params: {
  action: string;
  points: number;
  total: number;
}): string {
  return [
    scoreActionLabel(params.action),
    `+${params.points} points`,
    `Lead score: ${params.total}`,
  ].join("\n");
}

/**
 * Create or update the contact for an account and return its HubSpot id.
 *
 * `knownContactId` skips the lookup when we have already cached the id. If that
 * cached id has since been deleted or merged away in HubSpot, the 404 is
 * absorbed and the contact is resolved by email instead.
 */
export async function upsertContact(
  contact: ContactSnapshot,
  knownContactId?: string | null
): Promise<string | null> {
  const properties = contactProperties(contact);

  if (knownContactId) {
    try {
      await hubspotRequest(objectPath("contacts", knownContactId), {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      });
      return knownContactId;
    } catch (err) {
      const gone = err instanceof HubSpotError && (err.status === 404 || err.status === 400);
      if (!gone) throw err;
    }
  }

  const existingId = await findContactIdByEmail(contact.email);
  if (existingId) {
    await hubspotRequest(objectPath("contacts", existingId), {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    return existingId;
  }

  try {
    const created = await hubspotRequest<HubSpotRecord>(objectPath("contacts"), {
      method: "POST",
      body: JSON.stringify({ properties }),
    });
    return created?.id ?? null;
  } catch (err) {
    // The webhook and the checkout-return reconcile can both get here at once.
    // HubSpot rejects the loser with 409 because email is unique, so re-resolve
    // and update the contact the winner just created instead of failing.
    if (err instanceof HubSpotError && err.status === 409) {
      const raced = await findContactIdByEmail(contact.email);
      if (raced) {
        await hubspotRequest(objectPath("contacts", raced), {
          method: "PATCH",
          body: JSON.stringify({ properties }),
        });
        return raced;
      }
    }
    throw err;
  }
}

function dealProperties(
  deal: PurchaseDealSnapshot,
  description: string
): Record<string, string> {
  const properties: Record<string, string> = {
    dealname: deal.dealName,
    amount: String(deal.amount),
    description,
    pipeline: env.hubspot.dealPipeline || DEAL_PIPELINE_ID,
    dealstage: deal.dealStage || DealStage.PREVIEW_GENERATED,
  };
  if (deal.closedWon || deal.dealStage === DealStage.CLOSED_WON) {
    properties.closedate = (deal.closeDate ?? new Date()).toISOString();
  }
  return properties;
}

/**
 * Create or update the deal for a website purchase.
 *
 * Dedupes on the HubSpot id we cached in Postgres — we do not stamp a custom
 * payment-id property on the deal.
 */
export async function upsertPurchaseDeal(
  deal: PurchaseDealSnapshot,
  knownDealId?: string | null,
  description?: string
): Promise<string | null> {
  const resolvedDescription = description ?? splitDealDescription(deal).description;
  const properties = dealProperties(deal, resolvedDescription);

  if (knownDealId) {
    try {
      await hubspotRequest(objectPath("deals", knownDealId), {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      });
      return knownDealId;
    } catch (err) {
      const gone = err instanceof HubSpotError && (err.status === 404 || err.status === 400);
      if (!gone) throw err;
    }
  }

  const created = await hubspotRequest<HubSpotRecord>(objectPath("deals"), {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
  return created?.id ?? null;
}

/**
 * Create or update a note on a deal. Used when the itemized breakdown does
 * not fit in the standard description field.
 */
export async function upsertDealNote(params: {
  dealId: string;
  body: string;
  knownNoteId?: string | null;
}): Promise<string | null> {
  const properties = {
    hs_timestamp: new Date().toISOString(),
    hs_note_body: params.body,
  };

  if (params.knownNoteId) {
    try {
      await hubspotRequest(objectPath("notes", params.knownNoteId), {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      });
      return params.knownNoteId;
    } catch (err) {
      const gone = err instanceof HubSpotError && (err.status === 404 || err.status === 400);
      if (!gone) throw err;
    }
  }

  const created = await hubspotRequest<HubSpotRecord>(objectPath("notes"), {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
  const noteId = created?.id ?? null;
  if (noteId) {
    await associateNoteWithDeal(noteId, params.dealId);
  }
  return noteId;
}

/**
 * Create a progress note on a contact. Used so each scoring step shows up on
 * the HubSpot timeline without custom properties.
 */
export async function upsertContactNote(params: {
  contactId: string;
  body: string;
  timestamp?: Date;
  knownNoteId?: string | null;
}): Promise<string | null> {
  const properties = {
    hs_timestamp: (params.timestamp ?? new Date()).toISOString(),
    hs_note_body: params.body,
  };

  if (params.knownNoteId) {
    try {
      await hubspotRequest(objectPath("notes", params.knownNoteId), {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      });
      return params.knownNoteId;
    } catch (err) {
      const gone = err instanceof HubSpotError && (err.status === 404 || err.status === 400);
      if (!gone) throw err;
    }
  }

  const created = await hubspotRequest<HubSpotRecord>(objectPath("notes"), {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
  const noteId = created?.id ?? null;
  if (noteId) {
    await associateNoteWithContact(noteId, params.contactId);
  }
  return noteId;
}

export async function associateNoteWithContact(noteId: string, contactId: string): Promise<void> {
  await hubspotRequest(associationPath("notes", noteId, "contacts", contactId), {
    method: "PUT",
    body: JSON.stringify([
      {
        associationCategory: "HUBSPOT_DEFINED",
        associationTypeId: NOTE_TO_CONTACT_ASSOCIATION_TYPE_ID,
      },
    ]),
  });
}

export async function associateNoteWithDeal(noteId: string, dealId: string): Promise<void> {
  await hubspotRequest(associationPath("notes", noteId, "deals", dealId), {
    method: "PUT",
    body: JSON.stringify([
      {
        associationCategory: "HUBSPOT_DEFINED",
        associationTypeId: NOTE_TO_DEAL_ASSOCIATION_TYPE_ID,
      },
    ]),
  });
}

/**
 * Associate a deal with its contact. Uses the associations API version, which
 * is configured separately from the objects version.
 */
export async function associateDealWithContact(
  dealId: string,
  contactId: string
): Promise<void> {
  await hubspotRequest(associationPath("deals", dealId, "contacts", contactId), {
    method: "PUT",
    body: JSON.stringify([
      {
        associationCategory: "HUBSPOT_DEFINED",
        associationTypeId: DEAL_TO_CONTACT_ASSOCIATION_TYPE_ID,
      },
    ]),
  });
}

/** Tie the Closed Won deal back to the HubSpot lead it came from. */
export async function associateDealWithLead(dealId: string, leadId: string): Promise<void> {
  await hubspotRequest(associationPath("deals", dealId, "leads", leadId), {
    method: "PUT",
    body: JSON.stringify([
      {
        associationCategory: "HUBSPOT_DEFINED",
        associationTypeId: DEAL_TO_LEAD_ASSOCIATION_TYPE_ID,
      },
    ]),
  });
}

/** Associate the deal with the business's company record. */
export async function associateDealWithCompany(
  dealId: string,
  companyId: string
): Promise<void> {
  await hubspotRequest(associationPath("deals", dealId, "companies", companyId), {
    method: "PUT",
    body: JSON.stringify([
      {
        associationCategory: "HUBSPOT_DEFINED",
        associationTypeId: DEAL_TO_COMPANY_ASSOCIATION_TYPE_ID,
      },
    ]),
  });
}

/** Associate the contact with the business's company record. */
export async function associateContactWithCompany(
  contactId: string,
  companyId: string
): Promise<void> {
  await hubspotRequest(associationPath("contacts", contactId, "companies", companyId), {
    method: "PUT",
    body: JSON.stringify([
      {
        associationCategory: "HUBSPOT_DEFINED",
        associationTypeId: CONTACT_TO_COMPANY_ASSOCIATION_TYPE_ID,
      },
    ]),
  });
}

/**
 * Find a company by exact name. Prefer this over search-by-domain so a
 * hosted subdomain or preview URL never creates a junk company.
 */
export async function findCompanyIdByName(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  try {
    const found = await hubspotRequest<{ results?: HubSpotRecord[] }>(
      `${objectPath("companies")}/search`,
      {
        method: "POST",
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                { propertyName: "name", operator: "EQ", value: trimmed },
              ],
            },
          ],
          properties: ["name"],
          limit: 1,
        }),
      }
    );
    return found?.results?.[0]?.id ?? null;
  } catch (err) {
    if (err instanceof HubSpotError && err.status === 404) return null;
    throw err;
  }
}

function customerDomain(domain: string | null | undefined): string | undefined {
  const trimmed = domain?.trim();
  if (!trimmed || isPlatformOrLocalHost(trimmed)) return undefined;
  return trimmed;
}

function hostnameOf(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  if (!URL.canParse(candidate)) return null;
  const host = new URL(candidate).hostname.replace(/^www\./i, "").toLowerCase();
  return host || null;
}

/**
 * Localhost and hosts under PLATFORM_DOMAIN belong to us. They must not be
 * stored as a customer's own website domain.
 */
export function isPlatformOrLocalHost(hostOrUrl: string): boolean {
  const host = hostnameOf(hostOrUrl);
  if (!host) return false;
  if (host.includes("localhost")) return true;
  const platform = env.deployment.platformDomain;
  if (!platform) return false;
  return host === platform || host.endsWith(`.${platform}`);
}

/**
 * Create or reuse the HubSpot company for a business name.
 * Domain is optional — only set when it is a real customer website, not a site we host.
 */
export async function upsertCompany(params: {
  name: string;
  domain?: string | null;
  knownCompanyId?: string | null;
}): Promise<string | null> {
  const name = params.name.trim();
  if (!name) return null;

  const properties: Record<string, string> = { name };
  const domain = customerDomain(params.domain);
  if (domain) properties.domain = domain;

  if (params.knownCompanyId) {
    try {
      await hubspotRequest(objectPath("companies", params.knownCompanyId), {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      });
      return params.knownCompanyId;
    } catch (err) {
      const gone = err instanceof HubSpotError && (err.status === 404 || err.status === 400);
      if (!gone) throw err;
    }
  }

  const existingId = await findCompanyIdByName(name);
  if (existingId) {
    await hubspotRequest(objectPath("companies", existingId), {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    return existingId;
  }

  const created = await hubspotRequest<HubSpotRecord>(objectPath("companies"), {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
  return created?.id ?? null;
}

export type LeadSnapshot = {
  contactId: string;
  /** Person or business name shown on the lead board. */
  displayName: string;
  score: number;
  /** A website package has been paid for. */
  closedWon: boolean;
};

export function formatLeadName(lead: Pick<LeadSnapshot, "displayName">): string {
  return lead.displayName;
}

type PipelineStage = { id: string; label: string; displayOrder: number };
type Pipeline = { id: string; label: string; stages?: PipelineStage[]; displayOrder?: number };

let leadPlacement: { pipelineId: string; newStageId: string } | null = null;
let closedWonStageId: string | null = null;

function stageByLabel(stages: PipelineStage[], label: string): PipelineStage | undefined {
  const wanted = label.trim().toLowerCase();
  return stages.find((s) => s.label.trim().toLowerCase() === wanted);
}

/**
 * The portal's lead pipeline and its New stage.
 *
 * Env overrides win when set. Otherwise we ask HubSpot — stage ids are not the
 * same in every portal, and inventing `new-stage-id` creates a contact with no
 * Lead record when HubSpot rejects the create.
 */
export async function resolveLeadNewPlacement(): Promise<{
  pipelineId: string;
  newStageId: string;
}> {
  if (env.hubspot.leadPipeline && env.hubspot.leadNewStage) {
    return { pipelineId: env.hubspot.leadPipeline, newStageId: env.hubspot.leadNewStage };
  }
  if (leadPlacement) return leadPlacement;

  const listed = await hubspotRequest<{ results?: Pipeline[] }>(pipelinesPath("leads"), {
    method: "GET",
  });
  const pipelines = listed?.results ?? [];
  if (!pipelines.length) {
    throw new HubSpotError("HubSpot has no lead pipelines; cannot drop a Lead record");
  }

  const byEnv = env.hubspot.leadPipeline
    ? pipelines.find((p) => p.id === env.hubspot.leadPipeline)
    : undefined;
  const byLabel = pipelines.find((p) => /lead/i.test(p.label));
  const pipeline =
    byEnv ??
    byLabel ??
    [...pipelines].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))[0];

  let stages = pipeline.stages ?? [];
  if (!stages.length) {
    const full = await hubspotRequest<{ stages?: PipelineStage[] }>(
      pipelinesPath("leads", pipeline.id),
      { method: "GET" }
    );
    stages = full?.stages ?? [];
  }
  if (!stages.length) {
    throw new HubSpotError(`Lead pipeline ${pipeline.id} has no stages`);
  }

  const byEnvStage = env.hubspot.leadNewStage
    ? stages.find((s) => s.id === env.hubspot.leadNewStage)
    : undefined;
  const newStage =
    byEnvStage ??
    stageByLabel(stages, LEAD_NEW_STAGE_LABEL) ??
    [...stages].sort((a, b) => a.displayOrder - b.displayOrder)[0];

  leadPlacement = { pipelineId: pipeline.id, newStageId: newStage.id };
  return leadPlacement;
}

/**
 * The lead-pipeline stage a website purchase moves the lead into. HubSpot's
 * built-in lead pipeline has no such stage, so it is created on first use and
 * found by label after that, including by other instances.
 */
export async function resolveLeadClosedWonStage(): Promise<string> {
  if (env.hubspot.leadClosedWonStage) return env.hubspot.leadClosedWonStage;
  if (closedWonStageId) return closedWonStageId;

  const { pipelineId } = await resolveLeadNewPlacement();
  const pipeline = await hubspotRequest<{ stages?: PipelineStage[] }>(
    pipelinesPath("leads", pipelineId),
    { method: "GET" }
  );
  const stages = pipeline?.stages ?? [];
  const existing = stageByLabel(stages, LEAD_CLOSED_WON_STAGE_LABEL);
  if (existing) {
    closedWonStageId = existing.id;
    return existing.id;
  }

  const created = await hubspotRequest<{ id: string }>(
    pipelinesPath("leads", pipelineId, "stages"),
    {
      method: "POST",
      body: JSON.stringify({
        label: LEAD_CLOSED_WON_STAGE_LABEL,
        displayOrder: Math.max(0, ...stages.map((s) => s.displayOrder)) + 1,
        metadata: { isClosed: "true", leadState: "QUALIFIED" },
      }),
    }
  );
  closedWonStageId = created.id;
  return created.id;
}

/** A lead already attached to the contact, so a retried job reuses it. */
async function findLeadIdForContact(contactId: string): Promise<string | null> {
  const found = await hubspotRequest<{ results?: { toObjectId?: string | number }[] }>(
    associationListPath("contacts", contactId, "leads"),
    { method: "GET" }
  );
  const first = found?.results?.[0]?.toObjectId;
  return first != null ? String(first) : null;
}

/**
 * Create or update the HubSpot lead for an account.
 *
 * A contact alone is not a lead on HubSpot's Leads board — this writes the
 * Lead object and associates the contact as its primary contact. When
 * HUBSPOT_LEAD_OWNER_ID is set, the lead is assigned to that seat so it shows
 * under "My leads" instead of only on the contact record.
 *
 * The stage is only written when the lead is created and when a website is
 * bought. In between, a sales rep may move it by hand (Attempting, Connected),
 * and a routine score update must not drag it back to New.
 */
export async function upsertLead(
  lead: LeadSnapshot,
  knownLeadId?: string | null
): Promise<string | null> {
  const properties: Record<string, string> = {
    hs_lead_name: formatLeadName(lead),
    hs_lead_label: leadLabel(lead.score),
    hs_lead_type: LEAD_TYPE_NEW_BUSINESS,
    [env.hubspot.leadScoreProperty]: String(lead.score),
  };
  if (env.hubspot.leadOwnerId) {
    properties.hubspot_owner_id = env.hubspot.leadOwnerId;
  }
  if (lead.closedWon) {
    const { pipelineId } = await resolveLeadNewPlacement();
    properties.hs_pipeline = pipelineId;
    properties.hs_pipeline_stage = await resolveLeadClosedWonStage();
  }

  const leadId = knownLeadId ?? (await findLeadIdForContact(lead.contactId));
  if (leadId) {
    try {
      await hubspotRequest(objectPath("leads", leadId), {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      });
      return leadId;
    } catch (err) {
      const gone = err instanceof HubSpotError && (err.status === 404 || err.status === 400);
      if (!gone) throw err;
    }
  }

  const placement = await resolveLeadNewPlacement();
  const created = await hubspotRequest<HubSpotRecord>(objectPath("leads"), {
    method: "POST",
    body: JSON.stringify({
      properties: {
        hs_pipeline: placement.pipelineId,
        hs_pipeline_stage: placement.newStageId,
        ...properties,
      },
      associations: [
        {
          to: { id: lead.contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: LEAD_TO_PRIMARY_CONTACT_ASSOCIATION_TYPE_ID,
            },
          ],
        },
      ],
    }),
  });
  return created?.id ?? null;
}

export { isHubSpotConfigured };
