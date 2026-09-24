import { getVariantSpec } from "@/lib/sections/registry";
import { shortId } from "@/lib/utils";
import { pageTitle } from "@/lib/blueprint/page-catalog";
import { looksLikePrice } from "@/lib/pricing/contact-cta";
import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import type {
  WebsiteBlueprint,
  WebsitePage,
  WebsiteSection,
} from "@/lib/blueprint/types";
import type { TemplatePageDef } from "@/lib/templates/types";

/**
 * Forces AI output onto every locked page and section of the chosen design.
 * Missing copy falls back to wording built from the customer's answers.
 */
export function conformToTemplate(
  blueprint: WebsiteBlueprint,
  req: NormalizedRequirements
): WebsiteBlueprint {
  const templatePages = req.layout.length
    ? req.layout
    : req.template.pages.length
      ? req.template.pages
      : [{ slug: "home", title: pageTitle("home"), sections: req.template.sections }];

  const byPageSlug = new Map<string, WebsiteSection[]>();
  for (const page of blueprint.pages) {
    byPageSlug.set(page.slug, page.sections);
  }
  const allGenerated = blueprint.pages.flatMap((page) => page.sections);

  const pages: WebsitePage[] = templatePages.map((pageDef) =>
    conformPage(pageDef, byPageSlug.get(pageDef.slug) ?? [], allGenerated, req)
  );

  return { ...blueprint, pages };
}

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

      if (spec.type === "pricing") applyServicePricing(content, req.services);

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
        icons: spec.iconField ? source?.icons : undefined,
      };
    })
    .filter((s): s is WebsiteSection => s !== null);

  const title =
    pageDef.title ||
    (pageDef.slug === "home" ? req.business.name || pageTitle("home") : pageTitle(pageDef.slug));

  return { slug: pageDef.slug, title, sections };
}

/** Pricing cards list the customer's services — never published dollar rates. */
export function applyServicePricing(
  content: WebsiteSection["content"],
  services: string[]
): void {
  const names = services.map((s) => s.trim()).filter(Boolean);
  if (!names.length) {
    const existing = Array.isArray(content.planNames) ? content.planNames.map(String) : [];
    content.planNames = existing.length ? existing : ["Starter", "Growth", "Premium"];
  } else {
    content.planNames = names;
  }
  const planNames = content.planNames as string[];
  content.planPrices = planNames.map(() => "");
  const existingFeatures = Array.isArray(content.planFeatures)
    ? content.planFeatures.map(String)
    : [];
  content.planFeatures = planNames.map((name, i) => {
    const current = existingFeatures[i]?.trim() ?? "";
    if (current && !looksLikePrice(current)) return current;
    return `${name}\nContact our sales team for details and a quote.`;
  });
}

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
    if (Array.isArray(candidate)) {
      const cleaned = candidate.map(String).filter((v) => v.trim().length > 0);
      return cleaned.length ? cleaned : safeFallback;
    }
    return safeFallback;
  }

  if (typeof candidate !== "string" || !candidate.trim()) return safeFallback;
  return candidate;
}
