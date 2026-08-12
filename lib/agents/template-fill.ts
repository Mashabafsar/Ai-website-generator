import { getVariantSpec } from "@/lib/sections/registry";
import { shortId } from "@/lib/utils";
import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import type { WebsiteBlueprint, WebsiteSection } from "@/lib/blueprint/types";

/**
 * Forces AI output onto the selected template's locked slot list. The model is
 * only ever a copywriter here: whatever it returns, the finished blueprint has
 * exactly the template's sections, in the template's order, with the template's
 * fields. Anything it invented is dropped; anything it skipped falls back to the
 * registry defaults.
 */
export function conformToTemplate(
  blueprint: WebsiteBlueprint,
  req: NormalizedRequirements
): WebsiteBlueprint {
  const generated = blueprint.pages.flatMap((page) => page.sections);
  const claimed = new Set<number>();

  const sections = req.template.sections
    .map((variant): WebsiteSection | null => {
      const spec = getVariantSpec(variant);
      if (!spec) return null;

      const sourceIndex = takeMatch(generated, claimed, spec.variant, spec.type);
      const source = sourceIndex === -1 ? null : generated[sourceIndex];
      if (sourceIndex !== -1) claimed.add(sourceIndex);

      const defaults = spec.defaults(req.context);
      const content: WebsiteSection["content"] = {};
      for (const field of spec.fields) {
        content[field.key] = pickValue(
          source?.content?.[field.key],
          defaults[field.key],
          field.type === "string[]"
        );
      }

      return {
        id: source?.id || shortId(spec.type),
        type: spec.type,
        variant: spec.variant,
        content,
        imageKeywords: spec.needsImage
          ? (source?.imageKeywords?.length ? source.imageKeywords : spec.keywords(req.context))
          : undefined,
        selectedImage: source?.selectedImage ?? null,
        itemImages: source?.itemImages,
      };
    })
    .filter((s): s is WebsiteSection => s !== null);

  return {
    ...blueprint,
    pages: [
      {
        slug: "home",
        title: req.business.name || "Home",
        sections,
      },
    ],
  };
}

/** Prefers an exact variant match, then any unused section of the same type. */
function takeMatch(
  sections: WebsiteSection[],
  claimed: Set<number>,
  variant: string,
  type: string
): number {
  for (let i = 0; i < sections.length; i++) {
    if (!claimed.has(i) && sections[i].variant === variant) return i;
  }
  for (let i = 0; i < sections.length; i++) {
    if (!claimed.has(i) && sections[i].type === type) return i;
  }
  return -1;
}

function pickValue(
  candidate: string | string[] | undefined,
  fallback: string | string[] | undefined,
  wantsArray: boolean
): string | string[] {
  const safeFallback = fallback ?? (wantsArray ? [] : "");

  if (wantsArray) {
    if (!Array.isArray(candidate)) return safeFallback;
    const cleaned = candidate.map(String).filter((v) => v.trim().length > 0);
    return cleaned.length ? cleaned : safeFallback;
  }

  if (typeof candidate !== "string" || !candidate.trim()) return safeFallback;
  return candidate;
}
