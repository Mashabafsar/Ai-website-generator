import type { WebsiteBlueprint, WebsitePage } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

const footer = (id: string) => ({
  id,
  type: "footer",
  variant: "footer-simple",
  content: {
    businessName: "Nimbus",
    tagline: "The no-code platform to launch your next website fast.",
    linkLabels: ["Home", "About", "Services", "Pricing", "Blog", "Portfolio", "Contact"],
  },
});

const cta = (id: string) => ({
  id,
  type: "cta",
  variant: "cta-banner",
  content: {
    headline: "Get started your business today",
    subheadline: "Join 25,000+ teams building beautiful websites without writing a line of code.",
    ctaPrimary: "Create a free account",
  },
});

const pageHeader = (id: string, eyebrow: string, headline: string, subheadline: string) => ({
  id,
  type: "hero",
  variant: "hero-centered",
  content: { eyebrow, headline, subheadline, ctaPrimary: "Get started", ctaSecondary: "" },
});

/** Content used for the public /templates/whiter multi-page demo. */
export function whiterDemoBlueprint(): WebsiteBlueprint {
  const home: WebsitePage = {
    slug: "home",
    title: "Home",
    sections: [
      {
        id: "hero_home",
        type: "hero",
        variant: "hero-split-with-image",
        content: {
          eyebrow: "SaaS platform",
          headline: "Get started your business, fast.",
          subheadline:
            "With lots of unique blocks, you can easily build a page without coding. Launch your next website in minutes, not months.",
          ctaPrimary: "Create a free account",
          ctaSecondary: "See how it works",
        },
        selectedImage: img("/templates/whiter/hero.png", "Product dashboard"),
      },
      {
        id: "feat_home",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "Everything you need to launch",
          subheading: "Powerful building blocks that work out of the box.",
          itemTitles: ["User centered design", "Earn extra money", "Launch your service"],
          itemBodies: [
            "Beautiful, responsive templates crafted around real user behaviour.",
            "Monetise from day one with built-in billing and subscriptions.",
            "Go live in minutes with one-click publishing to a fast global CDN.",
          ],
        },
        itemImages: [
          img("/templates/whiter/icon-target.svg", "Target icon"),
          img("/templates/whiter/icon-coin.svg", "Coin icon"),
          img("/templates/whiter/icon-rocket.png", "Rocket icon"),
        ],
      },
      {
        id: "about_home",
        type: "about",
        variant: "about-with-image",
        content: {
          eyebrow: "Why Nimbus",
          heading: "Get access to your daily cost",
          body: "See exactly where every dollar goes with a live dashboard. Nimbus keeps your team aligned with real-time analytics, so you can make confident decisions and grow faster.",
        },
        selectedImage: img("/templates/whiter/content.png", "Analytics dashboard"),
      },
      {
        id: "value_home",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "We create value to your business",
          subheading: "",
          itemTitles: ["User centered design", "Get latest updates", "Transparent pricing"],
          itemBodies: [
            "Every block is accessible, responsive, and tuned for conversion.",
            "Ship weekly with new blocks, integrations, and templates.",
            "No hidden fees — one simple plan that scales with you.",
          ],
        },
        selectedImage: img("/templates/whiter/value.png", "Team collaborating"),
      },
      {
        id: "test_home",
        type: "testimonials",
        variant: "testimonials-grid",
        content: {
          heading: "Customers are loving it",
          quotes: [
            "You made it so simple. My new site is faster and easier to work with than my old one.",
            "Simply the best. Better than all the rest — I'd recommend it to anyone.",
            "A must-have for anyone who wants to launch quickly without a developer.",
          ],
          authors: ["Alan Farmer", "Maria Chen", "Devon Wright"],
          roles: ["Digital Marketer", "Founder, Loop", "Product Designer"],
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
        "We're building the fastest way to launch",
        "Nimbus started with a simple idea: everyone should be able to build a beautiful website without code."
      ),
      {
        id: "about_about",
        type: "about",
        variant: "about-with-image",
        content: {
          eyebrow: "Our story",
          heading: "From a small team to 25,000+ customers",
          body: "Founded in 2019, Nimbus has grown into a platform trusted by startups and enterprises alike. We obsess over speed, simplicity, and design — so you can focus on your business.",
        },
        selectedImage: img("/templates/whiter/about.png", "The team"),
      },
      {
        id: "feat_about",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "What we stand for",
          subheading: "The values that guide every decision.",
          itemTitles: ["Customer first", "Craft & quality", "Move fast"],
          itemBodies: [
            "Every feature starts with a real customer problem worth solving.",
            "We sweat the details so your site always looks its best.",
            "We ship quickly and improve continuously, together with you.",
          ],
        },
        itemImages: [
          img("/templates/whiter/icon-heart.svg", "Heart icon"),
          img("/templates/whiter/icon-target.svg", "Target icon"),
          img("/templates/whiter/icon-rocket.png", "Rocket icon"),
        ],
      },
      {
        id: "test_about",
        type: "testimonials",
        variant: "testimonials-grid",
        content: {
          heading: "Loved by teams worldwide",
          quotes: [
            "The team genuinely cares. Support is fast and thoughtful.",
            "We migrated in a weekend and never looked back.",
            "Nimbus made our brand feel premium overnight.",
          ],
          authors: ["Priya Nair", "Tom Becker", "Sofia Rossi"],
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
        "Everything you need to grow online",
        "From design to launch, we've got every step covered."
      ),
      {
        id: "svc_services",
        type: "services",
        variant: "services-cards",
        content: {
          heading: "Services tailored to your goals",
          subheading: "Pick a plan or mix and match — it's all included.",
          itemTitles: ["Digital Marketing", "Content Writing", "UI/UX Design"],
          itemBodies: [
            "Data-driven campaigns that turn visitors into customers.",
            "On-brand copy that ranks and converts, written for humans.",
            "Delightful interfaces designed around your users' needs.",
          ],
        },
        itemImages: [
          img("/templates/whiter/service-1.png", "Marketing"),
          img("/templates/whiter/service-2.png", "Content"),
          img("/templates/whiter/service-3.png", "Design"),
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
            "We craft a design that fits you perfectly.",
            "We build it fast on the Nimbus platform.",
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
        "Start free. Upgrade when you're ready. No surprises."
      ),
      {
        id: "price_pricing",
        type: "pricing",
        variant: "pricing-tiers",
        content: {
          heading: "Choose the plan that fits",
          subheading: "Every plan includes hosting, SSL, and unlimited pages.",
          planNames: ["Starter", "Growth", "Premium"],
          planPrices: ["", "", ""],
          planFeatures: [
            "1 website\nNimbus subdomain\nCommunity support",
            "Unlimited websites\nCustom domain\nPriority support\nAnalytics",
            "Everything in Growth\nDedicated manager\nSLA & SSO\nRemove branding",
          ],
        },
      },
      {
        id: "faq_pricing",
        type: "faq",
        variant: "faq-accordion",
        content: {
          heading: "Pricing questions",
          questions: ["Is there a free plan?", "Can I change plans later?", "Do you offer refunds?"],
          answers: [
            "Yes — start free forever on the Starter plan, no card required.",
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
      pageHeader("hero_contact", "Contact", "Let's talk", "Have a question? Our team is here to help."),
      {
        id: "contact_contact",
        type: "contact",
        variant: "contact-split",
        content: {
          heading: "Get in touch",
          subheading: "Tell us about your project and we'll get back within one business day.",
          email: "hello@nimbus.example",
          phone: "(555) 902-4471",
          address: "500 Market St, San Francisco, CA",
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
      pageHeader("hero_faq", "FAQ", "Frequently asked questions", "Everything you need to know about Nimbus."),
      {
        id: "faq_faq",
        type: "faq",
        variant: "faq-accordion",
        content: {
          heading: "Common questions",
          questions: [
            "Do I need to know how to code?",
            "Can I use my own domain?",
            "Is my site fast and secure?",
            "Can I export my website?",
          ],
          answers: [
            "Not at all — Nimbus is fully no-code, with a visual editor for everything.",
            "Yes, connect any custom domain in a few clicks with free SSL.",
            "Every site ships on a global CDN with HTTPS enabled by default.",
            "Yes — export clean, static HTML any time you like.",
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
      pageHeader("hero_blog", "Blog", "Ideas, guides & product news", "Insights to help you build and grow faster."),
      {
        id: "posts_blog",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "Latest articles",
          subheading: "From the Nimbus team.",
          itemTitles: [
            "How to launch a landing page in an afternoon",
            "10 design tips for higher conversions",
            "Behind the scenes: our new editor",
          ],
          itemBodies: [
            "A step-by-step guide to going live fast without cutting corners.",
            "Small changes that make a big difference to your results.",
            "The story of how we rebuilt the Nimbus editor from scratch.",
          ],
        },
        itemImages: [
          img("/templates/whiter/blog-1.png", "Blog post one"),
          img("/templates/whiter/blog-2.png", "Blog post two"),
          img("/templates/whiter/blog-3.png", "Blog post three"),
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
      pageHeader("hero_portfolio", "Portfolio", "Websites built on Nimbus", "A selection of sites launched by our customers."),
      {
        id: "port_portfolio",
        type: "portfolio",
        variant: "portfolio-case-studies",
        content: {
          heading: "Selected work",
          subheading: "Real businesses, real results.",
          itemTitles: ["Loop — SaaS launch", "Verde — eco store", "Atlas — agency site"],
          itemBodies: [
            "A conversion-focused launch page that tripled sign-ups.",
            "A storefront that loads in under a second worldwide.",
            "A bold agency portfolio that wins new business.",
          ],
          authors: ["Loop", "Verde", "Atlas"],
          roles: ["SaaS", "E-commerce", "Agency"],
          metrics: ["3x|Sign-ups|1s|Load time", "60%|More sales|4.9|Rating", "2x|Leads|100%|Uptime"],
        },
        itemImages: [
          img("/templates/whiter/portfolio-1.png", "Loop case study"),
          img("/templates/whiter/portfolio-2.png", "Verde case study"),
          img("/templates/whiter/portfolio-3.png", "Atlas case study"),
        ],
      },
      cta("cta_portfolio"),
      footer("foot_portfolio"),
    ],
  };

  return {
    business: {
      name: "Nimbus",
      industry: "SaaS platform",
      description: "The no-code platform to launch your next website fast.",
      location: "San Francisco, California",
    },
    design: {
      tone: "Friendly & approachable",
      colorPalette: ["Bright blue"],
      typography: "Modern",
      visualStyle: "Modern",
    },
    seo: {
      title: "Nimbus | Build your next website fast",
      description: "The no-code website platform trusted by 25,000+ teams.",
    },
    quoteSignals: [],
    pages: [home, about, services, pricing, contact, faq, blog, portfolio],
  };
}
