import type { TemplateSlotRegion } from "../contracts";

/** Maps ForgeTech's visual bands to the locked blueprint slots they read. */
export const forgetechSlots: TemplateSlotRegion[] = [
  { region: "hero", type: "hero", occurrence: 0 },
  { region: "capabilities", type: "features", occurrence: 0 },
  { region: "about", type: "about", occurrence: 0 },
  { region: "services", type: "services", occurrence: 0 },
  { region: "value proposition", type: "features", occurrence: 1 },
  { region: "testimonials", type: "testimonials", occurrence: 0 },
  { region: "project showcase", type: "portfolio", occurrence: 0 },
  { region: "faq", type: "faq", occurrence: 0 },
  { region: "articles", type: "features", occurrence: 2 },
  { region: "cta", type: "cta", occurrence: 0 },
  { region: "footer", type: "footer", occurrence: 0 },
];
