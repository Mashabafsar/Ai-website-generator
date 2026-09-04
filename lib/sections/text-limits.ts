import { getVariantSpec } from "@/lib/sections/registry";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";

/** Max characters per content field key (applied during sanitize). */
export const FIELD_LIMITS: Record<string, number> = {
  eyebrow: 36,
  headline: 58,
  subheadline: 110,
  heading: 48,
  body: 160,
  subheading: 90,
  ctaPrimary: 22,
  ctaSecondary: 22,
  ctaLabel: 22,
  tagline: 56,
  businessName: 48,
  email: 80,
  phone: 24,
  address: 100,
};

export const ARRAY_FIELD_LIMITS: Record<string, number> = {
  itemTitles: 38,
  itemBodies: 85,
  stepTitles: 32,
  stepBodies: 75,
  // A statistics band sets its values at display sizes, so anything longer than
  // a short numeral overlaps its neighbours.
  statValues: 8,
  statLabels: 34,
  quotes: 120,
  authors: 40,
  roles: 40,
  questions: 72,
  answers: 140,
  planNames: 24,
  planPrices: 12,
  planFeatures: 200,
  linkLabels: 20,
  metrics: 80,
};

export const ARRAY_MAX_ITEMS: Record<string, number> = {
  itemTitles: 6,
  itemBodies: 6,
  stepTitles: 5,
  stepBodies: 5,
  statValues: 4,
  statLabels: 4,
  quotes: 4,
  authors: 4,
  roles: 4,
  questions: 6,
  answers: 6,
  planNames: 3,
  planPrices: 3,
  planFeatures: 3,
  linkLabels: 6,
  metrics: 4,
};

/** Array fields that must stay the same length as their partner. */
const PARALLEL_ARRAYS: [string, string][] = [
  ["itemTitles", "itemBodies"],
  ["stepTitles", "stepBodies"],
  ["statValues", "statLabels"],
];

function clampString(value: string, max: number): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > max * 0.6) return `${cut.slice(0, lastSpace).trim()}…`;
  return `${cut.trim()}…`;
}

function clampField(key: string, value: string | string[]): string | string[] {
  if (Array.isArray(value)) {
    const itemMax = ARRAY_FIELD_LIMITS[key] ?? 80;
    const maxItems = ARRAY_MAX_ITEMS[key] ?? 6;
    return value
      .slice(0, maxItems)
      .map((v) => (typeof v === "string" ? clampString(v, itemMax) : v))
      .filter((v) => typeof v === "string" && v.length > 0);
  }
  if (typeof value !== "string") return value;
  const max = FIELD_LIMITS[key] ?? 120;
  return clampString(value, max);
}

/** Truncate all section copy to UI-friendly lengths. Mutates blueprint. */
export function clampBlueprintText(blueprint: WebsiteBlueprint): WebsiteBlueprint {
  blueprint.business.description = clampString(blueprint.business.description || "", 160);
  blueprint.business.name = clampString(blueprint.business.name || "", FIELD_LIMITS.businessName);

  for (const page of blueprint.pages) {
    for (const section of page.sections) {
      const spec = getVariantSpec(section.variant);
      const allowed = new Set(spec?.fields.map((f) => f.key) ?? Object.keys(section.content));
      for (const key of Object.keys(section.content)) {
        if (!allowed.has(key)) continue;
        section.content[key] = clampField(key, section.content[key] as string | string[]);
      }
      // Keep parallel arrays aligned.
      for (const [titleKey, bodyKey] of PARALLEL_ARRAYS) {
        const titles = section.content[titleKey];
        const bodies = section.content[bodyKey];
        if (!Array.isArray(titles) || !Array.isArray(bodies)) continue;
        if (titles.length === bodies.length) continue;
        const n = Math.min(titles.length, bodies.length);
        section.content[titleKey] = titles.slice(0, n);
        section.content[bodyKey] = bodies.slice(0, n);
        if (titleKey === "itemTitles" && section.itemImages) {
          section.itemImages = section.itemImages.slice(0, n);
        }
      }
    }
  }

  return blueprint;
}

export function limitsForPrompt(): string {
  const scalar = Object.entries(FIELD_LIMITS)
    .map(([k, v]) => `${k}: ${v} chars`)
    .join(", ");
  const arrays = Object.entries(ARRAY_FIELD_LIMITS)
    .map(([k, v]) => `${k}[]: ${v} chars each (max ${ARRAY_MAX_ITEMS[k] ?? 6} items)`)
    .join(", ");
  return `STRICT copy limits — never exceed: ${scalar}. Arrays: ${arrays}. Write short, scannable marketing copy. No long paragraphs.`;
}
