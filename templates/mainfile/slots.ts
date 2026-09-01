import type { TemplateSlotRegion } from "../contracts";

/**
 * Maps the Mraval HOME page's visual bands to the locked blueprint slots they
 * read. (The validator checks this against the seed's home section list; the
 * design's other pages are validated as page-level slot lists in validate.ts.)
 */
export const mainfileSlots: TemplateSlotRegion[] = [
  { region: "hero", type: "hero", occurrence: 0 },
  { region: "feature tiles", type: "features", occurrence: 0 },
  { region: "value story", type: "about", occurrence: 0 },
  { region: "why choose us", type: "features", occurrence: 1 },
  { region: "testimonials", type: "testimonials", occurrence: 0 },
  { region: "cta", type: "cta", occurrence: 0 },
  { region: "footer", type: "footer", occurrence: 0 },
];
