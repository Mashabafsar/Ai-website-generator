import { load, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import { tryFetchAsset } from "@/lib/scraper/fetch-guard";
import {
  contrastRatio,
  ensureContrast,
  hueDistance,
  isNeutral,
  luminance,
  mix,
  parseCssColor,
  saturation,
  toHex,
  type Rgb,
} from "@/lib/scraper/color";
import { matchThemeFont, type FontMatch } from "@/lib/scraper/font-match";
import { imageSize, orientationOf } from "@/lib/scraper/image-size";
import {
  sanitizeSvg,
  saveProjectImage,
  sniffImageType,
  type StoredImageType,
} from "@/lib/images/storage";
import { sanitizeText } from "@/lib/agents/security";
import {
  MAX_IMPORTED_IMAGES,
  type ImportedBrand,
  type ImportedBrandColors,
  type ImportedBrandImage,
} from "@/lib/branding/imported-brand";
import type { ScrapedSite } from "@/lib/scraper/website";

// Brand Import — reads a customer's existing website for the three things the
// text pass can't give us: their logo, their photographs, and their visual
// identity. Every step is independently fault-tolerant: a site with no logo,
// unreadable CSS, or no usable photos still returns whatever else was found.

const STYLESHEET_LIMIT = 4;
const STYLESHEET_BYTES = 400 * 1024;
const STYLESHEET_TIMEOUT_MS = 6_000;
const CSS_PARSE_CAP = 600 * 1024;

const LOGO_CANDIDATE_LIMIT = 5;
const LOGO_BYTES = 1024 * 1024;
const ASSET_TIMEOUT_MS = 8_000;

const IMAGE_CANDIDATE_LIMIT = 18;
const IMAGE_MIN_BYTES = 12 * 1024;
const IMAGE_MAX_BYTES = 1_500 * 1024;
const IMAGE_TOTAL_BYTES = 8 * 1024 * 1024;
const IMAGE_MIN_EDGE = 200;

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

const RASTER: StoredImageType[] = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ---- helpers ---------------------------------------------------------------

function absolute(href: string | undefined, base: URL): URL | null {
  const value = (href || "").trim();
  if (!value || value.startsWith("#")) return null;
  try {
    const url = new URL(value, base);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/** Picks the widest entry from a `srcset`, which is usually the original asset. */
function widestFromSrcset(srcset: string | undefined): string | null {
  if (!srcset) return null;
  let best: { url: string; width: number } | null = null;
  for (const part of srcset.split(",")) {
    const [url, descriptor] = part.trim().split(/\s+/);
    if (!url) continue;
    const width = descriptor?.endsWith("w") ? parseInt(descriptor, 10) : 0;
    if (!best || width > best.width) best = { url, width: Number.isFinite(width) ? width : 0 };
  }
  return best?.url ?? null;
}

function decodeDataImage(value: string): { bytes: Buffer; type: StoredImageType } | null {
  const match = value.match(/^data:image\/[a-z+]+\s*;\s*base64\s*,(.+)$/is);
  if (!match) return null;
  try {
    const bytes = Buffer.from(match[1], "base64");
    const type = sniffImageType(bytes);
    return type ? { bytes, type } : null;
  } catch {
    return null;
  }
}

// ---- stylesheet gathering --------------------------------------------------

type SiteCss = { css: string; googleFamilies: string[] };

async function gatherCss($: CheerioAPI, base: URL): Promise<SiteCss> {
  const parts: string[] = [];
  const googleFamilies: string[] = [];

  $("style").each((_, el) => {
    const text = $(el).text();
    if (text) parts.push(text);
  });

  const sheets: URL[] = [];
  $('link[rel~="stylesheet"], link[rel="preload"][as="style"]').each((_, el) => {
    const href = $(el).attr("href");
    const url = absolute(href, base);
    if (!url) return;
    if (url.hostname === "fonts.googleapis.com") {
      for (const m of url.search.matchAll(/family=([^&:]+)/g)) {
        googleFamilies.push(decodeURIComponent(m[1]).replace(/\+/g, " "));
      }
      return;
    }
    if (sheets.length < STYLESHEET_LIMIT) sheets.push(url);
  });


  const fetched = await Promise.all(
    sheets.map((url) =>
      tryFetchAsset(url, {
        timeoutMs: STYLESHEET_TIMEOUT_MS,
        maxBytes: STYLESHEET_BYTES,
        accept: "text/css,*/*;q=0.1",
      })
    )
  );
  for (const sheet of fetched) {
    if (sheet) parts.push(sheet.bytes.toString("utf8"));
  }

  return { css: parts.join("\n").slice(0, CSS_PARSE_CAP), googleFamilies };
}

type CssRule = { selector: string; body: string };

function cssRules(css: string): CssRule[] {
  const rules: CssRule[] = [];
  for (const match of css.matchAll(/([^{}]{1,400})\{([^{}]{0,4000})\}/g)) {
    rules.push({ selector: match[1].toLowerCase().trim(), body: match[2] });
  }
  return rules;
}

// ---- colours ---------------------------------------------------------------

const BRAND_VAR = /--[\w-]*(brand|primary|accent|theme|main|highlight)[\w-]*/i;
const BRAND_SELECTOR = /(\.|#|^)?(btn|button|cta|primary|brand|header|navbar|nav\b|hero|badge|tag)/;

/** Resolves one level of `var(--x)` indirection using the site's own tokens. */
function resolveVar(value: string, vars: Map<string, string>): string {
  const match = value.match(/var\(\s*(--[\w-]+)\s*(?:,([^)]*))?\)/i);
  if (!match) return value;
  return (vars.get(match[1].toLowerCase()) ?? match[2] ?? "").trim();
}

function detectColors(
  $: CheerioAPI,
  css: string
): { colors: ImportedBrandColors; note?: string } | null {
  const rules = cssRules(css);
  const vars = new Map<string, string>();
  for (const rule of rules) {
    for (const m of rule.body.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
      const name = m[1].toLowerCase();
      if (!vars.has(name)) vars.set(name, m[2].trim());
    }
  }

  // Deliberate signals (brand tokens, theme-color, button backgrounds) are
  // summed freely; incidental ones are capped, so a colour that merely appears
  // in thousands of rules cannot outrank the one the site calls its brand.
  const STRONG_SIGNAL = 20;
  const WEAK_CEILING = 40;
  const scores = new Map<string, { color: Rgb; strong: number; weak: number }>();
  const add = (raw: string | undefined, weight: number) => {
    if (!raw) return;
    const value = resolveVar(raw.trim(), vars);
    const color = parseCssColor(value.split(/\s+/)[0] ?? value);
    if (!color) return;
    const key = toHex(color);
    const entry = scores.get(key) ?? { color, strong: 0, weak: 0 };
    if (weight >= STRONG_SIGNAL) entry.strong += weight;
    else entry.weak = Math.min(WEAK_CEILING, entry.weak + weight);
    scores.set(key, entry);
  };

  for (const [name, value] of vars) {
    if (BRAND_VAR.test(name)) add(value, /(brand|primary)/i.test(name) ? 120 : 70);
  }

  add($('meta[name="theme-color"]').attr("content"), 90);

  let pageBackground: Rgb | null = null;
  let pageForeground: Rgb | null = null;

  for (const rule of rules) {
    const emphasis = BRAND_SELECTOR.test(rule.selector) ? 45 : 5;
    const isRoot = /(^|,)\s*(html|body|:root)\s*(,|$)/.test(rule.selector);

    for (const m of rule.body.matchAll(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/gi)) {
      const value = resolveVar(m[1].trim(), vars);
      const color = parseCssColor(value.split(/\s+/)[0] ?? value);
      if (isRoot && color && !pageBackground) pageBackground = color;
      add(m[1], emphasis);
    }
    for (const m of rule.body.matchAll(/(?:^|;)\s*(?:color|fill)\s*:\s*([^;]+)/gi)) {
      const value = resolveVar(m[1].trim(), vars);
      const color = parseCssColor(value);
      if (isRoot && color && !pageForeground) pageForeground = color;
      add(m[1], BRAND_SELECTOR.test(rule.selector) ? 20 : 2);
    }
    for (const m of rule.body.matchAll(/(?:^|;)\s*border(?:-\w+)?-color\s*:\s*([^;]+)/gi)) {
      add(m[1], emphasis / 3);
    }
  }

  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    for (const m of style.matchAll(/background(?:-color)?\s*:\s*([^;]+)/gi)) add(m[1], 12);
  });

  const ranked = [...scores.values()]
    .map((entry) => ({ color: entry.color, weight: entry.strong + entry.weak }))
    .sort((a, b) => b.weight - a.weight);

  // A brand colour is saturated and mid-toned. Near-black navies and washed-out
  // greys are page furniture, however often they appear.
  const isBrandColor = (color: Rgb) => {
    const l = luminance(color);
    return saturation(color) >= 0.25 && l >= 0.045 && l <= 0.75;
  };
  const vivid = ranked.filter((c) => isBrandColor(c.color));
  const usable = vivid.length ? vivid : ranked.filter((c) => !isNeutral(c.color));
  if (!usable.length) return null;

  const background = pageBackground && isNeutral(pageBackground) ? pageBackground : WHITE;
  const onLightPage = luminance(background) > 0.5;

  let primary = ensureContrast(usable[0].color, WHITE, 3);
  // A brand colour that all but disappears into the page background is not
  // usable as the button/link colour the templates paint with.
  if (contrastRatio(primary, background) < 1.6) {
    primary = ensureContrast(primary, background, 1.8);
  }

  const accentSource = usable
    .slice(1)
    .find((c) => hueDistance(c.color, primary) > 25 && saturation(c.color) > 0.2);
  const accent = accentSource
    ? ensureContrast(accentSource.color, WHITE, 3)
    : mix(primary, BLACK, 0.8);

  let foreground = pageForeground ?? (onLightPage ? { r: 15, g: 23, b: 42 } : WHITE);
  if (contrastRatio(foreground, background) < 4.5) {
    foreground = onLightPage ? { r: 11, g: 10, b: 36 } : WHITE;
  }

  const secondary = mix(primary, background, 0.1);

  return {
    colors: {
      primary: toHex(primary),
      secondary: toHex(secondary),
      accent: toHex(accent),
      background: toHex(background),
      foreground: toHex(foreground),
    },
    note:
      contrastRatio(usable[0].color, WHITE) < 3
        ? "Your brand colour was darkened slightly so button text stays readable."
        : undefined,
  };
}

// ---- typography ------------------------------------------------------------

function detectFont($: CheerioAPI, site: SiteCss): FontMatch | null {
  const candidates: { stack: string; weight: number }[] = [];

  // A Google Fonts link lists the display face before the supporting ones, so
  // earlier entries carry more of the site's identity.
  site.googleFamilies.forEach((family, index) => {
    candidates.push({ stack: family, weight: Math.max(40, 100 - index * 12) });
  });


  const rules = cssRules(site.css);
  const vars = new Map<string, string>();
  for (const rule of rules) {
    for (const m of rule.body.matchAll(/(--[\w-]*font[\w-]*)\s*:\s*([^;]+)/gi)) {
      const name = m[1].toLowerCase();
      if (!vars.has(name)) vars.set(name, m[2].trim());
    }
  }
  for (const [name, value] of vars) {
    candidates.push({ stack: value, weight: /(body|base|sans|default|primary)/.test(name) ? 80 : 55 });
  }

  for (const rule of rules) {
    const isBody = /(^|,)\s*(body|html|:root|\*)\s*(,|$)/.test(rule.selector);
    const isHeading = /(^|,)\s*h[1-3]\b/.test(rule.selector);
    const isFontFace = /@font-face/.test(rule.selector);
    for (const m of rule.body.matchAll(/font-family\s*:\s*([^;]+)/gi)) {
      const stack = resolveVar(m[1].trim(), vars) || m[1].trim();
      const weight = isBody ? 90 : isFontFace ? 60 : isHeading ? 45 : 10;
      // A site's code face says nothing about its brand.
      const isMono = /mono|\bcode\b|courier|consolas/i.test(stack) || /\b(pre|code|kbd)\b/.test(rule.selector);
      candidates.push({ stack, weight: isMono ? 1 : weight });
    }
  }

  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    for (const m of style.matchAll(/font-family\s*:\s*([^;]+)/gi)) {
      candidates.push({ stack: m[1].trim(), weight: 8 });
    }
  });

  const tally = new Map<string, { stack: string; weight: number }>();
  for (const candidate of candidates) {
    const match = matchThemeFont(candidate.stack);
    if (!match) continue;
    const key = `${match.id}|${match.detected}`;
    const existing = tally.get(key);
    if (existing) existing.weight += candidate.weight;
    else tally.set(key, { stack: candidate.stack, weight: candidate.weight });
  }

  const best = [...tally.entries()].sort((a, b) => b[1].weight - a[1].weight)[0];
  return best ? matchThemeFont(best[1].stack) : null;
}

