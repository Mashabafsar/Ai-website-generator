// Levyna design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const LV = {
  brand: "var(--brand, #D8F366)",
  brandDeep: "var(--brand-strong, #D8F366)",
  brandSoft: "var(--brand-soft, #1C1C1C)",
  ink: "var(--theme-fg, #F4F4F0)",
  body: "var(--theme-muted, #B9B9B9)",
  line: "var(--theme-line, #2A2A2A)",
  surface: "var(--theme-surface, #1C1C1C)",
  card: "var(--theme-card, #222222)",
  bg: "var(--theme-bg, #161616)",
  inverse: "var(--theme-inverse, #161616)",
  inverseFg: "var(--theme-inverse-fg, #D8F366)",
  radius: "1rem",
} as const;
