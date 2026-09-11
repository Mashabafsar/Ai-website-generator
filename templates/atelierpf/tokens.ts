// Atelier design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const AP = {
  brand: "var(--brand, #222420)",
  brandDeep: "var(--brand-strong, #222420)",
  brandSoft: "var(--brand-soft, #EAECF0)",
  ink: "var(--theme-fg, #222420)",
  body: "var(--theme-muted, #5C5E5A)",
  line: "var(--theme-line, #D5D8DE)",
  surface: "var(--theme-surface, #EAECF0)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #F4F5F7)",
  inverse: "var(--theme-inverse, #222420)",
  inverseFg: "var(--theme-inverse-fg, #F4F5F7)",
  radius: "1rem",
} as const;