// ---- logo ------------------------------------------------------------------

type LogoCandidate = { score: number; url?: URL; inline?: string };


const LOGO_HINT = /logo|wordmark|brandmark|site-?brand|site-?title/i;

export function logoCandidates($: CheerioAPI, base: URL): LogoCandidate[] {
  const found: LogoCandidate[] = [];
  const seen = new Set<string>();

  const push = (score: number, href: string | undefined) => {
    const raw = (href || "").trim();
    if (!raw) return;
    if (raw.startsWith("data:")) {
      found.push({ score, inline: raw });
      return;
    }
    const url = absolute(raw, base);
    if (!url) return;
    const key = url.toString();
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ score, url });
  };

  const imgSource = (el: Element): string | undefined => {
    const $el = $(el);
    return (
      $el.attr("src") ||
      $el.attr("data-src") ||
      $el.attr("data-lazy-src") ||
      widestFromSrcset($el.attr("srcset") || $el.attr("data-srcset")) ||
      undefined
    );
  };

  const looksLikeLogo = (el: Element): boolean => {
    const $el = $(el);
    const haystack = [
      $el.attr("class"),
      $el.attr("id"),
      $el.attr("alt"),
      $el.attr("src"),
      $el.parent().attr("class"),
      $el.parent().attr("id"),
    ]
      .filter(Boolean)
      .join(" ");
    return LOGO_HINT.test(haystack);
  };

  $("header img, nav img, [class*='header'] img, [id*='header'] img, [class*='navbar'] img").each(
    (_, el) => {
      push(looksLikeLogo(el) ? 100 : 60, imgSource(el));
    }
  );

  $("img").each((_, el) => {
    if (looksLikeLogo(el)) push(80, imgSource(el));
  });

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed: unknown = JSON.parse($(el).text());
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const record = node as Record<string, unknown>;
        const graph = Array.isArray(record["@graph"]) ? (record["@graph"] as unknown[]) : [];
        for (const entry of [record, ...graph]) {
          if (!entry || typeof entry !== "object") continue;
          const logo = (entry as Record<string, unknown>).logo;
          if (typeof logo === "string") push(95, logo);
          else if (logo && typeof logo === "object") {
            const url = (logo as Record<string, unknown>).url;
            if (typeof url === "string") push(95, url);
          }
        }
      }
    } catch {
      // A malformed JSON-LD block is just one missed hint.
    }
  });

  $("header svg, nav svg, [class*='logo'] svg").each((_, el) => {
    const markup = $.html(el);
    if (markup && markup.length < 200_000) found.push({ score: 70, inline: markup });
  });

  $('link[rel~="apple-touch-icon"]').each((_, el) => push(40, $(el).attr("href")));
  $('link[rel~="icon"], link[rel~="shortcut"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    if (/\.ico(\?|$)/i.test(href)) return; // multi-resolution containers don't render in <img>
    push(30, href);
  });
  push(15, $('meta[property="og:logo"]').attr("content"));

  return found.sort((a, b) => b.score - a.score).slice(0, LOGO_CANDIDATE_LIMIT);
}

