// Lead-scoring rules and HubSpot association type ids. Everything tunable
// about scoring lives here so the values can change without touching any
// business logic. HubSpot receives standard contact/deal fields plus Notes
// for each scoring step. Numeric totals and consent also stay in our database.
//
// Deal scoring follows HubSpot's lead-scoring model for deals: a combined
// engagement + fit score with group limits, an overall score limit, and
// A1–C3 thresholds (letter = fit, number = engagement).
// See https://knowledge.hubspot.com/scoring/understand-the-lead-scoring-tool

import { CREDIT_PACKS, type CreditPackId } from "@/lib/constants";

/** Every action that can move a lead / deal score. */
export const CrmScoreAction = {
  REGISTERED: "REGISTERED",
  THEME_SELECTED: "THEME_SELECTED",
  QUESTIONNAIRE_COMPLETED: "QUESTIONNAIRE_COMPLETED",
  CREDIT_PACK_PURCHASED: "CREDIT_PACK_PURCHASED",
  WEBSITE_PACKAGE_PURCHASED: "WEBSITE_PACKAGE_PURCHASED",
} as const;
export type CrmScoreAction = (typeof CrmScoreAction)[keyof typeof CrmScoreAction];

/** HubSpot score groups: engagement = actions, fit = who they are / profile. */
export const ScoreGroup = {
  ENGAGEMENT: "engagement",
  FIT: "fit",
} as const;
export type ScoreGroup = (typeof ScoreGroup)[keyof typeof ScoreGroup];

/**
 * Which HubSpot score group each action feeds.
 * Questionnaire completion is fit (business profile filled in).
 * Login, credit packs, and website purchase are engagement.
 */
export const SCORE_ACTION_GROUP: Record<string, ScoreGroup> = {
  [CrmScoreAction.REGISTERED]: ScoreGroup.ENGAGEMENT,
  [CrmScoreAction.THEME_SELECTED]: ScoreGroup.ENGAGEMENT,
  [CrmScoreAction.CREDIT_PACK_PURCHASED]: ScoreGroup.ENGAGEMENT,
  [CrmScoreAction.WEBSITE_PACKAGE_PURCHASED]: ScoreGroup.ENGAGEMENT,
  [CrmScoreAction.QUESTIONNAIRE_COMPLETED]: ScoreGroup.FIT,
};

/**
 * HubSpot-style limits. Once a group (or the overall score) hits its limit,
 * further points from that group no longer raise the combined score.
 */
export const SCORE_LIMIT = 100;
export const ENGAGEMENT_GROUP_LIMIT = 60;
export const FIT_GROUP_LIMIT = 40;

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
  [CrmScoreAction.WEBSITE_PACKAGE_PURCHASED]: 25,
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

/** HubSpot-defined association type id for deal -> company. */
export const DEAL_TO_COMPANY_ASSOCIATION_TYPE_ID = 5;

/** HubSpot-defined association type id for contact -> company. */
export const CONTACT_TO_COMPANY_ASSOCIATION_TYPE_ID = 1;

/** HubSpot-defined association type id for deal -> lead (primary deal on the lead). */
export const DEAL_TO_LEAD_ASSOCIATION_TYPE_ID = 583;

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
 * HubSpot combined-score thresholds for deals.
 * Letter = fit (A high … C low). Number = engagement (1 high … 3 low).
 */
export const DEAL_FIT_THRESHOLDS = { A: 12, B: 8 } as const;
export const DEAL_ENGAGEMENT_THRESHOLDS = { HIGH: 30, MEDIUM: 15 } as const;

export type DealScoreLabel =
  | "A1"
  | "A2"
  | "A3"
  | "B1"
  | "B2"
  | "B3"
  | "C1"
  | "C2"
  | "C3";

export type CombinedScore = {
  /** Capped engagement group points. */
  engagement: number;
  /** Capped fit group points. */
  fit: number;
  /** min(engagement + fit, SCORE_LIMIT). */
  combined: number;
  /** Uncapped raw totals before group limits (for notes / debugging). */
  engagementRaw: number;
  fitRaw: number;
  /** HubSpot-style combined threshold, e.g. A2. */
  dealLabel: DealScoreLabel;
  /** Lead-object label derived from the combined score. */
  leadLabel: LeadLabel;
};

/**
 * Login alone is cold, completing the questionnaire makes the lead warm, and
 * buying credits on top of that makes it hot.
 */
export function leadLabel(score: number): LeadLabel {
  if (score >= LEAD_LABEL_THRESHOLDS.HOT) return "HOT";
  if (score >= LEAD_LABEL_THRESHOLDS.WARM) return "WARM";
  return "COLD";
}

/** Map capped fit + engagement onto HubSpot's A1–C3 deal threshold grid. */
export function dealScoreLabel(fit: number, engagement: number): DealScoreLabel {
  const fitLetter =
    fit >= DEAL_FIT_THRESHOLDS.A ? "A" : fit >= DEAL_FIT_THRESHOLDS.B ? "B" : "C";
  const engagementDigit =
    engagement >= DEAL_ENGAGEMENT_THRESHOLDS.HIGH
      ? "1"
      : engagement >= DEAL_ENGAGEMENT_THRESHOLDS.MEDIUM
        ? "2"
        : "3";
  return `${fitLetter}${engagementDigit}` as DealScoreLabel;
}

/**
 * Apply HubSpot group limits and the overall score limit to a list of score
 * events. Criteria in each group add independently; the group cap stops further
 * contribution once hit.
 */
export function computeCombinedScore(
  events: { action: string; points: number }[]
): CombinedScore {
  let engagementRaw = 0;
  let fitRaw = 0;
  for (const event of events) {
    const group = SCORE_ACTION_GROUP[event.action];
    if (group === ScoreGroup.FIT) fitRaw += event.points;
    else if (group === ScoreGroup.ENGAGEMENT) engagementRaw += event.points;
  }
  const engagement = Math.min(Math.max(0, engagementRaw), ENGAGEMENT_GROUP_LIMIT);
  const fit = Math.min(Math.max(0, fitRaw), FIT_GROUP_LIMIT);
  const combined = Math.min(engagement + fit, SCORE_LIMIT);
  return {
    engagement,
    fit,
    combined,
    engagementRaw,
    fitRaw,
    dealLabel: dealScoreLabel(fit, engagement),
    leadLabel: leadLabel(combined),
  };
}

/** Operator-facing labels for score events (admin UI and HubSpot notes). */
export const SCORE_ACTION_LABELS: Record<string, string> = {
  [CrmScoreAction.REGISTERED]: "Logged in",
  [CrmScoreAction.THEME_SELECTED]: "Selected a theme",
  [CrmScoreAction.QUESTIONNAIRE_COMPLETED]: "Completed questionnaire",
  [CrmScoreAction.CREDIT_PACK_PURCHASED]: "Purchased a credit pack",
  [CrmScoreAction.WEBSITE_PACKAGE_PURCHASED]: "Purchased website package",
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
