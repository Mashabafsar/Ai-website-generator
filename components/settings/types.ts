import type { QuestionnaireAnswers } from "@/lib/questionnaire/schema";

export type SettingsTab = "account" | "billing" | "business";

/** Fired by the account menu so Settings switches to Account even if that tab is already the server default. */
export const OPEN_ACCOUNT_SETTINGS = "settings-open-account";

export function isSettingsTab(value: string): value is SettingsTab {
  return value === "account" || value === "billing" || value === "business";
}

export type BusinessDetailsSeed =
  | { state: "empty" }
  | { state: "continue"; href: string; label: string }
  | {
      state: "ready";
      projectId: string;
      answers: QuestionnaireAnswers;
      canRegenerate: boolean;
      questionnaireHref: string;
      previewHref: string;
    };
