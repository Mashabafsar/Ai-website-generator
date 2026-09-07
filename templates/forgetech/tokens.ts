// ForgeTech design tokens, mapped from the Figma "Standard" industrial theme.
// Accents resolve to --brand; page/surface/ink resolve to --theme-* when a
// custom theme is chosen, with the original hex as the fallback so demos stay
// pixel-identical.
export const FT = {
  trinidad: "var(--brand, #FF750B)",
  trinidadDeep: "var(--brand-strong, #EA5501)",
  trinidadInk: "var(--brand-strong, #CB4103)",
  trinidadWash: "var(--brand-soft, #FFF3E8)",
  shark: "var(--theme-inverse, #25282A)",
  woodsmoke: "var(--theme-inverse, #131416)",
  ink: "var(--theme-fg, #1F1F1F)",
  body: "var(--theme-muted, #4F4F4F)",
  muted: "var(--theme-muted, #888888)",
  line: "var(--theme-line, #E7E7E7)",
  surface: "var(--theme-surface, #F7F7F7)",
  canvas: "var(--theme-bg, #ffffff)",
  card: "var(--theme-card, #ffffff)",
  onDark: "var(--theme-inverse-fg, #ffffff)",
} as const;
