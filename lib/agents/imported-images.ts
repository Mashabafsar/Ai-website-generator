import type { ImportedBrandImage } from "@/lib/branding/imported-brand";
import type { StockImageReference, WebsiteBlueprint } from "@/lib/blueprint/types";
import { collectImageSlots, setSlotImage, slotImage, type ImageSlot } from "@/lib/agents/image-slots";
import {
  assignBest,
  contentWords,
  MIN_FIT_SCORE,
  scorePhoto,
  type PhotoFacts,
} from "@/lib/images/placement";

// Places photos pulled from a customer's own site into the slots they belong
// in, before stock photography fills whatever is left. Each photo goes where
// its content fits (a team shot to About, a treatment room to the matching
// service), judged from the vision analysis taken at import or, failing that,
// its alt text. A photo that fits nowhere is left out rather than forced in.

const TEMPLATE_ASSET = /^\/templates\//;

/** Section-level slots that can take a good photo even when little is known about it. */
const OPEN_ROLES = new Set(["hero", "about", "cta"]);

function toRef(img: ImportedBrandImage, alt: string): StockImageReference {
  return {
    provider: "upload",
    url: img.url,
    altText: img.altText || img.analysis?.description || alt,
    description: img.analysis?.description || img.altText || undefined,
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

export function importedPhotoFacts(img: ImportedBrandImage): PhotoFacts {
  return {
    description: img.analysis?.description || img.altText,
    tags: img.analysis?.tags,
    kind: img.analysis?.kind,
    quality: img.analysis?.quality,
    orientation: img.orientation,
  };
}

/** True when nothing is known about what the photo shows. */
function isUnknown(img: ImportedBrandImage): boolean {
  return !img.analysis && contentWords(img.altText).length === 0;
}

function scoreImported(img: ImportedBrandImage, slot: ImageSlot): number {
  const score = scorePhoto(importedPhotoFacts(img), slot.intent);
  if (!isUnknown(img)) return score;
  // Unanalysed and unlabelled: only a broad section photo is a safe home.
  if (slot.itemIndex !== undefined || !OPEN_ROLES.has(slot.intent.role)) {
    return Number.NEGATIVE_INFINITY;
  }
  return score + MIN_FIT_SCORE;
}

/**
 * Mutates the blueprint so image slots use the customer's own photos where
 * they fit. Editor uploads are left alone. When none of the imported photos
 * are on the page yet, stock and template photos are replaced so the site
 * actually shows the pictures pulled from the customer's website.
 */
export function assignImportedImages(
  blueprint: WebsiteBlueprint,
  imported: ImportedBrandImage[]
): WebsiteBlueprint {
  if (!imported.length) return blueprint;

  const importedUrls = new Set(imported.map((img) => img.url));
  const slots = collectImageSlots(blueprint);
  const alreadyPlaced = slots.some((slot) => isCustomerPhoto(slotImage(slot), importedUrls));
  const replaceForeign = !alreadyPlaced;

  const open = (img: StockImageReference | null | undefined): boolean => {
    if (!img?.url || TEMPLATE_ASSET.test(img.url)) return true;
    return replaceForeign && !isCustomerPhoto(img, importedUrls);
  };

  const onPage = new Set(slots.map((slot) => slotImage(slot)?.url).filter(Boolean));
  const photos = imported.filter((img) => !onPage.has(img.url));
  const targets = slots.filter((slot) => open(slotImage(slot)));
  if (!photos.length || !targets.length) return blueprint;

  const placed = assignBest({
    slotCount: targets.length,
    photoCount: photos.length,
    score: (s, p) => scoreImported(photos[p], targets[s]),
    priority: (s) => targets[s].priority,
  });

  for (const { slot, photo } of placed) {
    setSlotImage(targets[slot], toRef(photos[photo], targets[slot].altText));
  }
  return blueprint;
}
