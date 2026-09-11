// Onix design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const OX = {
  brand: "var(--brand, #6F5BEB)",
  brandDeep: "var(--brand-strong, #6F5BEB)",
  brandSoft: "var(--brand-soft, #FFFFFF)",
  ink: "var(--theme-fg, #16141F)",
  body: "var(--theme-muted, #6A6578)",
  line: "var(--theme-line, #E4DFF6)",
  surface: "var(--theme-surface, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #F7F5FF)",
  inverse: "var(--theme-inverse, #16141F)",
  inverseFg: "var(--theme-inverse-fg, #F7F5FF)",
  mark: "#EBB15B",
  radius: "1.25rem",
} as const;
