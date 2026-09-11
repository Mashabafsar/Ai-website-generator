import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function gritDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Grit",
      industry: "Creative consultancy",
      description: "A sharp personal site for people who ship, then prove it.",
      location: "New York, New York",
    },
    design: {
      tone: "Bold & energetic",
      colorPalette: ["Warm sunset"],
      typography: "Bold",
      visualStyle: "Bold",
    },
    seo: {
      title: "Grit | Creative consultancy",
      description: "A sharp personal site for people who ship, then prove it.",
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
              eyebrow: "Grit",
              headline: "Work with teeth still in it",
              subheadline: "Selected projects, a clear offer, and a resume that doesn't look like a resume.",
              ctaPrimary: "Hire me",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/grit/hero.jpg", "Grit visual"),
          },
          {
            id: "about_2",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "The studio",
              body: "A sharp personal site for people who ship, then prove it.",
              headline: "The studio",
              subheadline: "A sharp personal site for people who ship, then prove it.",
            },
            selectedImage: img("/templates/grit/hero.jpg", "Grit visual"),
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
              img("/templates/grit/hero.jpg", "Project one"),
              img("/templates/grit/hero.jpg", "Project two"),
              img("/templates/grit/hero.jpg", "Project three"),
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
              businessName: "Grit",
              tagline: "Resume-forward portfolio: Playfair display, IBM Plex Mono labels, coral strike marks.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
