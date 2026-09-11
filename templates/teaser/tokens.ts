// Teaser design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const TS = {
  brand: "var(--brand, #111111)",
  brandDeep: "var(--brand-strong, #111111)",
  brandSoft: "var(--brand-soft, #F2F2F2)",
  ink: "var(--theme-fg, #000000)",
  body: "var(--theme-muted, #6B6B6B)",
  line: "var(--theme-line, #E4E4E4)",
  surface: "var(--theme-surface, #F2F2F2)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FFFFFF)",
  inverse: "var(--theme-inverse, #121212)",
  inverseFg: "var(--theme-inverse-fg, #FFFFFF)",
  radius: "1rem",
} as const;
