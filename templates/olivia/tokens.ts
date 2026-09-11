// Olivia design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const OL = {
  brand: "var(--brand, #161616)",
  brandDeep: "var(--brand-strong, #161616)",
  brandSoft: "var(--brand-soft, #F4F3EE)",
  ink: "var(--theme-fg, #161616)",
  body: "var(--theme-muted, #5C5C58)",
  line: "var(--theme-line, #E7E6E0)",
  surface: "var(--theme-surface, #F4F3EE)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FDFDFB)",
  inverse: "var(--theme-inverse, #161616)",
  inverseFg: "var(--theme-inverse-fg, #FDFDFB)",
  mark: "#FFDCB8",
  radius: "1rem",
} as const;
