// Athlo design tokens, mapped from the "SPORTS" UI8 Figma Make export — a bold,
// energetic sports-club look: near-black ink, a warm amber accent, and clean
// off-white surfaces. Theme variables take over when a custom theme is chosen;
// the original hex stays the fallback so the default look is unchanged.
export const SP = {
  brand: "var(--brand, #ffc857)",
  brandStrong: "var(--brand-strong, #e0a93a)",
  brandSoft: "var(--brand-soft, #fff4d6)",
  ink: "var(--theme-fg, #0e121b)",
  body: "var(--theme-muted, #525866)",
  muted: "var(--theme-muted, #99a0ae)",
  line: "var(--theme-line, #f2f2f2)",
  surface: "var(--theme-surface, #f8f8f8)",
  moss: "var(--brand-soft, #6f9075)",
  white: "var(--theme-bg, #ffffff)",
  card: "var(--theme-card, #ffffff)",
  inverse: "var(--theme-inverse, #0e121b)",
  onDark: "var(--theme-inverse-fg, #ffffff)",
} as const;
