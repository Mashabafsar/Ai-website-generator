import type { WebsiteBlueprint, WebsitePage } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

const footer = (id: string) => ({
  id,
  type: "footer",
  variant: "footer-simple",
  content: {
    businessName: "Mraval",
    tagline: "A creative studio crafting colorful brands, apps, and landing pages.",
    linkLabels: ["Home", "About", "Services", "Pricing", "Blog", "Portfolio", "Contact"],
  },
});

const cta = (id: string) => ({
  id,
  type: "cta",
  variant: "cta-banner",
  content: {
    headline: "Let's discover the multipurpose Mraval",
    subheadline: "Mraval is all that you need to create your creative website. Start enjoying your creativity today.",
    ctaPrimary: "Purchase now",
  },
});

const pageHeader = (id: string, eyebrow: string, headline: string, subheadline: string) => ({
  id,
  type: "hero",
  variant: "hero-centered",
  content: { eyebrow, headline, subheadline, ctaPrimary: "Get started", ctaSecondary: "" },
});

/** Content used for the public /templates/mainfile multi-page demo. */
export function mainfileDemoBlueprint(): WebsiteBlueprint {
  const home: WebsitePage = {
    slug: "home",
    title: "Home",
    sections: [
      {
        id: "hero_home",
        type: "hero",
        variant: "hero-split-with-image",
        content: {
          eyebrow: "Creative studio",
          headline: "Mraval — creative app & landing page studio",
          subheadline:
            "We design colorful brands, apps, and landing pages that help creators do more of what they love. Let's make your ideas a success.",
          ctaPrimary: "Learn more",
          ctaSecondary: "Watch video",
        },
        selectedImage: img("/templates/mainfile/hero.jpg", "Creative studio workspace"),
      },
      {
        id: "feat_home",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "We grow up your business",
          subheading: "Let's success your ideas with a team that sweats every detail.",
          itemTitles: ["Responsive design", "Well documented", "Easy to change"],
          itemBodies: [
            "Pixel-perfect layouts that look their best on every screen and device.",
            "Clean, organised files and clear docs so your team can move fast.",
            "Modular blocks you can restyle and reorder without touching code.",
          ],
        },
      },
      {
        id: "about_home",
        type: "about",
        variant: "about-with-image",
        content: {
          eyebrow: "Elements design",
          heading: "Impressive elements for every idea",
          body: "From bold hero sections to playful icon blocks, Mraval gives you a full toolkit of beautifully crafted components. Build something impressive in an afternoon, not a month.",
        },
        selectedImage: img("/templates/mainfile/content.jpg", "Design elements showcase"),
      },
      {
        id: "value_home",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "Design helps creators do more",
          subheading: "Why choose Mraval for your next creative project.",
          itemTitles: ["Responsive web", "High quality design", "Cool animations"],
          itemBodies: [
            "Fluid layouts tuned for conversion on phones, tablets, and desktops.",
            "A refined visual language with colour, depth, and delightful detail.",
            "Subtle, tasteful motion that brings your story to life on scroll.",
          ],
        },
        selectedImage: img("/templates/mainfile/value.jpg", "Creative team collaborating"),
      },
      {
        id: "test_home",
        type: "testimonials",
        variant: "testimonials-grid",
        content: {
          heading: "What our clients say",
          quotes: [
            "Mraval turned our rough idea into a polished, colorful product in record time.",
            "The best creative team we've worked with — thoughtful, fast, and genuinely fun.",
            "Our new landing page tripled sign-ups. The design just works.",
          ],
          authors: ["Denise Carroll", "Carol Hicks", "Harold Wagner"],
          roles: ["Founder, Loop", "Marketing Lead", "Product Manager"],
        },
      },
      cta("cta_home"),
      footer("foot_home"),
    ],
  };

  const about: WebsitePage = {
    slug: "about",
    title: "About",
    sections: [
      pageHeader(
        "hero_about",
        "About us",
        "A creative studio built around big ideas",
        "Mraval started with a simple belief: great design should be colorful, joyful, and within reach of every creator."
      ),
      {
        id: "about_about",
        type: "about",
        variant: "about-with-image",
        content: {
          eyebrow: "Our story",
          heading: "From a small team to a full-service studio",
          body: "We're a tight-knit group of designers, developers, and storytellers. We obsess over craft and colour so you can focus on your product and your customers.",
        },
        selectedImage: img("/templates/mainfile/about.jpg", "The Mraval team"),
      },
      {
        id: "feat_about",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "What we stand for",
          subheading: "The values behind every project we ship.",
          itemTitles: ["Creativity first", "Craft & quality", "Move fast"],
          itemBodies: [
            "Every project starts with a bold, original idea worth building.",
            "We sweat the details so your brand always looks its best.",
            "We iterate quickly and improve continuously, together with you.",
          ],
        },
      },
      {
        id: "test_about",
        type: "testimonials",
        variant: "testimonials-grid",
        content: {
          heading: "Loved by teams worldwide",
          quotes: [
            "The team genuinely cares. Every handoff was clear and thoughtful.",
            "We launched in a weekend and never looked back.",
            "Mraval made our brand feel premium overnight.",
          ],
          authors: ["Janet Wheeler", "Craig Morris", "Ruth Ramirez"],
          roles: ["Head of Growth", "CTO, Northstar", "Creative Lead"],
        },
      },
      cta("cta_about"),
      footer("foot_about"),
    ],
  };

  const services: WebsitePage = {
    slug: "services",
    title: "Services",
    sections: [
      pageHeader(
        "hero_services",
        "Our services",
        "Everything you need to launch and grow",
        "From brand and design to build and launch, we've got every step covered."
      ),
      {
        id: "svc_services",
        type: "services",
        variant: "services-cards",
        content: {
          heading: "Services tailored to your goals",
          subheading: "Pick a focus or combine them for an end-to-end launch.",
          itemTitles: ["Brand & identity", "UI / UX design", "Web & app build"],
          itemBodies: [
            "Distinctive logos, palettes, and visual systems that stand out.",
            "Delightful, user-centred interfaces designed to convert.",
            "Fast, responsive websites and apps built on modern tooling.",
          ],
        },
        itemImages: [
          img("/templates/mainfile/service-1.jpg", "Brand and identity"),
          img("/templates/mainfile/service-2.jpg", "UI and UX design"),
          img("/templates/mainfile/service-3.jpg", "Web and app build"),
        ],
      },
      {
        id: "proc_services",
        type: "process",
        variant: "process-steps",
        content: {
          heading: "A simple, proven process",
          stepTitles: ["Discover", "Design", "Build", "Launch"],
          stepBodies: [
            "We learn your goals, audience, and brand.",
            "We craft a colorful design that fits you perfectly.",
            "We build it fast with clean, maintainable code.",
            "We publish and support your growth.",
          ],
        },
      },
      cta("cta_services"),
      footer("foot_services"),
    ],
  };

  const pricing: WebsitePage = {
    slug: "pricing",
    title: "Pricing",
    sections: [
      pageHeader(
        "hero_pricing",
        "Pricing",
        "Simple, transparent pricing",
        "Start small and upgrade as you grow. No surprises, ever."
      ),
      {
        id: "price_pricing",
        type: "pricing",
        variant: "pricing-tiers",
        content: {
          heading: "Choose the plan that fits",
          subheading: "Every plan includes source files, support, and a flexible license.",
          planNames: ["Starter", "Professional", "Business"],
          planPrices: ["$29", "$99", "$499"],
          planFeatures: [
            "1 landing page\nCommunity support\nFlexible license",
            "Up to 5 pages\n100+ components\nPriority support\nSpeedy build tooling",
            "Unlimited pages\nMailing manager\nData history\nTwo-factor auth\nDedicated manager",
          ],
        },
      },
      {
        id: "faq_pricing",
        type: "faq",
        variant: "faq-accordion",
        content: {
          heading: "Pricing questions",
          questions: ["Is there a free trial?", "Can I change plans later?", "Do you offer refunds?"],
          answers: [
            "Yes — try any plan free for 14 days, no card required.",
            "Absolutely. Upgrade or downgrade any time from your dashboard.",
            "We offer a 30-day money-back guarantee on all paid plans.",
          ],
        },
      },
      cta("cta_pricing"),
      footer("foot_pricing"),
    ],
  };

  const contact: WebsitePage = {
    slug: "contact",
    title: "Contact",
    sections: [
      pageHeader("hero_contact", "Contact", "Let's talk", "Have a question or a project in mind? Our team is here to help."),
      {
        id: "contact_contact",
        type: "contact",
        variant: "contact-split",
        content: {
          heading: "Need help? Get in touch",
          subheading: "Tell us about your project and we'll reply within one business day.",
          email: "hello@mraval.example",
          phone: "+369 258 147 258",
          address: "71 Amsterdam Avenue, Sydney, NY 10243",
          ctaLabel: "Send message",
        },
      },
      footer("foot_contact"),
    ],
  };

  const faq: WebsitePage = {
    slug: "faq",
    title: "FAQ",
    sections: [
      pageHeader("hero_faq", "FAQ", "Frequently asked questions", "Everything you need to know about working with Mraval."),
      {
        id: "faq_faq",
        type: "faq",
        variant: "faq-accordion",
        content: {
          heading: "Common questions",
          questions: [
            "How long does a project take?",
            "Do you work with startups?",
            "Can you handle both design and build?",
            "Do I own the final files?",
          ],
          answers: [
            "Most landing pages ship in 1–2 weeks; larger sites take a little longer.",
            "Yes — we love helping startups launch fast on a budget.",
            "Absolutely. We can take you from blank page to launched product.",
            "Yes, you own all deliverables and source files once the project ends.",
          ],
        },
      },
      cta("cta_faq"),
      footer("foot_faq"),
    ],
  };

  const blog: WebsitePage = {
    slug: "blog",
    title: "Blog",
    sections: [
      pageHeader("hero_blog", "Blog", "Ideas, guides & studio news", "Insights to help you design, build, and grow faster."),
      {
        id: "posts_blog",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "Latest articles",
          subheading: "From the Mraval studio.",
          itemTitles: [
            "Improving lives through learning",
            "The leading marketplace for creators",
            "Staying ahead of the future of work",
          ],
          itemBodies: [
            "A step-by-step guide to launching a colorful landing page fast.",
            "How marketplaces are reshaping the way creators earn.",
            "Small design changes that make a big difference to your results.",
          ],
        },
        itemImages: [
          img("/templates/mainfile/blog-1.jpg", "Blog post one"),
          img("/templates/mainfile/blog-2.jpg", "Blog post two"),
          img("/templates/mainfile/blog-3.jpg", "Blog post three"),
        ],
      },
      cta("cta_blog"),
      footer("foot_blog"),
    ],
  };

  const portfolio: WebsitePage = {
    slug: "portfolio",
    title: "Portfolio",
    sections: [
      pageHeader("hero_portfolio", "Portfolio", "Selected work", "A selection of colorful projects we've launched for our clients."),
      {
        id: "port_portfolio",
        type: "portfolio",
        variant: "portfolio-case-studies",
        content: {
          heading: "Our recent projects",
          subheading: "Real brands, real results.",
          itemTitles: ["Loop — app launch", "Verde — eco store", "Atlas — agency site", "Nova — SaaS brand", "Pulse — fitness app", "Bloom — florist"],
          itemBodies: [
            "A bold app landing page that tripled sign-ups.",
            "A storefront that loads fast and sells beautifully.",
            "A confident agency portfolio that wins new business.",
            "A crisp SaaS identity and marketing site.",
            "A vibrant fitness app brand and store.",
            "A charming site for a boutique florist.",
          ],
          roles: ["App", "E-commerce", "Agency", "SaaS", "Mobile", "Local"],
        },
        itemImages: [
          img("/templates/mainfile/portfolio-1.jpg", "Loop project"),
          img("/templates/mainfile/portfolio-2.jpg", "Verde project"),
          img("/templates/mainfile/portfolio-3.jpg", "Atlas project"),
          img("/templates/mainfile/portfolio-4.jpg", "Nova project"),
          img("/templates/mainfile/portfolio-5.jpg", "Pulse project"),
          img("/templates/mainfile/portfolio-6.jpg", "Bloom project"),
        ],
      },
      cta("cta_portfolio"),
      footer("foot_portfolio"),
    ],
  };

  return {
    business: {
      name: "Mraval",
      industry: "Creative Studio",
      description: "A creative studio crafting colorful brands, apps, and landing pages.",
      location: "Sydney, Australia",
    },
    design: {
      tone: "Bold & energetic",
      colorPalette: ["Blue & violet"],
      typography: "Modern",
      visualStyle: "Playful",
    },
    seo: {
      title: "Mraval | Creative app & landing page studio",
      description: "A creative studio crafting colorful brands, apps, and landing pages.",
    },
    quoteSignals: [],
    pages: [home, about, services, pricing, contact, faq, blog, portfolio],
  };
}
