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
  DEAL_TO_CONTACT_ASSOCIATION_TYPE_ID,
  NOTE_TO_CONTACT_ASSOCIATION_TYPE_ID,
  NOTE_TO_DEAL_ASSOCIATION_TYPE_ID,
  scoreActionLabel,
} from "@/lib/crm/config";
import {
  HubSpotError,
  associationPath,
  hubspotRequest,
  isHubSpotConfigured,
  objectPath,
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
  paymentId: string;
  projectId: string;
  dealName: string;
  /** Charged amount in currency units (not cents). */
  amount: number;
  currency: string;
  websiteUrl: string;
  lineItems: { name: string; amount: number }[];
  monthlyTotal?: number;
};

type HubSpotRecord = { id?: string };

/** Conservative cap under HubSpot's textarea limit so a huge quote still fits. */
export const DEAL_DESCRIPTION_MAX_CHARS = 60_000;

export function formatPriceBreakdown(deal: PurchaseDealSnapshot): string {
  const currency = deal.currency.toUpperCase();
  const lines = deal.lineItems.map((item) => `${item.name}: ${item.amount} ${currency}`);
  lines.push(`Total charged: ${deal.amount} ${currency}`);
  if (deal.monthlyTotal && deal.monthlyTotal > 0) {
    lines.push(`Recurring: ${deal.monthlyTotal} ${currency}/month`);
  }
  return lines.join("\n");
}

export function formatDealDescription(deal: PurchaseDealSnapshot): string {
  return `Website: ${deal.websiteUrl}\n\n${formatPriceBreakdown(deal)}`;
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
  return {
    description: `Website: ${deal.websiteUrl}\nAmount: ${deal.amount} ${currency}\nFull itemized breakdown attached as a note.`,
    overflowBody: full,
  };
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
  const properties: Record<string, string> = { email: contact.email };
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
  };
  // Deals are only created once the payment has succeeded, so they land in
  // Closed Won. HubSpot rejects a pipeline without a stage, so both are always
  // sent; a custom pipeline needs its own Closed Won id in HUBSPOT_DEAL_STAGE.
  properties.pipeline = env.hubspot.dealPipeline || "default";
  properties.dealstage = env.hubspot.dealStage || "closedwon";
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

export { isHubSpotConfigured };
