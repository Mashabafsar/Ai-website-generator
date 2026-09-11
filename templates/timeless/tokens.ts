// Timeless design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const TI = {
  brand: "var(--brand, #0885FF)",
  brandDeep: "var(--brand-strong, #0885FF)",
  brandSoft: "var(--brand-soft, #FFFFFF)",
  ink: "var(--theme-fg, #0B1220)",
  body: "var(--theme-muted, #5C6570)",
  line: "var(--theme-line, #D8DEE4)",
  surface: "var(--theme-surface, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #F4F6F8)",
  inverse: "var(--theme-inverse, #0B1220)",
  inverseFg: "var(--theme-inverse-fg, #F4F6F8)",
  radius: "1rem",
} as const;
