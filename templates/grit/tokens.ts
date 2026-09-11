// Grit design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const GR = {
  brand: "var(--brand, #FF5050)",
  brandDeep: "var(--brand-strong, #FF5050)",
  brandSoft: "var(--brand-soft, #FFFFFF)",
  ink: "var(--theme-fg, #030303)",
  body: "var(--theme-muted, #666666)",
  line: "var(--theme-line, #DDDDDD)",
  surface: "var(--theme-surface, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FAFAF8)",
  inverse: "var(--theme-inverse, #030303)",
  inverseFg: "var(--theme-inverse-fg, #FAFAF8)",
  mark: "#F2C44C",
  radius: "1rem",
} as const;
