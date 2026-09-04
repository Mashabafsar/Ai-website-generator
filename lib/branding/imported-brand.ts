import { z } from "zod";

// The branding lifted from a customer's existing website: their logo, their
// photos, their colours, and the nearest catalog match to their typeface. Kept
// free of server-only imports so the questionnaire schema (and therefore the
// wizard) can validate it on both sides of the wire.

/**
 * Marks a theme as deliberately art-directed by the customer's own site, which
 * is what lets `templates/shared/brand.ts` paint with the imported primary
 * instead of each design's signature accent.
 */
export const IMPORTED_PALETTE_NAME = "Imported from your website";

export const MAX_IMPORTED_IMAGES = 8;

/** Assets always land in this project's own upload folder — never hot-linked. */
const uploadPath = z
  .string()
  .max(300)
  .regex(/^\/uploads\/[A-Za-z0-9][A-Za-z0-9._/-]*$/, "Imported assets must be stored uploads")
  .refine((v) => !v.includes(".."), "Invalid upload path");

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Expected a #rrggbb colour");

const httpUrl = z
  .string()
  .max(500)
  .refine((v) => /^https?:\/\//i.test(v), "Expected an http(s) URL");


export const importedBrandColorsSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  accent: hexColor,
  background: hexColor,
  foreground: hexColor,
});

export const importedBrandImageSchema = z.object({
  url: uploadPath,
  altText: z.string().max(160),
  /** The page the photo was found on, kept as provenance for the licence note. */
  sourcePageUrl: httpUrl,
  orientation: z.enum(["landscape", "portrait", "square"]),
});

export const importedBrandSchema = z.object({
  sourceUrl: httpUrl,
  importedAt: z.string().max(40),
  logoUrl: uploadPath.optional(),
  colors: importedBrandColorsSchema.optional(),
  fontFamily: z.string().max(60).optional(),
  fontDetected: z.string().max(80).optional(),
  fontMatch: z.enum(["exact", "close", "loose"]).optional(),
  images: z.array(importedBrandImageSchema).max(MAX_IMPORTED_IMAGES).default([]),
  /** Human-readable reasons a piece of branding could not be detected. */
  notes: z.array(z.string().max(200)).max(8).default([]),
});

export type ImportedBrandColors = z.infer<typeof importedBrandColorsSchema>;
export type ImportedBrandImage = z.infer<typeof importedBrandImageSchema>;
export type ImportedBrand = z.infer<typeof importedBrandSchema>;

/** True when there is a visual identity worth offering the customer. */
export function hasImportedTheme(brand: ImportedBrand | null | undefined): boolean {
  return Boolean(brand?.colors || brand?.fontFamily);
}

/** True when the import produced anything at all worth showing. */
export function hasImportedBrand(brand: ImportedBrand | null | undefined): boolean {
  return Boolean(brand && (hasImportedTheme(brand) || brand.logoUrl || brand.images.length));
}

/** Parses a value stored in questionnaire answers, dropping anything malformed. */
export function parseImportedBrand(raw: unknown): ImportedBrand | null {
  if (!raw) return null;
  const parsed = importedBrandSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
