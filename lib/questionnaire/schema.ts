import { z } from "zod";
import { PackageType } from "@/lib/constants";
import {
  importedBrandSchema,
  importedAssetConsentSchema,
  parseImportedBrand,
  parseAssetConsent,
} from "@/lib/branding/imported-brand";

// Tone, visual style, and palette vocabularies are shared: a template declares
// its defaults, and the questionnaire may optionally override them.

export const TONES = [
  "Modern & trustworthy",
  "Bold & energetic",
  "Elegant & premium",
  "Friendly & approachable",
  "Minimal & clean",
  "Professional & corporate",
] as const;

export const VISUAL_STYLES = [
  "Modern",
  "Minimal",
  "Bold",
  "Classic",
  "Playful",
  "Luxury",
] as const;

export const COLOR_PREFERENCES = [
  "Brand blue & violet",
  "Emerald & teal",
  "Green & black",
  "Warm sunset",
  "Monochrome",
  "Deep navy",
  "Rose & plum",
] as const;

/** Typed-hex option. Stored on `colorPreference`; hexes live on `customPrimary` etc. */
export const CUSTOM_COLOR_PREFERENCE = "Custom";

export const COLOR_CHOICES = [...COLOR_PREFERENCES, CUSTOM_COLOR_PREFERENCE] as const;

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values).optional().or(z.literal(""));

export const questionnaireSchema = z.object({
  // Selected website design (Template.id). Validated against the DB server-side.
  templateId: z.string().min(1, "Choose a design from the template library"),

  // Existing website (step 0). When "yes", the URL is scraped to prefill answers.
  hasWebsite: z.enum(["yes", "no"]).optional().or(z.literal("")),
  existingWebsiteUrl: z.string().max(300).optional().or(z.literal("")),

  // Business
  businessName: z.string().min(2, "Business name is required").max(80),
  industry: z.string().min(2, "Industry is required").max(60),
  description: z.string().min(10, "Tell us a bit more about the business").max(600),
  location: z.string().max(80).optional().or(z.literal("")),

  // Audience & offering
  targetAudience: z.string().min(3, "Describe your target audience").max(200),
  demographics: z.string().min(3, "Describe who you serve").max(200),
  goals: z.string().min(5, "Tell us what this website should achieve").max(400),
  services: z
    .array(z.string().min(1))
    .min(1, "Add at least one service or product")
    .max(12),

  // Optional branding — empty means keep the template's look and voice
  tone: optionalEnum(TONES),
  colorPreference: optionalEnum(COLOR_CHOICES),
  visualStyle: optionalEnum(VISUAL_STYLES),
  brandingNotes: z.string().max(400).optional().or(z.literal("")),
  /** Typed brand hexes when Colors is Custom. Optional so older records parse. */
  customPrimary: z.string().max(40).optional().or(z.literal("")),
  customSecondary: z.string().max(40).optional().or(z.literal("")),
  customAccent: z.string().max(40).optional().or(z.literal("")),
  /** Catalog id from templates/shared/fonts.ts. Empty keeps the design's type. */
  fontFamily: z.string().max(60).optional().or(z.literal("")),

  // Branding lifted from an existing website. Optional so older projects parse.
  importedThemeChoice: z.enum(["imported", "custom"]).optional().or(z.literal("")),
  importedBrand: importedBrandSchema.optional(),
  importedAssetConsent: importedAssetConsentSchema.optional(),

  // Contact
  contactEmail: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  contactPhone: z.string().max(40).optional().or(z.literal("")),

  // Delivery
  packageType: z.nativeEnum(PackageType).default(PackageType.SELF_HOSTING),
});

export type QuestionnaireAnswers = z.infer<typeof questionnaireSchema>;

export const defaultQuestionnaire: QuestionnaireAnswers = {
  templateId: "",
  hasWebsite: "",
  existingWebsiteUrl: "",
  businessName: "",
  industry: "",
  description: "",
  location: "",
  targetAudience: "",
  demographics: "",
  goals: "",
  services: [],
  tone: "",
  colorPreference: "",
  visualStyle: "",
  brandingNotes: "",
  customPrimary: "",
  customSecondary: "",
  customAccent: "",
  fontFamily: "",
  importedThemeChoice: "",
  contactEmail: "",
  contactPhone: "",
  packageType: PackageType.SELF_HOSTING,
};

/** Merge stored JSON with defaults so records saved before new fields still parse. */
export function parseQuestionnaireAnswers(raw: unknown): QuestionnaireAnswers {
  const source = typeof raw === "string" ? JSON.parse(raw) : raw;
  const incoming = (source ?? {}) as Record<string, unknown>;
  const merged = { ...defaultQuestionnaire, ...incoming } as QuestionnaireAnswers & {
    importedBrand?: unknown;
    importedAssetConsent?: unknown;
  };
  // A malformed brand or consent must not fail the rest of a saved questionnaire.
  const brand = parseImportedBrand(incoming.importedBrand);
  const consent = parseAssetConsent(incoming.importedAssetConsent);
  if (brand) merged.importedBrand = brand;
  else delete merged.importedBrand;
  if (consent) merged.importedAssetConsent = consent;
  else delete merged.importedAssetConsent;

  const parsed = questionnaireSchema.safeParse(merged);
  if (parsed.success) return parsed.data;
  return questionnaireSchema.parse({
    ...merged,
    demographics: merged.demographics || merged.targetAudience || "General audience",
    goals: merged.goals || "Present the business clearly and convert visitors.",
  });
}
