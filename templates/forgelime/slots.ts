import type { TemplateSlotRegion } from "../contracts";

/** Maps Forge Lime's visual bands to the locked home-page blueprint slots. */
export const forgelimeSlots: TemplateSlotRegion[] = [
  { region: "hero", type: "hero", occurrence: 0 },
  { region: "about", type: "features", occurrence: 0 },
  { region: "solutions", type: "services", occurrence: 0 },
  { region: "process", type: "process", occurrence: 0 },
  { region: "statistics", type: "features", occurrence: 1 },
  { region: "testimonials", type: "testimonials", occurrence: 0 },
  { region: "advantages", type: "features", occurrence: 2 },
  { region: "faq", type: "faq", occurrence: 0 },
  { region: "contact", type: "contact", occurrence: 0 },
  { region: "footer", type: "footer", occurrence: 0 },
];
