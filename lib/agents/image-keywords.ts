// Builds the stock-photo queries the Image Sourcing Agent searches with.
//
// Providers match on a short, concrete phrase; long keyword piles drift onto
// whichever word happens to dominate the index, which is how a dental practice
// ended up with interior-design photography. So a query is at most a few
// meaningful words taken from the copy the model actually wrote for that
// section, anchored by the industry, and each query has a broader fallback to
// try before the chain gives up and returns a placeholder.

import type { WebsiteSection } from "@/lib/blueprint/types";

/** Filler that adds no visual meaning to a photo search. */
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "best", "but", "by", "can", "complete",
  "custom", "do", "every", "expert", "for", "from", "full", "get", "great", "have",
  "help", "how", "in", "is", "it", "its", "leading", "more", "most", "of", "on",
  "one", "only", "or", "other", "our", "premier", "professional", "quality", "s",
  "service", "services", "so", "solution", "solutions", "tailored", "that", "the",
  "their", "to", "top", "trusted", "up", "us", "we", "what", "why", "with", "you",
  "your",
]);

/** Lowercase words, dropping punctuation, filler, and pure numbers. */
function words(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

/** A short searchable phrase, or "" when nothing meaningful survives. */
function phrase(input: string | undefined, maxWords: number, exclude: Set<string> = new Set()): string {
  if (!input) return "";
  const kept: string[] = [];
  for (const word of words(input)) {
    if (exclude.has(word)) continue;
    kept.push(word);
    if (kept.length === maxWords) break;
  }
  return kept.join(" ");
}

export type ImageBusinessContext = {
  name: string;
  industry: string;
};

/** Proper nouns from the brand name pollute a photo search. */
function brandWords(name: string): Set<string> {
  return new Set(words(name));
}

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value.find((v) => typeof v === "string" && v.trim()) : value;

/**
 * Queries for a section's own photo, most specific first. The model's
 * `imageKeywords` lead when present, then the section's own headline, then the
 * industry on its own.
 */
export function sectionImageQueries(
  section: WebsiteSection,
  business: ImageBusinessContext
): string[][] {
  const brand = brandWords(business.name);
  const industry = phrase(business.industry, 3);
  const modelHint = phrase(section.imageKeywords?.[0], 3, brand);
  const copy = phrase(
    first(section.content.headline) ?? first(section.content.heading),
    3,
    brand
  );

  const queries: string[][] = [];
  const push = (...terms: string[]) => {
    const query = terms.filter(Boolean);
    if (query.length) queries.push(query);
  };

  push(modelHint, industry);
  push(copy, industry);
  push(industry);
  return dedupe(queries);
}

/**
 * Queries for one item's photo (a service, product, or case). The item's own
 * title is the subject; the industry keeps it in the right world.
 */
export function itemImageQueries(
  title: string,
  business: ImageBusinessContext
): string[][] {
  const brand = brandWords(business.name);
  const industry = phrase(business.industry, 3);
  const subject = phrase(title, 3, brand);

  const queries: string[][] = [];
  if (subject && industry) queries.push([subject, industry]);
  if (subject) queries.push([subject]);
  if (industry) queries.push([industry]);
  return dedupe(queries);
}

function dedupe(queries: string[][]): string[][] {
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const query of queries) {
    const key = query.join(" ");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(query);
  }
  return out;
}
