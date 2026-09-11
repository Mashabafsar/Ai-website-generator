// Lukasz design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const LU = {
  brand: "var(--brand, #1A1A1A)",
  brandDeep: "var(--brand-strong, #1A1A1A)",
  brandSoft: "var(--brand-soft, #F6F6F4)",
  ink: "var(--theme-fg, #171717)",
  body: "var(--theme-muted, #666666)",
  line: "var(--theme-line, #E6E6E6)",
  surface: "var(--theme-surface, #F6F6F4)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FFFFFF)",
  inverse: "var(--theme-inverse, #171717)",
  inverseFg: "var(--theme-inverse-fg, #FFFFFF)",
  radius: "1rem",
} as const;
