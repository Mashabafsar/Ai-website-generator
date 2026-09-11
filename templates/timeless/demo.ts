import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function timelessDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Timeless",
      industry: "Creative agency",
      description: "A creative company for brands that intend to last.",
      location: "New York, New York",
    },
    design: {
      tone: "Elegant & premium",
      colorPalette: ["Brand blue"],
      typography: "Modern",
      visualStyle: "Modern",
    },
    seo: {
      title: "Timeless | Creative agency",
      description: "A creative company for brands that intend to last.",
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
            variant: "hero-centered",
            content: {
              eyebrow: "Timeless",
              headline: "Work that still looks right in ten years",
              subheadline: "Brand, film, and digital for houses that refuse seasonal thinking.",
              ctaPrimary: "See cases",
              ctaSecondary: "Learn more",
            },
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
            id: "portfolio_3",
            type: "portfolio",
            variant: "portfolio-case-studies",
            content: {
              heading: "Selected work",
              subheading: "A short list of recent projects.",
              itemTitles: ["North atrium", "Harbor house", "Civic lobby"],
              itemBodies: ["A quiet public interior.", "A family house reworked.", "A lobby that finally greets people."],
            },
            itemImages: [
              img("/templates/timeless/hero.jpg", "Project one"),
              img("/templates/timeless/hero.jpg", "Project two"),
              img("/templates/timeless/hero.jpg", "Project three"),
            ],
          },
          {
            id: "process_4",
            type: "process",
            variant: "process-steps",
            content: {
              heading: "How we work",
              subheading: "Four steps, no mystery.",
              itemTitles: ["Listen", "Frame", "Make", "Stand behind"],
              itemBodies: [
                "A tight briefing so we are solving the actual problem.",
                "A plan you can show a partner without translating.",
                "Design and build in the open.",
                "Launch support and a clean handoff.",
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
              subheadline: "A creative company for brands that intend to last.",
              ctaPrimary: "See cases",
            },
          },
          {
            id: "footer_7",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "Timeless",
              tagline: "Creative-agency home with cool mist surfaces and a long-form case grid.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
