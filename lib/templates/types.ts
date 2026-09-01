// A template is one complete website design. Users pick exactly one; they never
// assemble a site out of individual sections.

export const TEMPLATE_RENDERERS = [
  "standard-sections",
  "forgetech",
  "techvantage",
  "craftedspaces",
  "whiter",
  "mainfile",
  "saasldg",
] as const;
export type TemplateRenderer = (typeof TEMPLATE_RENDERERS)[number];

/**
 * One page of a (possibly multi-page) design. `slug` must be a page-catalog type
 * (see lib/blueprint/page-catalog.ts); `sections` is that page's locked, ordered
 * list of section registry variants. A single-page design is just one page whose
 * slug is "home".
 */
export type TemplatePageDef = {
  slug: string;
  title: string;
  sections: string[];
};

export type SiteTemplate = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  bestFor: string;
  thumbnailUrl: string;
  previewImageUrl: string;
  accent: string;
  colorPreference: string;
  visualStyle: string;
  tone: string;
  /**
   * The home page's locked, ordered content slots. Kept as a flat array for
   * backward compatibility (quotes, features, single-page renderers). It always
   * mirrors the "home" entry in `pages`.
   * Implementation metadata — never surfaced as a selection mechanism in the UI.
   */
  sections: string[];
  /**
   * Every page this design ships, each with its own locked slot list. The first
   * entry is always "home". Single-page designs have exactly one page.
   */
  pages: TemplatePageDef[];
  renderer: string;
  published: boolean;
  sortOrder: number;
};
