import type { TemplateSlotRegion } from "../contracts";

/**
 * Maps the Sarahfolio HOME page's visual bands to the locked blueprint slots
 * they read. Other catalog pages are validated as page-level slot lists.
 */
export const sarahfolioSlots: TemplateSlotRegion[] = [
  { region: "hero", type: "hero", occurrence: 0 },
  { region: "about", type: "about", occurrence: 0 },
  { region: "services", type: "services", occurrence: 0 },
  { region: "work", type: "portfolio", occurrence: 0 },
  { region: "testimonials", type: "testimonials", occurrence: 0 },
  { region: "cta", type: "cta", occurrence: 0 },
  { region: "footer", type: "footer", occurrence: 0 },
];
