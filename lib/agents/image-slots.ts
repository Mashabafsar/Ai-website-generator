// Every image slot on a blueprint, with what it needs to show. Shared by stock
// sourcing and customer-photo placement so both judge a slot the same way.

import { getVariantSpec, type ImageOrientation } from "@/lib/sections/registry";
import { itemImageQueries, sectionImageQueries } from "@/lib/agents/image-keywords";
import { rolePriority, slotRole, type SlotIntent } from "@/lib/images/placement";
import type { StockImageReference, WebsiteBlueprint, WebsiteSection } from "@/lib/blueprint/types";

export type ImageSlot = {
  section: WebsiteSection;
  /** Set for a per-item photo; absent for the section's own photo. */
  itemIndex?: number;
  intent: SlotIntent;
  queries: string[][];
  altText: string;
  priority: number;
};

const text = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value.filter((v) => typeof v === "string").join(" ") : value ?? "";

export function slotImage(slot: ImageSlot): StockImageReference | null | undefined {
  return slot.itemIndex === undefined
    ? slot.section.selectedImage
    : slot.section.itemImages?.[slot.itemIndex];
}

export function setSlotImage(slot: ImageSlot, image: StockImageReference): void {
  if (slot.itemIndex === undefined) {
    slot.section.selectedImage = image;
    return;
  }
  if (!slot.section.itemImages) slot.section.itemImages = [];
  slot.section.itemImages[slot.itemIndex] = image;
}

/**
 * An item's stock photo was chosen for its title, so when a rewrite changes
 * the title the photo is released and sourced again for the new subject.
 * Customer photos and uploads stay where they are.
 */
export function releaseRetitledItemPhotos(
  section: WebsiteSection,
  nextContent: Record<string, string | string[]>
): void {
  const before = section.content.itemTitles;
  const after = nextContent.itemTitles;
  if (!Array.isArray(before) || !Array.isArray(after) || !section.itemImages) return;
  section.itemImages = section.itemImages.map((img, index) =>
    img && img.provider !== "upload" && before[index] !== after[index] ? null : img
  );
}

/**
 * Lists the blueprint's image slots in page order. Per-item photo arrays are
 * resized to match their titles as a side effect, so a slot index always
 * points at the item it illustrates.
 */
export function collectImageSlots(blueprint: WebsiteBlueprint): ImageSlot[] {
  const business = { name: blueprint.business.name, industry: blueprint.business.industry };
  const industry = blueprint.business.industry;
  const slots: ImageSlot[] = [];

  for (const page of blueprint.pages) {
    for (const section of page.sections) {
      const spec = getVariantSpec(section.variant);
      if (!spec) continue;
      const c = section.content;

      if (spec.needsImage) {
        const role = slotRole(section.type, false);
        const orientation: ImageOrientation = spec.imageOrientation ?? "landscape";
        slots.push({
          section,
          intent: {
            role,
            orientation,
            subject: [text(section.imageKeywords), text(c.headline), text(c.heading)]
              .filter(Boolean)
              .join(" · "),
            context: [text(c.subheadline), text(c.subheading), text(c.body)]
              .filter(Boolean)
              .join(" ")
              .slice(0, 400),
            industry,
          },
          queries: sectionImageQueries(section, business),
          altText: `${blueprint.business.name} — ${section.type}`,
          priority: rolePriority(role),
        });
      }

      if (!spec.needsItemImages) continue;
      const titles = Array.isArray(c.itemTitles)
        ? c.itemTitles.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        : [];
      if (!titles.length) continue;
      const bodies = Array.isArray(c.itemBodies) ? c.itemBodies : [];

      const existing = section.itemImages ? [...section.itemImages] : [];
      while (existing.length < titles.length) existing.push(null);
      if (existing.length > titles.length) existing.length = titles.length;
      section.itemImages = existing;

      const role = slotRole(section.type, true);
      const orientation: ImageOrientation = spec.imageOrientation ?? "square";
      for (const [index, title] of titles.entries()) {
        const body = typeof bodies[index] === "string" ? bodies[index] : "";
        slots.push({
          section,
          itemIndex: index,
          intent: {
            role,
            orientation,
            subject: title,
            context: [body, text(c.heading)].filter(Boolean).join(" ").slice(0, 400),
            industry,
          },
          queries: itemImageQueries(title, business, body),
          altText: `${title} — ${blueprint.business.name}`,
          priority: rolePriority(role),
        });
      }
    }
  }

  return slots;
}
