import type { TemplateSlotRegion } from "../contracts";

/**
 * Maps the Stratus HOME page's visual bands to the locked blueprint slots they
 * read. Stratus is single-page, so this is the whole design. (The validator
 * checks this against the seed's home section list.)
 */
export const saasldgSlots: TemplateSlotRegion[] = [
  { region: "hero", type: "hero", occurrence: 0 },
  { region: "features", type: "features", occurrence: 0 },
  { region: "pricing", type: "pricing", occurrence: 0 },
  { region: "faq", type: "faq", occurrence: 0 },
  { region: "testimonials", type: "testimonials", occurrence: 0 },
  { region: "cta", type: "cta", occurrence: 0 },
  { region: "footer", type: "footer", occurrence: 0 },
];
