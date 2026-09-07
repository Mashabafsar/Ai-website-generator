// Slot access shared by every bespoke template renderer. A design reads its
// content out of the blueprint's fixed slots, so the layout can never change —
// only the words and images inside it.

import type { AssembledSite, SectionTheme, WebsiteBlueprint } from "@/lib/blueprint/types";

export type SlotContent = Record<string, string | string[]>;

export type TemplateSlot = {
  type: string;
  variant: string;
  content: SlotContent;
  image?: string;
  itemImages: (string | undefined)[];
  /**
   * Per-item icon names, positionally aligned with the variant's item array.
   * Kept sparse — a gap must stay a gap or every following item would shift onto
   * the wrong icon.
   */
  icons: (string | undefined)[];
  /** Per-section color overrides. Empty means inherit the site theme. */
  theme?: SectionTheme;
};

type ImageLike = { url?: string } | null | undefined;

const url = (image: ImageLike): string | undefined => image?.url || undefined;

const names = (icons: unknown): (string | undefined)[] =>
  Array.isArray(icons) ? icons.map((n) => (typeof n === "string" && n ? n : undefined)) : [];

/**
 * Renderers are used both by the live editor (blueprint) and by the persisted
 * preview/export (assembled site), so both shapes flatten into one slot list.
 *
 * `pageSlug` selects which page to read for multi-page designs (defaults to the
 * "home" page, then the first page). Single-page designs pass nothing and get
 * their only page.
 */
export function toSlots(
  blueprint?: WebsiteBlueprint | null,
  site?: AssembledSite | null,
  pageSlug?: string
): TemplateSlot[] {
  const pick = <T extends { slug: string }>(pages: T[] | undefined): T | undefined => {
    if (!pages?.length) return undefined;
    if (pageSlug) {
      const match = pages.find((p) => p.slug === pageSlug);
      if (match) return match;
    }
    return pages.find((p) => p.slug === "home") ?? pages[0];
  };

  const fromBlueprint = pick(blueprint?.pages)?.sections;
  if (fromBlueprint?.length) {
    return fromBlueprint.map((section) => ({
      type: section.type,
      variant: section.variant,
      content: section.content as SlotContent,
      image: url(section.selectedImage),
      itemImages: (section.itemImages ?? []).map(url),
      icons: names(section.icons),
      theme: section.theme,
    }));
  }

  const fromSite = pick(site?.pages)?.sections;
  if (fromSite?.length) {
    return fromSite.map((section) => {
      const props = section.props as SlotContent & {
        image?: ImageLike;
        selectedImage?: ImageLike;
        itemImages?: ImageLike[];
        icons?: unknown;
        theme?: SectionTheme;
      };
      return {
        type: section.type,
        variant: section.variant,
        content: props,
        image: url(props.image) || url(props.selectedImage),
        itemImages: (props.itemImages ?? []).map(url),
        icons: names(props.icons),
        theme: section.theme ?? props.theme,
      };
    });
  }

  return [];
}

/** The list of page slugs present in a blueprint or assembled site, home-first. */
export function pageSlugsOf(
  blueprint?: WebsiteBlueprint | null,
  site?: AssembledSite | null
): { slug: string; title: string }[] {
  const pages = (blueprint?.pages ?? site?.pages ?? []).map((p) => ({ slug: p.slug, title: p.title }));
  const home = pages.filter((p) => p.slug === "home");
  const rest = pages.filter((p) => p.slug !== "home");
  return [...home, ...rest];
}

const EMPTY: TemplateSlot = { type: "", variant: "", content: {}, itemImages: [], icons: [] };

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
