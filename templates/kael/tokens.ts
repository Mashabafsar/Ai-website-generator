// Kael Donovan design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const KA = {
  brand: "var(--brand, #111111)",
  brandDeep: "var(--brand-strong, #111111)",
  brandSoft: "var(--brand-soft, #FFFFFF)",
  ink: "var(--theme-fg, #111111)",
  body: "var(--theme-muted, #555555)",
  line: "var(--theme-line, #E8E8E4)",
  surface: "var(--theme-surface, #FFFFFF)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FAFAF8)",
  inverse: "var(--theme-inverse, #111111)",
  inverseFg: "var(--theme-inverse-fg, #FAFAF8)",
  radius: "1rem",
} as const;
