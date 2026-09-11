// Will Jacks design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const WJ = {
  brand: "var(--brand, #181818)",
  brandDeep: "var(--brand-strong, #181818)",
  brandSoft: "var(--brand-soft, #FFFFFF)",
  ink: "var(--theme-fg, #181818)",
  body: "var(--theme-muted, #5F5F5F)",
  line: "var(--theme-line, #E9E9E9)",
  surface: "var(--theme-surface, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #F7F7F4)",
  inverse: "var(--theme-inverse, #181818)",
  inverseFg: "var(--theme-inverse-fg, #F7F7F4)",
  mark: "#D5FBE2",
  radius: "1rem",
} as const;
