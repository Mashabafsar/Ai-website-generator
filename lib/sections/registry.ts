// Section registry: the single source of truth for allowed section types and
// variants. Used by the prompt builder (to constrain the AI), blueprint
// validation (allowed variants), the assembly agent (blueprint -> props), and
// the section components (rendering).

export type SectionFieldType = "string" | "text" | "string[]";

export type SectionField = {
  key: string;
  label: string;
  type: SectionFieldType;
  required?: boolean;
};

export type ImageOrientation = "landscape" | "portrait" | "square";

export type SectionContext = {
  businessName: string;
  industry: string;
  description: string;
  audience: string;
  services: string[];
  tone: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export type SectionContent = Record<string, string | string[]>;

export type SectionVariantSpec = {
  type: string;
  variant: string;
  label: string;
  description: string;
  componentName: string;
  fields: SectionField[];
  needsImage: boolean;
  /** When true, each itemTitles entry gets its own stock/upload image. */
  needsItemImages?: boolean;
  imageOrientation?: ImageOrientation;
  /**
   * The content array whose entries each carry an icon. Set wherever any design
   * draws a symbol per item; like `needsImage`, a design that has no icon in
   * that region simply ignores the value.
   */
  iconField?: string;
  /**
   * Older variant ids this slot still accepts after a same-type correction.
   * Lets stored projects generated under the old id keep saving.
   */
  supersedes?: string[];
  /** Business-level image terms — a floor under the content-derived query. */
  keywords: (ctx: SectionContext) => string[];
  defaults: (ctx: SectionContext) => SectionContent;
};

const list = (ctx: SectionContext, n: number, fallback: string[]): string[] => {
  const items = ctx.services.length ? ctx.services : fallback;
  return items.slice(0, n);
};

export const SECTION_REGISTRY: SectionVariantSpec[] = [
  // ---- HERO ----
  {
    type: "hero",
    variant: "hero-split-with-image",
    label: "Hero — split with image",
    description: "Headline and CTA on one side, a dominant image on the other.",
    componentName: "HeroSplitWithImage",
    needsImage: true,
    imageOrientation: "landscape",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "string" },
      { key: "headline", label: "Headline", type: "string", required: true },
      { key: "subheadline", label: "Subheadline", type: "text", required: true },
      { key: "ctaPrimary", label: "Primary CTA", type: "string" },
      { key: "ctaSecondary", label: "Secondary CTA", type: "string" },
    ],
    keywords: (ctx) => [ctx.industry],
    defaults: (ctx) => ({
      eyebrow: ctx.industry,
      headline: `${ctx.businessName} — ${ctx.industry} you can trust`,
      subheadline: ctx.description || `Helping ${ctx.audience} with expert ${ctx.industry.toLowerCase()} services.`,
      ctaPrimary: "Get started",
      ctaSecondary: "Learn more",
    }),
  },
  {
    type: "hero",
    variant: "hero-centered",
    label: "Hero — centered",
    description: "Centered headline, subheadline, and CTA on an atmospheric background.",
    componentName: "HeroCentered",
    needsImage: false,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "string" },
      { key: "headline", label: "Headline", type: "string", required: true },
      { key: "subheadline", label: "Subheadline", type: "text", required: true },
      { key: "ctaPrimary", label: "Primary CTA", type: "string" },
      { key: "ctaSecondary", label: "Secondary CTA", type: "string" },
    ],
    keywords: (ctx) => [ctx.industry],
    defaults: (ctx) => ({
      eyebrow: ctx.industry.slice(0, 28),
      headline: ctx.businessName,
      subheadline: (ctx.description || `Modern ${ctx.industry.toLowerCase()} for ${ctx.audience}.`).slice(0, 100),
      ctaPrimary: "Get started",
      ctaSecondary: "Contact us",
    }),
  },
  {
    type: "hero",
    variant: "hero-background-image",
    label: "Hero — background image",
    description: "Full-bleed background image with an overlaid headline and CTA.",
    componentName: "HeroBackgroundImage",
    needsImage: true,
    imageOrientation: "landscape",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "string" },
      { key: "headline", label: "Headline", type: "string", required: true },
      { key: "subheadline", label: "Subheadline", type: "text", required: true },
      { key: "ctaPrimary", label: "Primary CTA", type: "string" },
    ],
    keywords: (ctx) => [ctx.industry],
    defaults: (ctx) => ({
      eyebrow: ctx.industry,
      headline: `Welcome to ${ctx.businessName}`,
      subheadline: ctx.description || `Trusted ${ctx.industry.toLowerCase()} for ${ctx.audience}.`,
      ctaPrimary: "Get started",
    }),
  },

  // ---- ABOUT ----
  {
    type: "about",
    variant: "about-with-image",
    label: "About — with image",
    description: "A short story about the business alongside an image.",
    componentName: "AboutWithImage",
    needsImage: true,
    imageOrientation: "landscape",
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "body", label: "Body", type: "text", required: true },
    ],
    keywords: (ctx) => [`${ctx.industry} team`],
    defaults: (ctx) => ({
      heading: `About ${ctx.businessName}`,
      body:
        ctx.description ||
        `${ctx.businessName} is a ${ctx.industry.toLowerCase()} business dedicated to serving ${ctx.audience} with quality and care.`,
    }),
  },
  {
    type: "about",
    variant: "about-simple",
    label: "About — simple",
    description: "A clean, text-only about section.",
    componentName: "AboutSimple",
    needsImage: false,
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "body", label: "Body", type: "text", required: true },
    ],
    keywords: () => [],
    defaults: (ctx) => ({
      heading: `Why ${ctx.businessName}`,
      body:
        ctx.description ||
        `We help ${ctx.audience} get results with dependable ${ctx.industry.toLowerCase()} services.`,
    }),
  },

  // ---- SERVICES ----
  {
    type: "services",
    variant: "services-grid",
    label: "Services — grid",
    description: "A responsive grid of services with short descriptions.",
    componentName: "ServicesGrid",
    needsImage: false,
    needsItemImages: true,
    imageOrientation: "square",
    iconField: "itemTitles",
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "itemTitles", label: "Service / product titles", type: "string[]", required: true },
      { key: "itemBodies", label: "Service / product descriptions", type: "string[]", required: true },
    ],
    keywords: (ctx) => [ctx.industry],
    defaults: (ctx) => {
      const titles = list(ctx, 6, ["Consulting", "Strategy", "Support"]);
      return {
        heading: "What we offer",
        subheading: `Services tailored for ${ctx.audience}.`,
        itemTitles: titles,
        itemBodies: titles.map((t) => `Professional ${t.toLowerCase()} delivered by our expert team.`),
      };
    },
  },
  {
    type: "services",
    variant: "services-cards",
    label: "Services — cards",
    description: "Elevated service cards with a stronger visual hierarchy.",
    componentName: "ServicesCards",
    needsImage: false,
    needsItemImages: true,
    imageOrientation: "landscape",
    iconField: "itemTitles",
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "itemTitles", label: "Service / product titles", type: "string[]", required: true },
      { key: "itemBodies", label: "Service / product descriptions", type: "string[]", required: true },
    ],
    keywords: (ctx) => [ctx.industry],
    defaults: (ctx) => {
      const titles = list(ctx, 4, ["Consulting", "Strategy", "Support", "Delivery"]);
      return {
        heading: "Our services",
        subheading: `Everything ${ctx.audience} need, in one place.`,
        itemTitles: titles,
        itemBodies: titles.map((t) => `End-to-end ${t.toLowerCase()} built around your goals.`),
      };
    },
  },

  // ---- PRODUCTS ----
  {
    type: "products",
    variant: "products-grid",
    label: "Products — grid with images",
    description: "Product cards with photos, titles, and short descriptions.",
    componentName: "ProductsGrid",
    needsImage: false,
    needsItemImages: true,
    imageOrientation: "square",
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "itemTitles", label: "Product names", type: "string[]", required: true },
      { key: "itemBodies", label: "Product descriptions", type: "string[]", required: true },
    ],
    keywords: (ctx) => [ctx.industry],
    defaults: (ctx) => {
      const titles = list(ctx, 4, ctx.services.length ? ctx.services.slice(0, 4) : ["Starter", "Pro", "Premium", "Custom"]);
      return {
        heading: "Our products",
        subheading: "Quality picks for every need.",
        itemTitles: titles,
        itemBodies: titles.map((t) => `Trusted ${t.toLowerCase()} built for results.`),
      };
    },
  },

  // ---- FEATURES ----
  {
    type: "features",
    variant: "features-grid",
    label: "Features — grid",
    description: "Highlight key benefits in a grid.",
    componentName: "FeaturesGrid",
    needsImage: false,
    needsItemImages: true,
    imageOrientation: "landscape",
    iconField: "itemTitles",
    supersedes: ["features-stats"],
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "itemTitles", label: "Feature titles", type: "string[]", required: true },
      { key: "itemBodies", label: "Feature descriptions", type: "string[]", required: true },
    ],
    keywords: (ctx) => [ctx.industry],
    defaults: (ctx) => ({
      heading: "Why choose us",
      subheading: `The ${ctx.businessName} difference.`,
      itemTitles: ["Experienced team", "Fast turnaround", "Transparent pricing", "Ongoing support"],
      itemBodies: [
        "Seasoned professionals who care about your outcome.",
        "We move quickly without cutting corners.",
        "Clear quotes with no surprises.",
        "We're here long after launch.",
      ],
    }),
  },
  {
    type: "features",
    variant: "features-stats",
    label: "Features — stats",
    description: "A row of headline numbers with short labels.",
    componentName: "FeaturesGrid",
    needsImage: false,
    supersedes: ["features-grid"],
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "itemTitles", label: "Stat values", type: "string[]", required: true },
      { key: "itemBodies", label: "Stat labels", type: "string[]", required: true },
    ],
    keywords: (ctx) => [ctx.industry],
    defaults: (ctx) => ({
      heading: "By the numbers",
      subheading: `Results from ${ctx.businessName}.`,
      itemTitles: ["500+", "15+", "300+", "98%"],
      itemBodies: [
        "Successful projects completed",
        "Years of industry experience",
        "Clients served globally",
        "Client satisfaction rate",
      ],
    }),
  },

  // ---- PORTFOLIO / CASE STUDIES ----
  {
    type: "portfolio",
    variant: "portfolio-case-studies",
    label: "Portfolio — case studies",
    description: "Case studies with quotes, authors, and impact metrics.",
    componentName: "PortfolioCaseStudies",
    needsImage: false,
    needsItemImages: true,
    imageOrientation: "portrait",
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "itemTitles", label: "Case titles", type: "string[]", required: true },
      { key: "itemBodies", label: "Case quotes / bodies", type: "string[]", required: true },
      { key: "authors", label: "Authors", type: "string[]", required: true },
      { key: "roles", label: "Roles", type: "string[]" },
      { key: "metrics", label: "Metrics (value|label|value|label)", type: "string[]" },
    ],
    keywords: () => [],
    defaults: (ctx) => ({
      heading: `Real results with ${ctx.businessName}`,
      subheading: `Outcomes our ${ctx.industry.toLowerCase()} clients see.`,
      itemTitles: ["Faster delivery", "Clearer operations", "Stronger collaboration"],
      itemBodies: [
        `${ctx.businessName} helped us ship faster with a clearer process.`,
        "We reduced context switching and improved day-to-day clarity.",
        "Onboarding and teamwork became seamless across the company.",
      ],
      authors: ["Aarav Mehta", "Sophia Patel", "David Liu"],
      roles: ["Frontend Engineer", "Operations Manager", "Team Lead"],
      metrics: ["40%|Faster Delivery|95%|Satisfaction", "3.5x|Efficiency|70%|Fewer Errors", "2x|Faster Onboarding|88%|Collaboration"],
    }),
  },

  // ---- PROCESS ----
  {
    type: "process",
    variant: "process-steps",
    label: "Process — steps",
    description: "A step-by-step overview of how you work.",
    componentName: "ProcessSteps",
    needsImage: false,
    iconField: "stepTitles",
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "stepTitles", label: "Step titles", type: "string[]", required: true },
      { key: "stepBodies", label: "Step descriptions", type: "string[]", required: true },
    ],
    keywords: () => [],
    defaults: () => ({
      heading: "How it works",
      stepTitles: ["Discover", "Plan", "Build", "Launch"],
      stepBodies: [
        "We learn about your goals and needs.",
        "We craft a tailored plan and quote.",
        "We execute with quality and speed.",
        "We deliver and support your success.",
      ],
    }),
  },

  // ---- TESTIMONIALS ----
  {
    type: "testimonials",
    variant: "testimonials-grid",
    label: "Testimonials — grid",
    description: "Social proof from happy customers.",
    componentName: "TestimonialsGrid",
    // Some designs (e.g. CraftedSpaces) use a background photo behind the quote.
    // Sourcing it makes the image match the business instead of a stock fallback.
    needsImage: true,
    imageOrientation: "landscape",
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "quotes", label: "Quotes", type: "string[]", required: true },
      { key: "authors", label: "Authors", type: "string[]", required: true },
      { key: "roles", label: "Roles", type: "string[]" },
    ],
    keywords: (ctx) => [`${ctx.industry} customer`],
    defaults: (ctx) => ({
      heading: "What our clients say",
      quotes: [
        `${ctx.businessName} exceeded our expectations from day one.`,
        "Professional, responsive, and genuinely helpful.",
        "The results speak for themselves — highly recommended.",
      ],
      authors: ["Alex Morgan", "Jordan Lee", "Sam Rivera"],
      roles: ["Business Owner", "Operations Lead", "Founder"],
    }),
  },

  // ---- FAQ ----
  {
    type: "faq",
    variant: "faq-accordion",
    label: "FAQ — accordion",
    description: "Answer common questions.",
    componentName: "FaqAccordion",
    needsImage: false,
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "questions", label: "Questions", type: "string[]", required: true },
      { key: "answers", label: "Answers", type: "string[]", required: true },
    ],
    keywords: () => [],
    defaults: (ctx) => ({
      heading: "Frequently asked questions",
      questions: [
        `What areas does ${ctx.businessName} serve?`,
        "How do I get a quote?",
        "How long does a project take?",
      ],
      answers: [
        ctx.location
          ? `We proudly serve ${ctx.location} and surrounding areas.`
          : "We work with clients locally and remotely.",
        "Reach out through our contact form and we'll respond quickly.",
        "Timelines vary by scope — we'll share a clear estimate up front.",
      ],
    }),
  },

  // ---- PRICING ----
  {
    type: "pricing",
    variant: "pricing-tiers",
    label: "Pricing — tiers",
    description: "Simple pricing tiers.",
    componentName: "PricingTiers",
    needsImage: false,
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "planNames", label: "Plan names", type: "string[]", required: true },
      { key: "planPrices", label: "Plan prices", type: "string[]", required: true },
      { key: "planFeatures", label: "Plan features (newline per plan)", type: "string[]", required: true },
    ],
    keywords: () => [],
    defaults: () => ({
      heading: "Simple pricing",
      subheading: "Choose the plan that fits you.",
      planNames: ["Starter", "Growth", "Premium"],
      planPrices: ["$99", "$299", "$599"],
      planFeatures: [
        "Core service\nEmail support\n1 revision",
        "Everything in Starter\nPriority support\n3 revisions",
        "Everything in Growth\nDedicated manager\nUnlimited revisions",
      ],
    }),
  },

  // ---- CONTACT ----
  {
    type: "contact",
    variant: "contact-split",
    label: "Contact — split",
    description: "Contact details beside a contact form.",
    componentName: "ContactSplit",
    needsImage: false,
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "email", label: "Email", type: "string" },
      { key: "phone", label: "Phone", type: "string" },
      { key: "address", label: "Address", type: "string" },
      { key: "ctaLabel", label: "Submit label", type: "string" },
    ],
    keywords: () => [],
    defaults: (ctx) => ({
      heading: "Get in touch",
      subheading: `Tell us about your project and we'll get back to you.`,
      email: ctx.contactEmail || "hello@example.com",
      phone: ctx.contactPhone || "",
      address: ctx.location || "",
      ctaLabel: "Send message",
    }),
  },
  {
    type: "contact",
    variant: "contact-simple",
    label: "Contact — simple",
    description: "A compact centered contact block.",
    componentName: "ContactSimple",
    needsImage: false,
    fields: [
      { key: "heading", label: "Heading", type: "string", required: true },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "email", label: "Email", type: "string" },
      { key: "phone", label: "Phone", type: "string" },
    ],
    keywords: () => [],
    defaults: (ctx) => ({
      heading: "Contact us",
      subheading: "We'd love to hear from you.",
      email: ctx.contactEmail || "hello@example.com",
      phone: ctx.contactPhone || "",
    }),
  },

  // ---- CTA ----
  {
    type: "cta",
    variant: "cta-banner",
    label: "CTA — banner",
    description: "A bold call-to-action banner.",
    componentName: "CtaBanner",
    // Some designs (e.g. Athlo) render the CTA over a large photo, so source an
    // industry-relevant one instead of always falling back to the design asset.
    needsImage: true,
    imageOrientation: "landscape",
    fields: [
      { key: "headline", label: "Headline", type: "string", required: true },
      { key: "subheadline", label: "Subheadline", type: "text" },
      { key: "ctaPrimary", label: "Primary CTA", type: "string" },
    ],
    keywords: (ctx) => [ctx.industry],
    defaults: (ctx) => ({
      headline: `Ready to work with ${ctx.businessName}?`,
      subheadline: "Let's build something great together.",
      ctaPrimary: "Get started",
    }),
  },

  // ---- FOOTER ----
  {
    type: "footer",
    variant: "footer-simple",
    label: "Footer — simple",
    description: "A simple footer with brand and links.",
    componentName: "FooterSimple",
    needsImage: false,
    fields: [
      { key: "businessName", label: "Business name", type: "string", required: true },
      { key: "tagline", label: "Tagline", type: "string" },
      { key: "linkLabels", label: "Link labels", type: "string[]" },
    ],
    keywords: () => [],
    defaults: (ctx) => ({
      businessName: ctx.businessName,
      tagline: `${ctx.industry} for ${ctx.audience}.`,
      linkLabels: ["Home", "About", "Services", "Contact"],
    }),
  },
];

