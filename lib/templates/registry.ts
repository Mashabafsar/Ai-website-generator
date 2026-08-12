// Seed definitions for the template library. The running app always reads
// templates from the database (lib/templates/store.ts); this file exists only to
// seed those rows and to sanity-check that every slot maps to a real component.

// Relative imports keep this file runnable from the standalone Prisma seed script.
import { getVariantSpec } from "../sections/registry";
import type { SiteTemplate } from "./types";

export type { SiteTemplate };

/** Seed payload shape — Prisma assigns the id. */
export type TemplateSeed = Omit<SiteTemplate, "id">;

/** ForgeTech — the bespoke Figma industrial design with its own renderer. */
export const FORGETECH_SEED: TemplateSeed = {
  slug: "forgetech",
  name: "ForgeTech",
  tagline: "Industrial strength, sharp edges, molten orange accents.",
  bestFor: "Engineering, construction, manufacturing & energy firms",
  // A screenshot of the rendered design, so the card shows the actual layout
  // rather than a stock photo from inside it.
  thumbnailUrl: "/templates/forgetech/preview.png",
  previewImageUrl: "/templates/forgetech/preview.png",
  accent: "#FF750B",
  colorPreference: "Warm sunset",
  visualStyle: "Bold",
  tone: "Modern & trustworthy",
  renderer: "forgetech",
  published: true,
  sortOrder: 0,
  // Slot order maps 1:1 onto the ForgeTech renderer: capabilities, story,
  // services, value proposition, testimonials, showcase, FAQ, then articles.
  sections: [
    "hero-background-image",
    "features-grid",
    "about-with-image",
    "services-cards",
    "features-grid",
    "testimonials-grid",
    "portfolio-case-studies",
    "faq-accordion",
    "features-grid",
    "cta-banner",
    "footer-simple",
  ],
};

/** Techvantage — the bespoke Figma corporate technology design. */
export const TECHVANTAGE_SEED: TemplateSeed = {
  slug: "techvantage",
  name: "Techvantage",
  tagline: "Deep navy, electric blue, built to win enterprise trust.",
  bestFor: "IT consultancies, software firms & B2B technology services",
  thumbnailUrl: "/templates/techvantage/preview.png",
  previewImageUrl: "/templates/techvantage/preview.png",
  accent: "#0C3DFF",
  colorPreference: "Deep navy",
  visualStyle: "Modern",
  tone: "Professional & corporate",
  renderer: "techvantage",
  published: true,
  sortOrder: 1,
  // Slot order maps 1:1 onto the Techvantage renderer: services, story,
  // statistics, why-choose-us, approach, quotes, case studies, then articles.
  sections: [
    "hero-split-with-image",
    "services-cards",
    "about-with-image",
    "features-grid",
    "features-grid",
    "features-grid",
    "testimonials-grid",
    "portfolio-case-studies",
    "features-grid",
    "faq-accordion",
    "cta-banner",
    "footer-simple",
  ],
};

/**
 * Layout skeletons built from the approved section library. They are seeded but
 * left unpublished: the gallery only offers designs that have been fully art
 * directed and given their own renderer, so a shopper never picks something
 * that looks unfinished. Publish one once it has a real design behind it.
 */
