import type { ThemeTokens } from "@/lib/blueprint/types";

// Theme Agent — maps a color preference + visual style to concrete design
// tokens. Deterministic (rules-based) so results are consistent.

const PALETTES: Record<string, ThemeTokens["colors"]> = {
  "Brand blue & violet": {
    primary: "#5D4AFE",
    secondary: "#EEF0FF",
    accent: "#24D5F6",
    background: "#FFFFFF",
    foreground: "#0B0A24",
  },
  "Emerald & teal": {
    primary: "#0E9F6E",
    secondary: "#E7F7F1",
    accent: "#14B8A6",
    background: "#FFFFFF",
    foreground: "#06231B",
  },
  "Warm sunset": {
    primary: "#F97316",
    secondary: "#FFF3E9",
    accent: "#EF4444",
    background: "#FFFBF7",
    foreground: "#2A160A",
  },
  Monochrome: {
    primary: "#111827",
    secondary: "#F3F4F6",
    accent: "#6B7280",
    background: "#FFFFFF",
    foreground: "#0B0B0F",
  },
  "Deep navy": {
    primary: "#1E3A8A",
    secondary: "#EAF0FB",
    accent: "#3B82F6",
    background: "#FFFFFF",
    foreground: "#0A1226",
  },
  "Rose & plum": {
    primary: "#DB2777",
    secondary: "#FCEBF3",
    accent: "#9333EA",
    background: "#FFFDFE",
    foreground: "#2A0A1B",
  },
};

const RADII: Record<string, string> = {
  Modern: "0.75rem",
  Minimal: "0.375rem",
  Bold: "1rem",
  Classic: "0.25rem",
  Playful: "1.25rem",
  Luxury: "0.5rem",
};

export function createTheme(colorPreference: string, visualStyle: string): ThemeTokens {
  const colors = PALETTES[colorPreference] ?? PALETTES["Brand blue & violet"];
  const radius = RADII[visualStyle] ?? "0.75rem";
  return {
    colors,
    radius,
    fontStyle: `${visualStyle.toLowerCase()} sans-serif`,
  };
}

/** The exact primary hexes the auto palettes produce (an "unchanged" default). */
export const PALETTE_PRIMARIES = new Set(
  Object.values(PALETTES).map((c) => c.primary.toLowerCase())
);

/**
 * The brand accent a bespoke design should paint with. Bespoke designs ship a
 * hand-tuned default accent; the editor's primary color overrides it. We treat a
 * primary that still equals one of the auto palette defaults as "not customized"
 * and keep the design's own accent, so demos and untouched projects look exactly
 * as designed while a user-picked color takes effect immediately.
 */
export function effectiveBrand(
  themePrimary: string | null | undefined,
  designDefault: string
): string {
  const p = themePrimary?.trim();
  if (!p) return designDefault;
  return PALETTE_PRIMARIES.has(p.toLowerCase()) ? designDefault : p;
}
