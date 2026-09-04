import { z } from "zod";
import { isAllowedVariant } from "@/lib/sections/registry";
import { isCatalogPage } from "@/lib/blueprint/page-catalog";
import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const contentValue = z.union([z.string(), z.array(z.string())]);

export const stockImageSchema = z.object({
  provider: z.enum(["shutterstock", "pexels", "unsplash", "placeholder", "upload", "client-site"]),
  providerImageId: z.string().optional(),
  url: z.string(),
  photographer: z.string().optional(),
  attributionRequired: z.boolean().optional(),
  licenseInfo: z.string().optional(),
  altText: z.string(),
  sourcePageUrl: z.string().max(500).optional(),
});

export const sectionSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    variant: z.string().min(1),
    content: z.record(contentValue),
    imageKeywords: z.array(z.string()).optional(),
    selectedImage: stockImageSchema.nullish(),
    itemImages: z.array(stockImageSchema.nullable()).optional(),
    // Any string parses so a saved project keeps loading after the catalog
    // changes; the icon selection agent drops names it no longer allows.
    icons: z.array(z.string().max(60).nullable()).optional(),
  })
  .refine((s) => isAllowedVariant(s.type, s.variant), {
    message: "Section variant is not in the approved registry",
    path: ["variant"],
  });

export const pageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .refine((slug) => isCatalogPage(slug), {
      message: "Page slug is not in the allowed page catalog",
    }),
  title: z.string().min(1),
  sections: z.array(sectionSchema).min(1),
});

export const seoSchema = z.object({
  title: z.string().min(1).max(70),
  description: z.string().min(1).max(200),
  keywords: z.array(z.string()).optional(),
});

export const themeSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    foreground: z.string(),
  }),
  radius: z.string(),
  fontStyle: z.string(),
  fontFamily: z.string().max(60).optional(),
  palette: z.string().max(60).optional(),
  logo: z
    .object({
      initials: z.string(),
      dataUrl: z.string(),
      svg: z.string(),
    })
    .optional(),
  logoUrl: z
    .string()
    .max(2_000_000)
    .refine((v) => /^(\/|https:\/\/|data:image\/(png|jpeg|webp|gif);)/.test(v), {
      message: "Logo must be an uploaded path, https URL, or raster image data URL",
    })
    .optional(),
});

export const blueprintSchema = z.object({
  projectId: z.string().optional(),
  business: z.object({
    name: z.string().min(1),
    industry: z.string().min(1),
    description: z.string(),
    location: z.string().optional(),
  }),
  design: z.object({
    tone: z.string(),
    colorPalette: z.array(z.string()),
    typography: z.string(),
    visualStyle: z.string(),
    palette: z.string().max(60).optional(),
    fontFamily: z.string().max(60).optional(),
  }),
  pages: z.array(pageSchema).min(1),
  seo: seoSchema,
  quoteSignals: z.array(z.string()),
  complexity: z
    .object({
      level: z.enum(["simple", "medium", "complex"]),
      reasons: z.array(z.string()).optional(),
    })
    .optional(),
});

export type ValidationResult =
  | { valid: true; blueprint: WebsiteBlueprint; errors: [] }
  | { valid: false; blueprint: null; errors: string[] };

export function validateBlueprint(input: unknown): ValidationResult {
  const parsed = blueprintSchema.safeParse(input);
  if (parsed.success) {
    return { valid: true, blueprint: parsed.data as WebsiteBlueprint, errors: [] };
  }
  const errors = parsed.error.issues.map(
    (i) => `${i.path.join(".") || "(root)"}: ${i.message}`
  );
  return { valid: false, blueprint: null, errors };
}

/** Extract a JSON object from a model response that may include prose / fences. */
export function extractJson(raw: string): unknown | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  // Prefer fenced ```json blocks.
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    // Fall back to the first {...} span.
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
