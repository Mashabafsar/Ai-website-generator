// Deterministic pricing configuration for the Quote Agent. All amounts are whole
// USD dollars. The quote engine must never rely on AI opinion — only these rules.

import { PackageType } from "@/lib/constants";

export const PRICING = {
  currency: "USD",

  /** One-time site build, charged on both packages. */
  websiteCreation: 499,
  /** One-time subdomain assignment, managed hosting only. */
  subdomain: 200,
  /** Recurring hosting, managed hosting only. */
  managedHostingMonthly: 29,

  includedPages: 1,
  perAdditionalPage: 75,

  includedSections: 6,
  perExtraSection: 20,

  // Feature add-ons (one-time). Features not listed, or listed at 0, are free.
  features: {
    contact_form: 0,
    gallery: 20,
    testimonials: 0,
    faq: 0,
    pricing_table: 0,
    newsletter: 60,
  } as Record<string, number>,

  featureLabels: {
    gallery: "Image gallery",
    newsletter: "Newsletter signup",
  } as Record<string, string>,
} as const;

export const PACKAGE_LABELS: Record<string, string> = {
  [PackageType.SELF_HOSTING]: "Download your files",
  [PackageType.MANAGED_HOSTING]: "We host it for you",
};
