export const QUOTE_CTA_LABEL = "Contact our sales";

const PRICE_LIKE =
  /(?:[$€£¥]|usd|eur|gbp)\s*[\d,]|[\d,]+\s*(?:usd|dollars?|eur|gbp|\/\s*mo|\/\s*month|\/\s*yr|per\s*month)/i;

const PRICE_FRAGMENT =
  /(?:[$€£¥]\s*[\d,]+(?:\.\d+)?)|(?:\b\d[\d,]*(?:\.\d+)?\s*(?:usd|dollars?|eur|gbp|\/\s*mo(?:nth)?|per\s*month))/gi;

export function looksLikePrice(value: string | undefined | null): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^\d/.test(trimmed) && /\d/.test(trimmed) && PRICE_LIKE.test(trimmed)) return true;
  return PRICE_LIKE.test(trimmed);
}

/** Strip published rates from copy so pricing always leads to Contact. */
export function stripPriceAmounts(value: string): string {
  return value
    .replace(PRICE_FRAGMENT, "")
    .replace(/\bstarting from\b/gi, "")
    .replace(/\s+[—–-]\s+/g, " — ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}

/** Preview / in-app multi-page sites switch with ?page=. */
export function previewContactHref(): string {
  return "?page=contact";
}

/** Static export: path from this page to the Contact page. */
export function exportContactHref(fromSlug: string): string {
  if (fromSlug === "contact") return "#contact";
  if (fromSlug === "home") return "contact/";
  return "../contact/";
}
