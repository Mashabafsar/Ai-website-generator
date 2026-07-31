import { findImage } from "@/lib/images/provider";
import { getVariantSpec } from "@/lib/sections/registry";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";

/**
 * Image Sourcing Agent — fills section-level `selectedImage` and per-item
 * `itemImages` (services / products / portfolio) using the provider chain.
 * Mutates and returns the same blueprint.
 */
export async function sourceImages(blueprint: WebsiteBlueprint): Promise<WebsiteBlueprint> {
  const tasks: Promise<void>[] = [];

  for (const page of blueprint.pages) {
    for (const section of page.sections) {
      const spec = getVariantSpec(section.variant);
      if (!spec) continue;

      if (spec.needsImage && !section.selectedImage) {
        const keywords = section.imageKeywords?.length
          ? section.imageKeywords
          : [blueprint.business.industry, blueprint.business.name];

        tasks.push(
          findImage({
            keywords,
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

        titles.forEach((title, index) => {
          if (existing[index]) return;
          const keywords = [
            title,
            blueprint.business.industry,
            ...spec.keywords({
              businessName: blueprint.business.name,
              industry: blueprint.business.industry,
              description: blueprint.business.description,
              audience: "",
              services: titles,
              tone: blueprint.design.tone,
            }),
          ].filter(Boolean);

          tasks.push(
            findImage({
              keywords,
              orientation: spec.imageOrientation ?? "square",
              altText: `${title} — ${blueprint.business.name}`,
            }).then((img) => {
              if (!section.itemImages) section.itemImages = [];
              section.itemImages[index] = img;
            })
          );
        });
      }
    }
  }

  await Promise.all(tasks);
  return blueprint;
}
