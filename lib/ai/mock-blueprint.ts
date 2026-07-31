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
 * Composes the ordered section list for a single-page website. The user's page
 * selections and features decide which optional sections are included; the whole
 * site is one scrollable page (hero first, footer last).
 */
function singlePageSections(req: NormalizedRequirements): string[] {
  const hasFaq = req.features.includes("faq") || req.pages.includes("FAQ");
  const hasTestimonials = req.features.includes("testimonials");
  const hasPricing = req.features.includes("pricing_table") || req.pages.includes("Pricing");
  const hasContact =
    req.pages.includes("Contact") ||
    req.features.includes("contact_form") ||
    Boolean(req.contact.email);

  // Always assemble from the approved reference-component variants.
  const s = [
    "hero-centered",
    "about-with-image",
    "services-grid",
    "products-grid",
    "features-grid",
    "portfolio-case-studies",
    "process-steps",
  ];
  if (hasPricing) s.push("pricing-tiers");
  if (hasTestimonials) s.push("testimonials-grid");
  if (hasFaq) s.push("faq-accordion");
  s.push("cta-banner");
  if (hasContact) s.push("contact-split");
  s.push("footer-simple");
  return s;
}

/**
 * Deterministic Website Planner + generator. Produces a valid single-page
 * WebsiteBlueprint without any external model — used as the mock provider and as
 * the fallback when the AI response can't be validated.
 */
export function buildMockBlueprint(req: NormalizedRequirements): WebsiteBlueprint {
  const page: WebsitePage = {
    slug: "home",
    title: req.business.name || "Home",
    sections: singlePageSections(req).map((v) => makeSection(v, req)),
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
        "single-page site",
        `${sectionCount} section(s)`,
        `${req.features.length} feature(s)`,
        req.services.length > 4 ? "many services" : "focused services",
      ],
    },
  };
}
