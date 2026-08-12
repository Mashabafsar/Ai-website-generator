import { z } from "zod";
import { PackageType } from "@/lib/constants";

// The design comes from the selected template, not the questionnaire — tone,
// visual style, palette, and section order all ship with the template. These
// vocabularies stay here as the allowed values a template may declare.

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
  services: z
    .array(z.string().min(1))
    .min(1, "Add at least one service or product")
    .max(12),

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
  services: [],
  contactEmail: "",
  contactPhone: "",
  packageType: PackageType.SELF_HOSTING,
};
