// Lead-scoring rules and HubSpot association type ids. Everything tunable
// about scoring lives here so the values can change without touching any
// business logic. HubSpot receives standard contact/deal fields plus Notes
// for each scoring step. Numeric totals and consent also stay in our database.

import { CREDIT_PACKS, type CreditPackId } from "@/lib/constants";

/** Every action that can move a lead score. */
export const CrmScoreAction = {
  REGISTERED: "REGISTERED",
  THEME_SELECTED: "THEME_SELECTED",
  QUESTIONNAIRE_COMPLETED: "QUESTIONNAIRE_COMPLETED",
  CREDIT_PACK_PURCHASED: "CREDIT_PACK_PURCHASED",
} as const;
export type CrmScoreAction = (typeof CrmScoreAction)[keyof typeof CrmScoreAction];

/**
 * Actions that score once per account, ever.
 *
 * Filling the questionnaire by hand and importing it with the scraper are the
 * same event on purpose — doing both is worth 15 points total, not 30.
 *
 * THEME_SELECTED no longer scores; it stays in CrmScoreAction only so older
 * score history keeps its label.
 */
export const ONE_TIME_SCORES: Record<string, number> = {
  [CrmScoreAction.REGISTERED]: 5,
  [CrmScoreAction.QUESTIONNAIRE_COMPLETED]: 15,
};

/** Credit-pack points, awarded on every purchase rather than once. */
export const PACKAGE_SCORES: Record<CreditPackId, number> = {
  small: 10,
  medium: 15,
  large: 20,
};

/** Outbox job kinds. */
export const CrmJobKind = {
  CONTACT_SYNC: "CONTACT_SYNC",
  PURCHASE_DEAL: "PURCHASE_DEAL",
} as const;
export type CrmJobKind = (typeof CrmJobKind)[keyof typeof CrmJobKind];

export const CrmJobStatus = {
  PENDING: "PENDING",
  /** Claimed by a worker. The lease in outbox.ts lets a dead worker's job be retaken. */
  RUNNING: "RUNNING",
  DONE: "DONE",
  /** Attempts exhausted. Needs an operator to look at `lastError`. */
  FAILED: "FAILED",
} as const;
export type CrmJobStatus = (typeof CrmJobStatus)[keyof typeof CrmJobStatus];

/** HubSpot-defined association type id for deal -> contact. */
export const DEAL_TO_CONTACT_ASSOCIATION_TYPE_ID = 3;

/** HubSpot-defined association type id for note -> deal. */
export const NOTE_TO_DEAL_ASSOCIATION_TYPE_ID = 214;

/** HubSpot-defined association type id for note -> contact. */
export const NOTE_TO_CONTACT_ASSOCIATION_TYPE_ID = 202;

/** HubSpot-defined association type id for lead -> primary contact. */
export const LEAD_TO_PRIMARY_CONTACT_ASSOCIATION_TYPE_ID = 578;

/**
 * HubSpot Original Traffic Source for contacts we create via the CRM API.
 * Without this, HubSpot labels API-created contacts as Offline Sources.
 */
export const CONTACT_ANALYTICS_SOURCE = "DIRECT_TRAFFIC";

/**
 * HubSpot's standard `hs_lead_type` value for a new opportunity.
 * The portal enum is underscore form: NEW_BUSINESS | UPSELL | RE_ATTEMPTING.
 */
export const LEAD_TYPE_NEW_BUSINESS = "NEW_BUSINESS";

/** Label of the lead-pipeline stage a new signup starts in. */
export const LEAD_NEW_STAGE_LABEL = "New";

/** Label of the lead-pipeline stage a website purchase moves the lead into. */
export const LEAD_CLOSED_WON_STAGE_LABEL = "Closed Won";

/** Minimum score for each HubSpot lead label (standard `hs_lead_label` values). */
export const LEAD_LABEL_THRESHOLDS = { HOT: 30, WARM: 20 } as const;

export type LeadLabel = "HOT" | "WARM" | "COLD";

/**
 * Login alone is cold, completing the questionnaire makes the lead warm, and
 * buying credits on top of that makes it hot.
 */
export function leadLabel(score: number): LeadLabel {
  if (score >= LEAD_LABEL_THRESHOLDS.HOT) return "HOT";
  if (score >= LEAD_LABEL_THRESHOLDS.WARM) return "WARM";
  return "COLD";
}

/** Operator-facing labels for score events (admin UI and HubSpot notes). */
export const SCORE_ACTION_LABELS: Record<string, string> = {
  [CrmScoreAction.REGISTERED]: "Logged in",
  [CrmScoreAction.THEME_SELECTED]: "Selected a theme",
  [CrmScoreAction.QUESTIONNAIRE_COMPLETED]: "Completed questionnaire",
  [CrmScoreAction.CREDIT_PACK_PURCHASED]: "Purchased a credit pack",
};

export function scoreActionLabel(action: string): string {
  return SCORE_ACTION_LABELS[action] ?? action.replace(/_/g, " ").toLowerCase();
}

export function packageScore(packId: string): number {
  return PACKAGE_SCORES[packId as CreditPackId] ?? 0;
}

export function oneTimeScore(action: CrmScoreAction): number {
  return ONE_TIME_SCORES[action] ?? 0;
}

/** Guards against a pack being added to CREDIT_PACKS without a score. */
export function assertScoringConfigIsComplete(): void {
  const missing = CREDIT_PACKS.filter((pack) => !(pack.id in PACKAGE_SCORES));
  if (missing.length > 0) {
    throw new Error(
      `Credit packs without a lead score: ${missing.map((p) => p.id).join(", ")}`
    );
  }
}
