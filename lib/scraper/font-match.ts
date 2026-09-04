import { THEME_FONTS } from "@/templates/shared/fonts";

// Maps a typeface seen on a customer's website to the nearest family the
// generator can actually load. Arbitrary web fonts are never served from the
// generated site, so every detection resolves to a catalog id or to nothing.

export type FontMatch = {
  /** Catalog id from templates/shared/fonts.ts. */
  id: string;
  /** The family name as the customer's stylesheet spelled it. */
  detected: string;
  /**
   * exact — the same family is in the catalog.
   * close — a documented substitute for a well-known family.
   * loose — only the broad classification (serif / sans / display) survived.
   */
  confidence: "exact" | "close" | "loose";
};

/** Families the catalog does not carry, mapped to their nearest sibling. */
const SUBSTITUTES: Record<string, string> = {
  helvetica: "inter",
  "helvetica neue": "inter",
  arial: "inter",
  "arial nova": "inter",
  "segoe ui": "inter",
  "system ui": "inter",
  geist: "inter",
  "sf pro": "inter",
  "sf pro display": "inter",
  "sf pro text": "inter",
  "neue haas grotesk": "inter",
  "aktiv grotesk": "inter",
  graphik: "inter",
  "suisse intl": "inter",
  manrope: "onest",
  satoshi: "onest",
  outfit: "onest",
  "plus jakarta sans": "onest",
  urbanist: "onest",
  "general sans": "onest",
  "clash display": "onest",
  gilroy: "poppins",
  futura: "poppins",
  "futura pt": "poppins",
  "avenir next": "poppins",
  avenir: "poppins",
  circular: "poppins",
  "circular std": "poppins",
  quicksand: "poppins",
  "josefin sans": "poppins",
  nunito: "poppins",
  "nunito sans": "poppins",
  "proxima nova": "montserrat",
  "gotham": "montserrat",
  "brandon grotesque": "montserrat",
  "sofia pro": "montserrat",
  raleway: "work-sans",
  barlow: "work-sans",
  karla: "work-sans",
  archivo: "work-sans",
  "titillium web": "work-sans",
  "fira sans": "work-sans",
  "ibm plex sans": "work-sans",
  rubik: "dm-sans",
  figtree: "dm-sans",
  "public sans": "dm-sans",
  hind: "dm-sans",
  "source sans pro": "open-sans",
  "source sans 3": "open-sans",
  "noto sans": "open-sans",
  "pt sans": "open-sans",
  verdana: "open-sans",
  tahoma: "open-sans",
  mulish: "lato",
  cabin: "lato",
  "myriad pro": "lato",
  ubuntu: "lato",
  "roboto condensed": "roboto",
  "roboto flex": "roboto",
  "helvetica now": "roboto",
  "space mono": "space-grotesk",
  "jetbrains mono": "space-grotesk",
  "ibm plex mono": "space-grotesk",
  "roboto mono": "space-grotesk",
  "courier new": "space-grotesk",
  oswald: "bebas-neue",
  anton: "bebas-neue",
  teko: "bebas-neue",
  "archivo black": "bebas-neue",
  georgia: "merriweather",
  "times new roman": "merriweather",
  times: "merriweather",
  garamond: "merriweather",
  "eb garamond": "merriweather",
  "pt serif": "merriweather",
  "noto serif": "merriweather",
  "crimson text": "merriweather",
  lora: "merriweather",
  "libre baskerville": "merriweather",
  "source serif pro": "merriweather",
  didot: "playfair-display",
  bodoni: "playfair-display",
  "cormorant garamond": "playfair-display",
  cormorant: "playfair-display",
  "dm serif display": "playfair-display",
  canela: "playfair-display",
  tiempos: "playfair-display",
  "freight display": "playfair-display",
};

/** Generic CSS families and OS stack entries that say nothing about the design. */
const GENERIC = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "ui-rounded",
  "-apple-system",
  "blinkmacsystemfont",
  "inherit",
  "initial",
  "unset",
  "emoji",
  "apple color emoji",
  "segoe ui emoji",
  "segoe ui symbol",
  "noto color emoji",
  "math",
  "fangsong",
]);

/**
 * Families that exist to render a non-Latin script. The catalog is Latin-only,
 * so matching one would swap a site's real typeface for an unrelated guess.
 */
const NON_LATIN =
  /\b(zen kaku|kaku gothic|maru gothic|mincho|hiragino|meiryo|yu gothic|yu mincho|ms gothic|ms mincho|simsun|simhei|microsoft yahei|malgun|nanum|noto (sans|serif) (jp|kr|sc|tc|hk|thai|hebrew|arabic|devanagari|bengali|tamil)|noto sans cjk|source han)\b/i;

function normalize(name: string): string {
  return name
    .replace(/!\s*important/gi, "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Splits a `font-family` value into its individual family names. */
export function splitFontStack(value: string): string[] {
  return value
    .split(",")
    .map(normalize)
    .filter(Boolean);
}

/** The first family in a stack that actually names a typeface. */
export function firstRealFamily(stack: string[]): string | null {
  for (const family of stack) {
    if (GENERIC.has(family)) continue;
    if (family.startsWith("var(")) continue;
    if (/^-/.test(family)) continue;
    return family;
  }
  return null;
}

function classify(stack: string[]): string {
  const joined = stack.join(" ");
  if (stack.includes("serif") || /serif/.test(joined.replace(/sans-?serif/g, ""))) {
    return /display|didot|bodoni|canela|tiempos/.test(joined) ? "playfair-display" : "merriweather";
  }
  return "inter";
}

/** Levenshtein distance, bounded to short family names. */
function distance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  let prev = Array.from({ length: cols }, (_, i) => i);
  for (let i = 1; i < rows; i++) {
    const curr = [i];
    for (let j = 1; j < cols; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[cols - 1];
}

/**
 * Resolves a detected `font-family` stack to a catalog font. Returns null only
 * when the stack names nothing at all, in which case the template keeps its own
 * type.
 */
export function matchThemeFont(stackValue: string): FontMatch | null {
  const stack = splitFontStack(stackValue).filter((family) => !NON_LATIN.test(family));
  const detected = firstRealFamily(stack);
  if (!detected) return null;

  const exact = THEME_FONTS.find(
    (f) => f.id === detected.replace(/\s+/g, "-") || f.name.toLowerCase() === detected
  );
  if (exact) return { id: exact.id, detected, confidence: "exact" };

  const substitute = SUBSTITUTES[detected];
  if (substitute) return { id: substitute, detected, confidence: "close" };

  // "Open Sans Condensed", "Inter Tight", "Poppins Light" and friends all name
  // a catalog family with a weight or width suffix attached.
  const prefixed = THEME_FONTS.find((f) => detected.startsWith(f.name.toLowerCase()));
  if (prefixed) return { id: prefixed.id, detected, confidence: "close" };

  const prefixedSubstitute = Object.keys(SUBSTITUTES).find((key) => detected.startsWith(key));
  if (prefixedSubstitute) {
    return { id: SUBSTITUTES[prefixedSubstitute], detected, confidence: "close" };
  }

  let nearest: { id: string; score: number } | null = null;
  for (const font of THEME_FONTS) {
    const name = font.name.toLowerCase();
    const score = distance(detected, name) / Math.max(detected.length, name.length);
    if (!nearest || score < nearest.score) nearest = { id: font.id, score };
  }
  if (nearest && nearest.score <= 0.34) {
    return { id: nearest.id, detected, confidence: "close" };
  }

  return { id: classify(stack), detected, confidence: "loose" };
}
