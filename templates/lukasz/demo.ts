import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function lukaszDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Lukasz Studio",
      industry: "Creative studio",
      description: "A focused practice for image-led brands and editorial work.",
      location: "New York, New York",
    },
    design: {
      tone: "Minimal & clean",
      colorPalette: ["Monochrome"],
      typography: "Minimal",
      visualStyle: "Minimal",
    },
    seo: {
      title: "Lukasz Studio | Creative studio",
      description: "A focused practice for image-led brands and editorial work.",
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
              eyebrow: "Lukasz",
              headline: "Pictures, then the words around them",
              subheadline: "Direction, stills, and sites for people who already know their taste.",
              ctaPrimary: "Get in touch",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/lukasz/hero.jpg", "Lukasz visual"),
          },
          {
            id: "about_2",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "The studio",
              body: "A focused practice for image-led brands and editorial work.",
              headline: "The studio",
              subheadline: "A focused practice for image-led brands and editorial work.",
            },
            selectedImage: img("/templates/lukasz/hero.jpg", "Lukasz visual"),
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
              img("/templates/lukasz/hero.jpg", "Project one"),
              img("/templates/lukasz/hero.jpg", "Project two"),
              img("/templates/lukasz/hero.jpg", "Project three"),
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
              businessName: "Lukasz Studio",
              tagline: "Quiet personal studio: generous whitespace, project grid, conversational about.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
