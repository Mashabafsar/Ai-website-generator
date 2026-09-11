import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function fusionDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Fusion",
      industry: "SaaS platform",
      description: "A product workspace that makes launches feel inevitable.",
      location: "New York, New York",
    },
    design: {
      tone: "Bold & energetic",
      colorPalette: ["Brand blue & violet"],
      typography: "Playful",
      visualStyle: "Playful",
    },
    seo: {
      title: "Fusion | SaaS platform",
      description: "A product workspace that makes launches feel inevitable.",
    },
    quoteSignals: [],
    pages: [
      {
        slug: "home",
        title: "Home",
        sections: [
          {
            id: "hero_1",
            type: "hero",
            variant: "hero-split-with-image",
            content: {
              eyebrow: "Fusion",
              headline: "Ship the next drop without the chaos",
              subheadline: "Campaigns, drops, and member experiences in one calm operating layer.",
              ctaPrimary: "Start free",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/fusion/hero.jpg", "Fusion visual"),
          },
          {
            id: "features_2",
            type: "features",
            variant: "features-grid",
            content: {
              heading: "Why it works",
              subheading: "A few principles that keep showing up in the work.",
              itemTitles: ["Clarity first", "Craft in public", "Pace with care"],
              itemBodies: [
                "We explain the work in language a new visitor understands.",
                "Process is visible — no black-box weeks.",
                "Speed where it helps, patience where it matters.",
              ],
            },
          },
          {
            id: "pricing_3",
            type: "pricing",
            variant: "pricing-tiers",
            content: {
              heading: "Plans",
              subheading: "Simple monthly options.",
              planNames: ["Starter", "Studio", "House"],
              planPrices: ["$29", "$79", "$199"],
              planFeatures: ["Core access", "Priority support", "Dedicated partner"],
            },
          },
          {
            id: "faq_4",
            type: "faq",
            variant: "faq-accordion",
            content: {
              heading: "Questions",
              questions: ["How do we start?", "How long does it take?", "Can we keep editing later?"],
              answers: [
                "A short briefing call, then a locked plan before any design.",
                "Most first sites are ready to review within two weeks.",
                "Yes — the editor keeps the layout locked so copy and images can change safely.",
              ],
            },
          },
          {
            id: "testimonials_5",
            type: "testimonials",
            variant: "testimonials-grid",
            content: {
              heading: "Kind words",
              quotes: [
                "They made the work feel inevitable.",
                "The site finally matches how we talk about ourselves.",
                "Calm process, sharp result.",
              ],
              authors: ["Amelia Chen", "Jonas Hale", "Priya Shah"],
              roles: ["Founder", "Creative director", "Practice lead"],
            },
          },
          {
            id: "cta_6",
            type: "cta",
            variant: "cta-banner",
            content: {
              headline: "Ready when you are",
              subheadline: "A product workspace that makes launches feel inevitable.",
              ctaPrimary: "Start free",
            },
          },
          {
            id: "footer_7",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "Fusion",
              tagline: "Lavender-and-cyan SaaS landing for product and NFT-adjacent launches.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
