// Deterministic pricing configuration for the Quote Agent. All amounts are whole
// USD dollars. The quote engine must never rely on AI opinion — only these rules.

import { PackageType } from "@/lib/constants";

export const PRICING = {
  currency: "USD",

  // Base package prices.
  basePackage: {
    [PackageType.SELF_HOSTING]: { oneTime: 499, monthly: 0 },
    [PackageType.MANAGED_HOSTING]: { oneTime: 699, monthly: 29 },
  } as Record<string, { oneTime: number; monthly: number }>,

  includedPages: 1,
  perAdditionalPage: 75,

  includedSections: 6,
  perExtraSection: 20,

  complexity: { simple: 0, medium: 150, complex: 400 } as Record<string, number>,

  // Feature add-ons (one-time). Features not listed are included at no charge.
  features: {
    contact_form: 0,
    gallery: 120,
    testimonials: 0,
    faq: 0,
    pricing_table: 80,
    newsletter: 60,
  } as Record<string, number>,

  featureLabels: {
    gallery: "Image gallery",
    pricing_table: "Pricing table",
    newsletter: "Newsletter signup",
  } as Record<string, string>,
} as const;

export const PACKAGE_LABELS: Record<string, string> = {
  [PackageType.SELF_HOSTING]: "Self-hosting (ZIP export)",
  [PackageType.MANAGED_HOSTING]: "Managed hosting + subdomain",
};
