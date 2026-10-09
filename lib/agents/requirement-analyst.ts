import type { QuestionnaireAnswers } from "@/lib/questionnaire/schema";
import type { SectionContext } from "@/lib/sections/registry";
import type { SiteTemplate, TemplatePageDef } from "@/lib/templates/types";
import type { SiteContact } from "@/lib/blueprint/types";
import { buildSiteContact } from "@/lib/contact/links";
import { featuresFromVariants } from "@/lib/quote/features";
import { parseUserColor } from "@/lib/theme/parse-color";
import type { CustomThemeColors } from "@/lib/agents/theme";
import { resolveSiteLayout } from "@/lib/agents/site-layout";
import { signalsFromAnswers } from "@/lib/agents/site-structure";

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
  /** Typed hexes when the customer wrote their own colors. */
  customColors?: CustomThemeColors;
  features: string[];
  contact: SiteContact;
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
  /** Every page and section of the chosen design, in template order. */
  layout: TemplatePageDef[];
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
  const customColors = readCustomColors(answers);
  const colorPreference = colorPreferenceAnswer || template.colorPreference;
  const demographics = answers.demographics?.trim() || "";
  const goals = answers.goals?.trim() || "";
  const brandingNotes = answers.brandingNotes?.trim() || "";

  const layout = resolveSiteLayout(
    template.pages,
    answers.layout,
    signalsFromAnswers({ ...answers, services })
  );

  // Features come from the pages and sections the planner kept, so the
  // deterministic quote matches the site that will actually be generated.
  const allVariants = layout.flatMap((p) => p.sections);
  const features = featuresFromVariants(allVariants.length ? allVariants : template.sections);

  const quoteSignals = ["service_business", "multi_section_homepage", `template:${template.slug}`];
  if (layout.length > 1) quoteSignals.push("multi_page");
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
    colorPreferenceExplicit: Boolean(colorPreferenceAnswer) || Boolean(customColors),
    ...(customColors ? { customColors } : {}),
    features,
    contact: buildSiteContact({
      email: context.contactEmail,
      phone: context.contactPhone,
      address: location,
      social: {
        instagram: answers.socialInstagram,
        linkedin: answers.socialLinkedin,
        twitter: answers.socialTwitter,
        facebook: answers.socialFacebook,
        youtube: answers.socialYoutube,
      },
    }) ?? {},
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
    layout,
  };
}

function readCustomColors(answers: QuestionnaireAnswers): CustomThemeColors | undefined {
  const primary = parseUserColor(answers.customPrimary || "");
  const secondary = parseUserColor(answers.customSecondary || "");
  const accent = parseUserColor(answers.customAccent || "");
  if (!primary && !secondary && !accent) return undefined;
  return {
    ...(primary ? { primary } : {}),
    ...(secondary ? { secondary } : {}),
    ...(accent ? { accent } : {}),
  };
}