export const STANDARD_SEEDS: TemplateSeed[] = [
  {
    slug: "meridian",
    name: "Meridian",
    tagline: "Confident, corporate, conversion-focused.",
    bestFor: "Agencies, consultants & professional services",
    thumbnailUrl: "/templates/meridian/thumbnail.svg",
    previewImageUrl: "/templates/meridian/preview.svg",
    accent: "#5D4AFE",
    colorPreference: "Brand blue & violet",
    visualStyle: "Modern",
    tone: "Modern & trustworthy",
    renderer: "standard-sections",
    published: false,
    sortOrder: 10,
    sections: [
      "hero-split-with-image",
      "about-with-image",
      "services-cards",
      "portfolio-case-studies",
      "process-steps",
      "testimonials-grid",
      "faq-accordion",
      "cta-banner",
      "contact-split",
      "footer-simple",
    ],
  },
  {
    slug: "aurora",
    name: "Aurora",
    tagline: "Airy gradients and a big, welcoming opening statement.",
    bestFor: "SaaS, startups & digital products",
    thumbnailUrl: "/templates/aurora/thumbnail.svg",
    previewImageUrl: "/templates/aurora/preview.svg",
    accent: "#0EA5E9",
    colorPreference: "Emerald & teal",
    visualStyle: "Modern",
    tone: "Friendly & approachable",
    renderer: "standard-sections",
    published: false,
    sortOrder: 20,
    sections: [
      "hero-centered",
      "features-grid",
      "services-grid",
      "process-steps",
      "testimonials-grid",
      "pricing-tiers",
      "faq-accordion",
      "cta-banner",
      "contact-simple",
      "footer-simple",
    ],
  },
  {
    slug: "lumen",
    name: "Lumen",
    tagline: "Quiet, generous whitespace with typography doing the work.",
    bestFor: "Studios, writers & boutique practices",
    thumbnailUrl: "/templates/lumen/thumbnail.svg",
    previewImageUrl: "/templates/lumen/preview.svg",
    accent: "#0F172A",
    colorPreference: "Monochrome",
    visualStyle: "Minimal",
    tone: "Minimal & clean",
    renderer: "standard-sections",
    published: false,
    sortOrder: 30,
    sections: [
      "hero-centered",
      "about-simple",
      "services-grid",
      "portfolio-case-studies",
      "testimonials-grid",
      "faq-accordion",
      "contact-simple",
      "footer-simple",
    ],
  },
  {
    slug: "verde",
    name: "Verde",
    tagline: "Grounded, natural greens for hands-on local businesses.",
    bestFor: "Trades, wellness, food & local services",
    thumbnailUrl: "/templates/verde/thumbnail.svg",
    previewImageUrl: "/templates/verde/preview.svg",
    accent: "#10B981",
    colorPreference: "Emerald & teal",
    visualStyle: "Classic",
    tone: "Friendly & approachable",
    renderer: "standard-sections",
    published: false,
    sortOrder: 40,
    sections: [
      "hero-background-image",
      "about-with-image",
      "services-grid",
      "features-grid",
      "testimonials-grid",
      "faq-accordion",
      "cta-banner",
      "contact-split",
      "footer-simple",
    ],
  },
  {
    slug: "noir",
    name: "Noir",
    tagline: "Dark, premium and unmistakably high-end.",
    bestFor: "Luxury brands, hospitality & private clients",
    thumbnailUrl: "/templates/noir/thumbnail.svg",
    previewImageUrl: "/templates/noir/preview.svg",
    accent: "#C084FC",
    colorPreference: "Rose & plum",
    visualStyle: "Luxury",
    tone: "Elegant & premium",
    renderer: "standard-sections",
    published: false,
    sortOrder: 50,
    sections: [
      "hero-background-image",
      "about-with-image",
      "services-cards",
      "portfolio-case-studies",
      "testimonials-grid",
      "pricing-tiers",
      "cta-banner",
      "contact-split",
      "footer-simple",
    ],
  },
  {
    slug: "studio",
    name: "Studio",
    tagline: "Portfolio-first, built to let the work speak.",
    bestFor: "Designers, photographers & creative studios",
    thumbnailUrl: "/templates/studio/thumbnail.svg",
    previewImageUrl: "/templates/studio/preview.svg",
    accent: "#F43F5E",
    colorPreference: "Rose & plum",
    visualStyle: "Playful",
    tone: "Bold & energetic",
    renderer: "standard-sections",
    published: false,
    sortOrder: 60,
    sections: [
      "hero-split-with-image",
      "portfolio-case-studies",
      "about-with-image",
      "services-grid",
      "process-steps",
      "testimonials-grid",
      "cta-banner",
      "contact-simple",
      "footer-simple",
    ],
  },
  {
    slug: "commerce",
    name: "Commerce",
    tagline: "Product-led layout with catalogue and pricing up front.",
    bestFor: "Retail, ecommerce & product businesses",
    thumbnailUrl: "/templates/commerce/thumbnail.svg",
    previewImageUrl: "/templates/commerce/preview.svg",
    accent: "#1D4ED8",
    colorPreference: "Deep navy",
    visualStyle: "Modern",
    tone: "Professional & corporate",
    renderer: "standard-sections",
    published: false,
    sortOrder: 70,
    sections: [
      "hero-split-with-image",
      "products-grid",
      "features-grid",
      "about-simple",
      "pricing-tiers",
      "testimonials-grid",
      "faq-accordion",
      "cta-banner",
      "contact-split",
      "footer-simple",
    ],
  },
];

export const ALL_SEEDS: TemplateSeed[] = [FORGETECH_SEED, TECHVANTAGE_SEED, ...STANDARD_SEEDS];

export const DEFAULT_TEMPLATE_SLUG = FORGETECH_SEED.slug;

/** Fails fast if a seed references a content slot with no component behind it. */
export function assertSeedTemplatesValid(): void {
  for (const template of ALL_SEEDS) {
    for (const variant of template.sections) {
      if (!getVariantSpec(variant)) {
        throw new Error(`Template "${template.slug}" references unknown variant "${variant}"`);
      }
    }
  }
}
