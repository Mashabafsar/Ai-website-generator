// Decides which photo belongs in which image slot.
//
// A slot says what it needs (its role on the page, the subject it illustrates,
// its orientation); a photo says what it shows (a description, tags, and a
// broad kind). Placement scores every photo against every slot and hands out
// the strongest fits first, so the hero never grabs the one photo that could
// only have worked as a team portrait, and nothing is placed by index or
// repeated just to fill a gap. Pure: no I/O, so it is shared by stock
// sourcing, customer-photo placement, and the tests.

import type { ImageOrientation } from "@/lib/sections/registry";

export type SlotRole =
  | "hero"
  | "about"
  | "testimonials"
  | "cta"
  | "service"
  | "product"
  | "feature"
  | "portfolio"
  | "generic";

export const PHOTO_KINDS = [
  "people",
  "portrait",
  "place",
  "work",
  "product",
  "food",
  "detail",
  "graphic",
  "other",
] as const;

export type PhotoKind = (typeof PHOTO_KINDS)[number];

/** What a photo shows, from vision analysis or the provider's own description. */
export type PhotoFacts = {
  description: string;
  tags?: string[];
  kind?: PhotoKind;
  quality?: "good" | "poor";
  orientation?: ImageOrientation;
};

/** What an image slot needs. */
export type SlotIntent = {
  role: SlotRole;
  orientation: ImageOrientation;
  /** The specific thing the photo must show: an item title, headline, or photo brief. */
  subject: string;
  /** Surrounding copy that narrows the subject down. */
  context?: string;
  industry: string;
};

const ROLE_KINDS: Record<SlotRole, { prefer: PhotoKind[]; avoid: PhotoKind[] }> = {
  hero: { prefer: ["place", "work", "people", "product", "food"], avoid: ["portrait", "detail"] },
  about: { prefer: ["people", "portrait", "place", "work"], avoid: ["product", "food", "detail"] },
  testimonials: { prefer: ["people", "portrait"], avoid: ["product", "detail", "food"] },
  cta: { prefer: ["place", "work", "people", "detail"], avoid: ["portrait"] },
  service: { prefer: ["work", "place", "product", "detail", "food", "people"], avoid: ["portrait"] },
  product: { prefer: ["product", "food", "detail"], avoid: ["portrait", "people"] },
  feature: { prefer: ["work", "place", "detail", "people", "product"], avoid: ["portrait"] },
  portfolio: { prefer: ["work", "place", "product", "food"], avoid: ["portrait"] },
  generic: { prefer: [], avoid: [] },
};

/** Hero and about set the tone of the page, so they choose before item grids. */
const ROLE_PRIORITY: Record<SlotRole, number> = {
  hero: 0,
  about: 1,
  service: 2,
  product: 2,
  portfolio: 2,
  feature: 3,
  testimonials: 4,
  cta: 5,
  generic: 6,
};

export function rolePriority(role: SlotRole): number {
  return ROLE_PRIORITY[role];
}

export function slotRole(sectionType: string, isItem: boolean): SlotRole {
  if (isItem) {
    if (sectionType === "services") return "service";
    if (sectionType === "products") return "product";
    if (sectionType === "portfolio") return "portfolio";
    if (sectionType === "features") return "feature";
    return "generic";
  }
  if (
    sectionType === "hero" ||
    sectionType === "about" ||
    sectionType === "testimonials" ||
    sectionType === "cta"
  ) {
    return sectionType;
  }
  return "generic";
}

/** Plain-language brief for the vision model and for logs. */
export const ROLE_BRIEF: Record<SlotRole, string> = {
  hero: "wide opening photo that sums up the business",
  about: "the people or the place behind the business",
  testimonials: "happy customers or people being helped",
  cta: "calm background photo behind a call to action",
  service: "photo of this specific service being delivered",
  product: "photo of this specific product",
  feature: "photo illustrating this specific benefit",
  portfolio: "photo of finished work for this project",
  generic: "photo that fits this section",
};

const FILLER = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into", "is",
  "it", "its", "of", "on", "or", "our", "the", "their", "this", "to", "with", "we",
  "you", "your", "photo", "image", "picture", "stock", "view", "background", "close",
  "up", "shot",
]);

