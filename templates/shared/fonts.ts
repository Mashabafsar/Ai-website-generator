// Theme font catalog — the user-facing font picker for generated websites.
// Every bespoke template exposes its type through CSS variables (e.g.
// --sp-display, --wh-body); a selected theme font overrides those variables on
// the template root, so one choice restyles headings, body, and wordmarks.
//
// All entries load from Google Fonts with a single stylesheet link, which works
// identically in the React preview (rendered inline by site.tsx) and the static
// export (link emitted into the document head).

import type { ThemeTokens } from "@/lib/blueprint/types";

export type ThemeFont = {
  /** Stable id stored on theme.fontFamily. */
  id: string;
  /** Human label shown in the picker. */
  name: string;
  /** CSS font-family stack applied to the template. */
  stack: string;
  /** Google Fonts stylesheet URL that loads the family. */
  href: string;
};

const gf = (family: string, weights: string) =>
  `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weights}&display=block`;

const sans = (family: string) => `'${family}', ui-sans-serif, system-ui, sans-serif`;
const serif = (family: string) => `'${family}', ui-serif, Georgia, serif`;

export const THEME_FONTS: ThemeFont[] = [
  { id: "inter", name: "Inter", stack: sans("Inter"), href: gf("Inter", "400;500;600;700") },
  { id: "onest", name: "Onest", stack: sans("Onest"), href: gf("Onest", "400;500;600;700") },
  { id: "poppins", name: "Poppins", stack: sans("Poppins"), href: gf("Poppins", "400;500;600;700") },
  { id: "montserrat", name: "Montserrat", stack: sans("Montserrat"), href: gf("Montserrat", "400;500;600;700") },
  { id: "roboto", name: "Roboto", stack: sans("Roboto"), href: gf("Roboto", "400;500;700") },
  { id: "open-sans", name: "Open Sans", stack: sans("Open Sans"), href: gf("Open Sans", "400;500;600;700") },
  { id: "lato", name: "Lato", stack: sans("Lato"), href: gf("Lato", "400;700") },
  { id: "dm-sans", name: "DM Sans", stack: sans("DM Sans"), href: gf("DM Sans", "400;500;700") },
  { id: "work-sans", name: "Work Sans", stack: sans("Work Sans"), href: gf("Work Sans", "400;500;600;700") },
  { id: "space-grotesk", name: "Space Grotesk", stack: sans("Space Grotesk"), href: gf("Space Grotesk", "400;500;600;700") },
  { id: "sora", name: "Sora", stack: sans("Sora"), href: gf("Sora", "400;600;700") },
  { id: "playfair-display", name: "Playfair Display", stack: serif("Playfair Display"), href: gf("Playfair Display", "400;600;700") },
  { id: "merriweather", name: "Merriweather", stack: serif("Merriweather"), href: gf("Merriweather", "400;700") },
  { id: "bebas-neue", name: "Bebas Neue", stack: sans("Bebas Neue"), href: gf("Bebas Neue", "400") },
];

/** One stylesheet that loads every catalog family — used by the picker so each
 * option renders in its own typeface. */
export const FONT_CATALOG_HREF =
  "https://fonts.googleapis.com/css2?" +
  THEME_FONTS.map((f) => f.href.split("css2?")[1]).join("&") +
  "&display=block";

/** The selected font for a theme, or null when the template default applies. */
export function resolveThemeFont(theme?: ThemeTokens | null): ThemeFont | null {
  const id = theme?.fontFamily;
  if (!id) return null;
  return THEME_FONTS.find((f) => f.id === id) ?? null;
}

/**
 * React preview: inline style overrides for the template root. Sets every font
 * variable the template owns plus the root fontFamily, so the choice cascades
 * through headings, body, and wordmarks. Inline custom properties beat the
 * next/font class variables, so no template CSS needs to change.
 */
export function themeFontStyle(theme: ThemeTokens | null | undefined, vars: string[]): Record<string, string> {
  const font = resolveThemeFont(theme);
  if (!font) return {};
  const style: Record<string, string> = { fontFamily: font.stack };
  for (const v of vars) style[v] = font.stack;
  return style;
}

/** Static export: `:root` declarations overriding the template's font vars. */
export function themeFontCss(theme: ThemeTokens | null | undefined, vars: string[]): string {
  const font = resolveThemeFont(theme);
  if (!font) return "";
  return vars.map((v) => `${v}: ${font.stack};`).join(" ");
}

/** Static export: a body rule so hardcoded body stacks also follow the pick. */
export function themeFontBodyCss(theme: ThemeTokens | null | undefined): string {
  const font = resolveThemeFont(theme);
  return font ? `body { font-family: ${font.stack}; }` : "";
}

/** Stylesheet link for the selected font, or null for the template default. */
export function themeFontHref(theme: ThemeTokens | null | undefined): string | null {
  return resolveThemeFont(theme)?.href ?? null;
}
