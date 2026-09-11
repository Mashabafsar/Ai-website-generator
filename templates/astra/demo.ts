import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function astraDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Astra Dental",
      industry: "Dental clinic",
      description: "Family and cosmetic dentistry with a calm, contemporary chairside manner.",
      location: "New York, New York",
    },
    design: {
      tone: "Modern & trustworthy",
      colorPalette: ["Deep navy"],
      typography: "Minimal",
      visualStyle: "Minimal",
    },
    seo: {
      title: "Astra Dental | Dental clinic",
      description: "Family and cosmetic dentistry with a calm, contemporary chairside manner.",
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
              eyebrow: "Astra Dental",
              headline: "Confident smiles, thoughtfully cared for",
              subheadline: "Preventive, cosmetic, and restorative dentistry in a studio that feels unhurried.",
              ctaPrimary: "Book a visit",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/astra/hero.jpg", "Astra Dental visual"),
          },
          {
            id: "services_2",
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
            id: "about_3",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "The studio",
              body: "Family and cosmetic dentistry with a calm, contemporary chairside manner.",
              headline: "The studio",
              subheadline: "Family and cosmetic dentistry with a calm, contemporary chairside manner.",
            },
            selectedImage: img("/templates/astra/hero.jpg", "Astra Dental visual"),
          },
          {
            id: "features_4",
            type: "features",
            variant: "features-stats",
            content: {
              heading: "By the numbers",
              subheading: "Proof without the theater.",
              itemTitles: ["12 yrs", "4.9★", "2k+"],
              itemBodies: ["In practice", "Client rating", "People served"],
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
              subheadline: "Family and cosmetic dentistry with a calm, contemporary chairside manner.",
              ctaPrimary: "Book a visit",
            },
          },
          {
            id: "contact_8",
            type: "contact",
            variant: "contact-split",
            content: {
              heading: "Contact",
              subheading: "Tell us what you are trying to do. We will answer like people.",
              body: "Email or call — we reply within one business day.",
            },
          },
          {
            id: "footer_9",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "Astra Dental",
              tagline: "Calm clinical blue, serif headlines, built for modern dental practices.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
