// Elektra design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const EL = {
  brand: "var(--brand, #3B82F6)",
  brandDeep: "var(--brand-strong, #3B82F6)",
  brandSoft: "var(--brand-soft, #121416)",
  ink: "var(--theme-fg, #F5F7F8)",
  body: "var(--theme-muted, #95A0B2)",
  line: "var(--theme-line, #2E3138)",
  surface: "var(--theme-surface, #121416)",
  card: "var(--theme-card, #0C0E10)",
  bg: "var(--theme-bg, #050606)",
  inverse: "var(--theme-inverse, #050606)",
  inverseFg: "var(--theme-inverse-fg, #F5F7F8)",
  mark: "#F97316",
  radius: "1rem",
} as const;
