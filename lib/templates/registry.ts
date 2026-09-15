// Seed definitions for the template library. The running app always reads
// templates from the database (lib/templates/store.ts); this file exists only to
// seed those rows and to sanity-check that every slot maps to a real component.

// Relative imports keep this file runnable from the standalone Prisma seed script.
import { getVariantSpec } from "../sections/registry";
import { resolveSeedPages } from "./pages";
import type { SiteTemplate, TemplatePageDef } from "./types";

export type { SiteTemplate };

/**
 * Seed payload shape — Prisma assigns the id. `sections` (the home page slots)
 * stays required for backward compatibility; multi-page designs additionally
 * declare `pages`. When `pages` is omitted the design is single-page (home only).
 */
export type TemplateSeed = Omit<SiteTemplate, "id" | "pages"> & {
  pages?: TemplatePageDef[];
};

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
    "features-stats",
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

/** CraftedSpaces — the bespoke interior and architectural Figma design. */
export const CRAFTEDSPACES_SEED: TemplateSeed = {
  slug: "craftedspaces",
  name: "CraftedSpaces",
  tagline: "Warm modern interiors, refined details, and architecture-led balance.",
  bestFor: "Interior studios, architects, boutique renovation firms & design consultancies",
  thumbnailUrl: "/templates/craftedspaces/preview.png",
  previewImageUrl: "/templates/craftedspaces/preview.png",
  accent: "#1A1A1A",
  colorPreference: "Stone & charcoal",
  visualStyle: "Minimal",
  tone: "Elegant & premium",
  renderer: "craftedspaces",
  published: true,
  sortOrder: 2,
  // Slot order maps 1:1 onto the CraftedSpaces renderer.
  sections: [
    "hero-background-image",
    "portfolio-case-studies",
    "about-with-image",
    "features-grid",
    "services-cards",
    "testimonials-grid",
    "portfolio-case-studies",
    "features-grid",
    "faq-accordion",
    "cta-banner",
    "footer-simple",
  ],
};

/**
 * Whiter — the bespoke, MULTI-PAGE SaaS/agency design (ported from the "Whiter"
 * Bootstrap set). Bright blue accent, soft rounded cards, floating shapes. It
 * supports the full page catalog; the AI decides which optional pages to include.
 */
