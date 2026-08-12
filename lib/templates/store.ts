// Runtime template reads. The library UI and the generation pipeline both go
// through here so publishing a row is enough to change what users can pick.

import type { Template as PrismaTemplate } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TEMPLATE_SLUG } from "@/lib/templates/registry";
import type { SiteTemplate } from "@/lib/templates/types";

export function parseTemplate(row: PrismaTemplate): SiteTemplate {
  let sections: string[] = [];
  try {
    const parsed: unknown = JSON.parse(row.sections);
    if (Array.isArray(parsed)) {
      sections = parsed.filter((s): s is string => typeof s === "string");
    }
  } catch {
    sections = [];
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    bestFor: row.bestFor,
    thumbnailUrl: row.thumbnailUrl,
    previewImageUrl: row.previewImageUrl,
    accent: row.accent,
    colorPreference: row.colorPreference,
    visualStyle: row.visualStyle,
    tone: row.tone,
    sections,
    renderer: row.renderer,
    published: row.published,
    sortOrder: row.sortOrder,
  };
}

export async function listPublishedTemplates(): Promise<SiteTemplate[]> {
  const rows = await prisma.template.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(parseTemplate);
}

export async function getTemplateById(id: string): Promise<SiteTemplate | null> {
  const row = await prisma.template.findUnique({ where: { id } });
  return row ? parseTemplate(row) : null;
}

export async function getTemplateBySlug(slug: string): Promise<SiteTemplate | null> {
  const row = await prisma.template.findUnique({ where: { slug } });
  return row ? parseTemplate(row) : null;
}

/** True only for templates a user is allowed to select right now. */
export async function isPublishedTemplate(idOrSlug: string): Promise<boolean> {
  const row = await prisma.template.findFirst({
    where: { published: true, OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true },
  });
  return Boolean(row);
}

/**
 * Resolve the design a project was built with. Falls back to the first published
 * template so older projects created before the library still render.
 */
export async function resolveTemplate(idOrSlug: string | null | undefined): Promise<SiteTemplate> {
  if (idOrSlug) {
    const byId = await getTemplateById(idOrSlug);
    if (byId) return byId;
    const bySlug = await getTemplateBySlug(idOrSlug);
    if (bySlug) return bySlug;
  }

  const [firstPublished] = await listPublishedTemplates();
  if (firstPublished) return firstPublished;

  const fallback = await getTemplateBySlug(DEFAULT_TEMPLATE_SLUG);
  if (fallback) return fallback;

  throw new Error("No templates available — run `npm run db:seed` to populate the library.");
}
