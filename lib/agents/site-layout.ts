import { pageTitle } from "@/lib/blueprint/page-catalog";
import { getVariantSpec } from "@/lib/sections/registry";
import type { TemplatePageDef } from "@/lib/templates/types";
import type { ContentSignals } from "@/lib/agents/site-structure";

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

/**
 * Every page and every locked section of the chosen design. The model writes
 * copy for the whole template; it does not drop bands the brief did not name.
 */
export function suggestedSiteLayout(
  templatePages: TemplatePageDef[],
  _signals?: ContentSignals
): SiteLayoutPage[] {
  const pages = templatePages.length
    ? templatePages
    : [{ slug: "home", title: pageTitle("home"), sections: [] as string[] }];

  return pages
    .filter((page) => page.sections.length > 0)
    .map((page) => ({
      slug: page.slug,
      sections: [...page.sections],
    }));
}

/**
 * Expands any planned subset to the full design. A saved or model plan can
 * only name slots this template has; generation still fills every one.
 */
export function clampSiteLayout(
  templatePages: TemplatePageDef[],
  _chosen?: SiteLayoutPage[] | undefined | null
): SiteLayoutPage[] {
  return suggestedSiteLayout(templatePages);
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
 * Locked pages generation should fill: the whole design, even when an older
 * plan saved only some of the bands.
 */
export function resolveSiteLayout(
  templatePages: TemplatePageDef[],
  _chosen?: SiteLayoutPage[] | undefined | null,
  _signals?: ContentSignals
): TemplatePageDef[] {
  return layoutToPageDefs(templatePages, suggestedSiteLayout(templatePages));
}
