import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

/** Content used for the public /templates/saasldg single-page live demo. */
export function saasldgDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Flowbase",
      industry: "SaaS platform",
      description:
        "The all-in-one cloud workspace that helps teams automate workflows and scale operations effortlessly.",
      location: "San Francisco, California",
    },
    design: {
      tone: "Modern & trustworthy",
      colorPalette: ["Bright blue"],
      typography: "Modern",
      visualStyle: "Modern",
    },
    seo: {
      title: "Flowbase | Automate your business, effortlessly",
      description:
        "Flowbase is the intuitive cloud platform trusted by fast-growing teams to streamline workflows and scale with confidence.",
    },
    quoteSignals: [],
    pages: [
      {
        slug: "home",
        title: "Home",
        sections: [
          {
            id: "hero_home",
            type: "hero",
            variant: "hero-split-with-image",
            content: {
              eyebrow: "Cloud workspace",
              headline: "Unleash and transform your business potential",
              subheadline:
                "Empower your team, streamline workflows, and scale your operations effortlessly with our intuitive cloud-based platform.",
              ctaPrimary: "Start free trial",
              ctaSecondary: "Book a demo",
            },
            selectedImage: img("/templates/saasldg/hero.jpg", "Flowbase product dashboard"),
          },
          {
            id: "feat_home",
            type: "features",
            variant: "features-grid",
            content: {
              heading: "Everything you need to run faster",
              subheading:
                "Empowering your business with cutting-edge tools and functionalities.",
              itemTitles: [
                "Scalable infrastructure",
                "Real-time analytics",
                "Advanced security",
                "Intuitive interface",
                "24/7 support",
                "Automated workflows",
              ],
              itemBodies: [
                "Scale effortlessly to meet growing demand with flexible, robust infrastructure.",
                "Get instant insight into your data, empowering confident, data-driven decisions.",
                "Rest easy knowing your data is protected with top-of-the-line security measures.",
                "Enjoy a user-friendly interface built for seamless navigation and productivity.",
                "Receive round-the-clock help from a dedicated team for a smooth experience.",
                "Optimize processes with automated workflows that save time and reduce errors.",
              ],
            },
          },
          {
            id: "price_home",
            type: "pricing",
            variant: "pricing-tiers",
            content: {
              heading: "Pricing",
              subheading: "Transparent, flexible options tailored to suit your needs.",
              planNames: ["Personal", "Pro", "Enterprise"],
              planPrices: ["", "", ""],
              planFeatures: [
                "Task management\nReal-time collaboration\nBasic analytics\nMobile app access",
                "Advanced reporting\nCustomizable branding\nEnhanced security\nWorkflow automation",
                "Dedicated account manager\nAdvanced integrations\nUnlimited users\n24/7 priority support",
              ],
            },
          },
          {
            id: "faq_home",
            type: "faq",
            variant: "faq-accordion",
            content: {
              heading: "Got questions? We have answers",
              questions: [
                "How quickly can I get started?",
                "Do I need a credit card for the free trial?",
                "How secure is the platform?",
                "Can I upgrade or downgrade later?",
              ],
              answers: [
                "Sign up and you'll be automating your first workflow in minutes — no setup calls required.",
                "No card needed. Start the 14-day trial instantly and only pay when you're ready.",
                "Your data is encrypted in transit and at rest, with SSO and granular access controls.",
                "Absolutely. Change plans any time from your dashboard, and we'll prorate the difference.",
              ],
            },
          },
          {
            id: "test_home",
            type: "testimonials",
            variant: "testimonials-grid",
            content: {
              heading: "Discover what our happy users have to say.",
              quotes: [
                "Since implementing this platform, our productivity has skyrocketed. It's like having a whole team of superheroes supporting our business.",
                "I used to juggle multiple tools, but this brought everything under one roof. Now I'm a marketing wizard with time to spare.",
                "As a small business owner I needed something affordable. It delivered beyond my expectations and helped us compete with the big players.",
              ],
              authors: ["Jane Doe", "John Smith", "Sarah Johnson"],
              roles: ["CEO, TechGenius Inc.", "Marketing Maven", "Small Business Owner"],
            },
          },
          {
            id: "cta_home",
            type: "cta",
            variant: "cta-banner",
            content: {
              headline: "Ready to start?",
              subheadline: "Get the easiest access and launch your workspace today.",
              ctaPrimary: "Download now",
            },
          },
          {
            id: "foot_home",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "Flowbase",
              tagline: "The intuitive cloud workspace for fast-growing teams.",
              linkLabels: ["Features", "Pricing", "FAQ", "Reviews", "Contact"],
            },
          },
        ],
      },
    ],
  };
}
