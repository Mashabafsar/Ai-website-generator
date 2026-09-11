import type { TemplateSlotRegion } from "../contracts";

/**
 * Maps the Rebo HOME page's visual bands to the locked blueprint slots they
 * read. Other catalog pages are validated as page-level slot lists in validate.ts.
 */
export const reboSlots: TemplateSlotRegion[] = [
  { region: "hero", type: "hero", occurrence: 0 },
  { region: "services", type: "services", occurrence: 0 },
  { region: "about", type: "about", occurrence: 0 },
  { region: "work", type: "portfolio", occurrence: 0 },
  { region: "process", type: "process", occurrence: 0 },
  { region: "testimonials", type: "testimonials", occurrence: 0 },
  { region: "marquee", type: "cta", occurrence: 0 },
  { region: "team", type: "features", occurrence: 0 },
  { region: "contact", type: "contact", occurrence: 0 },
  { region: "footer", type: "footer", occurrence: 0 },
];