async function importLogo(
  $: CheerioAPI,
  base: URL,
  projectId: string
): Promise<{ url: string } | null> {
  for (const candidate of logoCandidates($, base)) {
    let bytes: Buffer | null = null;
    let type: StoredImageType | null = null;

    if (candidate.inline) {
      if (candidate.inline.startsWith("data:")) {
        const decoded = decodeDataImage(candidate.inline);
        if (decoded) {
          bytes = decoded.bytes;
          type = decoded.type;
        }
      } else {
        bytes = Buffer.from(candidate.inline, "utf8");
        type = "image/svg+xml";
      }
    } else if (candidate.url) {
      const asset = await tryFetchAsset(candidate.url, {
        timeoutMs: ASSET_TIMEOUT_MS,
        maxBytes: LOGO_BYTES,
        accept: "image/*",
      });
      if (asset) {
        bytes = asset.bytes;
        type = sniffImageType(asset.bytes);
      }
    }

    if (!bytes || !type) continue;

    if (type === "image/svg+xml") {
      const safe = sanitizeSvg(bytes.toString("utf8"));
      if (!safe) continue;
      bytes = Buffer.from(safe, "utf8");
    }

    const size = imageSize(bytes, type);
    if (size && (size.width < 16 || size.height < 16)) continue;

    try {
      const stored = await saveProjectImage({
        projectId,
        bytes,
        contentType: type,
        subdir: "imported",
        optimize: "logo",
      });
      return { url: stored.url };
    } catch {
      return null;
    }
  }
  return null;
}

