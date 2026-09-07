// Whiter design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const WH = {
  brand: "var(--brand, #1787FC)",
  brandDeep: "var(--brand-strong, #0F6FE0)",
  brandSoft: "var(--brand-soft, #E6EFFF)",
  cloudburst: "var(--theme-fg, #213053)",
  mirage: "var(--theme-fg, #1D263A)",
  ink: "var(--theme-fg, #1D263A)",
  body: "var(--theme-muted, #5A6785)",
  muted: "var(--theme-muted, #8A94A6)",
  line: "var(--theme-line, #E6EAF4)",
  skeptic: "var(--brand-soft, #D6EBE4)",
  catskill: "var(--theme-surface, #E6EAF4)",
  surface: "var(--theme-surface, #F5F8FF)",
  accent: "var(--brand, #FF7139)",
  white: "var(--theme-bg, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  inverse: "var(--theme-inverse, #1D263A)",
  onDark: "var(--theme-inverse-fg, #ffffff)",
} as const;
