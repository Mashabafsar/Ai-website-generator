// WebCanvas design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const WC = {
  brand: "var(--brand, #EEEBDE)",
  brandDeep: "var(--brand-strong, #EEEBDE)",
  brandSoft: "var(--brand-soft, #2D2D2D)",
  ink: "var(--theme-fg, #EEEBDE)",
  body: "var(--theme-muted, #A8A498)",
  line: "var(--theme-line, #414141)",
  surface: "var(--theme-surface, #2D2D2D)",
  card: "var(--theme-card, #323232)",
  bg: "var(--theme-bg, #242424)",
  inverse: "var(--theme-inverse, #242424)",
  inverseFg: "var(--theme-inverse-fg, #EEEBDE)",
  radius: "0px",
} as const;
