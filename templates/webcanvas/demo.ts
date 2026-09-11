import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function webcanvasDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "WebCanvas",
      industry: "Web studio",
      description: "A web studio that still draws before it ships.",
      location: "New York, New York",
    },
    design: {
      tone: "Bold & energetic",
      colorPalette: ["Monochrome"],
      typography: "Bold",
      visualStyle: "Bold",
    },
    seo: {
      title: "WebCanvas | Web studio",
      description: "A web studio that still draws before it ships.",
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
              eyebrow: "WebCanvas",
              headline: "What we do is the whole page",
              subheadline: "Sites, identities, and campaigns for companies tired of looking like software.",
              ctaPrimary: "Start a brief",
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
              img("/templates/webcanvas/hero.jpg", "Project one"),
              img("/templates/webcanvas/hero.jpg", "Project two"),
              img("/templates/webcanvas/hero.jpg", "Project three"),
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
              subheadline: "A web studio that still draws before it ships.",
              ctaPrimary: "Start a brief",
            },
          },
          {
            id: "footer_7",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "WebCanvas",
              tagline: "Warm-stone agency: cream type on charcoal, looping wordmarks, studio grit.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
