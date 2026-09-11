import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function foksDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Foks Journal",
      industry: "Editorial magazine",
      description: "A creative magazine for culture, craft, and the people making it.",
      location: "New York, New York",
    },
    design: {
      tone: "Elegant & premium",
      colorPalette: ["Monochrome"],
      typography: "Classic",
      visualStyle: "Classic",
    },
    seo: {
      title: "Foks Journal | Editorial magazine",
      description: "A creative magazine for culture, craft, and the people making it.",
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
            variant: "hero-background-image",
            content: {
              eyebrow: "Foks",
              headline: "Stories worth lingering over",
              subheadline: "Essays, interviews, and visual features from independent culture.",
              ctaPrimary: "Read the issue",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/foks/hero.jpg", "Foks visual"),
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
            id: "about_3",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "The studio",
              body: "A creative magazine for culture, craft, and the people making it.",
              headline: "The studio",
              subheadline: "A creative magazine for culture, craft, and the people making it.",
            },
            selectedImage: img("/templates/foks/hero.jpg", "Foks visual"),
          },
          {
            id: "testimonials_4",
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
            id: "faq_5",
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
            id: "cta_6",
            type: "cta",
            variant: "cta-banner",
            content: {
              headline: "Ready when you are",
              subheadline: "A creative magazine for culture, craft, and the people making it.",
              ctaPrimary: "Read the issue",
            },
          },
          {
            id: "footer_7",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "Foks Journal",
              tagline: "Creative magazine masthead: Bricolage headlines, DM Sans body, editorial columns.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
