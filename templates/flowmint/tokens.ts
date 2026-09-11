// FlowMint design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const FM = {
  brand: "var(--brand, #1A1A1A)",
  brandDeep: "var(--brand-strong, #1A1A1A)",
  brandSoft: "var(--brand-soft, #FFFFFF)",
  ink: "var(--theme-fg, #111111)",
  body: "var(--theme-muted, #6A6A6A)",
  line: "var(--theme-line, #CCCCCC)",
  surface: "var(--theme-surface, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #F4F4F2)",
  inverse: "var(--theme-inverse, #1A1A1A)",
  inverseFg: "var(--theme-inverse-fg, #F4F4F2)",
  radius: "1rem",
} as const;
