import type { TemplateSlotRegion } from "../contracts";

/** Maps Techvantage's visual bands to the locked blueprint slots they read. */
export const techvantageSlots: TemplateSlotRegion[] = [
  { region: "hero", type: "hero", occurrence: 0 },
  { region: "services", type: "services", occurrence: 0 },
  { region: "about", type: "about", occurrence: 0 },
  // Sets its values at display size, so the seed locks this slot to the
  // `features-stats` variant — prose here overlaps its neighbours.
  { region: "statistics", type: "features", occurrence: 0 },
  { region: "why choose us", type: "features", occurrence: 1 },
  { region: "approach", type: "features", occurrence: 2 },
  { region: "testimonials", type: "testimonials", occurrence: 0 },
  { region: "case studies", type: "portfolio", occurrence: 0 },
  { region: "articles", type: "features", occurrence: 3 },
  { region: "faq", type: "faq", occurrence: 0 },
  { region: "cta", type: "cta", occurrence: 0 },
  { region: "footer", type: "footer", occurrence: 0 },
];
