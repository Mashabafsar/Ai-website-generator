// Health Doc design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const HD = {
  brand: "var(--brand, #8246FB)",
  brandDeep: "var(--brand-strong, #8246FB)",
  brandSoft: "var(--brand-soft, #0C1018)",
  ink: "var(--theme-fg, #F4F5F7)",
  body: "var(--theme-muted, #8B919E)",
  line: "var(--theme-line, #1C2330)",
  surface: "var(--theme-surface, #0C1018)",
  card: "var(--theme-card, #10151F)",
  bg: "var(--theme-bg, #050810)",
  inverse: "var(--theme-inverse, #050810)",
  inverseFg: "var(--theme-inverse-fg, #F4F5F7)",
  radius: "1rem",
} as const;