/** Lowercase content words, with a light plural strip so "dentists" meets "dentist". */
export function contentWords(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !FILLER.has(w) && !/^\d+$/.test(w))
    .map((w) => (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
}

function overlap(a: string[], b: Set<string>): number {
  let n = 0;
  for (const w of new Set(a)) if (b.has(w)) n += 1;
  return n;
}

const PORTRAIT_WORDS = /\b(portrait|headshot|selfie|close-up of a (man|woman|person))\b/;
const PEOPLE_WORDS =
  /\b(people|person|persons|man|men|woman|women|team|staff|colleagues|customer|customers|client|clients|family|families|couple|doctor|dentist|nurse|chef|worker|workers|employee|employees|child|children|kids|student|students|smiling|group)\b/;
const PLACE_WORDS =
  /\b(interior|exterior|office|room|clinic|building|restaurant|kitchen|studio|shop|store|storefront|lobby|reception|workspace|warehouse|gym|salon|hotel|house|home|garden|street|city|landscape|venue)\b/;
const PRODUCT_WORDS = /\b(product|bottle|package|packaging|box|jar|device|gadget|isolated|on white)\b/;
const FOOD_WORDS = /\b(food|dish|meal|plate|coffee|drink|dessert|bread|cake|pizza|salad|cocktail)\b/;
const GRAPHIC_WORDS =
  /\b(logo|icon|text|lettering|typography|screenshot|infographic|diagram|chart|banner|illustration|vector|clipart|clip art|watermark)\b/;

/** A best guess at the kind of photo from its description alone. */
export function inferPhotoKind(text: string): PhotoKind | undefined {
  const t = text.toLowerCase();
  if (!t.trim()) return undefined;
  if (GRAPHIC_WORDS.test(t)) return "graphic";
  if (PORTRAIT_WORDS.test(t)) return "portrait";
  if (FOOD_WORDS.test(t)) return "food";
  if (PEOPLE_WORDS.test(t)) return "people";
  if (PLACE_WORDS.test(t)) return "place";
  if (PRODUCT_WORDS.test(t)) return "product";
  return undefined;
}

/** Below this, a photo is not a fit for the slot and should not be placed there. */
export const MIN_FIT_SCORE = 3;

/**
 * How well a photo fits a slot. `-Infinity` means never place it (logos, text
 * graphics). Subject matches dominate; the role/kind fit separates a team
 * photo from a product shot when the words alone can't.
 */
export function scorePhoto(photo: PhotoFacts, slot: SlotIntent): number {
  const text = [photo.description, ...(photo.tags ?? [])].join(" ");
  const kind = photo.kind ?? inferPhotoKind(text);
  if (kind === "graphic") return Number.NEGATIVE_INFINITY;

  const photoWords = new Set(contentWords(text));
  let score = 0;

  score += overlap(contentWords(slot.subject), photoWords) * 4;
  score += Math.min(3, overlap(contentWords(slot.context), photoWords));
  score += Math.min(2, overlap(contentWords(slot.industry), photoWords)) * 2;

  const fit = ROLE_KINDS[slot.role];
  if (kind && fit.prefer.includes(kind)) score += 4;
  if (kind && fit.avoid.includes(kind)) score -= 6;

  if (photo.orientation) {
    if (photo.orientation === slot.orientation) score += 2;
    else if (slot.orientation === "landscape" && photo.orientation === "square") score += 0;
    else if (slot.orientation === "square") score -= 1;
    else score -= 3;
  }

  if (photo.quality === "poor") score -= 5;
  return score;
}

export type Assignment = { slot: number; photo: number; score: number };

/**
 * Globally best one-to-one placement: the strongest (slot, photo) pair is
 * settled first, then the next strongest among what is left, until nothing
 * reaches `minScore`. Ties go to the more prominent slot, then page order.
 * Slots without a fitting photo are simply left out of the result.
 */
export function assignBest(params: {
  slotCount: number;
  photoCount: number;
  score: (slot: number, photo: number) => number;
  minScore?: number | ((slot: number) => number);
  priority?: (slot: number) => number;
}): Assignment[] {
  const { slotCount, photoCount, score } = params;
  const minFor =
    typeof params.minScore === "function"
      ? params.minScore
      : () => (params.minScore as number | undefined) ?? MIN_FIT_SCORE;
  const priority = params.priority ?? (() => 0);

  const pairs: Assignment[] = [];
  for (let s = 0; s < slotCount; s++) {
    const floor = minFor(s);
    for (let p = 0; p < photoCount; p++) {
      const value = score(s, p);
      if (Number.isFinite(value) && value >= floor) pairs.push({ slot: s, photo: p, score: value });
    }
  }

  pairs.sort(
    (a, b) =>
      b.score - a.score ||
      priority(a.slot) - priority(b.slot) ||
      a.slot - b.slot ||
      a.photo - b.photo
  );

  const slotDone = new Set<number>();
  const photoDone = new Set<number>();
  const out: Assignment[] = [];
  for (const pair of pairs) {
    if (slotDone.has(pair.slot) || photoDone.has(pair.photo)) continue;
    slotDone.add(pair.slot);
    photoDone.add(pair.photo);
    out.push(pair);
  }
  return out.sort((a, b) => a.slot - b.slot);
}
