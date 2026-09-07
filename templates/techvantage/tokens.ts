// Techvantage design tokens, mapped from the Figma "Minimal" corporate theme.
// Theme variables take over when a custom theme is chosen; original hexes stay
// as fallbacks so demos remain the designed navy look.
export const TV = {
  blue: "var(--brand, #0C3DFF)",
  blueDeep: "var(--brand-strong, #002FF5)",
  blueSoft: "var(--brand, #2F6DFF)",
  ink: "var(--theme-fg, #1C2539)",
  inkDeep: "var(--theme-fg, #0A1B5C)",
  body: "var(--theme-muted, #304874)",
  bodyMuted: "var(--theme-muted, #2B3E61)",
  wash: "var(--brand-soft, #E8F5FF)",
  surface: "var(--theme-surface, #F4F6FB)",
  line: "var(--theme-line, #E4E8F1)",
  lineDark: "var(--theme-line, #4D72AA)",
  onDarkMuted: "var(--theme-muted, #A2B7D7)",
  panelTop: "var(--theme-inverse, #0C1743)",
  panelBottom: "var(--theme-inverse, #102166)",
  dot: "var(--theme-muted, #566292)",
  canvas: "var(--theme-bg, #ffffff)",
  card: "var(--theme-card, #ffffff)",
  onDark: "var(--theme-inverse-fg, #ffffff)",
} as const;
