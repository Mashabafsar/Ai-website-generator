// Resume design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const RS = {
  brand: "var(--brand, #000000)",
  brandDeep: "var(--brand-strong, #000000)",
  brandSoft: "var(--brand-soft, #F4F4F5)",
  ink: "var(--theme-fg, #000000)",
  body: "var(--theme-muted, #67697c)",
  line: "var(--theme-line, #67697c)",
  surface: "var(--theme-surface, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FFFFFF)",
  inverse: "var(--theme-inverse, #000000)",
  inverseFg: "var(--theme-inverse-fg, #FFFFFF)",
  radius: "8px",
} as const;
