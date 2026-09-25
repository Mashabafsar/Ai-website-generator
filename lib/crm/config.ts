// Lead-scoring rules and HubSpot association type ids. Everything tunable
// about scoring lives here so the values can change without touching any
// business logic. HubSpot receives only standard properties — score and
// consent stay in our database.

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
 * same event on purpose — doing both is worth 20 points total, not 40.
 */
export const ONE_TIME_SCORES: Record<string, number> = {
  [CrmScoreAction.REGISTERED]: 5,
  [CrmScoreAction.THEME_SELECTED]: 5,
  [CrmScoreAction.QUESTIONNAIRE_COMPLETED]: 20,
};

/** Credit-pack points, awarded on every purchase rather than once. */
export const PACKAGE_SCORES: Record<CreditPackId, number> = {
  small: 10,
  medium: 20,
  large: 40,
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
