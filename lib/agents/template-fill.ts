import { getVariantSpec } from "@/lib/sections/registry";
import { shortId } from "@/lib/utils";
import { pageTitle } from "@/lib/blueprint/page-catalog";
import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import type {
  WebsiteBlueprint,
  WebsitePage,
  WebsiteSection,
} from "@/lib/blueprint/types";
import type { TemplatePageDef } from "@/lib/templates/types";

/**
 * Forces AI output onto the selected template's locked layout. The model is only
 * ever a copywriter here: whatever it returns, the finished blueprint has exactly
 * the template's pages (home + whichever optional pages the model chose to write)
 * and, per page, exactly the template's sections, in the template's order, with
 * the template's fields. Anything it invented is dropped; anything it skipped
 * falls back to the registry defaults.
 *
 * This is where "the AI decides which pages to generate" is enforced: an optional
 * page is included only when the model actually returned a page with that slug
 * (and the template supports it). "home" is always present.
 */
export function conformToTemplate(
  blueprint: WebsiteBlueprint,
  req: NormalizedRequirements
): WebsiteBlueprint {
  const templatePages = req.template.pages.length
    ? req.template.pages
    : [{ slug: "home", title: pageTitle("home"), sections: req.template.sections }];

  // Every section the model wrote, indexed by the page slug it wrote it under,
  // plus a flat pool used as a fallback when a page match runs out.
  const byPageSlug = new Map<string, WebsiteSection[]>();
  for (const page of blueprint.pages) {
    byPageSlug.set(page.slug, page.sections);
  }
  const allGenerated = blueprint.pages.flatMap((page) => page.sections);

  const includedSlugs = new Set(blueprint.pages.map((p) => p.slug));

  const pages: WebsitePage[] = templatePages
    .filter((pageDef) => pageDef.slug === "home" || includedSlugs.has(pageDef.slug))
    .map((pageDef) => conformPage(pageDef, byPageSlug.get(pageDef.slug) ?? [], allGenerated, req));

  return { ...blueprint, pages };
}

/** Builds one page's locked slots, preferring copy the model wrote for it. */
function conformPage(
  pageDef: TemplatePageDef,
  pageSections: WebsiteSection[],
  fallbackPool: WebsiteSection[],
  req: NormalizedRequirements
): WebsitePage {
  const claimedLocal = new Set<number>();
  const claimedPool = new Set<number>();

  const sections = pageDef.sections
    .map((variant): WebsiteSection | null => {
      const spec = getVariantSpec(variant);
      if (!spec) return null;

      // Prefer content the model wrote under this page, then anything unused.
      let source: WebsiteSection | null = null;
      const localIndex = takeMatch(pageSections, claimedLocal, spec.variant, spec.type);
      if (localIndex !== -1) {
        claimedLocal.add(localIndex);
        source = pageSections[localIndex];
      } else {
        const poolIndex = takeMatch(fallbackPool, claimedPool, spec.variant, spec.type);
        if (poolIndex !== -1) {
          claimedPool.add(poolIndex);
          source = fallbackPool[poolIndex];
        }
      }

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
          ? source?.imageKeywords?.length
            ? source.imageKeywords
            : spec.keywords(req.context)
          : undefined,
        selectedImage: source?.selectedImage ?? null,
        itemImages: source?.itemImages,
      };
    })
    .filter((s): s is WebsiteSection => s !== null);

  const title =
    pageDef.title ||
    (pageDef.slug === "home" ? req.business.name || pageTitle("home") : pageTitle(pageDef.slug));

  return { slug: pageDef.slug, title, sections };
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