// ---- content images --------------------------------------------------------

const IMAGE_REJECT =
  /(sprite|icon|logo|favicon|avatar|badge|pixel|spacer|blank|tracking|1x1|placeholder|loading|loader|arrow|chevron|bullet|flag|emoji|payment|visa|mastercard|paypal|stripe|social|facebook|twitter|instagram|linkedin|youtube|whatsapp|star|rating|shim|dot\.)/i;

type ImageCandidate = { url: URL; alt: string; score: number };

export function imageCandidates($: CheerioAPI, base: URL): ImageCandidate[] {
  const found = new Map<string, ImageCandidate>();

  const consider = (el: Element, href: string | undefined, alt: string) => {
    const url = absolute(href, base);
    if (!url) return;
    if (IMAGE_REJECT.test(url.pathname)) return;
    if (/\.svg(\?|$)/i.test(url.pathname)) return;

    const $el = $(el);
    const width = parseInt($el.attr("width") || "", 10);
    const height = parseInt($el.attr("height") || "", 10);
    if (Number.isFinite(width) && width > 0 && width < 150) return;
    if (Number.isFinite(height) && height > 0 && height < 150) return;

    let score = 0;
    if ($el.closest("main, article, [class*='product'], [class*='gallery'], [class*='portfolio'], [class*='work'], [class*='project'], [class*='card'], section").length) {
      score += 20;
    }
    if ($el.closest("header, footer, nav, aside").length) score -= 60;
    if (/hero|banner|feature|product|gallery|showcase|project/i.test(url.pathname)) score += 15;
    if (LOGO_HINT.test([$el.attr("class"), $el.attr("alt"), $el.attr("id")].join(" "))) return;

    const key = url.toString();
    const existing = found.get(key);
    if (!existing || existing.score < score) {
      found.set(key, { url, alt: sanitizeText(alt || "").slice(0, 140), score });
    }
  };

  $("img").each((_, el) => {
    const $el = $(el);
    const href =
      $el.attr("src") ||
      $el.attr("data-src") ||
      $el.attr("data-lazy-src") ||
      widestFromSrcset($el.attr("srcset") || $el.attr("data-srcset")) ||
      undefined;
    consider(el, href, $el.attr("alt") || "");
  });

  $("picture source").each((_, el) => {
    const $el = $(el);
    consider(el, widestFromSrcset($el.attr("srcset")) || undefined, $el.parent().find("img").attr("alt") || "");
  });

  const og = $('meta[property="og:image"]').attr("content");
  const ogUrl = absolute(og, base);
  if (ogUrl && !IMAGE_REJECT.test(ogUrl.pathname) && !found.has(ogUrl.toString())) {
    found.set(ogUrl.toString(), { url: ogUrl, alt: "", score: 5 });
  }


  return [...found.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, IMAGE_CANDIDATE_LIMIT);
}

