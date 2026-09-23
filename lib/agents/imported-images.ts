import { getVariantSpec } from "@/lib/sections/registry";
import type { ImportedBrandImage } from "@/lib/branding/imported-brand";
import type { StockImageReference, WebsiteBlueprint } from "@/lib/blueprint/types";

// Places photos pulled from a customer's own site into the slots they belong
// in, before stock photography fills whatever is left. Hero / about / gallery
// get first pick; service and product rows match on the item title when the
// imported alt text has something in common.

const TEMPLATE_ASSET = /^\/templates\//;

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

function isCustomerPhoto(
  img: StockImageReference | null | undefined,
  importedUrls: Set<string>
): boolean {
  if (!img?.url || TEMPLATE_ASSET.test(img.url)) return false;
  if (importedUrls.has(img.url)) return true;
  return img.provider === "upload";
}

/**
 * Mutates the blueprint so image slots use the customer's own photos.
 * Editor uploads are left alone. When none of the imported photos are on the
 * page yet, stock and template photos are replaced so the site actually shows
 * the pictures pulled from the customer's website.
 */
export function assignImportedImages(
  blueprint: WebsiteBlueprint,
  imported: ImportedBrandImage[]
): WebsiteBlueprint {
  if (!imported.length) return blueprint;

  const importedUrls = new Set(imported.map((img) => img.url));
  const alreadyPlaced = blueprint.pages.some((page) =>
    page.sections.some(
      (section) =>
        isCustomerPhoto(section.selectedImage, importedUrls) ||
        (section.itemImages ?? []).some((img) => isCustomerPhoto(img, importedUrls))
    )
  );
  const replaceForeign = !alreadyPlaced;

  const open = (img: StockImageReference | null | undefined): boolean => {
    if (!img?.url || TEMPLATE_ASSET.test(img.url)) return true;
    return replaceForeign && !isCustomerPhoto(img, importedUrls);
  };

  const available = imported.map((img) => ({ img, used: false }));
  let cycle = 0;

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

  const takeOrRepeat = (want: { orientation?: string; hint?: string }): ImportedBrandImage | null => {
    const fresh = take(want);
    if (fresh) return fresh;
    if (!imported.length) return null;
    const img = imported[cycle % imported.length];
    cycle += 1;
    return img;
  };

  for (const page of blueprint.pages) {
    for (const section of page.sections) {
      const spec = getVariantSpec(section.variant);
      if (!spec) continue;

      if (spec.needsImage && open(section.selectedImage)) {
        const hint = [
          section.content.headline,
          section.content.heading,
          ...(section.imageKeywords ?? []),
        ]
          .flat()
          .filter((v): v is string => typeof v === "string")
          .join(" ");
        const img = takeOrRepeat({
          orientation: spec.imageOrientation ?? "landscape",
          hint,
        });
        if (img) {
          section.selectedImage = toRef(img, `${blueprint.business.name} — ${section.type}`);
        }
      }

      if (!spec.needsItemImages) continue;

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
        if (!open(existing[index])) continue;
        const img = takeOrRepeat({
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
