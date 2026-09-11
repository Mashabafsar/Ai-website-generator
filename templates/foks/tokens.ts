// Foks design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const FK = {
  brand: "var(--brand, #171717)",
  brandDeep: "var(--brand-strong, #171717)",
  brandSoft: "var(--brand-soft, #FFFFFF)",
  ink: "var(--theme-fg, #171717)",
  body: "var(--theme-muted, #686868)",
  line: "var(--theme-line, #E6E6E6)",
  surface: "var(--theme-surface, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #F9F9F9)",
  inverse: "var(--theme-inverse, #171717)",
  inverseFg: "var(--theme-inverse-fg, #F9F9F9)",
  radius: "1rem",
} as const;
