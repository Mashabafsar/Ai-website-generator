// Colour parsing and contrast maths for the website importer. Everything a
// scraped stylesheet can say about a colour has to become a plain sRGB hex
// before it may reach a theme token.

export type Rgb = { r: number; g: number; b: number };

const NAMED: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  navy: "#000080",
  teal: "#008080",
  orange: "#ffa500",
  purple: "#800080",
  gray: "#808080",
  grey: "#808080",
  silver: "#c0c0c0",
  maroon: "#800000",
  olive: "#808000",
  lime: "#00ff00",
  aqua: "#00ffff",
  cyan: "#00ffff",
  fuchsia: "#ff00ff",
  magenta: "#ff00ff",
  yellow: "#ffff00",
  pink: "#ffc0cb",
  gold: "#ffd700",
  crimson: "#dc143c",
  indigo: "#4b0082",
  darkblue: "#00008b",
  midnightblue: "#191970",
  royalblue: "#4169e1",
  steelblue: "#4682b4",
  seagreen: "#2e8b57",
  forestgreen: "#228b22",
  tomato: "#ff6347",
  coral: "#ff7f50",
  salmon: "#fa8072",
  khaki: "#f0e68c",
  beige: "#f5f5dc",
  ivory: "#fffff0",
  snow: "#fffafa",
  slategray: "#708090",
  slategrey: "#708090",
  dimgray: "#696969",
  dimgrey: "#696969",
};


function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: [number, number, number];
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return {
    r: clamp255((rgb[0] + m) * 255),
    g: clamp255((rgb[1] + m) * 255),
    b: clamp255((rgb[2] + m) * 255),
  };
}

function gamma(channel: number): number {
  const v = channel <= 0.0031308 ? 12.92 * channel : 1.055 * Math.abs(channel) ** (1 / 2.4) - 0.055;
  return clamp255(v * 255);
}

function oklchToRgb(l: number, c: number, hDeg: number): Rgb {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const bb = c * Math.sin(h);

  const l_ = (l + 0.3963377774 * a + 0.2158037573 * bb) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * bb) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * bb) ** 3;

  return {
    r: gamma(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    g: gamma(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    b: gamma(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  };
}

/**
 * Parses one CSS colour value. Returns null for anything that has no fixed sRGB
 * value here — keywords like `currentColor`, gradients, and colours that are
 * effectively invisible because their alpha is near zero.
 */
export function parseCssColor(raw: string): Rgb | null {
  const value = raw.trim().toLowerCase();
  if (!value) return null;

  if (NAMED[value]) return parseCssColor(NAMED[value]);

  const hex = value.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3 || h.length === 4) {
      if (h.length === 4 && parseInt(h[3] + h[3], 16) < 40) return null;
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16),
      };
    }
    if (h.length === 6 || h.length === 8) {
      if (h.length === 8 && parseInt(h.slice(6, 8), 16) < 40) return null;
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
      };
    }
    return null;
  }

  const rgb = value.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const channel = (p: string) =>
      p.endsWith("%") ? clamp255((parseFloat(p) / 100) * 255) : clamp255(parseFloat(p));
    if (parts[3] !== undefined) {
      const a = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
      if (!Number.isFinite(a) || a < 0.15) return null;
    }
    const out = { r: channel(parts[0]), g: channel(parts[1]), b: channel(parts[2]) };
    return Number.isFinite(out.r) && Number.isFinite(out.g) && Number.isFinite(out.b) ? out : null;
  }

  // Tailwind v4 and other modern stacks emit oklch(), so a parser that only
  // knows hex/rgb/hsl would read a whole site as colourless.
  const oklch = value.match(/^oklch\(([^)]+)\)$/);
  if (oklch) {
    const parts = oklch[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    if (parts[3] !== undefined) {
      const a = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
      if (!Number.isFinite(a) || a < 0.15) return null;
    }
    const l = parts[0].endsWith("%") ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
    const c = parts[1].endsWith("%") ? (parseFloat(parts[1]) / 100) * 0.4 : parseFloat(parts[1]);
    const h = parseFloat(parts[2]);
    if (![l, c, h].every(Number.isFinite)) return null;
    return oklchToRgb(l, c, h);
  }

  const hsl = value.match(/^hsla?\(([^)]+)\)$/);
  if (hsl) {
    const parts = hsl[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    if (parts[3] !== undefined) {
      const a = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
      if (!Number.isFinite(a) || a < 0.15) return null;
    }
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    if (![h, s, l].every(Number.isFinite)) return null;
    return hslToRgb(h, s, l);
  }

  return null;
}

export function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((c) => clamp255(c).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function channelLuminance(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function luminance(color: Rgb): number {
  return (
    0.2126 * channelLuminance(color.r) +
    0.7152 * channelLuminance(color.g) +
    0.0722 * channelLuminance(color.b)
  );
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** HSL saturation, 0..1. Greys and near-greys sit close to zero. */
export function saturation({ r, g, b }: Rgb): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  if (max === min) return 0;
  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
}

export function hue({ r, g, b }: Rgb): number {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  if (max === min) return 0;
  const d = max - min;
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

export function hueDistance(a: Rgb, b: Rgb): number {
  const d = Math.abs(hue(a) - hue(b));
  return d > 180 ? 360 - d : d;
}

export function mix(a: Rgb, b: Rgb, weightA: number): Rgb {
  const w = Math.max(0, Math.min(1, weightA));
  return {
    r: clamp255(a.r * w + b.r * (1 - w)),
    g: clamp255(a.g * w + b.g * (1 - w)),
    b: clamp255(a.b * w + b.b * (1 - w)),
  };
}

const BLACK: Rgb = { r: 0, g: 0, b: 0 };
const WHITE: Rgb = { r: 255, g: 255, b: 255 };

/**
 * Walks a colour toward black or white until it clears `target` contrast
 * against `against`. Used so an imported brand colour that would render
 * unreadable button text is darkened instead of copied verbatim.
 */
export function ensureContrast(color: Rgb, against: Rgb, target: number): Rgb {
  if (contrastRatio(color, against) >= target) return color;
  const toward = luminance(against) > 0.5 ? BLACK : WHITE;
  let best = color;
  for (let step = 1; step <= 20; step++) {
    best = mix(color, toward, 1 - step / 20);
    if (contrastRatio(best, against) >= target) return best;
  }
  return toward === BLACK ? BLACK : WHITE;
}


/** True for colours so close to pure white/black that they read as canvas, not brand. */
export function isNeutral(color: Rgb): boolean {
  const l = luminance(color);
  return saturation(color) < 0.12 || l > 0.92 || l < 0.02;
}