// ---- Lookup helpers ----

const BY_VARIANT = new Map(SECTION_REGISTRY.map((s) => [s.variant, s]));

export function getVariantSpec(variant: string): SectionVariantSpec | undefined {
  return BY_VARIANT.get(variant);
}

/**
 * True when `locked` declares it supersedes `incoming` and both share a type.
 * Used by the template lock so a slot correction does not lock out old saves.
 */
export function acceptsSupersededVariant(locked: string, incoming: string): boolean {
  const spec = BY_VARIANT.get(locked);
  if (!spec?.supersedes?.includes(incoming)) return false;
  const incomingSpec = BY_VARIANT.get(incoming);
  return Boolean(incomingSpec && incomingSpec.type === spec.type);
}

export function isAllowedVariant(type: string, variant: string): boolean {
  const spec = BY_VARIANT.get(variant);
  return Boolean(spec && spec.type === type);
}

export function variantsForType(type: string): SectionVariantSpec[] {
  return SECTION_REGISTRY.filter((s) => s.type === type);
}

/** How many icons a section carries: the length of its `iconField` array. */
export function iconCount(variant: string, content: SectionContent): number {
  const field = BY_VARIANT.get(variant)?.iconField;
  if (!field) return 0;
  const value = content[field];
  return Array.isArray(value) ? value.length : 0;
}

export const ALLOWED_SECTION_TYPES = Array.from(new Set(SECTION_REGISTRY.map((s) => s.type)));

/** Compact registry description for prompts: type -> allowed variants + fields. */
export function registryForPrompt(): string {
  const byType = new Map<string, SectionVariantSpec[]>();
  for (const spec of SECTION_REGISTRY) {
    const arr = byType.get(spec.type) ?? [];
    arr.push(spec);
    byType.set(spec.type, arr);
  }
  const lines: string[] = [];
  for (const [type, specs] of byType) {
    lines.push(`- ${type}:`);
    for (const s of specs) {
      const fieldKeys = s.fields.map((f) => `${f.key}${f.type === "string[]" ? "[]" : ""}`).join(", ");
      lines.push(`    - variant "${s.variant}": fields { ${fieldKeys} }${s.needsImage ? " (has image)" : ""}`);
    }
  }
  return lines.join("\n");
}

export function buildSectionContext(ctx: SectionContext): SectionContext {
  return ctx;
}
