import type { CSSProperties } from "react";
import { effectiveBrand } from "@/lib/agents/theme";

// Bridges the editor's brand color onto a bespoke design. Each design's accent
// tokens resolve to `var(--brand[...], <original hex>)`, and these helpers set
// those variables on the design root from the project theme. When the user has
// not changed the color, `effectiveBrand` returns the design's own accent, so
// the default look is untouched.

/** Inline style for a React design root. */
export function brandStyle(
  themePrimary: string | null | undefined,
  fallback: string
): CSSProperties {
  const brand = effectiveBrand(themePrimary, fallback);
  return {
    ["--brand" as string]: brand,
    ["--brand-strong" as string]: `color-mix(in oklab, ${brand} 82%, black)`,
    ["--brand-soft" as string]: `color-mix(in oklab, ${brand} 12%, white)`,
  };
}

/** CSS declarations for the static export's `<style>` block. */
export function brandCss(themePrimary: string | null | undefined, fallback: string): string {
  const brand = effectiveBrand(themePrimary, fallback);
  return [
    `--brand:${brand};`,
    `--brand-strong:color-mix(in oklab, ${brand} 82%, black);`,
    `--brand-soft:color-mix(in oklab, ${brand} 12%, white);`,
  ].join("");
}
