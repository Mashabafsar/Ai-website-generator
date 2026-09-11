// Healia design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const HE = {
  brand: "var(--brand, #F38660)",
  brandDeep: "var(--brand-strong, #F38660)",
  brandSoft: "var(--brand-soft, #F8EEE2)",
  ink: "var(--theme-fg, #3C2219)",
  body: "var(--theme-muted, #897770)",
  line: "var(--theme-line, #E3D6D1)",
  surface: "var(--theme-surface, #F8EEE2)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FDF6EE)",
  inverse: "var(--theme-inverse, #3C2219)",
  inverseFg: "var(--theme-inverse-fg, #FDF6EE)",
  radius: "1rem",
} as const;
