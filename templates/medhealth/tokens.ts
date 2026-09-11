// MedHealth design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const MH = {
  brand: "var(--brand, #224171)",
  brandDeep: "var(--brand-strong, #224171)",
  brandSoft: "var(--brand-soft, #EBF5F9)",
  ink: "var(--theme-fg, #1A2744)",
  body: "var(--theme-muted, #5C6B84)",
  line: "var(--theme-line, #D7E3EC)",
  surface: "var(--theme-surface, #EBF5F9)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #F7FAFC)",
  inverse: "var(--theme-inverse, #1A2744)",
  inverseFg: "var(--theme-inverse-fg, #FFFFFF)",
  mark: "#72A7D8",
  radius: "1rem",
} as const;
