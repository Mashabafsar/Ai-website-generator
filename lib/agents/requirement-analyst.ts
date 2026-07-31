import type { QuestionnaireAnswers } from "@/lib/questionnaire/schema";
import type { SectionContext } from "@/lib/sections/registry";

export type NormalizedRequirements = {
  business: { name: string; industry: string; description: string; location?: string };
  audience: string;
  services: string[];
  tone: string;
  visualStyle: string;
  colorPreference: string;
  pages: string[];
  features: string[];
  contact: { email?: string; phone?: string };
  packageType: string;
  quoteSignals: string[];
  context: SectionContext;
};

/**
 * Requirement Analyst Agent — turns raw questionnaire answers into clean,
 * structured requirements the rest of the pipeline can rely on. Rules-based
 * (no model needed) per the architecture's MVP guidance.
 */
export function analyzeRequirements(answers: QuestionnaireAnswers): NormalizedRequirements {
  const services = answers.services.map((s) => s.trim()).filter(Boolean);
  const location = answers.location?.trim() || undefined;

  const quoteSignals: string[] = ["service_business", "multi_section_homepage"];
  if (answers.features.includes("contact_form")) quoteSignals.push("contact_form");
  if (answers.features.includes("gallery")) quoteSignals.push("gallery");
  if (answers.features.includes("pricing_table")) quoteSignals.push("pricing");
  if (answers.pages.length > 3) quoteSignals.push("multi_page");

  const context: SectionContext = {
    businessName: answers.businessName.trim(),
    industry: answers.industry.trim(),
    description: answers.description.trim(),
    audience: answers.targetAudience.trim(),
    services,
    tone: answers.tone,
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
    tone: answers.tone,
    visualStyle: answers.visualStyle,
    colorPreference: answers.colorPreference,
    pages: answers.pages,
    features: answers.features,
    contact: { email: context.contactEmail, phone: context.contactPhone },
    packageType: answers.packageType,
    quoteSignals,
    context,
  };
}
