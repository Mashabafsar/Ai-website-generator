import { shortId } from "@/lib/utils";
import { getVariantSpec } from "@/lib/sections/registry";
import { pageTitle } from "@/lib/blueprint/page-catalog";
import { applyServicePricing } from "@/lib/agents/template-fill";
import { searchPhrases } from "@/lib/ai/prompt-builder";
import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import type { WebsiteBlueprint, WebsitePage, WebsiteSection } from "@/lib/blueprint/types";

function makeSection(variant: string, req: NormalizedRequirements): WebsiteSection {
  const spec = getVariantSpec(variant);
  if (!spec) throw new Error(`Unknown variant in planner: ${variant}`);
  const content = spec.defaults(req.context);
  if (spec.type === "pricing") applyServicePricing(content, req.services);
  return {
    id: shortId(spec.type),
    type: spec.type,
    variant: spec.variant,
    content,
    imageKeywords: spec.needsImage ? spec.keywords(req.context) : undefined,
    selectedImage: null,
  };
}

/**
 * Deterministic content generator for the selected template. Fills the pages
 * and slots the Website Planner chose. Used as the mock provider and as the fallback
 * when the AI response can't be validated.
 */
export function buildMockBlueprint(req: NormalizedRequirements): WebsiteBlueprint {
  const pageDefs = req.layout.length
    ? req.layout
    : req.template.pages.length
      ? req.template.pages
      : [{ slug: "home", title: pageTitle("home"), sections: req.template.sections }];

  const pages: WebsitePage[] = pageDefs.map((def) => ({
    slug: def.slug,
    title:
      def.title ||
      (def.slug === "home" ? req.business.name || pageTitle("home") : pageTitle(def.slug)),
    sections: def.sections.map((v) => makeSection(v, req)),
  }));

  const { primary, secondary } = searchPhrases(req);
  const sectionCount = pages.reduce((n, p) => n + p.sections.length, 0);
  const complexityLevel =
    sectionCount >= 14 ? "complex" : sectionCount >= 9 ? "medium" : "simple";

  return {
    business: {
      name: req.business.name,
      industry: req.business.industry,
      description: req.business.description,
      location: req.business.location,
    },
    design: {
      tone: req.tone,
      colorPalette: [req.colorPreference],
      typography: req.visualStyle,
      visualStyle: req.visualStyle,
    },
    pages,
    seo: {
      title: `${primary} | ${req.business.name}`.slice(0, 70),
      description: (
        req.business.description ||
        `${req.business.name} — ${primary} for ${req.audience}.`
      ).slice(0, 160),
      keywords: [primary, ...secondary].slice(0, 6),
    },
    quoteSignals: req.quoteSignals,
    complexity: {
      level: complexityLevel,
      reasons: [
        `${req.template.name} template`,
        `${pages.length} page(s)`,
        `${sectionCount} section(s)`,
        `${req.features.length} feature(s)`,
        req.services.length > 4 ? "many services" : "focused services",
      ],
    },
  };
}
