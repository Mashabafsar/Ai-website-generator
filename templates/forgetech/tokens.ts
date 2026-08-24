// ForgeTech design tokens, mapped from the Figma "Standard" industrial theme.
// The accent (trinidad) resolves to the editor's brand color via --brand, with
// the original hex as the fallback so the default look is unchanged.
export const FT = {
  trinidad: "var(--brand, #FF750B)",
  trinidadDeep: "var(--brand-strong, #EA5501)",
  trinidadInk: "var(--brand-strong, #CB4103)",
  trinidadWash: "var(--brand-soft, #FFF3E8)",
  shark: "#25282A",
  woodsmoke: "#131416",
  ink: "#1F1F1F",
  body: "#4F4F4F",
  muted: "#888888",
  line: "#E7E7E7",
  surface: "#F7F7F7",
} as const;
