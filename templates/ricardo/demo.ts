import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function ricardoDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Ricardo Rowen",
      industry: "Personal atelier",
      description: "An atelier site for a name people already whisper.",
      location: "New York, New York",
    },
    design: {
      tone: "Elegant & premium",
      colorPalette: ["Rose & plum"],
      typography: "Luxury",
      visualStyle: "Luxury",
    },
    seo: {
      title: "Ricardo Rowen | Personal atelier",
      description: "An atelier site for a name people already whisper.",
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
              eyebrow: "Ricardo Rowen",
              headline: "Made slowly, worn often",
              subheadline: "Bespoke work, private clients, and a studio that still answers the phone.",
              ctaPrimary: "Enquire",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/ricardo/hero.jpg", "Ricardo Rowen visual"),
          },
          {
            id: "about_2",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "The studio",
              body: "An atelier site for a name people already whisper.",
              headline: "The studio",
              subheadline: "An atelier site for a name people already whisper.",
            },
            selectedImage: img("/templates/ricardo/hero.jpg", "Ricardo Rowen visual"),
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
              img("/templates/ricardo/hero.jpg", "Project one"),
              img("/templates/ricardo/hero.jpg", "Project two"),
              img("/templates/ricardo/hero.jpg", "Project three"),
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
              businessName: "Ricardo Rowen",
              tagline: "Romantic personal atelier: Cormorant serif, rose ink, script asides.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
