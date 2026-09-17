// The fixed catalog of page types a website can be built from. "home" is always
// present. The Website Planner Agent chooses optional pages (among those the
// chosen template actually supports) from the customer's answers.
//
// This is the single source of truth for allowed page slugs. It is imported by
// the schema (to reject unknown slugs), the prompt builder (to describe the
// choice to the model), and conformToTemplate (to enforce the final page set).

export const PAGE_CATALOG = [
  "home",
  "about",
  "services",
  "pricing",
  "contact",
  "faq",
  "blog",
  "portfolio",
] as const;

export type PageType = (typeof PAGE_CATALOG)[number];

/** Home is mandatory and always the first page of a site. */
export const MANDATORY_PAGE: PageType = "home";

/** Every page type the AI may optionally add on top of home. */
export const OPTIONAL_PAGES: PageType[] = PAGE_CATALOG.filter(
  (slug): slug is PageType => slug !== MANDATORY_PAGE
);

/** Human-friendly page titles used as defaults for tabs / nav / <title>. */
export const PAGE_TITLES: Record<PageType, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  pricing: "Pricing",
  contact: "Contact",
  faq: "FAQ",
  blog: "Blog",
  portfolio: "Portfolio",
};

const CATALOG_SET = new Set<string>(PAGE_CATALOG);

/** True when a slug is one of the allowed catalog page types. */
export function isCatalogPage(slug: string): slug is PageType {
  return CATALOG_SET.has(slug);
}

/** A sensible default title for a page slug (falls back to a title-cased slug). */
export function pageTitle(slug: string): string {
  if (isCatalogPage(slug)) return PAGE_TITLES[slug];
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
