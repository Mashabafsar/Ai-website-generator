import type { QuestionnaireAnswers } from "@/lib/questionnaire/schema";
import type { SectionContext } from "@/lib/sections/registry";
import type { SiteTemplate, TemplatePageDef } from "@/lib/templates/types";
import { featuresFromVariants } from "@/lib/quote/features";

export type NormalizedRequirements = {
  business: { name: string; industry: string; description: string; location?: string };
  audience: string;
  services: string[];
  tone: string;
  visualStyle: string;
  colorPreference: string;
  features: string[];
  contact: { email?: string; phone?: string; address?: string };
  packageType: string;
  quoteSignals: string[];
  context: SectionContext;
  /** The locked design the content must be written for. */
  template: {
    id: string;
    slug: string;
    name: string;
    renderer: string;
    /** The home page's ordered content slots (kept for single-page callers). */
    sections: string[];
    /** Every page the design supports, each with its locked ordered slots. */
    pages: TemplatePageDef[];
  };
};

/**
 * Requirement Analyst Agent — turns raw questionnaire answers plus the selected
 * template into clean, structured requirements. Design decisions come from the
 * template; the questionnaire only supplies business facts. Rules-based.
 */
export function analyzeRequirements(
  answers: QuestionnaireAnswers,
  template: SiteTemplate
): NormalizedRequirements {
  const services = answers.services.map((s) => s.trim()).filter(Boolean);
  const location = answers.location?.trim() || undefined;
  // Features come from every page's slots so a multi-page design's pricing /
  // contact / gallery pages are reflected in the deterministic quote.
  const allVariants = template.pages.flatMap((p) => p.sections);
  const features = featuresFromVariants(allVariants.length ? allVariants : template.sections);

  const quoteSignals = ["service_business", "multi_section_homepage", `template:${template.slug}`];
  if (template.pages.length > 1) quoteSignals.push("multi_page");
  for (const feature of features) {
    if (feature === "contact_form") quoteSignals.push("contact_form");
    if (feature === "gallery") quoteSignals.push("gallery");
    if (feature === "pricing_table") quoteSignals.push("pricing");
  }

  const context: SectionContext = {
    businessName: answers.businessName.trim(),
    industry: answers.industry.trim(),
    description: answers.description.trim(),
    audience: answers.targetAudience.trim(),
    services,
    tone: template.tone,
    location,
    contactEmail: answers.contactEmail?.trim() || undefined,
    contactPhone: answers.contactPhone?.trim() || undefined,
  };

  return {
    business: {
      name: context.businessName,
      industry: context.industry,
      description: context.description,
      location,
    },
    audience: context.audience,
    services,
    tone: template.tone,
    visualStyle: template.visualStyle,
    colorPreference: template.colorPreference,
    features,
    contact: { email: context.contactEmail, phone: context.contactPhone, address: location },
    packageType: answers.packageType,
    quoteSignals,
    context,
    template: {
      id: template.id,
      slug: template.slug,
      name: template.name,
      renderer: template.renderer,
      sections: template.sections,
      pages: template.pages,
    },
  };
}
