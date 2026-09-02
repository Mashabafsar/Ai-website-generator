// Athlo design tokens, mapped from the "SPORTS" UI8 Figma Make export — a bold,
// energetic sports-club look: near-black ink, a warm amber accent, and clean
// off-white surfaces. The amber accent resolves to the editor's brand color via
// --brand, with the original hex as the fallback so the default look is
// unchanged. Named colors mirror the original palette.
export const SP = {
  brand: "var(--brand, #ffc857)",
  brandStrong: "var(--brand-strong, #e0a93a)",
  brandSoft: "var(--brand-soft, #fff4d6)",
  ink: "#0e121b",
  body: "#525866",
  muted: "#99a0ae",
  line: "#f2f2f2",
  surface: "#f8f8f8",
  // Fixed secondary used behind the merch/feature accent card in the source.
  moss: "#6f9075",
  white: "#ffffff",
} as const;
