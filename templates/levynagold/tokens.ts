// Levyna Gold design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const LG = {
  brand: "var(--brand, #E5BE68)",
  brandDeep: "var(--brand-strong, #E5BE68)",
  brandSoft: "var(--brand-soft, #141414)",
  ink: "var(--theme-fg, #EEEEEC)",
  body: "var(--theme-muted, #A8A59C)",
  line: "var(--theme-line, #2A2A28)",
  surface: "var(--theme-surface, #141414)",
  card: "var(--theme-card, #171717)",
  bg: "var(--theme-bg, #0B0B0B)",
  inverse: "var(--theme-inverse, #0B0B0B)",
  inverseFg: "var(--theme-inverse-fg, #E5BE68)",
  radius: "1rem",
} as const;
