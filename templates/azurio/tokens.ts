// Azurio design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const AZ = {
  brand: "var(--brand, #002BBA)",
  brandDeep: "var(--brand-strong, #002BBA)",
  brandSoft: "var(--brand-soft, #F9F7F7)",
  ink: "var(--theme-fg, #0F0F0F)",
  body: "var(--theme-muted, #575960)",
  line: "var(--theme-line, #DBD8D8)",
  surface: "var(--theme-surface, #F9F7F7)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #EEEAE8)",
  inverse: "var(--theme-inverse, #0F0F0F)",
  inverseFg: "var(--theme-inverse-fg, #EEEAE8)",
  radius: "0px",
} as const;
