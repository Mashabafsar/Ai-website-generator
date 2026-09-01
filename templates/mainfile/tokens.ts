// Mraval design tokens, mapped from the "Mraval" multipurpose Bootstrap theme (a
// colorful, gradient-forward creative/app-landing look). The blue-violet accent
// resolves to the editor's brand color via --brand, with the original hex as the
// fallback so the default look is unchanged. The multicolor gradient accents
// mirror the original theme's playful icon palette.
export const MR = {
  brand: "var(--brand, #7DBCFF)",
  brandStrong: "var(--brand-strong, #57A6FF)",
  brandSoft: "var(--brand-soft, #EFECFD)",
  ink: "#34314B",
  body: "#666666",
  muted: "#B0AEBE",
  line: "#ECEAF6",
  surface: "#F6F8F9",
  heroBg: "#EFECFD",
  violet: "#8667F7",
  white: "#FFFFFF",
} as const;

// The signature multicolor icon gradients (from the original bg-color-* set),
// rotated across feature tiles to give the design its playful energy.
export const MR_GRADIENTS = [
  "linear-gradient(90deg, #9CCDFE 0%, #94AAFD 100%)",
  "linear-gradient(90deg, #55EDC0 0%, #4BDBDB 100%)",
  "linear-gradient(90deg, #FDA498 0%, #F58B9E 100%)",
  "linear-gradient(90deg, #F2A7CA 0%, #C289F4 100%)",
  "linear-gradient(90deg, #FFC187 0%, #FE93A7 100%)",
  "linear-gradient(90deg, #A1ECFF 0%, #7DBCFF 100%)",
] as const;

// The brand button/CTA gradient, wired to the editor brand via --brand so a
// changed swatch flows through while the default stays true to the theme.
export const MR_BRAND_GRADIENT =
  "linear-gradient(90deg, var(--brand, #7DBCFF) 0%, var(--brand-strong, #57A6FF) 100%)";

// Simple 24x24 line-icon path data drawn (stroked white) inside the gradient
// feature tiles, so the design carries its playful icon look with no icon files.
// Shared by both site.tsx (JSX) and export.ts (HTML string).
export const MR_ICON_PATHS = [
  "M4 5h16v10H4z M9 19h6 M8 15v4 M16 15v4", // monitor
  "M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5", // layers
  "M4 20l4-1 10-10-3-3L5 16l-1 4z M14 6l3 3", // pen
  "M12 3l2.6 5.6 6.1.6-4.6 4 1.4 6-5.5-3.2L6.5 19l1.4-6L3.3 9l6.1-.6z", // star
  "M4 20V4 M4 20h16 M8 16v-4 M12 16V8 M16 16v-7", // chart
  "M12 21C5 15 3 11 6 7.5 8 5.3 11 6 12 8c1-2 4-2.7 6-.5 3 3.5 1 7.5-6 13z", // heart
] as const;
