import type { TemplateSlotRegion } from "../contracts";

/** Maps CraftedSpaces' visual bands to the locked blueprint slots they read. */
export const craftedspacesSlots: TemplateSlotRegion[] = [
  { region: "hero", type: "hero", occurrence: 0 },
  { region: "recent projects", type: "portfolio", occurrence: 0 },
  { region: "about / experience", type: "about", occurrence: 0 },
  { region: "capabilities", type: "features", occurrence: 0 },
  { region: "services", type: "services", occurrence: 0 },
  { region: "testimonials", type: "testimonials", occurrence: 0 },
  { region: "gallery", type: "portfolio", occurrence: 1 },
  { region: "blogs", type: "features", occurrence: 1 },
  { region: "faq", type: "faq", occurrence: 0 },
  { region: "cta", type: "cta", occurrence: 0 },
  { region: "footer", type: "footer", occurrence: 0 },
];
