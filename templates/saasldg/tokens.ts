// Stratus design tokens, mapped from the "Core" UI8 SaaS landing (a clean,
// cloud-blue product marketing look). The bright blue accent resolves to the
// editor's brand color via --brand, with the original hex as the fallback so
// the default look is unchanged. Named colors mirror the original palette.
export const SL = {
  brand: "var(--brand, #2A85FF)",
  brandDeep: "var(--brand-strong, #1A6FE0)",
  brandSoft: "var(--brand-soft, #EAF2FF)",
  ink: "#272B30",
  body: "#6F767E",
  muted: "#9A9FA5",
  line: "#E0E0E0",
  surface: "#F7F7F7",
  dark: "#272B30",
  dark2: "#1F2328",
  white: "#FFFFFF",
} as const;

// Soft pastel accents behind the feature icon tiles, straight from the source
// theme. The renderer cycles through them so each feature reads distinctly.
export const SL_FEATURE_COLORS = [
  "#CABDFF",
  "#B5E4CA",
  "#FFBC99",
  "#B1E5FC",
  "#FFA7FB",
  "#FFD88D",
] as const;

// Inline SVG glyphs for the feature tiles (drawn on a 24x24 viewBox), so the
// design carries its own iconography without shipping icon asset files.
export const SL_ICON_PATHS = [
  // scalable infrastructure — stacked layers
  "M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5m-18 5 9 5 9-5",
  // real-time analytics — bar chart
  "M4 20V10m5 10V4m5 16v-7m5 7V8",
  // advanced security — shield
  "M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Zm-2 9 1.5 1.5L15 9",
  // intuitive interface — cursor/layout
  "M4 5h16v10H4zM4 19h8m8-6-3 6-1.5-3L12 21",
  // 24/7 support — headset
  "M4 13v-1a8 8 0 0 1 16 0v1m0 0v3a3 3 0 0 1-3 3h-2m5-6h-3v6h3M4 13h3v6H4z",
  // automated workflows — refresh/gears
  "M4 12a8 8 0 0 1 14-5m2-2v4h-4M20 12a8 8 0 0 1-14 5m-2 2v-4h4",
] as const;
