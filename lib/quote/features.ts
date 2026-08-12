// Billable features are a property of the chosen design, not a user checkbox.
// Deriving them from the locked section list keeps the Quote Agent deterministic.

const FEATURE_BY_VARIANT: Record<string, string> = {
  "faq-accordion": "faq",
  "pricing-tiers": "pricing_table",
  "contact-split": "contact_form",
  "contact-simple": "contact_form",
  "testimonials-grid": "testimonials",
  "portfolio-case-studies": "gallery",
  "products-grid": "gallery",
};

export function featuresFromVariants(variants: string[]): string[] {
  const features = new Set<string>();
  for (const variant of variants) {
    const feature = FEATURE_BY_VARIANT[variant];
    if (feature) features.add(feature);
  }
  return [...features];
}
