import { findImageForQueries } from "@/lib/images/provider";
import { getVariantSpec } from "@/lib/sections/registry";
import { itemImageQueries, sectionImageQueries } from "@/lib/agents/image-keywords";
import { assignImportedImages } from "@/lib/agents/imported-images";
import type { ImportedBrandImage } from "@/lib/branding/imported-brand";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";

/**
 * Image Sourcing Agent — fills section-level `selectedImage` and per-item
 * `itemImages` (services / products / portfolio) using the provider chain.
 * Queries come from the copy the model wrote for each section, so photos match
 * the finished page rather than the industry alone. Mutates and returns the same
 * blueprint. Imported client photos, when present, take the matching slots first.
 */
export async function sourceImages(
  blueprint: WebsiteBlueprint,
  imported: ImportedBrandImage[] = []
): Promise<WebsiteBlueprint> {
  if (imported.length) assignImportedImages(blueprint, imported);

  const business = { name: blueprint.business.name, industry: blueprint.business.industry };
  const tasks: Promise<void>[] = [];

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
