// Portra design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const PO = {
  brand: "var(--brand, #68BDE7)",
  brandDeep: "var(--brand-strong, #68BDE7)",
  brandSoft: "var(--brand-soft, #F6F8FA)",
  ink: "var(--theme-fg, #111111)",
  body: "var(--theme-muted, #5A5A5A)",
  line: "var(--theme-line, #E6E6E6)",
  surface: "var(--theme-surface, #F6F8FA)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FFFFFF)",
  inverse: "var(--theme-inverse, #111111)",
  inverseFg: "var(--theme-inverse-fg, #FFFFFF)",
  radius: "1rem",
} as const;
