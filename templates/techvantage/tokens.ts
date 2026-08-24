// Techvantage design tokens, mapped from the Figma "Minimal" corporate theme.
export const TV = {
  /** Primary action blue — resolves to the editor's brand color via --brand. */
  blue: "var(--brand, #0C3DFF)",
  /** Deeper blue used for pressed/secondary actions and link text. */
  blueDeep: "var(--brand-strong, #002FF5)",
  /** Mid blue used for the services progress bar. */
  blueSoft: "var(--brand, #2F6DFF)",
  /** Near-black navy for headings. */
  ink: "#1C2539",
  /** Darkest navy, used for the big statistic numerals. */
  inkDeep: "#0A1B5C",
  /** Body copy on light surfaces. */
  body: "#304874",
  /** Muted navy for inactive accordion titles. */
  bodyMuted: "#2B3E61",
  /** Pale blue tint used for buttons and text on dark panels. */
  wash: "#E8F5FF",
  /** Light grey-blue section background. */
  surface: "#F4F6FB",
  /** Card border. */
  line: "#E4E8F1",
  /** Border on dark panels. */
  lineDark: "#4D72AA",
  /** Placeholder text on dark panels. */
  onDarkMuted: "#A2B7D7",
  /** Dark navy panel gradient (hero, testimonials, footer) sampled from the design. */
  panelTop: "#0C1743",
  panelBottom: "#102166",
  /** Carousel dot on dark panels. */
  dot: "#566292",
} as const;
