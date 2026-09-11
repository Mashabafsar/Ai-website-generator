import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function rebelDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Rebel Grace",
      industry: "Design studio",
      description: "UI/UX design and development with an unapologetic point of view.",
      location: "New York, New York",
    },
    design: {
      tone: "Bold & energetic",
      colorPalette: ["Monochrome"],
      typography: "Bold",
      visualStyle: "Bold",
    },
    seo: {
      title: "Rebel Grace | Design studio",
      description: "UI/UX design and development with an unapologetic point of view.",
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
              eyebrow: "Rebel Grace",
              headline: "Rebel. Grace.",
              subheadline: "A designer-developer practice for brands that want more attitude than polish.",
              ctaPrimary: "Start a conversation",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/rebel/hero.jpg", "Rebel Grace visual"),
          },
          {
            id: "about_2",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "The studio",
              body: "UI/UX design and development with an unapologetic point of view.",
              headline: "The studio",
              subheadline: "UI/UX design and development with an unapologetic point of view.",
            },
            selectedImage: img("/templates/rebel/hero.jpg", "Rebel Grace visual"),
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
              img("/templates/rebel/hero.jpg", "Project one"),
              img("/templates/rebel/hero.jpg", "Project two"),
              img("/templates/rebel/hero.jpg", "Project three"),
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
              subheadline: "UI/UX design and development with an unapologetic point of view.",
              ctaPrimary: "Start a conversation",
            },
          },
          {
            id: "footer_8",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "Rebel Grace",
              tagline: "Huge-type personal portfolio: cinematic intro, editorial bio, project reel.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
