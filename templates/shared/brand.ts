import type { CSSProperties } from "react";
import {
  effectiveBrand,
  PALETTE_ACCENTS,
  PALETTE_SECONDARIES,
} from "@/lib/agents/theme";

// Bridges the editor's brand colors onto a bespoke design. Each design's accent
// tokens resolve to CSS variables:
//   --brand         <- theme primary   (main accent: buttons, highlights)
//   --brand-strong  <- theme accent    (deep accent: hovers, dark strip, links)
//   --brand-soft    <- theme secondary (soft tint: washes behind accents)
// When a swatch is still an auto-palette default (i.e. untouched), the design's
// own accent / derived shade is used, so demos and untouched projects are
// pixel-identical while any changed swatch takes effect immediately. A theme
// carrying `palette` was deliberately art-directed, so its primary counts as
// changed; the deep/soft shades stay derived from it to keep each design's
// tonal relationships intact.

type BrandTheme =
  | {
      colors?: { primary?: string; secondary?: string; accent?: string } | null;
      palette?: string;
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

function resolve(theme: BrandTheme, fallback: string) {
  const colors = theme?.colors;
  const primary = colors?.primary?.trim();
  const brand = theme?.palette && primary ? primary : effectiveBrand(primary, fallback);
  return {
    brand,
    strong: customOr(colors?.accent, PALETTE_ACCENTS, `color-mix(in oklab, ${brand} 82%, black)`),
    soft: customOr(colors?.secondary, PALETTE_SECONDARIES, `color-mix(in oklab, ${brand} 12%, white)`),
  };
}

/** Inline style for a React design root. */
export function brandStyle(theme: BrandTheme, fallback: string): CSSProperties {
  const { brand, strong, soft } = resolve(theme, fallback);
  return {
    ["--brand" as string]: brand,
    ["--brand-strong" as string]: strong,
    ["--brand-soft" as string]: soft,
  };
}

/** CSS declarations for the static export's `<style>` block. */
export function brandCss(theme: BrandTheme, fallback: string): string {
  const { brand, strong, soft } = resolve(theme, fallback);
  return `--brand:${brand};--brand-strong:${strong};--brand-soft:${soft};`;
}
