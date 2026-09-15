// Will Jacks design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const WJ = {
  brand: "var(--brand, #181818)",
  brandDeep: "var(--brand-strong, #181818)",
  brandSoft: "var(--brand-soft, #E9E9E9)",
  ink: "var(--theme-fg, #181818)",
  body: "var(--theme-muted, #5F5F5F)",
  line: "var(--theme-line, rgba(198,198,198,0.5))",
  surface: "var(--theme-surface, #E9E9E9)",
  card: "var(--theme-card, #E9E9E9)",
  bg: "var(--theme-bg, #E9E9E9)",
  inverse: "var(--theme-inverse, #181818)",
  inverseFg: "var(--theme-inverse-fg, #E9E9E9)",
  mint: "#D5FBE2",
  blush: "#F0E8E6",
  lemon: "#FFFBD1",
  sage: "#C4DCC5",
  mark: "#D5FBE2",
  icon: "#323232",
  radius: "0px",
} as const;
