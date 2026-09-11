// Omega design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const OM = {
  brand: "var(--brand, #0F53FA)",
  brandDeep: "var(--brand-strong, #0F53FA)",
  brandSoft: "var(--brand-soft, #F5F7FF)",
  ink: "var(--theme-fg, #19191B)",
  body: "var(--theme-muted, #696871)",
  line: "var(--theme-line, #E4E8F5)",
  surface: "var(--theme-surface, #F5F7FF)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FFFFFF)",
  inverse: "var(--theme-inverse, #19191B)",
  inverseFg: "var(--theme-inverse-fg, #FFFFFF)",
  mark: "#22B0FC",
  radius: "1rem",
} as const;
