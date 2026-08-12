// Slot access shared by every bespoke template renderer. A design reads its
// content out of the blueprint's fixed slots, so the layout can never change —
// only the words and images inside it.

import type { AssembledSite, WebsiteBlueprint } from "@/lib/blueprint/types";

export type SlotContent = Record<string, string | string[]>;

export type TemplateSlot = {
  type: string;
  variant: string;
  content: SlotContent;
  image?: string;
  itemImages: (string | undefined)[];
};

type ImageLike = { url?: string } | null | undefined;

const url = (image: ImageLike): string | undefined => image?.url || undefined;

/**
 * Renderers are used both by the live editor (blueprint) and by the persisted
 * preview/export (assembled site), so both shapes flatten into one slot list.
 */
export function toSlots(
  blueprint?: WebsiteBlueprint | null,
  site?: AssembledSite | null
): TemplateSlot[] {
  const fromBlueprint = blueprint?.pages[0]?.sections;
  if (fromBlueprint?.length) {
    return fromBlueprint.map((section) => ({
      type: section.type,
      variant: section.variant,
      content: section.content as SlotContent,
      image: url(section.selectedImage),
      itemImages: (section.itemImages ?? []).map(url),
    }));
  }

  const fromSite = site?.pages[0]?.sections;
  if (fromSite?.length) {
    return fromSite.map((section) => {
      const props = section.props as SlotContent & {
        image?: ImageLike;
        selectedImage?: ImageLike;
        itemImages?: ImageLike[];
      };
      return {
        type: section.type,
        variant: section.variant,
        content: props,
        image: url(props.image) || url(props.selectedImage),
        itemImages: (props.itemImages ?? []).map(url),
      };
    });
  }

  return [];
}

const EMPTY: TemplateSlot = { type: "", variant: "", content: {}, itemImages: [] };

/** Nth slot of a given type — designs reuse `features` for several bands. */
export function slotAt(slots: TemplateSlot[], type: string, occurrence = 0): TemplateSlot {
  let seen = 0;
  for (const slot of slots) {
    if (slot.type !== type) continue;
    if (seen === occurrence) return slot;
    seen += 1;
  }
  return EMPTY;
}

export function text(content: SlotContent, key: string, fallback = ""): string {
  const value = content[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function list(content: SlotContent, key: string, fallback: string[] = []): string[] {
  const value = content[key];
  if (!Array.isArray(value)) return fallback;
  const cleaned = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return cleaned.length ? cleaned : fallback;
}
