// Fusion design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const FU = {
  brand: "var(--brand, #8758FF)",
  brandDeep: "var(--brand-strong, #8758FF)",
  brandSoft: "var(--brand-soft, #FFFFFF)",
  ink: "var(--theme-fg, #1B1630)",
  body: "var(--theme-muted, #5C5870)",
  line: "var(--theme-line, #E4E1F2)",
  surface: "var(--theme-surface, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #F4F4F2)",
  inverse: "var(--theme-inverse, #1B1630)",
  inverseFg: "var(--theme-inverse-fg, #F4F4F2)",
  mark: "#5CB8E4",
  radius: "1rem",
} as const;