async function importImages(
  $: CheerioAPI,
  base: URL,
  projectId: string,
  sourcePageUrl: string
): Promise<ImportedBrandImage[]> {
  const stored: ImportedBrandImage[] = [];
  let budget = IMAGE_TOTAL_BYTES;

  for (const candidate of imageCandidates($, base)) {
    if (stored.length >= MAX_IMPORTED_IMAGES || budget <= 0) break;

    const asset = await tryFetchAsset(candidate.url, {
      timeoutMs: ASSET_TIMEOUT_MS,
      maxBytes: Math.min(IMAGE_MAX_BYTES, budget),
      accept: "image/*",
    });
    if (!asset) continue;

    const type = sniffImageType(asset.bytes);
    if (!type || !RASTER.includes(type)) continue;
    if (asset.bytes.length < IMAGE_MIN_BYTES) continue;

    const size = imageSize(asset.bytes, type);
    if (size && (size.width < IMAGE_MIN_EDGE || size.height < IMAGE_MIN_EDGE)) continue;

    try {
      const saved = await saveProjectImage({
        projectId,
        bytes: asset.bytes,
        contentType: type,
        subdir: "imported",
        optimize: "photo",
      });
      // The budget tracks bytes pulled off the customer's server, not bytes
      // kept, so re-encoding cannot be a licence to download more.
      budget -= asset.bytes.length;
      stored.push({
        // An empty alt is kept empty on purpose: the assembly step then writes
        // one from the section it lands in, which beats "Photo from acme.com".
        url: saved.url,
        altText: candidate.alt,
        sourcePageUrl,
        orientation: orientationOf(
          saved.width && saved.height ? { width: saved.width, height: saved.height } : size
        ),
      });
    } catch {
      break;
    }
  }

  return stored;
}

