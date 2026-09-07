import { getVariantSpec } from "@/lib/sections/registry";
import type { ImportedBrandImage } from "@/lib/branding/imported-brand";
import type { StockImageReference, WebsiteBlueprint } from "@/lib/blueprint/types";

// Places photos pulled from a customer's own site into the slots they belong
// in, before stock photography fills whatever is left. Hero / about / gallery
// get first pick; service and product rows match on the item title when the
// imported alt text has something in common.

const SECTION_SLOTS = new Set(["hero", "about", "gallery", "cta"]);
const ITEM_SLOTS = new Set(["services", "products", "gallery", "portfolio"]);

function words(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function overlap(a: string, b: string): number {
  const right = new Set(words(b));
  return words(a).filter((w) => right.has(w)).length;
}

function toRef(img: ImportedBrandImage, alt: string): StockImageReference {
  return {
    provider: "upload",
    url: img.url,
    altText: img.altText || alt,
    attributionRequired: false,
    licenseInfo: "Imported from the customer's existing website",
  };
}

/**
 * Mutates the blueprint so matching empty image slots use imported photos.
 * Already-filled slots (an editor pick, a previous generate) are left alone.
 */
export function assignImportedImages(
  blueprint: WebsiteBlueprint,
  imported: ImportedBrandImage[]
): WebsiteBlueprint {
  if (!imported.length) return blueprint;

  const available = imported.map((img) => ({ img, used: false }));

  const take = (want: { orientation?: string; hint?: string }): ImportedBrandImage | null => {
    let best: { index: number; score: number } | null = null;
    for (const [index, slot] of available.entries()) {
      if (slot.used) continue;
      let score = 1;
      if (want.orientation && slot.img.orientation === want.orientation) score += 3;
      else if (want.orientation === "landscape" && slot.img.orientation === "square") score += 1;
      if (want.hint) score += overlap(want.hint, slot.img.altText) * 4;
      if (!best || score > best.score) best = { index, score };
    }
    if (!best) return null;
    available[best.index].used = true;
    return available[best.index].img;
  };

  for (const page of blueprint.pages) {
    for (const section of page.sections) {
      const spec = getVariantSpec(section.variant);
      if (!spec) continue;

      if (spec.needsImage && !section.selectedImage && SECTION_SLOTS.has(section.type)) {
        const hint = [
          section.content.headline,
          section.content.heading,
          ...(section.imageKeywords ?? []),
        ]
          .flat()
          .filter((v): v is string => typeof v === "string")
          .join(" ");
        const img = take({
          orientation: spec.imageOrientation ?? "landscape",
          hint,
        });
        if (img) {
          section.selectedImage = toRef(img, `${blueprint.business.name} — ${section.type}`);
        }
      }

      if (!spec.needsItemImages || !ITEM_SLOTS.has(section.type)) continue;

      const titles = Array.isArray(section.content.itemTitles)
        ? section.content.itemTitles.filter(
            (t): t is string => typeof t === "string" && t.trim().length > 0
          )
        : [];
      if (!titles.length) continue;

      const existing = section.itemImages ? [...section.itemImages] : [];
      while (existing.length < titles.length) existing.push(null);
      if (existing.length > titles.length) existing.length = titles.length;

      for (const [index, title] of titles.entries()) {
        if (existing[index]) continue;
        const img = take({
          orientation: spec.imageOrientation ?? "square",
          hint: title,
        });
        if (img) existing[index] = toRef(img, `${title} — ${blueprint.business.name}`);
      }
      section.itemImages = existing;
    }
  }

  return blueprint;
}
