// LuxeFrame design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const LX = {
  brand: "var(--brand, #E0FD60)",
  brandDeep: "var(--brand-strong, #E0FD60)",
  brandSoft: "var(--brand-soft, #161616)",
  ink: "var(--theme-fg, #F4F4F0)",
  body: "var(--theme-muted, #9D9D9D)",
  line: "var(--theme-line, #323232)",
  surface: "var(--theme-surface, #161616)",
  card: "var(--theme-card, #1F1F1F)",
  bg: "var(--theme-bg, #121212)",
  inverse: "var(--theme-inverse, #121212)",
  inverseFg: "var(--theme-inverse-fg, #E0FD60)",
  radius: "0.25rem",
} as const;
