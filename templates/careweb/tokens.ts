// Careweb design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const CW = {
  brand: "var(--brand, #0EA4E7)",
  brandDeep: "var(--brand-strong, #0EA4E7)",
  brandSoft: "var(--brand-soft, #E7F2F8)",
  ink: "var(--theme-fg, #0A1F44)",
  body: "var(--theme-muted, #5C6F8C)",
  line: "var(--theme-line, #CFD0D7)",
  surface: "var(--theme-surface, #E7F2F8)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #F9FAFD)",
  inverse: "var(--theme-inverse, #001047)",
  inverseFg: "var(--theme-inverse-fg, #FFFFFF)",
  mark: "#00E8DA",
  radius: "1rem",
} as const;
