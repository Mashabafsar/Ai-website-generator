import type { QuestionnaireAnswers } from "@/lib/questionnaire/schema";
import {
  hasImportedTheme,
  parseImportedBrand,
  type ImportedBrand,
} from "@/lib/branding/imported-brand";
import type { SectionContext } from "@/lib/sections/registry";
import type { SiteTemplate, TemplatePageDef } from "@/lib/templates/types";
import { featuresFromVariants } from "@/lib/quote/features";

export type NormalizedRequirements = {
  business: { name: string; industry: string; description: string; location?: string };
  audience: string;
  demographics: string;
  goals: string;
  brandingNotes: string;
  services: string[];
  tone: string;
  visualStyle: string;
  colorPreference: string;
  /**
   * True when the customer picked the color themselves. The Theme Agent lets the
   * model choose a palette only when they didn't.
   */
  colorPreferenceExplicit: boolean;
  /** Logo, photos, colours and typeface pulled from the customer's old site. */
  importedBrand?: ImportedBrand;
  /**
   * True when the customer chose to keep the imported identity. Their logo and
   * photos are used either way — those are their own assets, not a theme.
   */
  useImportedTheme: boolean;
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
 * template into clean, structured requirements. Layout stays locked to the
 * template; optional branding picks override tone and theme tokens.
 */
export function analyzeRequirements(
  answers: QuestionnaireAnswers,
  template: SiteTemplate
): NormalizedRequirements {
  const services = answers.services.map((s) => s.trim()).filter(Boolean);
  const location = answers.location?.trim() || undefined;
  const tone = answers.tone?.trim() || template.tone;
  const visualStyle = answers.visualStyle?.trim() || template.visualStyle;
  const colorPreferenceAnswer = answers.colorPreference?.trim() || "";
  const colorPreference = colorPreferenceAnswer || template.colorPreference;
  const demographics = answers.demographics?.trim() || "";
  const goals = answers.goals?.trim() || "";
  const brandingNotes = answers.brandingNotes?.trim() || "";
  const importedBrand = parseImportedBrand(answers.importedBrand) ?? undefined;
  const useImportedTheme = answers.themeSource === "imported" && hasImportedTheme(importedBrand);
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
    tone,
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
    demographics,
    goals,
    brandingNotes,
    services,
    tone,
    visualStyle,
    colorPreference,
    colorPreferenceExplicit: Boolean(colorPreferenceAnswer),
    importedBrand,
    useImportedTheme,
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
