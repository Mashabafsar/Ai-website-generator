/**
 * Parse a color the customer typed — hex (`#RGB`, `#RRGGBB`, optional `#`) or a
 * CSS named color (`green`, `rebeccapurple`). Invalid input returns null so
 * callers never persist a broken value.
 */

const NAMED: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  orange: "#ffa500",
  purple: "#800080",
  pink: "#ffc0cb",
  gray: "#808080",
  grey: "#808080",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  lime: "#00ff00",
  navy: "#000080",
  teal: "#008080",
  aqua: "#00ffff",
  maroon: "#800000",
  olive: "#808000",
  silver: "#c0c0c0",
  gold: "#ffd700",
  crimson: "#dc143c",
  indigo: "#4b0082",
  violet: "#ee82ee",
  brown: "#a52a2a",
  beige: "#f5f5dc",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  salmon: "#fa8072",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  azure: "#f0ffff",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  darkblue: "#00008b",
  darkgreen: "#006400",
  darkgray: "#a9a9a9",
  darkgrey: "#a9a9a9",
  darkorange: "#ff8c00",
  darkred: "#8b0000",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  goldenrod: "#daa520",
  greenyellow: "#adff2f",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  lawngreen: "#7cfc00",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightgray: "#d3d3d3",
  lightgrey: "#d3d3d3",
  lightgreen: "#90ee90",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightskyblue: "#87cefa",
  lightyellow: "#ffffe0",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  olivedrab: "#6b8e23",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegreen: "#98fb98",
  palevioletred: "#db7093",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  rebeccapurple: "#663399",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  sienna: "#a0522d",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  thistle: "#d8bfd8",
  wheat: "#f5deb3",
  whitesmoke: "#f5f5f5",
  yellowgreen: "#9acd32",
};

function expandShortHex(hex: string): string {
  const a = hex[0];
  const b = hex[1];
  const c = hex[2];
  return `#${a}${a}${b}${b}${c}${c}`;
}

export type ParseColorMode = "live" | "commit";

/**
 * Returns a normalized `#rrggbb` hex, or null if the string is not a color.
 * `live` rejects `#RGB` so typing `#7C3AED` does not snap to `#77CC33` mid-keystroke.
 */
export function parseUserColor(input: string, mode: ParseColorMode = "commit"): string | null {
  const raw = input.trim();
  if (!raw) return null;

  const named = NAMED[raw.toLowerCase().replace(/\s+/g, "")];
  if (named) return named;

  const hex = raw.startsWith("#") ? raw.slice(1) : raw;
  if (!/^[0-9a-f]+$/i.test(hex)) return null;

  if (hex.length === 6) return `#${hex.toLowerCase()}`;
  if (hex.length === 3 && mode === "commit") return expandShortHex(hex.toLowerCase());
  return null;
}

/** Native `<input type="color">` only accepts `#rrggbb`. */
export function toColorInputValue(input: string | undefined, fallback = "#888888"): string {
  return parseUserColor(input ?? "", "commit") ?? fallback;
}

export function isValidCssColor(input: string | undefined): boolean {
  return Boolean(input && parseUserColor(input, "commit"));
}
