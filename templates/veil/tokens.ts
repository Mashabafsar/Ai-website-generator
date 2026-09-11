// Veil design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const VE = {
  brand: "var(--brand, #C8F04D)",
  brandDeep: "var(--brand-strong, #C8F04D)",
  brandSoft: "var(--brand-soft, #0E0E0E)",
  ink: "var(--theme-fg, #F0EDE6)",
  body: "var(--theme-muted, #888880)",
  line: "var(--theme-line, #282828)",
  surface: "var(--theme-surface, #0E0E0E)",
  card: "var(--theme-card, #141414)",
  bg: "var(--theme-bg, #080808)",
  inverse: "var(--theme-inverse, #080808)",
  inverseFg: "var(--theme-inverse-fg, #C8F04D)",
  radius: "0.25rem",
} as const;
