// Boundary-safe helpers for the template page structure. The DB `Template.sections`
// column is a JSON string that supports TWO shapes so old single-page seeds keep
// working while multi-page designs describe every page they ship:
//
//   legacy (single "home" page):  ["hero-...", "features-grid", ...]
//   multi-page:                   { "pages": [ { "slug", "title", "sections" } ] }
//
// Everything reads and writes through here, so the two formats can never drift.
// No prisma / React imports — safe from the Prisma seed script and the app alike.

import { MANDATORY_PAGE, pageTitle } from "../blueprint/page-catalog";
import type { TemplatePageDef } from "./types";

const isString = (v: unknown): v is string => typeof v === "string";

function normalizePage(input: unknown): TemplatePageDef | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  const slug = isString(obj.slug) ? obj.slug : null;
  if (!slug) return null;
  const sections = Array.isArray(obj.sections) ? obj.sections.filter(isString) : [];
  const title = isString(obj.title) && obj.title.trim() ? obj.title : pageTitle(slug);
  return { slug, title, sections };
}

/**
 * The home page is always present and always first. Reorders any page list so a
 * "home" entry leads, synthesizing an empty one only if the data omitted it.
 */
function withHomeFirst(pages: TemplatePageDef[]): TemplatePageDef[] {
  const home = pages.find((p) => p.slug === MANDATORY_PAGE);
  const rest = pages.filter((p) => p.slug !== MANDATORY_PAGE);
  if (home) return [home, ...rest];
  return [{ slug: MANDATORY_PAGE, title: pageTitle(MANDATORY_PAGE), sections: [] }, ...rest];
}

/** The full page list for a seed, defaulting a single-page design to just home. */
export function resolveSeedPages(seed: {
  sections: string[];
  pages?: TemplatePageDef[];
}): TemplatePageDef[] {
  if (seed.pages?.length) return withHomeFirst(seed.pages.map((p) => ({ ...p })));
  return [{ slug: MANDATORY_PAGE, title: pageTitle(MANDATORY_PAGE), sections: seed.sections }];
}

/** JSON string stored in `Template.sections` for a given page list. */
export function serializeTemplatePages(pages: TemplatePageDef[]): string {
  return JSON.stringify({ pages });
}

/**
 * Parse the stored `Template.sections` value into a page list plus the flat home
 * section array. Accepts both the legacy array shape and the multi-page object.
 */
export function parseSectionsField(raw: string): {
  pages: TemplatePageDef[];
  sections: string[];
} {
  const empty = { slug: MANDATORY_PAGE, title: pageTitle(MANDATORY_PAGE), sections: [] as string[] };
  try {
    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      const sections = parsed.filter(isString);
      return { pages: [{ ...empty, sections }], sections };
    }

    if (parsed && typeof parsed === "object" && Array.isArray((parsed as { pages?: unknown }).pages)) {
      const list = (parsed as { pages: unknown[] }).pages
        .map(normalizePage)
        .filter((p): p is TemplatePageDef => p !== null);
      const pages = withHomeFirst(list);
      const home = pages.find((p) => p.slug === MANDATORY_PAGE) ?? pages[0];
      return { pages, sections: home?.sections ?? [] };
    }
  } catch {
    // Fall through to the empty single-page default.
  }
  return { pages: [empty], sections: [] };
}
