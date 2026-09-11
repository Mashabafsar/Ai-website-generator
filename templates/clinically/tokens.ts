// Clinically design tokens. Theme variables take over when a custom theme is
// chosen; original hexes stay as fallbacks so the default look is unchanged.
export const CL = {
  brand: "var(--brand, #1E5DBC)",
  brandDeep: "var(--brand-strong, #1E5DBC)",
  brandSoft: "var(--brand-soft, #F5F9FE)",
  ink: "var(--theme-fg, #0F2F64)",
  body: "var(--theme-muted, #536288)",
  line: "var(--theme-line, #E8EBF1)",
  surface: "var(--theme-surface, #F5F9FE)",
  card: "var(--theme-card, #FFFFFF)",
  bg: "var(--theme-bg, #FBFDFF)",
  inverse: "var(--theme-inverse, #03133D)",
  inverseFg: "var(--theme-inverse-fg, #FFFFFF)",
  mark: "#1EBCB4",
  radius: "1rem",
} as const;
