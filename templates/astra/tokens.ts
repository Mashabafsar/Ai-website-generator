// Astra Dental design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const AS = {
  brand: "var(--brand, #3B6BFF)",
  brandDeep: "var(--brand-strong, #3B6BFF)",
  brandSoft: "var(--brand-soft, #EEF2FA)",
  ink: "var(--theme-fg, #0F1B33)",
  body: "var(--theme-muted, #5B6478)",
  line: "var(--theme-line, #D7DEEA)",
  surface: "var(--theme-surface, #EEF2FA)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #F7F9FC)",
  inverse: "var(--theme-inverse, #0F1B33)",
  inverseFg: "var(--theme-inverse-fg, #FFFFFF)",
  mark: "#8AA4FF",
  radius: "1rem",
} as const;
