import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function willjacksDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Will Jacks",
      industry: "Personal studio",
      description: "A personal website with room for work, notes, and the next thing.",
      location: "New York, New York",
    },
    design: {
      tone: "Friendly & approachable",
      colorPalette: ["Monochrome"],
      typography: "Playful",
      visualStyle: "Playful",
    },
    seo: {
      title: "Will Jacks | Personal studio",
      description: "A personal website with room for work, notes, and the next thing.",
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
              eyebrow: "Will Jacks",
              headline: "Maker. Editor. Always mid-project.",
              subheadline: "Selected work and a simple way to say hello.",
              ctaPrimary: "Say hello",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/willjacks/hero.jpg", "Will Jacks visual"),
          },
          {
            id: "about_2",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "The studio",
              body: "A personal website with room for work, notes, and the next thing.",
              headline: "The studio",
              subheadline: "A personal website with room for work, notes, and the next thing.",
            },
            selectedImage: img("/templates/willjacks/hero.jpg", "Will Jacks visual"),
          },
          {
            id: "services_3",
            type: "services",
            variant: "services-cards",
            content: {
              heading: "What we offer",
              subheading: "Clear work, priced like a practice not a pitch deck.",
              itemTitles: ["Signature service", "Ongoing support", "Specialist care"],
              itemBodies: [
                "The core offer people come for — delivered with a defined process.",
                "Retainers and follow-through so the work keeps compounding.",
                "Focused help for the cases that need a specialist's hand.",
              ],
            },
          },
          {
            id: "portfolio_4",
            type: "portfolio",
            variant: "portfolio-case-studies",
            content: {
              heading: "Selected work",
              subheading: "A short list of recent projects.",
              itemTitles: ["North atrium", "Harbor house", "Civic lobby"],
              itemBodies: ["A quiet public interior.", "A family house reworked.", "A lobby that finally greets people."],
            },
            itemImages: [
              img("/templates/willjacks/hero.jpg", "Project one"),
              img("/templates/willjacks/hero.jpg", "Project two"),
              img("/templates/willjacks/hero.jpg", "Project three"),
            ],
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
            id: "contact_6",
            type: "contact",
            variant: "contact-split",
            content: {
              heading: "Contact",
              subheading: "Tell us what you are trying to do. We will answer like people.",
              body: "Email or call — we reply within one business day.",
            },
          },
          {
            id: "footer_7",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "Will Jacks",
              tagline: "Personal site with mint, blush, and lemon tiles on charcoal ink.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
