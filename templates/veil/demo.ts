import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function veilDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Veil",
      industry: "Infrastructure software",
      description: "The signal layer for teams who need to see through the noise.",
      location: "New York, New York",
    },
    design: {
      tone: "Modern & trustworthy",
      colorPalette: ["Green & black"],
      typography: "Bold",
      visualStyle: "Bold",
    },
    seo: {
      title: "Veil | Infrastructure software",
      description: "The signal layer for teams who need to see through the noise.",
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
              eyebrow: "Veil",
              headline: "The signal layer",
              subheadline: "Observability and control without the dashboard theater.",
              ctaPrimary: "Request access",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/veil/hero.jpg", "Veil visual"),
          },
          {
            id: "about_2",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "The studio",
              body: "The signal layer for teams who need to see through the noise.",
              headline: "The studio",
              subheadline: "The signal layer for teams who need to see through the noise.",
            },
            selectedImage: img("/templates/veil/hero.jpg", "Veil visual"),
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
              img("/templates/veil/hero.jpg", "Project one"),
              img("/templates/veil/hero.jpg", "Project two"),
              img("/templates/veil/hero.jpg", "Project three"),
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
              subheadline: "The signal layer for teams who need to see through the noise.",
              ctaPrimary: "Request access",
            },
          },
          {
            id: "footer_8",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "Veil",
              tagline: "Signal-layer dark UI: Syne + DM Mono, acid-lime ticks, terminal calm.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
