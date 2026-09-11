// Levyna Blush design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const LB = {
  brand: "var(--brand, #FF8FFC)",
  brandDeep: "var(--brand-strong, #FF8FFC)",
  brandSoft: "var(--brand-soft, #FFFFFF)",
  ink: "var(--theme-fg, #18243A)",
  body: "var(--theme-muted, #5C6F8C)",
  line: "var(--theme-line, #E6E8EE)",
  surface: "var(--theme-surface, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FAFAFA)",
  inverse: "var(--theme-inverse, #18243A)",
  inverseFg: "var(--theme-inverse-fg, #FAFAFA)",
  mark: "#1A355E",
  radius: "1rem",
} as const;
