import { shortId } from "@/lib/utils";
import { getVariantSpec } from "@/lib/sections/registry";
import type { NormalizedRequirements } from "@/lib/agents/requirement-analyst";
import type { WebsiteBlueprint, WebsitePage, WebsiteSection } from "@/lib/blueprint/types";

function makeSection(variant: string, req: NormalizedRequirements): WebsiteSection {
  const spec = getVariantSpec(variant);
  if (!spec) throw new Error(`Unknown variant in planner: ${variant}`);
  return {
    id: shortId(spec.type),
    type: spec.type,
    variant: spec.variant,
    content: spec.defaults(req.context),
    imageKeywords: spec.needsImage ? spec.keywords(req.context) : undefined,
    selectedImage: null,
  };
}

/**
 * Deterministic content generator for the selected template. Fills the
 * template's locked slots with registry defaults — used as the mock provider and
 * as the fallback when the AI response can't be validated.
 */
export function buildMockBlueprint(req: NormalizedRequirements): WebsiteBlueprint {
  const page: WebsitePage = {
    slug: "home",
    title: req.business.name || "Home",
    sections: req.template.sections.map((v) => makeSection(v, req)),
  };
  const pages: WebsitePage[] = [page];

  const sectionCount = page.sections.length;
  const complexityLevel =
    sectionCount >= 9 ? "complex" : sectionCount >= 7 ? "medium" : "simple";

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
      title: `${req.business.name} | ${req.business.industry}`.slice(0, 70),
      description: (
        req.business.description ||
        `${req.business.name} — ${req.business.industry} for ${req.audience}.`
      ).slice(0, 200),
      keywords: [req.business.industry, ...req.services].slice(0, 8),
    },
    quoteSignals: req.quoteSignals,
    complexity: {
      level: complexityLevel,
      reasons: [
        `${req.template.name} template`,
        `${sectionCount} section(s)`,
        `${req.features.length} feature(s)`,
        req.services.length > 4 ? "many services" : "focused services",
      ],
    },
  };
}
