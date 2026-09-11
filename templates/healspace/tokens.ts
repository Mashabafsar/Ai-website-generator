// Healspace design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const HS = {
  brand: "var(--brand, #E47565)",
  brandDeep: "var(--brand-strong, #E47565)",
  brandSoft: "var(--brand-soft, #F2EFE9)",
  ink: "var(--theme-fg, #28332B)",
  body: "var(--theme-muted, #5C655E)",
  line: "var(--theme-line, #E5A9A0)",
  surface: "var(--theme-surface, #F2EFE9)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #F9F7F3)",
  inverse: "var(--theme-inverse, #28332B)",
  inverseFg: "var(--theme-inverse-fg, #F9F7F3)",
  mark: "#E5A9A0",
  radius: "1rem",
} as const;
