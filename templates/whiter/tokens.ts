// Whiter design tokens, mapped from the "Whiter" Bootstrap theme (a friendly,
// modern SaaS/agency look). The bright blue accent resolves to the editor's
// brand color via --brand, with the original hex as the fallback so the default
// look is unchanged. Named colors mirror the original theme's palette.
export const WH = {
  brand: "var(--brand, #1787FC)",
  brandDeep: "var(--brand-strong, #0F6FE0)",
  brandSoft: "var(--brand-soft, #E6EFFF)",
  cloudburst: "#213053",
  mirage: "#1D263A",
  ink: "#1D263A",
  body: "#5A6785",
  muted: "#8A94A6",
  line: "#E6EAF4",
  skeptic: "#D6EBE4",
  catskill: "#E6EAF4",
  surface: "#F5F8FF",
  accent: "#FF7139",
  white: "#FFFFFF",
} as const;
