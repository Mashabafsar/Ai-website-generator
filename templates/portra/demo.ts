import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function portraDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Portra",
      industry: "Product design",
      description: "UI/UX design for products that need to feel inevitable.",
      location: "New York, New York",
    },
    design: {
      tone: "Minimal & clean",
      colorPalette: ["Emerald & teal"],
      typography: "Minimal",
      visualStyle: "Minimal",
    },
    seo: {
      title: "Portra | Product design",
      description: "UI/UX design for products that need to feel inevitable.",
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
              eyebrow: "Portra",
              headline: "Hi — I design products people keep",
              subheadline: "Interfaces, design systems, and the research underneath.",
              ctaPrimary: "View work",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/portra/hero.jpg", "Portra visual"),
          },
          {
            id: "about_2",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "The studio",
              body: "UI/UX design for products that need to feel inevitable.",
              headline: "The studio",
              subheadline: "UI/UX design for products that need to feel inevitable.",
            },
            selectedImage: img("/templates/portra/hero.jpg", "Portra visual"),
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
              img("/templates/portra/hero.jpg", "Project one"),
              img("/templates/portra/hero.jpg", "Project two"),
              img("/templates/portra/hero.jpg", "Project three"),
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
              businessName: "Portra",
              tagline: "Designer portfolio with icy cyan marks on near-black type.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
