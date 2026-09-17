import { pageTitle, type PageType } from "@/lib/blueprint/page-catalog";
import { getVariantSpec } from "@/lib/sections/registry";
import type { TemplatePageDef } from "@/lib/templates/types";
import {
  decideSitePages,
  isStructuralSection,
  shouldKeepSectionType,
  type ContentSignals,
} from "@/lib/agents/site-structure";

/** One page the customer asked us to build, with the section variants to keep. */
export type SiteLayoutPage = {
  slug: string;
  sections: string[];
};

export function isMultiPageTemplate(pages: TemplatePageDef[]): boolean {
  return pages.some((p) => p.slug !== "home");
}

/** Everyday name for a section type — not variant ids. */
export function sectionTypeLabel(type: string): string {
  switch (type) {
    case "hero":
      return "Welcome";
    case "about":
      return "About the business";
    case "services":
      return "What you offer";
    case "products":
      return "Products";
    case "features":
      return "Highlights";
    case "portfolio":
      return "Past work";
    case "process":
      return "How it works";
    case "testimonials":
      return "Customer stories";
    case "faq":
      return "Common questions";
    case "pricing":
      return "Ways to work with you";
    case "contact":
      return "Get in touch";
    case "cta":
      return "Call to action";
    case "footer":
      return "Footer";
    default:
      return type.replace(/[-_]/g, " ");
  }
}

/** Short label for a locked slot. */
export function sectionPickerLabel(variant: string, occurrence = 0): string {
  const spec = getVariantSpec(variant);
  const base = spec ? sectionTypeLabel(spec.type) : variant;
  return occurrence > 0 ? `${base} ${occurrence + 1}` : base;
}

function allowedOnPage(pageDef: TemplatePageDef, variant: string): boolean {
  return pageDef.sections.includes(variant);
}

/**
 * Rule-based plan used when the Website Planner model is unavailable.
 * Home is always on. Optional pages follow who they serve and what they offer.
 */
export function suggestedSiteLayout(
  templatePages: TemplatePageDef[],
  signals: ContentSignals
): SiteLayoutPage[] {
  const pages = templatePages.length
    ? templatePages
    : [{ slug: "home", title: pageTitle("home"), sections: [] as string[] }];
  const keepPages = decideSitePages(signals, pages);

  return pages
    .filter((page) => page.slug === "home" || keepPages.includes(page.slug as PageType))
    .map((page) => ({
      slug: page.slug,
      sections: page.sections.filter((variant) => {
        if (isStructuralSection(variant)) return true;
        const spec = getVariantSpec(variant);
        if (!spec) return false;
        return shouldKeepSectionType(spec.type, signals);
      }),
    }))
    .filter((page) => page.sections.length > 0);
}

/**
 * Pins the customer's pick to slots this design actually has. Home stays.
 * Selecting a pricing band also keeps Contact when the design has that page,
 * so "Contact our sales" has somewhere to go.
 */
export function clampSiteLayout(
  templatePages: TemplatePageDef[],
  chosen: SiteLayoutPage[] | undefined | null
): SiteLayoutPage[] {
  const pages = templatePages.length
    ? templatePages
    : [{ slug: "home", title: pageTitle("home"), sections: [] as string[] }];
  const bySlug = new Map(pages.map((p) => [p.slug, p]));
  const picked = new Map<string, Set<string>>();

  for (const page of chosen ?? []) {
    const def = bySlug.get(page.slug);
    if (!def) continue;
    const variants = new Set(
      page.sections.filter((variant) => allowedOnPage(def, variant) || isStructuralSection(variant))
    );
    for (const variant of def.sections) {
      if (isStructuralSection(variant)) variants.add(variant);
    }
    picked.set(page.slug, variants);
  }

  if (!picked.has("home") && bySlug.has("home")) {
    const home = bySlug.get("home")!;
    picked.set("home", new Set(home.sections.filter((v) => isStructuralSection(v) || home.sections.includes(v))));
  }

  const hasPricing = [...picked.values()].some((variants) =>
    [...variants].some((v) => getVariantSpec(v)?.type === "pricing")
  );
  if (hasPricing && bySlug.has("contact") && !picked.has("contact")) {
    const contact = bySlug.get("contact")!;
    picked.set("contact", new Set(contact.sections));
  }

  return pages
    .filter((page) => picked.has(page.slug))
    .map((page) => ({
      slug: page.slug,
      sections: page.sections.filter((variant) => picked.get(page.slug)?.has(variant)),
    }))
    .filter((page) => page.sections.length > 0);
}

/** Final page list generation should fill, with template titles preserved. */
export function layoutToPageDefs(
  templatePages: TemplatePageDef[],
  layout: SiteLayoutPage[]
): TemplatePageDef[] {
  const bySlug = new Map(templatePages.map((p) => [p.slug, p]));
  return layout
    .map((page) => {
      const def = bySlug.get(page.slug);
      if (!def) return null;
      return {
        slug: def.slug,
        title: def.title,
        sections: def.sections.filter((variant) => page.sections.includes(variant)),
      };
    })
    .filter((page): page is TemplatePageDef => Boolean(page && page.sections.length));
}

/**
 * Turn a saved or AI-planned layout into locked pages. Empty records fall
 * back to the content-based suggestion so generation still runs.
 */
export function resolveSiteLayout(
  templatePages: TemplatePageDef[],
  chosen: SiteLayoutPage[] | undefined | null,
  signals: ContentSignals
): TemplatePageDef[] {
  const source =
    chosen && chosen.length ? clampSiteLayout(templatePages, chosen) : suggestedSiteLayout(templatePages, signals);
  const defs = layoutToPageDefs(templatePages, source);
  if (defs.length) return defs;
  return layoutToPageDefs(templatePages, suggestedSiteLayout(templatePages, signals));
}
