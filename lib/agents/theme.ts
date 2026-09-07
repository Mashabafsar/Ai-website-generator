import { THEME_FONTS } from "@/templates/shared/fonts";
import type { ThemeTokens, WebsiteBlueprint } from "@/lib/blueprint/types";
import {
  IMPORTED_PALETTE_NAME,
  type ImportedBrandColors,
} from "@/lib/branding/imported-brand";

// Theme Agent — maps a color preference + visual style to concrete design
// tokens. Deterministic (rules-based) so results are consistent; the heavy
// model only gets to pick *which* catalog entry applies, never a raw value.

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

/** The palette names the model may choose from, for the prompt and validation. */
export const PALETTE_NAMES = Object.keys(PALETTES);

/** The model's design direction, once checked against the catalogs. */
export type ThemeChoice = {
  palette?: string;
  fontFamily?: string;
};

/**
 * Keeps only values that exist in the catalogs. Never trust the model with a
 * raw hex or font stack — an unrecognized pick simply drops out and the
 * template default stands.
 */
export function validateThemeChoice(design: WebsiteBlueprint["design"] | undefined): ThemeChoice {
  const palette = design?.palette?.trim();
  const fontFamily = design?.fontFamily?.trim().toLowerCase();
  return {
    palette: palette && palette in PALETTES ? palette : undefined,
    fontFamily: THEME_FONTS.some((f) => f.id === fontFamily) ? fontFamily : undefined,
  };
}

/**
 * Builds the design tokens for a site. `colorPreference` is the questionnaire's
 * answer (falling back to the template's own), so an explicit customer choice
 * always outranks the model's; `choice.palette` only applies when the customer
 * left it alone.
 */
export function createTheme(
  colorPreference: string,
  visualStyle: string,
  options: {
    choice?: ThemeChoice;
    colorPreferenceExplicit?: boolean;
    /** Hexes + typeface lifted from the customer's site when they kept that look. */
    importedColors?: ImportedBrandColors;
    importedFontFamily?: string;
    logoUrl?: string;
  } = {}
): ThemeTokens {
  const { choice, colorPreferenceExplicit, importedColors, importedFontFamily, logoUrl } = options;
  const radius = RADII[visualStyle] ?? "0.75rem";
  const catalogFont =
    importedFontFamily && THEME_FONTS.some((f) => f.id === importedFontFamily)
      ? importedFontFamily
      : choice?.fontFamily;

  if (importedColors) {
    return {
      colors: importedColors,
      radius,
      fontStyle: `${visualStyle.toLowerCase()} sans-serif`,
      ...(catalogFont ? { fontFamily: catalogFont } : {}),
      palette: IMPORTED_PALETTE_NAME,
      ...(logoUrl ? { logoUrl } : {}),
    };
  }

  const paletteName = colorPreferenceExplicit
    ? colorPreference
    : choice?.palette ?? colorPreference;

  // Only a deliberate pick is recorded, so an untouched project keeps letting
  // each bespoke design paint with its own accent.
  const deliberate = paletteName in PALETTES && (colorPreferenceExplicit || Boolean(choice?.palette));
  const colors = PALETTES[paletteName] ?? PALETTES["Brand blue & violet"];
  return {
    colors,
    radius,
    fontStyle: `${visualStyle.toLowerCase()} sans-serif`,
    ...(catalogFont ? { fontFamily: catalogFont } : {}),
    ...(deliberate ? { palette: paletteName } : {}),
    ...(logoUrl ? { logoUrl } : {}),
  };
}

/** The exact hexes the auto palettes produce (an "unchanged" default) per role. */
export const PALETTE_PRIMARIES = new Set(
  Object.values(PALETTES).map((c) => c.primary.toLowerCase())
);
export const PALETTE_SECONDARIES = new Set(
  Object.values(PALETTES).map((c) => c.secondary.toLowerCase())
);
export const PALETTE_ACCENTS = new Set(
  Object.values(PALETTES).map((c) => c.accent.toLowerCase())
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
