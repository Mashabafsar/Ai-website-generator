import { THEME_FONTS } from "@/templates/shared/fonts";
import type { ThemeTokens, WebsiteBlueprint } from "@/lib/blueprint/types";
import {
  IMPORTED_PALETTE_NAME,
  type ImportedBrandColors,
} from "@/lib/branding/imported-brand";

// Theme Agent — maps a color preference + visual style + brand tone to concrete
// design tokens. Deterministic (rules-based) so results are consistent; the
// heavy model only gets to pick *which* catalog entry applies, never a raw value.

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
  "Green & black": {
    primary: "#22C55E",
    secondary: "#111111",
    accent: "#16A34A",
    background: "#0A0A0A",
    foreground: "#F4F4F5",
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

/** Marks a theme the customer (or AI) painted on purpose, not a template default. */
export const CUSTOM_PALETTE_NAME = "Custom";

/** The palette names the model may choose from, for the prompt and validation. */
export const PALETTE_NAMES = Object.keys(PALETTES);

/** Catalog swatches the editor can apply as a full-site conversion. */
export function paletteColors(name: string): ThemeTokens["colors"] | undefined {
  return PALETTES[name];
}

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
 * True when this site was deliberately art-directed (questionnaire, AI palette,
 * imported brand, or an editor custom paint). Demos and untouched projects stay
 * on each design's signature look.
 */
export function isDeliberateTheme(
  theme: { palette?: string | null } | null | undefined
): boolean {
  return Boolean(theme?.palette?.trim());
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
    /** Brand tone from the questionnaire or template — shapes contrast of dark bands. */
    tone?: string;
  } = {}
): ThemeTokens {
  const { choice, colorPreferenceExplicit, importedColors, importedFontFamily, logoUrl, tone } =
    options;
  const radius = RADII[visualStyle] ?? "0.75rem";
  const catalogFont =
    importedFontFamily && THEME_FONTS.some((f) => f.id === importedFontFamily)
      ? importedFontFamily
      : choice?.fontFamily;
  const fontStyle = `${visualStyle.toLowerCase()} sans-serif`;
  const extras = {
    ...(catalogFont ? { fontFamily: catalogFont } : {}),
    ...(logoUrl ? { logoUrl } : {}),
    ...(tone ? { tone } : {}),
  };

  if (importedColors) {
    return {
      colors: importedColors,
      radius,
      fontStyle,
      palette: IMPORTED_PALETTE_NAME,
      ...extras,
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
    fontStyle,
    ...(deliberate ? { palette: paletteName } : {}),
    ...extras,
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

// ---------------------------------------------------------------------------
// Full-surface derivation — primary + secondary become a complete paint job.
// ---------------------------------------------------------------------------

export type DerivedSurface = {
  brand: string;
  strong: string;
  soft: string;
  bg: string;
  fg: string;
  surface: string;
  card: string;
  muted: string;
  inverse: string;
  inverseFg: string;
  line: string;
};

type ToneProfile = {
  inversePrimary: number;
  inverseBlack: number;
  surfaceLift: number;
  mutedMix: number;
};

const TONE_PROFILES: Record<string, ToneProfile> = {
  "bold & energetic": { inversePrimary: 0.1, inverseBlack: 0.94, surfaceLift: 0.09, mutedMix: 0.55 },
  "elegant & premium": { inversePrimary: 0.07, inverseBlack: 0.95, surfaceLift: 0.05, mutedMix: 0.4 },
  "minimal & clean": { inversePrimary: 0.04, inverseBlack: 0.9, surfaceLift: 0.04, mutedMix: 0.5 },
  "friendly & approachable": { inversePrimary: 0.18, inverseBlack: 0.78, surfaceLift: 0.11, mutedMix: 0.38 },
  "professional & corporate": { inversePrimary: 0.22, inverseBlack: 0.88, surfaceLift: 0.07, mutedMix: 0.48 },
  "modern & trustworthy": { inversePrimary: 0.16, inverseBlack: 0.86, surfaceLift: 0.08, mutedMix: 0.45 },
};

function toneProfile(tone?: string | null): ToneProfile {
  const key = tone?.trim().toLowerCase() ?? "";
  return TONE_PROFILES[key] ?? TONE_PROFILES["modern & trustworthy"];
}

function parseHex(hex: string): [number, number, number] | null {
  const raw = hex.trim();
  const m = raw.match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexOf(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixHex(a: string, b: string, t: number): string {
  const A = parseHex(a);
  const B = parseHex(b);
  if (!A || !B) return a;
  return hexOf(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}

function luminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 1;
  const lin = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function isDark(hex: string): boolean {
  return luminance(hex) < 0.22;
}

type ColorInput = {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
};

/**
 * Turns the user's primary + secondary (or a named palette like green + black)
 * into a full page paint: canvas, cards, body copy, and the dark bands used
 * for heroes / footers. Brand tone nudges how dark those bands go.
 */
export function deriveSurface(
  colors: ColorInput | null | undefined,
  fallbackBrand: string,
  tone?: string | null
): DerivedSurface {
  const profile = toneProfile(tone);
  const primary = colors?.primary?.trim() || fallbackBrand;
  const secondary = colors?.secondary?.trim() || "#F3F4F6";
  const accent = colors?.accent?.trim() || primary;
  const background = colors?.background?.trim() || (isDark(secondary) ? secondary : "#FFFFFF");
  const foreground = colors?.foreground?.trim() || (isDark(background) ? "#F4F4F5" : "#0B0B0F");
  const darkCanvas = isDark(background) || isDark(secondary);

  const brand = primary;
  const strong = parseHex(accent) ? accent : mixHex(brand, "#000000", 0.18);
  const black = "#050505";
  const white = "#FFFFFF";

  if (darkCanvas) {
    const bg = isDark(background) ? background : secondary;
    const fg = isDark(foreground) ? "#F4F4F5" : foreground;
    const surface = mixHex(bg, brand, profile.surfaceLift);
    const card = mixHex(bg, brand, profile.surfaceLift + 0.04);
    const soft = mixHex(bg, brand, 0.2);
    return {
      brand,
      strong: isDark(strong) ? mixHex(brand, white, 0.15) : strong,
      soft,
      bg,
      fg,
      surface,
      card,
      muted: mixHex(fg, bg, profile.mutedMix),
      inverse: mixHex(mixHex(bg, black, 0.35), brand, profile.inversePrimary),
      inverseFg: fg,
      line: mixHex(bg, brand, 0.22),
    };
  }

  const bg = background;
  const fg = isDark(foreground) ? foreground : mixHex(primary, "#0A0A0A", 0.85);
  const wash = parseHex(secondary) && !isDark(secondary) ? secondary : mixHex(brand, white, 0.92);
  return {
    brand,
    strong,
    soft: wash,
    bg,
    fg,
    surface: wash,
    card: bg,
    muted: mixHex(fg, bg, profile.mutedMix),
    inverse: mixHex(mixHex(black, brand, profile.inversePrimary), white, 1 - profile.inverseBlack),
    inverseFg: white,
    line: mixHex(wash, brand, 0.12),
  };
}
