// Stratus design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const SL = {
  brand: "var(--brand, #2A85FF)",
  brandDeep: "var(--brand-strong, #1A6FE0)",
  brandSoft: "var(--brand-soft, #EAF2FF)",
  ink: "var(--theme-fg, #272B30)",
  body: "var(--theme-muted, #6F767E)",
  muted: "var(--theme-muted, #9A9FA5)",
  line: "var(--theme-line, #E0E0E0)",
  surface: "var(--theme-surface, #F7F7F7)",
  dark: "var(--theme-inverse, #272B30)",
  dark2: "var(--theme-inverse, #1F2328)",
  white: "var(--theme-bg, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  onDark: "var(--theme-inverse-fg, #ffffff)",
} as const;

// Soft pastel accents behind the feature icon tiles, straight from the source
// theme. The renderer cycles through them so each feature reads distinctly.
export const SL_FEATURE_COLORS = [
  "#CABDFF",
  "#B5E4CA",
  "#FFBC99",
  "#B1E5FC",
  "#FFA7FB",
  "#FFD88D",
] as const;

// Inline SVG glyphs for the feature tiles (drawn on a 24x24 viewBox), so the
// design carries its own iconography without shipping icon asset files.
export const SL_ICON_PATHS = [
  "M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5m-18 5 9 5 9-5",
  "M4 20V10m5 10V4m5 16v-7m5 7V8",
  "M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Zm-2 9 1.5 1.5L15 9",
  "M4 5h16v10H4zM4 19h8m8-6-3 6-1.5-3L12 21",
  "M4 13v-1a8 8 0 0 1 16 0v1m0 0v3a3 3 0 0 1-3 3h-2m5-6h-3v6h3M4 13h3v6H4z",
  "M4 12a8 8 0 0 1 14-5m2-2v4h-4M20 12a8 8 0 0 1-14 5m-2 2v-4h4",
] as const;
