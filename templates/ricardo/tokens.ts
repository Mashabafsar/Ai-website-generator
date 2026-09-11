// Ricardo Rowen design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const RC = {
  brand: "var(--brand, #DB2777)",
  brandDeep: "var(--brand-strong, #DB2777)",
  brandSoft: "var(--brand-soft, #FCEBF3)",
  ink: "var(--theme-fg, #2A0A1B)",
  body: "var(--theme-muted, #7A4A62)",
  line: "var(--theme-line, #F3D5E4)",
  surface: "var(--theme-surface, #FCEBF3)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FFFDFE)",
  inverse: "var(--theme-inverse, #2A0A1B)",
  inverseFg: "var(--theme-inverse-fg, #FFFDFE)",
  mark: "#EC4899",
  radius: "1rem",
} as const;
