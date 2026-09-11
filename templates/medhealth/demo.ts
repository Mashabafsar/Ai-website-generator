import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function medhealthDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "MedHealth",
      industry: "Medical practice",
      description: "Primary and specialty care with a clear path from search to appointment.",
      location: "New York, New York",
    },
    design: {
      tone: "Professional & corporate",
      colorPalette: ["Deep navy"],
      typography: "Classic",
      visualStyle: "Classic",
    },
    seo: {
      title: "MedHealth | Medical practice",
      description: "Primary and specialty care with a clear path from search to appointment.",
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
              eyebrow: "MedHealth",
              headline: "Healthcare, explained without the noise",
              subheadline: "Doctors, services, and visiting hours presented the way patients look for them.",
              ctaPrimary: "Request an appointment",
              ctaSecondary: "Learn more",
            },
            selectedImage: img("/templates/medhealth/hero.jpg", "MedHealth visual"),
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
              body: "Primary and specialty care with a clear path from search to appointment.",
              headline: "The studio",
              subheadline: "Primary and specialty care with a clear path from search to appointment.",
            },
            selectedImage: img("/templates/medhealth/hero.jpg", "MedHealth visual"),
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
              subheadline: "Primary and specialty care with a clear path from search to appointment.",
              ctaPrimary: "Request an appointment",
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
              businessName: "MedHealth",
              tagline: "Clean clinical marketing site with navy trust marks and soft informational cards.",
              linkLabels: ["Home", "Work", "About", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
