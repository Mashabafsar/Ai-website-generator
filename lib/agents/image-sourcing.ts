import { findImageForQueries } from "@/lib/images/provider";
import { getVariantSpec } from "@/lib/sections/registry";
import { itemImageQueries, sectionImageQueries } from "@/lib/agents/image-keywords";
import type { ImportedBrand, ImportedBrandImage } from "@/lib/branding/imported-brand";
import type { StockImageReference, WebsiteBlueprint } from "@/lib/blueprint/types";

/**
 * A customer's own photographs, drawn on before any stock provider. They are
 * handed out largest-slot-first: the hero and about images are the ones a
 * visitor actually looks at, so authentic photography belongs there before it
 * goes into a service card.
 */
class ClientImagePool {
  private remaining: ImportedBrandImage[];

  constructor(brand: ImportedBrand) {
    this.remaining = [...brand.images];
  }

  take(orientation: "landscape" | "portrait" | "square"): StockImageReference | null {
    if (!this.remaining.length) return null;
    let index = this.remaining.findIndex((img) => img.orientation === orientation);
    if (index === -1) index = 0;
    const [picked] = this.remaining.splice(index, 1);
    return {
      provider: "client-site",
      providerImageId: picked.url.split("/").pop(),
      url: picked.url,
      altText: picked.altText,
      attributionRequired: false,
      licenseInfo: `Imported from the client's own website (${picked.sourcePageUrl})`,
      sourcePageUrl: picked.sourcePageUrl,
    };
  }
}

/** Hands out the customer's own photos before any stock lookup runs. */
function fillFromClientImages(blueprint: WebsiteBlueprint, pool: ClientImagePool): void {
  for (const page of blueprint.pages) {
    for (const section of page.sections) {
      const spec = getVariantSpec(section.variant);
      if (!spec?.needsImage || section.selectedImage) continue;
      const image = pool.take(spec.imageOrientation ?? "landscape");
      if (!image) return;
      section.selectedImage = { ...image, altText: image.altText || `${blueprint.business.name} — ${section.type}` };
    }
  }

  for (const page of blueprint.pages) {
    for (const section of page.sections) {
      const spec = getVariantSpec(section.variant);
      if (!spec?.needsItemImages) continue;
      const titles = Array.isArray(section.content.itemTitles)
        ? section.content.itemTitles.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        : [];
      if (!titles.length) continue;

      const existing = section.itemImages ? [...section.itemImages] : [];
      while (existing.length < titles.length) existing.push(null);
      existing.length = titles.length;
      for (let index = 0; index < titles.length; index++) {
        if (existing[index]) continue;
        const image = pool.take(spec.imageOrientation ?? "square");
        if (!image) {
          section.itemImages = existing;
          return;
        }
        existing[index] = { ...image, altText: image.altText || `${titles[index]} — ${blueprint.business.name}` };
      }
      section.itemImages = existing;
    }
  }
}

/**
 * Image Sourcing Agent — fills section-level `selectedImage` and per-item
 * `itemImages` (services / products / portfolio) using the provider chain.
 * Queries come from the copy the model wrote for each section, so photos match
 * the finished page rather than the industry alone. When the customer imported
 * their old website, their own photos are placed first and stock only covers
 * what is left. Mutates and returns the same blueprint.
 */
export async function sourceImages(
  blueprint: WebsiteBlueprint,
  options: { clientImages?: ImportedBrand } = {}
): Promise<WebsiteBlueprint> {
  const business = { name: blueprint.business.name, industry: blueprint.business.industry };
  const tasks: Promise<void>[] = [];

  if (options.clientImages?.images.length) {
    fillFromClientImages(blueprint, new ClientImagePool(options.clientImages));
  }

  for (const page of blueprint.pages) {
    for (const section of page.sections) {
      const spec = getVariantSpec(section.variant);
      if (!spec) continue;

      if (spec.needsImage && !section.selectedImage) {
        tasks.push(
          findImageForQueries({
            queries: sectionImageQueries(section, business),
            orientation: spec.imageOrientation ?? "landscape",
            altText: `${blueprint.business.name} — ${section.type}`,
          }).then((img) => {
            section.selectedImage = img;
          })
        );
      }

      if (spec.needsItemImages) {
        const titles = Array.isArray(section.content.itemTitles)
          ? section.content.itemTitles.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
          : [];
        if (!titles.length) continue;

        const existing = section.itemImages ? [...section.itemImages] : [];
        while (existing.length < titles.length) existing.push(null);
        if (existing.length > titles.length) existing.length = titles.length;
        section.itemImages = existing;

        // One section's items resolve in series so each can rule out the photos
        // its siblings already took; separate sections still run in parallel.
        tasks.push(
          (async () => {
            const taken = new Set(existing.filter(Boolean).map((img) => img!.url));
            for (const [index, title] of titles.entries()) {
              if (existing[index]) continue;
              const img = await findImageForQueries({
                queries: itemImageQueries(title, business),
                orientation: spec.imageOrientation ?? "square",
                altText: `${title} — ${blueprint.business.name}`,
                taken,
              });
              taken.add(img.url);
              if (!section.itemImages) section.itemImages = [];
              section.itemImages[index] = img;
            }
          })()
        );
      }
    }
  }

  await Promise.all(tasks);
  return blueprint;
}
