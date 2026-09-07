import type { CSSProperties } from "react";
import type { SectionTheme } from "@/lib/blueprint/types";
import {
  CUSTOM_PALETTE_NAME,
  deriveSurface,
  effectiveBrand,
  isDeliberateTheme,
  PALETTE_ACCENTS,
  PALETTE_SECONDARIES,
  type DerivedSurface,
} from "@/lib/agents/theme";

// Bridges the editor's brand colors onto a bespoke design. Each design's tokens
// resolve to CSS variables:
//   --brand / --brand-strong / --brand-soft   accent, hover, wash
//   --theme-bg / --theme-fg                   page canvas + default text
//   --theme-surface / --theme-card            tinted bands + cards
//   --theme-muted / --theme-line              secondary copy + borders
//   --theme-inverse / --theme-inverse-fg      dark heroes, footers, overlays
//
// Theme-* variables are only written when a theme was deliberately chosen
// (questionnaire, AI palette, imported brand, or editor paint). Templates read
// them as `var(--theme-bg, #original)` so demos and old projects stay pixel-
// identical to the design.

export type BrandTheme =
  | {
      colors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        background?: string;
        foreground?: string;
      } | null;
      palette?: string;
      tone?: string;
    }
  | null
  | undefined;

/** Use the theme value only when the user has actually changed it. */
function customOr(
  value: string | undefined,
  paletteDefaults: Set<string>,
  fallback: string
): string {
  const v = value?.trim();
  if (!v) return fallback;
  return paletteDefaults.has(v.toLowerCase()) ? fallback : v;
}

function resolveBrand(theme: BrandTheme, fallback: string) {
  const colors = theme?.colors;
  const primary = colors?.primary?.trim();
  const brand = theme?.palette && primary ? primary : effectiveBrand(primary, fallback);
  return {
    brand,
    strong: customOr(colors?.accent, PALETTE_ACCENTS, `color-mix(in oklab, ${brand} 82%, black)`),
    soft: customOr(colors?.secondary, PALETTE_SECONDARIES, `color-mix(in oklab, ${brand} 12%, white)`),
  };
}

function resolveSurface(theme: BrandTheme, fallback: string): DerivedSurface | null {
  if (!isDeliberateTheme(theme)) return null;
  const colors = theme?.colors;
  const primary = colors?.primary?.trim();
  const brand = primary || fallback;
  return deriveSurface(colors, brand, theme?.tone);
}

function toVars(theme: BrandTheme, fallback: string): Record<string, string> {
  const surface = resolveSurface(theme, fallback);
  if (surface) {
    return {
      "--brand": surface.brand,
      "--brand-strong": surface.strong,
      "--brand-soft": surface.soft,
      "--theme-bg": surface.bg,
      "--theme-fg": surface.fg,
      "--theme-surface": surface.surface,
      "--theme-card": surface.card,
      "--theme-muted": surface.muted,
      "--theme-inverse": surface.inverse,
      "--theme-inverse-fg": surface.inverseFg,
      "--theme-line": surface.line,
      "--primary": surface.brand,
      "--secondary": surface.soft,
      "--accent": surface.strong,
      "--background": surface.bg,
      "--foreground": surface.fg,
    };
  }
  const { brand, strong, soft } = resolveBrand(theme, fallback);
  return {
    "--brand": brand,
    "--brand-strong": strong,
    "--brand-soft": soft,
  };
}

/** Inline style for a React design root. */
export function brandStyle(theme: BrandTheme, fallback: string): CSSProperties {
  const vars = toVars(theme, fallback);
  const surface = resolveSurface(theme, fallback);
  return {
    ...vars,
    ...(surface ? { color: surface.fg, backgroundColor: surface.bg } : {}),
  } as CSSProperties;
}

/** CSS declarations for the static export's `<style>` block. */
export function brandCss(theme: BrandTheme, fallback: string): string {
  return Object.entries(toVars(theme, fallback))
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}

function isSet(theme?: SectionTheme | null): theme is SectionTheme {
  return Boolean(theme && (theme.background || theme.foreground || theme.accent));
}

/** Per-section overrides — empty means inherit the site theme. */
export function sectionBandStyle(theme?: SectionTheme | null): CSSProperties {
  if (!isSet(theme)) return {};
  const style: Record<string, string> = {};
  if (theme.background) {
    style.backgroundColor = theme.background;
    style["--theme-bg"] = theme.background;
    style["--theme-surface"] = theme.background;
    style["--theme-card"] = theme.background;
    style["--theme-inverse"] = theme.background;
  }
  if (theme.foreground) {
    style.color = theme.foreground;
    style["--theme-fg"] = theme.foreground;
    style["--theme-muted"] = theme.foreground;
    style["--theme-inverse-fg"] = theme.foreground;
  }
  if (theme.accent) {
    style["--brand"] = theme.accent;
    style["--brand-strong"] = `color-mix(in oklab, ${theme.accent} 82%, black)`;
    style["--brand-soft"] = `color-mix(in oklab, ${theme.accent} 18%, white)`;
    style["--primary"] = theme.accent;
    style["--accent"] = theme.accent;
  }
  return style as CSSProperties;
}

/** Same overrides as a CSS declaration string for static export. */
export function sectionBandCss(theme?: SectionTheme | null): string {
  const style = sectionBandStyle(theme) as Record<string, string>;
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key === "backgroundColor" ? "background" : key;
      return `${cssKey}:${value}`;
    })
    .join(";");
}

export { CUSTOM_PALETTE_NAME, isDeliberateTheme };