export const WHITER_SEED: TemplateSeed = {
  slug: "whiter",
  name: "Whiter",
  tagline: "Bright, friendly SaaS design with soft shapes and a full multi-page site.",
  bestFor: "SaaS products, startups, digital agencies & no-code tools",
  thumbnailUrl: "/templates/whiter/preview.png",
  previewImageUrl: "/templates/whiter/preview.png",
  accent: "#1787FC",
  colorPreference: "Brand blue & violet",
  visualStyle: "Modern",
  tone: "Friendly & approachable",
  renderer: "whiter",
  published: true,
  sortOrder: 3,
  // The home page's locked slots (also mirrored as the first entry in `pages`).
  sections: [
    "hero-split-with-image",
    "features-grid",
    "about-with-image",
    "features-grid",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
  // Every page this multi-page design supports. "home" is mandatory; the AI
  // chooses which of the optional pages to include for a given business.
  pages: [
    {
      slug: "home",
      title: "Home",
      sections: [
        "hero-split-with-image",
        "features-grid",
        "about-with-image",
        "features-grid",
        "testimonials-grid",
        "cta-banner",
        "footer-simple",
      ],
    },
    {
      slug: "about",
      title: "About",
      sections: [
        "hero-centered",
        "about-with-image",
        "features-grid",
        "testimonials-grid",
        "cta-banner",
        "footer-simple",
      ],
    },
    {
      slug: "services",
      title: "Services",
      sections: ["hero-centered", "services-cards", "process-steps", "cta-banner", "footer-simple"],
    },
    {
      slug: "pricing",
      title: "Pricing",
      sections: ["hero-centered", "pricing-tiers", "faq-accordion", "cta-banner", "footer-simple"],
    },
    {
      slug: "contact",
      title: "Contact",
      sections: ["hero-centered", "contact-split", "footer-simple"],
    },
    {
      slug: "faq",
      title: "FAQ",
      sections: ["hero-centered", "faq-accordion", "cta-banner", "footer-simple"],
    },
    {
      slug: "blog",
      title: "Blog",
      sections: ["hero-centered", "features-grid", "cta-banner", "footer-simple"],
    },
    {
      slug: "portfolio",
      title: "Portfolio",
      sections: ["hero-centered", "portfolio-case-studies", "cta-banner", "footer-simple"],
    },
  ],
};

/**
 * Mraval — the bespoke, MULTI-PAGE creative/app-landing design (ported from the
 * "Mraval" multipurpose Bootstrap set). Colorful blue-violet gradients, playful
 * multicolor icon tiles, a lavender hero and pill buttons. It supports the full
 * page catalog; the AI decides which optional pages to include.
 */
export const MAINFILE_SEED: TemplateSeed = {
  slug: "mainfile",
  name: "Mraval",
  tagline: "Playful gradients and bold color for creative studios and app launches.",
  bestFor: "Creative studios, app startups, agencies & product landing pages",
  thumbnailUrl: "/templates/mainfile/preview.png",
  previewImageUrl: "/templates/mainfile/preview.png",
  accent: "#7DBCFF",
  colorPreference: "Brand blue & violet",
  visualStyle: "Playful",
  tone: "Bold & energetic",
  renderer: "mainfile",
  published: true,
  sortOrder: 4,
  // The home page's locked slots (also mirrored as the first entry in `pages`).
  sections: [
    "hero-split-with-image",
    "features-grid",
    "about-with-image",
    "features-grid",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
  // Every page this multi-page design supports. "home" is mandatory; the AI
  // chooses which of the optional pages to include for a given business.
  pages: [
    {
      slug: "home",
      title: "Home",
      sections: [
        "hero-split-with-image",
        "features-grid",
        "about-with-image",
        "features-grid",
        "testimonials-grid",
        "cta-banner",
        "footer-simple",
      ],
    },
    {
      slug: "about",
      title: "About",
      sections: [
        "hero-centered",
        "about-with-image",
        "features-grid",
        "testimonials-grid",
        "cta-banner",
        "footer-simple",
      ],
    },
    {
      slug: "services",
      title: "Services",
      sections: ["hero-centered", "services-cards", "process-steps", "cta-banner", "footer-simple"],
    },
    {
      slug: "pricing",
      title: "Pricing",
      sections: ["hero-centered", "pricing-tiers", "faq-accordion", "cta-banner", "footer-simple"],
    },
    {
      slug: "contact",
      title: "Contact",
      sections: ["hero-centered", "contact-split", "footer-simple"],
    },
    {
      slug: "faq",
      title: "FAQ",
      sections: ["hero-centered", "faq-accordion", "cta-banner", "footer-simple"],
    },
    {
      slug: "blog",
      title: "Blog",
      sections: ["hero-centered", "features-grid", "cta-banner", "footer-simple"],
    },
    {
      slug: "portfolio",
      title: "Portfolio",
      sections: ["hero-centered", "portfolio-case-studies", "cta-banner", "footer-simple"],
    },
  ],
};

/**
 * Stratus — the bespoke, SINGLE-PAGE SaaS landing (ported from the "Core" UI8
 * SaaS marketing set). Clean cloud-blue accent, soft rounded surface cards, a
 * big product screenshot, colorful feature tiles, a pricing block and a "Wall
 * of Love" review row. One home page with an ordered list of section slots.
 */
export const SAASLDG_SEED: TemplateSeed = {
  slug: "saasldg",
  name: "Stratus",
  tagline: "Cloud-blue SaaS landing with a big product screenshot, pricing and reviews.",
  bestFor: "SaaS platforms, cloud tools, startups & B2B software",
  thumbnailUrl: "/templates/saasldg/preview.png",
  previewImageUrl: "/templates/saasldg/preview.png",
  accent: "#2A85FF",
  colorPreference: "Brand blue",
  visualStyle: "Modern",
  tone: "Modern & trustworthy",
  renderer: "saasldg",
  published: true,
  sortOrder: 5,
  // Slot order maps 1:1 onto the Stratus renderer: hero + product shot,
  // feature tiles, pricing tiers, FAQ, "Wall of Love" reviews, download CTA,
  // then footer.
  sections: [
    "hero-split-with-image",
    "features-grid",
    "pricing-tiers",
    "faq-accordion",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
};

/**
 * Athlo — the bespoke, SINGLE-PAGE sports-club design (ported from the "SPORTS"
 * UI8 Figma Make export). Bold and energetic: full-bleed action photography, a
 * warm amber accent, uppercase grotesque display type and a huge Bebas Neue
 * wordmark. One home page with an ordered list of section slots.
 */
export const SPORTS_SEED: TemplateSeed = {
  slug: "sports",
  name: "Athlo",
  tagline: "Bold, energetic sports-club design with full-bleed action photography and an amber accent.",
  bestFor: "Sports clubs, teams, fitness studios & event organizers",
  thumbnailUrl: "/templates/sports/preview.png",
  previewImageUrl: "/templates/sports/preview.png",
  accent: "#FFC857",
  colorPreference: "Warm sunset",
  visualStyle: "Bold",
  tone: "Bold & energetic",
  renderer: "sports",
  published: true,
  sortOrder: 6,
  // Slot order maps 1:1 onto the Athlo renderer: hero, about, feature grid,
  // category cards, pricing tiers, testimonial wall, FAQ, event CTA, footer.
  sections: [
    "hero-background-image",
    "about-with-image",
    "features-grid",
    "services-cards",
    "pricing-tiers",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "footer-simple",
  ],
};

/**
 * Forge Lime — a bespoke, SINGLE-PAGE dark-lime growth template ported from
 * the "Forge" Figma design. It keeps a locked sequence of strategic sections:
 * hero, value story, solutions, process, stats, testimonials, advantages, FAQ,
 * contact, then footer.
 */
export const FORGELIME_SEED: TemplateSeed = {
  slug: "forgelime",
  name: "Forge Lime",
  tagline: "Dark high-contrast growth template with neon-lime accents and bold typography.",
  bestFor: "Sales consultancies, growth agencies & B2B marketing firms",
  thumbnailUrl: "/templates/forgelime/preview.png",
  previewImageUrl: "/templates/forgelime/preview.png",
  accent: "#A9FF5C",
  colorPreference: "Neon lime",
  visualStyle: "Bold",
  tone: "Modern & trustworthy",
  renderer: "forgelime",
  published: true,
  sortOrder: 7,
  sections: [
    "hero-centered",
    "features-grid",
    "services-cards",
    "process-steps",
    "features-stats",
    "testimonials-grid",
    "features-grid",
    "faq-accordion",
    "contact-split",
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

export const ASTRA_SEED: TemplateSeed = {
  slug: "astra",
  name: "Astra Dental",
  tagline: "Calm clinical blue, serif headlines, built for modern dental practices.",
  bestFor: "Dental clinics, orthodontists & oral-health practices",
  thumbnailUrl: "/templates/astra/preview.png",
  previewImageUrl: "/templates/astra/preview.png",
  accent: "#3B6BFF",
  colorPreference: "Deep navy",
  visualStyle: "Minimal",
  tone: "Modern & trustworthy",
  renderer: "astra",
  published: true,
  sortOrder: 8,
  sections: [
    "hero-split-with-image",
    "services-cards",
    "about-with-image",
    "features-stats",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "contact-split",
    "footer-simple",
  ],
};

export const AZURIO_SEED: TemplateSeed = {
  slug: "azurio",
  name: "Azurio",
  tagline: "Electric indigo on warm paper — a digital-agency layout with huge type.",
  bestFor: "Digital agencies, branding studios & freelance collectives",
  thumbnailUrl: "/templates/azurio/preview.png",
  previewImageUrl: "/templates/azurio/preview.png",
  accent: "#002BBA",
  colorPreference: "Deep navy",
  visualStyle: "Bold",
  tone: "Bold & energetic",
  renderer: "azurio",
  published: true,
  sortOrder: 9,
  sections: [
    "hero-centered",
    "features-grid",
    "portfolio-case-studies",
    "process-steps",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
};

export const OLIVIA_SEED: TemplateSeed = {
  slug: "olivia",
  name: "Olivia",
  tagline: "Soft paper portfolio with peach pricing tiles and highlighter FAQ cards.",
  bestFor: "Freelance designers, subscription studios & personal brands",
  thumbnailUrl: "/templates/olivia/preview.png",
  previewImageUrl: "/templates/olivia/preview.png",
  accent: "#161616",
  colorPreference: "Monochrome",
  visualStyle: "Minimal",
  tone: "Friendly & approachable",
  renderer: "olivia",
  published: true,
  sortOrder: 10,
  sections: [
    "hero-split-with-image",
    "features-grid",
    "pricing-tiers",
    "faq-accordion",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
};

export const ELEKTRA_SEED: TemplateSeed = {
  slug: "elektra",
  name: "Elektra",
  tagline: "Midnight EV showroom: charcoal canvas, electric blue, precision type.",
  bestFor: "EV brands, mobility startups & automotive showrooms",
  thumbnailUrl: "/templates/elektra/preview.png",
  previewImageUrl: "/templates/elektra/preview.png",
  accent: "#3B82F6",
  colorPreference: "Deep navy",
  visualStyle: "Bold",
  tone: "Modern & trustworthy",
  renderer: "elektra",
  published: true,
  sortOrder: 11,
  sections: [
    "hero-background-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "footer-simple",
  ],
};

export const FLOWMINT_SEED: TemplateSeed = {
  slug: "flowmint",
  name: "FlowMint",
  tagline: "Dark editorial portfolio with generous type and a mint-quiet surface.",
  bestFor: "Designers, art directors & independent studios",
  thumbnailUrl: "/templates/flowmint/preview.png",
  previewImageUrl: "/templates/flowmint/preview.png",
  accent: "#1A1A1A",
  colorPreference: "Monochrome",
  visualStyle: "Minimal",
  tone: "Elegant & premium",
  renderer: "flowmint",
  published: true,
  sortOrder: 12,
  sections: [
    "hero-split-with-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "contact-split",
    "footer-simple",
  ],
};

export const FOKS_SEED: TemplateSeed = {
  slug: "foks",
  name: "Foks",
  tagline: "Creative magazine masthead: Bricolage headlines, DM Sans body, editorial columns.",
  bestFor: "Magazines, publishers, newsrooms & content studios",
  thumbnailUrl: "/templates/foks/preview.png",
  previewImageUrl: "/templates/foks/preview.png",
  accent: "#171717",
  colorPreference: "Monochrome",
  visualStyle: "Classic",
  tone: "Elegant & premium",
  renderer: "foks",
  published: true,
  sortOrder: 13,
  sections: [
    "hero-background-image",
    "features-grid",
    "about-with-image",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "footer-simple",
  ],
};

export const FUSION_SEED: TemplateSeed = {
  slug: "fusion",
  name: "Fusion",
  tagline: "Lavender-and-cyan SaaS landing for product and NFT-adjacent launches.",
  bestFor: "SaaS products, web3 tools & creative tech startups",
  thumbnailUrl: "/templates/fusion/preview.png",
  previewImageUrl: "/templates/fusion/preview.png",
  accent: "#8758FF",
  colorPreference: "Brand blue & violet",
  visualStyle: "Playful",
  tone: "Bold & energetic",
  renderer: "fusion",
  published: true,
  sortOrder: 14,
  sections: [
    "hero-split-with-image",
    "features-grid",
    "pricing-tiers",
    "faq-accordion",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
};

export const HEALIA_SEED: TemplateSeed = {
  slug: "healia",
  name: "Healia",
  tagline: "Warm terracotta healthcare on cream paper — high-definition care, human tone.",
  bestFor: "Clinics, diagnostic labs & patient-first healthcare brands",
  thumbnailUrl: "/templates/healia/preview.png",
  previewImageUrl: "/templates/healia/preview.png",
  accent: "#F38660",
  colorPreference: "Warm sunset",
  visualStyle: "Classic",
  tone: "Friendly & approachable",
  renderer: "healia",
  published: true,
  sortOrder: 15,
  sections: [
    "hero-split-with-image",
    "services-cards",
    "about-with-image",
    "features-stats",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "contact-split",
    "footer-simple",
  ],
};

export const HEALSPACE_SEED: TemplateSeed = {
  slug: "healspace",
  name: "Healspace",
  tagline: "Forest-and-coral wellness studio: earthy ink, blush tiles, quiet luxury.",
  bestFor: "Wellness clinics, therapy practices & recovery studios",
  thumbnailUrl: "/templates/healspace/preview.png",
  previewImageUrl: "/templates/healspace/preview.png",
  accent: "#E47565",
  colorPreference: "Warm sunset",
  visualStyle: "Minimal",
  tone: "Elegant & premium",
  renderer: "healspace",
  published: true,
  sortOrder: 16,
  sections: [
    "hero-split-with-image",
    "services-cards",
    "about-with-image",
    "features-stats",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "contact-split",
    "footer-simple",
  ],
};

export const HEALTHDOC_SEED: TemplateSeed = {
  slug: "healthdoc",
  name: "Health Doc",
  tagline: "Dark AI-health product: violet accent on near-black, assistant-first layout.",
  bestFor: "Health-tech products, virtual clinics & AI care tools",
  thumbnailUrl: "/templates/healthdoc/preview.png",
  previewImageUrl: "/templates/healthdoc/preview.png",
  accent: "#8246FB",
  colorPreference: "Brand blue & violet",
  visualStyle: "Modern",
  tone: "Modern & trustworthy",
  renderer: "healthdoc",
  published: true,
  sortOrder: 17,
  sections: [
    "hero-split-with-image",
    "features-grid",
    "pricing-tiers",
    "faq-accordion",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
};

export const CLINICALLY_SEED: TemplateSeed = {
  slug: "clinically",
  name: "Clinically",
  tagline: "Trust-blue medical system: Inter, ice surfaces, appointment-led home.",
  bestFor: "Hospital groups, multi-site clinics & care networks",
  thumbnailUrl: "/templates/clinically/preview.png",
  previewImageUrl: "/templates/clinically/preview.png",
  accent: "#1E5DBC",
  colorPreference: "Deep navy",
  visualStyle: "Modern",
  tone: "Professional & corporate",
  renderer: "clinically",
  published: true,
  sortOrder: 18,
  sections: [
    "hero-split-with-image",
    "services-cards",
    "about-with-image",
    "features-stats",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "contact-split",
    "footer-simple",
  ],
};

export const MEDHEALTH_SEED: TemplateSeed = {
  slug: "medhealth",
  name: "MedHealth",
  tagline: "Clean clinical marketing site with navy trust marks and soft informational cards.",
  bestFor: "Private practices, medical groups & health campaigns",
  thumbnailUrl: "/templates/medhealth/preview.png",
  previewImageUrl: "/templates/medhealth/preview.png",
  accent: "#224171",
  colorPreference: "Deep navy",
  visualStyle: "Classic",
  tone: "Professional & corporate",
  renderer: "medhealth",
  published: true,
  sortOrder: 19,
  sections: [
    "hero-split-with-image",
    "services-cards",
    "about-with-image",
    "features-stats",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "contact-split",
    "footer-simple",
  ],
};

export const CAREWEB_SEED: TemplateSeed = {
  slug: "careweb",
  name: "Careweb",
  tagline: "Soft informational healthcare kit: airy cards, teal cues, family-clinic tone.",
  bestFor: "Family clinics, community health & patient education sites",
  thumbnailUrl: "/templates/careweb/preview.png",
  previewImageUrl: "/templates/careweb/preview.png",
  accent: "#0EA4E7",
  colorPreference: "Emerald & teal",
  visualStyle: "Modern",
  tone: "Friendly & approachable",
  renderer: "careweb",
  published: true,
  sortOrder: 20,
  sections: [
    "hero-split-with-image",
    "services-cards",
    "about-with-image",
    "features-stats",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "contact-split",
    "footer-simple",
  ],
};

export const KAEL_SEED: TemplateSeed = {
  slug: "kael",
  name: "Kael Donovan",
  tagline: "Personal studio site: oversized name, project trail, service cards.",
  bestFor: "Freelance designers, consultants & personal brands",
  thumbnailUrl: "/templates/kael/preview.png",
  previewImageUrl: "/templates/kael/preview.png",
  accent: "#111111",
  colorPreference: "Monochrome",
  visualStyle: "Bold",
  tone: "Bold & energetic",
  renderer: "kael",
  published: true,
  sortOrder: 21,
  sections: [
    "hero-split-with-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "contact-split",
    "footer-simple",
  ],
};

export const LUKASZ_SEED: TemplateSeed = {
  slug: "lukasz",
  name: "Lukasz",
  tagline: "Quiet personal studio: generous whitespace, project grid, conversational about.",
  bestFor: "Photographers, directors & independent creatives",
  thumbnailUrl: "/templates/lukasz/preview.png",
  previewImageUrl: "/templates/lukasz/preview.png",
  accent: "#1A1A1A",
  colorPreference: "Monochrome",
  visualStyle: "Minimal",
  tone: "Minimal & clean",
  renderer: "lukasz",
  published: true,
  sortOrder: 22,
  sections: [
    "hero-split-with-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "contact-split",
    "footer-simple",
  ],
};

export const LUXEFRAME_SEED: TemplateSeed = {
  slug: "luxeframe",
  name: "LuxeFrame",
  tagline: "High-end photography house: charcoal, acid-lime marks, cinematic frames.",
  bestFor: "Photographers, videographers & luxury visual studios",
  thumbnailUrl: "/templates/luxeframe/preview.png",
  previewImageUrl: "/templates/luxeframe/preview.png",
  accent: "#E0FD60",
  colorPreference: "Green & black",
  visualStyle: "Luxury",
  tone: "Elegant & premium",
  renderer: "luxeframe",
  published: true,
  sortOrder: 23,
  sections: [
    "hero-background-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "footer-simple",
  ],
};

export const GRIT_SEED: TemplateSeed = {
  slug: "grit",
  name: "Grit",
  tagline: "Resume-forward portfolio: Playfair display, IBM Plex Mono labels, coral strike marks.",
  bestFor: "Freelancers, CVs, consultants & personal studios",
  thumbnailUrl: "/templates/grit/preview.png",
  previewImageUrl: "/templates/grit/preview.png",
  accent: "#FF5050",
  colorPreference: "Warm sunset",
  visualStyle: "Bold",
  tone: "Bold & energetic",
  renderer: "grit",
  published: true,
  sortOrder: 24,
  sections: [
    "hero-split-with-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "contact-split",
    "footer-simple",
  ],
};

export const OMEGA_SEED: TemplateSeed = {
  slug: "omega",
  name: "Omega",
  tagline: "Bright dual-blue SaaS marketing: sky-to-indigo gradient energy, conversion home.",
  bestFor: "SaaS companies, startups & B2B product marketing",
  thumbnailUrl: "/templates/omega/preview.png",
  previewImageUrl: "/templates/omega/preview.png",
  accent: "#0F53FA",
  colorPreference: "Brand blue & violet",
  visualStyle: "Modern",
  tone: "Modern & trustworthy",
  renderer: "omega",
  published: true,
  sortOrder: 25,
  sections: [
    "hero-split-with-image",
    "features-grid",
    "pricing-tiers",
    "faq-accordion",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
};

export const ONIX_SEED: TemplateSeed = {
  slug: "onix",
  name: "Onix",
  tagline: "Violet agency system with warm gold asides and multi-layout energy.",
  bestFor: "Agencies, product studios & career-led companies",
  thumbnailUrl: "/templates/onix/preview.png",
  previewImageUrl: "/templates/onix/preview.png",
  accent: "#6F5BEB",
  colorPreference: "Brand blue & violet",
  visualStyle: "Modern",
  tone: "Professional & corporate",
  renderer: "onix",
  published: true,
  sortOrder: 26,
  sections: [
    "hero-centered",
    "features-grid",
    "portfolio-case-studies",
    "process-steps",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
};

export const PORTRA_SEED: TemplateSeed = {
  slug: "portra",
  name: "Portra",
  tagline: "Designer portfolio with icy cyan marks on near-black type.",
  bestFor: "UI/UX designers, product designers & creative directors",
  thumbnailUrl: "/templates/portra/preview.png",
  previewImageUrl: "/templates/portra/preview.png",
  accent: "#68BDE7",
  colorPreference: "Emerald & teal",
  visualStyle: "Minimal",
  tone: "Minimal & clean",
  renderer: "portra",
  published: true,
  sortOrder: 27,
  sections: [
    "hero-split-with-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "contact-split",
    "footer-simple",
  ],
};

export const REBEL_SEED: TemplateSeed = {
  slug: "rebel",
  name: "Rebel Grace",
  tagline: "Huge-type personal portfolio: cinematic intro, editorial bio, project reel.",
  bestFor: "UI/UX designers, developers & personal brands",
  thumbnailUrl: "/templates/rebel/preview.png",
  previewImageUrl: "/templates/rebel/preview.png",
  accent: "#111111",
  colorPreference: "Monochrome",
  visualStyle: "Bold",
  tone: "Bold & energetic",
  renderer: "rebel",
  published: true,
  sortOrder: 28,
  sections: [
    "hero-background-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "footer-simple",
  ],
};

export const RICARDO_SEED: TemplateSeed = {
  slug: "ricardo",
  name: "Ricardo Rowen",
  tagline: "Romantic personal atelier: Cormorant serif, rose ink, script asides.",
  bestFor: "Stylists, ateliers, boutiques & personal luxury brands",
  thumbnailUrl: "/templates/ricardo/preview.png",
  previewImageUrl: "/templates/ricardo/preview.png",
  accent: "#DB2777",
  colorPreference: "Rose & plum",
  visualStyle: "Luxury",
  tone: "Elegant & premium",
  renderer: "ricardo",
  published: true,
  sortOrder: 29,
  sections: [
    "hero-split-with-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "contact-split",
    "footer-simple",
  ],
};

export const TIMELESS_SEED: TemplateSeed = {
  slug: "timeless",
  name: "Timeless",
  tagline: "Creative-agency home with cool mist surfaces and a long-form case grid.",
  bestFor: "Creative agencies, production companies & brand studios",
  thumbnailUrl: "/templates/timeless/preview.png",
  previewImageUrl: "/templates/timeless/preview.png",
  accent: "#0885FF",
  colorPreference: "Brand blue",
  visualStyle: "Modern",
  tone: "Elegant & premium",
  renderer: "timeless",
  published: true,
  sortOrder: 30,
  sections: [
    "hero-centered",
    "features-grid",
    "portfolio-case-studies",
    "process-steps",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
};

export const LEVYNA_SEED: TemplateSeed = {
  slug: "levyna",
  name: "Levyna",
  tagline: "Interior studio on charcoal with a lime architectural mark.",
  bestFor: "Interior designers, architects & boutique renovation firms",
  thumbnailUrl: "/templates/levyna/preview.png",
  previewImageUrl: "/templates/levyna/preview.png",
  accent: "#D8F366",
  colorPreference: "Green & black",
  visualStyle: "Luxury",
  tone: "Elegant & premium",
  renderer: "levyna",
  published: true,
  sortOrder: 31,
  sections: [
    "hero-background-image",
    "portfolio-case-studies",
    "about-with-image",
    "services-cards",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "footer-simple",
  ],
};

export const LEVYNABLUSH_SEED: TemplateSeed = {
  slug: "levynablush",
  name: "Levyna Blush",
  tagline: "Navy interior house with a candy-pink signature on pale marble grounds.",
  bestFor: "Interior studios, furniture houses & residential designers",
  thumbnailUrl: "/templates/levynablush/preview.png",
  previewImageUrl: "/templates/levynablush/preview.png",
  accent: "#FF8FFC",
  colorPreference: "Rose & plum",
  visualStyle: "Luxury",
  tone: "Elegant & premium",
  renderer: "levynablush",
  published: true,
  sortOrder: 32,
  sections: [
    "hero-background-image",
    "portfolio-case-studies",
    "about-with-image",
    "services-cards",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "footer-simple",
  ],
};

export const LEVYNAGOLD_SEED: TemplateSeed = {
  slug: "levynagold",
  name: "Levyna Gold",
  tagline: "Midnight interiors with a champagne-gold rule — hospitality calm.",
  bestFor: "Hospitality interiors, residences & furniture ateliers",
  thumbnailUrl: "/templates/levynagold/preview.png",
  previewImageUrl: "/templates/levynagold/preview.png",
  accent: "#E5BE68",
  colorPreference: "Warm sunset",
  visualStyle: "Luxury",
  tone: "Elegant & premium",
  renderer: "levynagold",
  published: true,
  sortOrder: 33,
  sections: [
    "hero-background-image",
    "portfolio-case-studies",
    "about-with-image",
    "services-cards",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "footer-simple",
  ],
};

export const VEIL_SEED: TemplateSeed = {
  slug: "veil",
  name: "Veil",
  tagline: "Signal-layer dark UI: Syne + DM Mono, acid-lime ticks, terminal calm.",
  bestFor: "Infrastructure products, security tools & developer platforms",
  thumbnailUrl: "/templates/veil/preview.png",
  previewImageUrl: "/templates/veil/preview.png",
  accent: "#C8F04D",
  colorPreference: "Green & black",
  visualStyle: "Bold",
  tone: "Modern & trustworthy",
  renderer: "veil",
  published: true,
  sortOrder: 34,
  sections: [
    "hero-background-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "faq-accordion",
    "cta-banner",
    "footer-simple",
  ],
};

export const WEBCANVAS_SEED: TemplateSeed = {
  slug: "webcanvas",
  name: "WebCanvas",
  tagline: "Warm-stone agency: cream type on charcoal, looping wordmarks, studio grit.",
  bestFor: "Web studios, digital agencies & design houses",
  thumbnailUrl: "/templates/webcanvas/preview.png",
  previewImageUrl: "/templates/webcanvas/preview.png",
  accent: "#EEEBDE",
  colorPreference: "Monochrome",
  visualStyle: "Bold",
  tone: "Bold & energetic",
  renderer: "webcanvas",
  published: true,
  sortOrder: 35,
  sections: [
    "hero-centered",
    "features-grid",
    "portfolio-case-studies",
    "process-steps",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
};

export const WILLJACKS_SEED: TemplateSeed = {
  slug: "willjacks",
  name: "Will Jacks",
  tagline: "Personal site with mint, blush, and lemon tiles on charcoal ink.",
  bestFor: "Personal brands, photographers & independent makers",
  thumbnailUrl: "/templates/willjacks/preview.png",
  previewImageUrl: "/templates/willjacks/preview.png",
  accent: "#181818",
  colorPreference: "Monochrome",
  visualStyle: "Playful",
  tone: "Friendly & approachable",
  renderer: "willjacks",
  published: true,
  sortOrder: 36,
  sections: [
    "hero-split-with-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "contact-split",
    "footer-simple",
  ],
  pages: [
    {
      slug: "home",
      title: "Index",
      sections: [
        "hero-split-with-image",
        "about-with-image",
        "services-cards",
        "portfolio-case-studies",
        "testimonials-grid",
        "contact-split",
        "footer-simple",
      ],
    },
    {
      slug: "about",
      title: "Approach",
      sections: [
        "hero-centered",
        "services-cards",
        "about-with-image",
        "process-steps",
        "contact-split",
        "footer-simple",
      ],
    },
  ],
};

export const TEASER_SEED: TemplateSeed = {
  slug: "teaser",
  name: "Teaser",
  tagline: "Grid-rail SaaS landing: mist gray, ink headlines, product-screenshot gravity.",
  bestFor: "SaaS launches, product waitlists & startup landing pages",
  thumbnailUrl: "/templates/teaser/preview.png",
  previewImageUrl: "/templates/teaser/preview.png",
  accent: "#111111",
  colorPreference: "Monochrome",
  visualStyle: "Modern",
  tone: "Modern & trustworthy",
  renderer: "teaser",
  published: true,
  sortOrder: 37,
  sections: [
    "hero-split-with-image",
    "features-grid",
    "pricing-tiers",
    "faq-accordion",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
};

export const ATELIERPF_SEED: TemplateSeed = {
  slug: "atelierpf",
  name: "Atelier",
  tagline: "UI-kit portfolio: graphite type on cool gray, work-first grid.",
  bestFor: "Product designers, UI kits & studio portfolios",
  thumbnailUrl: "/templates/atelierpf/preview.png",
  previewImageUrl: "/templates/atelierpf/preview.png",
  accent: "#222420",
  colorPreference: "Monochrome",
  visualStyle: "Minimal",
  tone: "Minimal & clean",
  renderer: "atelierpf",
  published: true,
  sortOrder: 38,
  sections: [
    "hero-split-with-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "contact-split",
    "footer-simple",
  ],
};

export const RESUME_SEED: TemplateSeed = {
  slug: "resume",
  name: "Resume",
  tagline: "A simple portfolio template for designers — huge type, a resume, and the work.",
  bestFor: "Personal resumes, designer portfolios & freelance CVs",
  thumbnailUrl: "/templates/resume/preview.png",
  previewImageUrl: "/templates/resume/preview.png",
  accent: "#000000",
  colorPreference: "Monochrome",
  visualStyle: "Minimal",
  tone: "Minimal & clean",
  renderer: "resume",
  published: true,
  sortOrder: 39,
  sections: [
    "hero-split-with-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "contact-split",
    "footer-simple",
  ],
};

/**
 * Rebo — coral-on-cream digital agency from the Figma "Agency Digital
 * Multi-Layout" pack. Dark header on home, Clash Display inner pages, full
 * catalog (home, about, services, pricing, contact, faq, blog, portfolio).
 */
export const REBO_SEED: TemplateSeed = {
  slug: "rebo",
  name: "Rebo",
  tagline: "Coral-on-cream digital agency with bold type and a full multi-page site.",
  bestFor: "Digital agencies, design studios & creative consultancies",
  thumbnailUrl: "/templates/rebo/preview.png",
  previewImageUrl: "/templates/rebo/preview.png",
  accent: "#E44F39",
  colorPreference: "Warm coral",
  visualStyle: "Bold",
  tone: "Bold & energetic",
  renderer: "rebo",
  published: true,
  sortOrder: 40,
  sections: [
    "hero-split-with-image",
    "services-cards",
    "about-with-image",
    "portfolio-case-studies",
    "process-steps",
    "testimonials-grid",
    "cta-banner",
    "features-grid",
    "contact-split",
    "footer-simple",
  ],
  pages: [
    {
      slug: "home",
      title: "Home",
      sections: [
        "hero-split-with-image",
        "services-cards",
        "about-with-image",
        "portfolio-case-studies",
        "process-steps",
        "testimonials-grid",
        "cta-banner",
        "features-grid",
        "contact-split",
        "footer-simple",
      ],
    },
    {
      slug: "about",
      title: "About",
      sections: ["hero-centered", "about-with-image", "features-stats", "features-grid", "footer-simple"],
    },
    {
      slug: "services",
      title: "Services",
      sections: ["hero-centered", "services-cards", "process-steps", "footer-simple"],
    },
    {
      slug: "pricing",
      title: "Pricing",
      sections: ["hero-centered", "pricing-tiers", "faq-accordion", "footer-simple"],
    },
    {
      slug: "contact",
      title: "Contact",
      sections: ["hero-centered", "contact-split", "footer-simple"],
    },
    {
      slug: "faq",
      title: "FAQ",
      sections: ["hero-centered", "faq-accordion", "footer-simple"],
    },
    {
      slug: "blog",
      title: "Blog",
      sections: ["hero-centered", "features-grid", "footer-simple"],
    },
    {
      slug: "portfolio",
      title: "Portfolio",
      sections: ["hero-centered", "portfolio-case-studies", "footer-simple"],
    },
  ],
};

/**
 * Sarahfolio — personal copywriter portfolio from the Figma Personal Portfolio
 * Web UI Kit. Anton display, cream canvas, yellow offset CTAs, lime sunburst
 * heroes. Pages: home, about, services (process), blog, contact.
 */
export const SARAHFOLIO_SEED: TemplateSeed = {
  slug: "sarahfolio",
  name: "Sarah",
  tagline: "Personal copywriter portfolio — Anton display, yellow offset CTAs, multi-page.",
  bestFor: "Copywriters, writers & personal brand sites",
  thumbnailUrl: "/templates/sarahfolio/preview.png",
  previewImageUrl: "/templates/sarahfolio/preview.png",
  accent: "#FFBF38",
  colorPreference: "Warning yellow",
  visualStyle: "Bold",
  tone: "Bold & energetic",
  renderer: "sarahfolio",
  published: true,
  sortOrder: 41,
  sections: [
    "hero-split-with-image",
    "about-with-image",
    "services-cards",
    "portfolio-case-studies",
    "testimonials-grid",
    "cta-banner",
    "footer-simple",
  ],
  pages: [
    {
      slug: "home",
      title: "Home",
      sections: [
        "hero-split-with-image",
        "about-with-image",
        "services-cards",
        "portfolio-case-studies",
        "testimonials-grid",
        "cta-banner",
        "footer-simple",
      ],
    },
    {
      slug: "about",
      title: "About",
      sections: [
        "hero-centered",
        "about-with-image",
        "features-grid",
        "testimonials-grid",
        "cta-banner",
        "footer-simple",
      ],
    },
    {
      slug: "services",
      title: "Process",
      sections: ["hero-centered", "process-steps", "cta-banner", "footer-simple"],
    },
    {
      slug: "blog",
      title: "Blog",
      sections: ["hero-centered", "features-grid", "cta-banner", "footer-simple"],
    },
    {
      slug: "contact",
      title: "Contact",
      sections: ["hero-centered", "contact-split", "footer-simple"],
    },
  ],
};

/** Gallery pin order. Everything else follows in seed-declaration order. */
const GALLERY_LEAD_SLUGS = [
  "forgetech",
  "techvantage",
  "craftedspaces",
  "sports",
  "forgelime",
  "resume",
  "rebo",
  "sarahfolio",
  "willjacks",
] as const;

function orderGallerySeeds(seeds: TemplateSeed[]): TemplateSeed[] {
  const bySlug = new Map(seeds.map((seed) => [seed.slug, seed]));
  const seen = new Set<string>();
  const ordered: TemplateSeed[] = [];
  for (const slug of GALLERY_LEAD_SLUGS) {
    const seed = bySlug.get(slug);
    if (!seed) continue;
    ordered.push(seed);
    seen.add(slug);
  }
  for (const seed of seeds) {
    if (!seen.has(seed.slug)) ordered.push(seed);
  }
  return ordered.map((seed, sortOrder) => ({ ...seed, sortOrder }));
}

export const ALL_SEEDS: TemplateSeed[] = orderGallerySeeds([
  FORGETECH_SEED,
  TECHVANTAGE_SEED,
  CRAFTEDSPACES_SEED,
  SPORTS_SEED,
  FORGELIME_SEED,
  RESUME_SEED,
  REBO_SEED,
  SARAHFOLIO_SEED,
  WILLJACKS_SEED,
  WHITER_SEED,
  MAINFILE_SEED,
  SAASLDG_SEED,
  ASTRA_SEED,
  AZURIO_SEED,
  OLIVIA_SEED,
  ELEKTRA_SEED,
  FLOWMINT_SEED,
  FOKS_SEED,
  FUSION_SEED,
  HEALIA_SEED,
  HEALSPACE_SEED,
  HEALTHDOC_SEED,
  CLINICALLY_SEED,
  MEDHEALTH_SEED,
  CAREWEB_SEED,
  KAEL_SEED,
  LUKASZ_SEED,
  LUXEFRAME_SEED,
  GRIT_SEED,
  OMEGA_SEED,
  ONIX_SEED,
  PORTRA_SEED,
  REBEL_SEED,
  RICARDO_SEED,
  TIMELESS_SEED,
  LEVYNA_SEED,
  LEVYNABLUSH_SEED,
  LEVYNAGOLD_SEED,
  VEIL_SEED,
  WEBCANVAS_SEED,
  TEASER_SEED,
  ATELIERPF_SEED,
  ...STANDARD_SEEDS,
]);

export const DEFAULT_TEMPLATE_SLUG = FORGETECH_SEED.slug;

/** Fails fast if a seed references a content slot with no component behind it. */
export function assertSeedTemplatesValid(): void {
  for (const template of ALL_SEEDS) {
    // Validate every page's slots (a single-page design resolves to one "home").
    for (const page of resolveSeedPages(template)) {
      for (const variant of page.sections) {
        if (!getVariantSpec(variant)) {
          throw new Error(
            `Template "${template.slug}" page "${page.slug}" references unknown variant "${variant}"`
          );
        }
      }
    }
  }
}
