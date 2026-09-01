import { z } from "zod";
import { PackageType } from "@/lib/constants";

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
  "Warm sunset",
  "Monochrome",
  "Deep navy",
  "Rose & plum",
] as const;

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values).optional().or(z.literal(""));

export const questionnaireSchema = z.object({
  // Selected website design (Template.id). Validated against the DB server-side.
  templateId: z.string().min(1, "Choose a design from the template library"),

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
  colorPreference: optionalEnum(COLOR_PREFERENCES),
  visualStyle: optionalEnum(VISUAL_STYLES),
  brandingNotes: z.string().max(400).optional().or(z.literal("")),

  // Contact
  contactEmail: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  contactPhone: z.string().max(40).optional().or(z.literal("")),

  // Delivery
  packageType: z.nativeEnum(PackageType).default(PackageType.SELF_HOSTING),
});

export type QuestionnaireAnswers = z.infer<typeof questionnaireSchema>;

export const defaultQuestionnaire: QuestionnaireAnswers = {
  templateId: "",
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
  contactEmail: "",
  contactPhone: "",
  packageType: PackageType.SELF_HOSTING,
};

/** Merge stored JSON with defaults so records saved before new fields still parse. */
export function parseQuestionnaireAnswers(raw: unknown): QuestionnaireAnswers {
  const source = typeof raw === "string" ? JSON.parse(raw) : raw;
  const merged = { ...defaultQuestionnaire, ...(source as Partial<QuestionnaireAnswers>) };
  const parsed = questionnaireSchema.safeParse(merged);
  if (parsed.success) return parsed.data;
  return questionnaireSchema.parse({
    ...merged,
    demographics: merged.demographics || merged.targetAudience || "General audience",
    goals: merged.goals || "Present the business clearly and convert visitors.",
  });
}
