import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function luxeframeDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "LuxeFrame",
      industry: "Photography studio",
      description: "High-end visual for exclusive, exquisite moments.",
      location: "New York, New York",
    },
    design: {
      tone: "Elegant & premium",
      colorPalette: ["Green & black"],
      typography: "Luxury",
      visualStyle: "Luxury",
    },
    seo: {
      title: "LuxeFrame | Photography studio",
      description: "High-end visual for exclusive, exquisite moments.",
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
              eyebrow: "LuxeFrame",
              headline: "High-end visual for exclusive moments",
              subheadline: "Campaign, editorial, and private commissions with cinematic finish.",
              ctaPrimary: "Request a treatment",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/luxeframe/hero.jpg", "LuxeFrame visual"),
          },
          {
            id: "about_2",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "The studio",
              body: "High-end visual for exclusive, exquisite moments.",
              headline: "The studio",
              subheadline: "High-end visual for exclusive, exquisite moments.",
            },
            selectedImage: img("/templates/luxeframe/hero.jpg", "LuxeFrame visual"),
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
              img("/templates/luxeframe/hero.jpg", "Project one"),
              img("/templates/luxeframe/hero.jpg", "Project two"),
              img("/templates/luxeframe/hero.jpg", "Project three"),
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
            id: "faq_6",
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
            id: "cta_7",
            type: "cta",
            variant: "cta-banner",
            content: {
              headline: "Ready when you are",
              subheadline: "High-end visual for exclusive, exquisite moments.",
              ctaPrimary: "Request a treatment",
            },
          },
          {
            id: "footer_8",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "LuxeFrame",
              tagline: "High-end photography house: charcoal, acid-lime marks, cinematic frames.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