// ---- entry point -----------------------------------------------------------

/**
 * Pulls the logo, photographs, colours, and typeface from an already-fetched
 * page. Never throws: an unreachable stylesheet or an unreadable image only
 * costs that one piece of branding.
 */
export async function importBrandFromSite(params: {
  projectId: string;
  site: ScrapedSite;
}): Promise<ImportedBrand> {
  throw new Error("forced brand failure for fail-soft verification");
  try {
    return await importBrandFromSiteInner(params);
  } catch (err) {
    console.error("[scrape] branding import failed:", err);
    let sourceUrl = params.site.url;
    try {
      sourceUrl = new URL(params.site.url).toString();
    } catch {
      sourceUrl = "https://invalid.invalid";
    }
    return {
      sourceUrl,
      importedAt: new Date().toISOString(),
      images: [],
      notes: ["We couldn't import branding from this site."],
    };
  }
}

async function importBrandFromSiteInner(params: {
  projectId: string;
  site: ScrapedSite;
}): Promise<ImportedBrand> {
  const { projectId, site } = params;
  const base = new URL(site.url);
  const $ = load(site.html);
  const notes: string[] = [];

  const brand: ImportedBrand = {
    sourceUrl: base.toString(),
    importedAt: new Date().toISOString(),
    images: [],
    notes,
  };

  let css: SiteCss = { css: "", googleFamilies: [] };
  try {
    css = await gatherCss($, base);
  } catch {
    notes.push("We couldn't read your stylesheets, so colours and fonts were skipped.");
  }

  try {
    const detected = detectColors($, css.css);
    if (detected) {
      brand.colors = detected.colors;
      if (detected.note) notes.push(detected.note);
    } else {
      notes.push("No distinct brand colour stood out on your site.");
    }
  } catch {
    notes.push("No distinct brand colour stood out on your site.");
  }

  try {
    const font = detectFont($, css);
    if (font) {
      brand.fontFamily = font.id;
      brand.fontDetected = font.detected;
      brand.fontMatch = font.confidence;
    } else {
      notes.push("We couldn't identify the typeface your site uses.");
    }
  } catch {
    notes.push("We couldn't identify the typeface your site uses.");
  }


  try {
    const logo = await importLogo($, base, projectId);
    if (logo) brand.logoUrl = logo.url;
    else notes.push("No logo image was found on your homepage.");
  } catch {
    notes.push("No logo image was found on your homepage.");
  }

  try {
    brand.images = await importImages($, base, projectId, base.toString());
    if (!brand.images.length) {
      notes.push("No photos large enough to reuse were found on your homepage.");
    }
  } catch {
    notes.push("No photos large enough to reuse were found on your homepage.");
  }

  brand.notes = notes.slice(0, 8);
  return brand;
}
