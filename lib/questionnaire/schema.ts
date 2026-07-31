import { z } from "zod";
import { PackageType } from "@/lib/constants";

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

export const PAGE_OPTIONS = ["Home", "About", "Services", "Portfolio", "Pricing", "FAQ", "Contact"] as const;

export const FEATURE_OPTIONS = [
  "contact_form",
  "gallery",
  "testimonials",
  "faq",
  "pricing_table",
  "newsletter",
] as const;

export const questionnaireSchema = z.object({
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

  // Brand & design
  tone: z.enum(TONES),
  visualStyle: z.enum(VISUAL_STYLES),
  colorPreference: z.enum(COLOR_PREFERENCES),

  // Structure
  pages: z.array(z.enum(PAGE_OPTIONS)).min(1, "Select at least one page"),
  features: z.array(z.enum(FEATURE_OPTIONS)).default([]),

  // Contact
  contactEmail: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  contactPhone: z.string().max(40).optional().or(z.literal("")),

  // Package
  packageType: z.nativeEnum(PackageType).default(PackageType.SELF_HOSTING),
});

export type QuestionnaireAnswers = z.infer<typeof questionnaireSchema>;

export const defaultQuestionnaire: QuestionnaireAnswers = {
  businessName: "",
  industry: "",
  description: "",
  location: "",
  targetAudience: "",
  services: [],
  tone: TONES[0],
  visualStyle: VISUAL_STYLES[0],
  colorPreference: COLOR_PREFERENCES[0],
  pages: ["Home", "About", "Services", "Contact"],
  features: ["contact_form", "testimonials", "faq"],
  contactEmail: "",
  contactPhone: "",
  packageType: PackageType.SELF_HOSTING,
};
