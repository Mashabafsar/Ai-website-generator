// A template is one complete website design. Users pick exactly one; they never
// assemble a site out of individual sections.

export const TEMPLATE_RENDERERS = [
  "standard-sections",
  "forgetech",
  "techvantage",
  "craftedspaces",
] as const;
export type TemplateRenderer = (typeof TEMPLATE_RENDERERS)[number];

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
   * Locked, ordered content slots (section registry variants) the AI must fill.
   * Implementation metadata — never surfaced as a selection mechanism in the UI.
   */
  sections: string[];
  renderer: string;
  published: boolean;
  sortOrder: number;
};
