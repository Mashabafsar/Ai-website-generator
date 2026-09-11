// Rebel Grace design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const RB = {
  brand: "var(--brand, #111111)",
  brandDeep: "var(--brand-strong, #111111)",
  brandSoft: "var(--brand-soft, #141414)",
  ink: "var(--theme-fg, #F4F1EC)",
  body: "var(--theme-muted, #A8A49C)",
  line: "var(--theme-line, #2A2A2A)",
  surface: "var(--theme-surface, #141414)",
  card: "var(--theme-card, #1A1A1A)",
  bg: "var(--theme-bg, #0C0C0C)",
  inverse: "var(--theme-inverse, #0C0C0C)",
  inverseFg: "var(--theme-inverse-fg, #F4F1EC)",
  radius: "0px",
} as const;
