import type { WebsiteBlueprint, WebsitePage } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

const A = "/templates/rebo";

const footer = (id: string) => ({
  id,
  type: "footer" as const,
  variant: "footer-simple",
  content: {
    businessName: "REBO",
    tagline: "WE ARE PRIORITIZE COLLABORATION WITH OUR CLIENTS",
    linkLabels: ["Home", "About", "Services", "Portfolio", "Blog", "Pricing", "FAQ", "Contact"],
  },
});

/** Content used for the public /templates/rebo multi-page demo. */
export function reboDemoBlueprint(): WebsiteBlueprint {
  const home: WebsitePage = {
    slug: "home",
    title: "Home",
    sections: [
      {
        id: "hero_home",
        type: "hero",
        variant: "hero-split-with-image",
        content: {
          eyebrow: "REBO",
          headline: "A creative design studio",
          subheadline:
            "We're a creative design studio specializing in meeting the needs of the new generation. We offer innovative and cutting-edge design solutions to help our clients stand out in today's fast-paced.",
          ctaPrimary: "Get in touch",
          ctaSecondary: "Believed by more than a thousand people",
        },
        selectedImage: img(`${A}/hero.png`, "Designers collaborating around a laptop"),
      },
      {
        id: "services_home",
        type: "services",
        variant: "services-cards",
        content: {
          heading: "We provide effective design solutions",
          itemTitles: ["UI/UX Design", "Graphic Design", "Web Development", "Motion Graphics"],
          itemBodies: [
            "Focusing on user interface (UI) and user experience (UX) design enhance the usability and accessibility of digital products & app.",
            "Creating visual elements such as logos, branding materials, page layout techniques, brochures, & other marketing collateral.",
            "Designing and developing websites to ensure they are visually look and appealing, user-friendly, and functional your website.",
            "Creating animate graphics, videos for various purposes, including marketing and entertainment. To help sell a product or service.",
          ],
        },
        itemImages: [
          img(`${A}/service-ux.png`, "UI/UX design icon"),
          img(`${A}/service-graphic.png`, "Graphic design icon"),
          img(`${A}/service-web.png`, "Web development icon"),
          img(`${A}/service-motion.png`, "Motion graphics icon"),
        ],
      },
      {
        id: "about_home",
        type: "about",
        variant: "about-with-image",
        content: {
          heading: "We make your business stand out",
          body: "We work closely with our clients to know their objectives, target audience, unique needs, and practical design solutions.",
          itemTitles: ["15+", "120k", "100%"],
          itemBodies: ["Years of experience", "Successful projects", "Client satisfaction rate"],
        },
        selectedImage: img(`${A}/about-video.png`, "Studio team working together"),
      },
      {
        id: "work_home",
        type: "portfolio",
        variant: "portfolio-case-studies",
        content: {
          heading: "Have a wide range of creative project",
          itemTitles: ["Box mockup", "Editorial", "Tape kit", "Cup brand"],
          itemBodies: ["Packaging system", "Print collateral", "Identity kit", "Product brand"],
        },
        itemImages: [
          img(`${A}/work-1.png`, "Box mockup with tape"),
          img(`${A}/work-2.png`, "Open magazine on concrete"),
          img(`${A}/work-3.png`, "Stacked mockup tape rolls"),
          img(`${A}/work-4.png`, "Branded paper cup"),
        ],
      },
      {
        id: "process_home",
        type: "process",
        variant: "process-steps",
        content: {
          heading: "Our high quality working processes",
          subheading:
            "We focus at every stage on effective communication and collaboration between the client and ensuring that the final design meets the client's objectives and expectations.",
          body: "It is important to note that these are simplified steps, and the actual work process may vary depending on the complexity of the project.",
          stepTitles: ["01/ Project idea", "02/ Brainstorming", "03/ Launch"],
          stepBodies: [
            "The process starts with a detailed discussion with the client to understand their idea & goals.",
            "We map options, constraints, and a shared direction before any pixels move.",
            "We ship, measure, and stay close through the first weeks live.",
          ],
        },
      },
      {
        id: "quotes_home",
        type: "testimonials",
        variant: "testimonials-grid",
        content: {
          heading: "Clients are always satisfied with us",
          quotes: [
            "It fits our needs perfectly. It is definitely worth the investment. Your company is upstanding with and is behind its product 100%.",
            "It fits our needs perfectly. It is definitely worth the investment. Your company is upstanding with and is behind its product 100%.",
            "It fits our needs perfectly. It is definitely worth the investment. Your company is upstanding with and is behind its product 100%.",
            "It fits our needs perfectly. It is definitely worth the investment. Your company is upstanding with and is behind its product 100%.",
            "It fits our needs perfectly. It is definitely worth the investment. Your company is upstanding with and is behind its product 100%.",
            "It fits our needs perfectly. It is definitely worth the investment. Your company is upstanding with and is behind its product 100%.",
          ],
          authors: ["Dave Jones", "Dave Jones", "Dave Jones", "Dave Jones", "Dave Jones", "Dave Jones"],
          roles: ["UI/UX", "UI/UX", "UI/UX", "UI/UX", "UI/UX", "UI/UX"],
        },
        itemImages: [
          img(`${A}/quote-avatar.png`, "Dave Jones"),
          img(`${A}/quote-avatar.png`, "Dave Jones"),
          img(`${A}/quote-avatar.png`, "Dave Jones"),
          img(`${A}/quote-avatar.png`, "Dave Jones"),
          img(`${A}/quote-avatar.png`, "Dave Jones"),
          img(`${A}/quote-avatar.png`, "Dave Jones"),
        ],
      },
      {
        id: "cta_home",
        type: "cta",
        variant: "cta-banner",
        content: {
          headline: "LET'S CREATE NEW EXPERIENCES",
          subheadline: "A creative studio for brands that need to stand out.",
          ctaPrimary: "Get in touch",
        },
      },
      {
        id: "team_home",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "We have a team of creative people",
          itemTitles: ["Faris Miqdad", "Ghifari Syafi", "Fawwas Hamzah"],
          itemBodies: ["Software Developer", "Team Leader", "UI/UX Designer"],
        },
        itemImages: [
          img(`${A}/team-1.png`, "Faris Miqdad"),
          img(`${A}/team-2.png`, "Ghifari Syafi"),
          img(`${A}/team-3.png`, "Fawwas Hamzah"),
        ],
      },
      {
        id: "contact_home",
        type: "contact",
        variant: "contact-split",
        content: {
          heading: "Get in touch",
          subheading:
            "We work closely with our clients to understand their objectives, target audience, and unique needs. We use our creative skills to translate these requirements and practical design solutions.",
          body: "I agree with Lookscout Privacy Policy",
          ctaPrimary: "Get in touch",
        },
      },
      footer("foot_home"),
    ],
  };

  const about: WebsitePage = {
    slug: "about",
    title: "About",
    sections: [
      {
        id: "hero_about",
        type: "hero",
        variant: "hero-centered",
        content: {
          eyebrow: "About",
          headline: "ABOUT US",
          subheadline: "A creative and technology-driven digital design studio.",
        },
        selectedImage: img(`${A}/about-hero.png`, "Team gathered around a table"),
      },
      {
        id: "mission_about",
        type: "about",
        variant: "about-with-image",
        content: {
          eyebrow: "Our mission & vision",
          heading: "Our mission is to help businesses thrive a fast-paced competitive world by providing expert guidance & we're here to provide it.",
          body: "Our mission is to help businesses thrive a fast-paced competitive world by providing expert guidance & we're here to provide it.",
        },
        selectedImage: img(`${A}/about-hero.png`, "Studio conversation"),
      },
      {
        id: "stats_about",
        type: "features",
        variant: "features-stats",
        content: {
          heading: "By the numbers",
          itemTitles: ["25+", "84k", "20k", "85%"],
          itemBodies: ["Years of experience", "Active monthly users", "Project completed", "Average Conversion Rate"],
        },
      },
      {
        id: "team_about",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "Our team profesional",
          itemTitles: ["Veres Panna", "Illés Éva", "Szekeres Dalma", "Katona Beatrix"],
          itemBodies: ["IT Support Tech", "AI Engineer", "Info Sys. Mgr.", "QA Tester"],
        },
        itemImages: [
          img(`${A}/about-team-1.png`, "Veres Panna"),
          img(`${A}/about-team-2.png`, "Illés Éva"),
          img(`${A}/about-team-3.png`, "Szekeres Dalma"),
          img(`${A}/about-team-4.png`, "Katona Beatrix"),
        ],
      },
      footer("foot_about"),
    ],
  };

  const services: WebsitePage = {
    slug: "services",
    title: "Services",
    sections: [
      {
        id: "hero_services",
        type: "hero",
        variant: "hero-centered",
        content: {
          eyebrow: "Services",
          headline: "SERVICES",
          subheadline: "Business, financial, marketing, and software — named in the work.",
        },
        selectedImage: img(`${A}/services-hero.png`, "Smoke texture behind service names"),
      },
      {
        id: "list_services",
        type: "services",
        variant: "services-cards",
        content: {
          heading: "SERVICES",
          itemTitles: ["business", "financial", "marketing", "software"],
          itemBodies: [
            "Strategy and systems for companies that need a sharper commercial edge.",
            "Our experts provide financial guide, help manage investments, & risk to ensure your financial health.",
            "Campaigns and brand systems that make the offer unmistakable.",
            "Product and web software shaped around how people actually use it.",
          ],
        },
      },
      {
        id: "approach_services",
        type: "process",
        variant: "process-steps",
        content: {
          heading: "Our Approach",
          stepTitles: ["On-Page SEO", "Technical SEO", "Keyword Research", "Content Creation"],
          stepBodies: [
            "On-page SEO aims to improve users website content and structure to improve its ranking on search engine results pages.",
            "Technical SEO helps search engines crawl & index a site more effectively. Its performance and accessibility to search engines.",
            "We perform keyword research to identify the most relevant and high-traffic keywords and phrases for a client's industry.",
            "Content can take many forms, including blog posts, articles, videos, infographics & high-quality and informative content.",
          ],
        },
      },
      footer("foot_services"),
    ],
  };

  const pricing: WebsitePage = {
    slug: "pricing",
    title: "Pricing",
    sections: [
      {
        id: "hero_pricing",
        type: "hero",
        variant: "hero-centered",
        content: {
          eyebrow: "Pricing",
          headline: "PRICING PLANS",
          subheadline: "Let top creative talent come to you.",
        },
      },
      {
        id: "tiers_pricing",
        type: "pricing",
        variant: "pricing-tiers",
        content: {
          heading: "PRICING PLANS",
          planNames: ["Starter", "Beginner", "Best Value"],
          planPrices: ["", "", ""],
          planFeatures: [
            "Web Development\nSEO Optimization\nContent Writing\nSocial Media Management",
            "Web Development\nSEO Optimization\nContent Writing\nSocial Media Management",
            "Web Development\nSEO Optimization\nContent Writing\nSocial Media Management",
          ],
          itemBodies: [
            "Let top creative talent come to you by posting your job listing on #1 Design Jobs Board.",
            "Let top creative talent come to you by posting your job listing on #1 Design Jobs Board.",
            "Let top creative talent come to you by posting your job listing on #1 Design Jobs Board.",
          ],
        },
      },
      {
        id: "faq_pricing",
        type: "faq",
        variant: "faq-accordion",
        content: {
          heading: "Popular Questions",
          questions: [
            "What is a digital agency?",
            "Why should I hire a digital agency?",
            "Can a digital agency help with content creation?",
            "How much does it cost to hire a digital agency?",
            "What industries does a digital agency typically serve?",
          ],
          answers: [
            "A digital agency is a company that offers a range of services to help businesses establish a strong online presence and achieve their digital marketing goals. These services may include web design, web development, search engine optimization, and more.",
            "A specialist team compresses the learning curve — design, build, and distribution sit in one place.",
            "Yes. Content can take many forms, including blog posts, articles, videos, infographics & high-quality and informative content.",
            "Plans start from a clear monthly package. We'll share a quote once we know the scope.",
            "We typically serve brands, studios, and product companies that need a sharper digital presence.",
          ],
        },
      },
      footer("foot_pricing"),
    ],
  };

  const contact: WebsitePage = {
    slug: "contact",
    title: "Contact",
    sections: [
      {
        id: "hero_contact",
        type: "hero",
        variant: "hero-centered",
        content: {
          eyebrow: "(OUR CONTACTS)",
          headline: "CONTACTS",
          subheadline: "Get in Touch with Us",
        },
      },
      {
        id: "form_contact",
        type: "contact",
        variant: "contact-split",
        content: {
          heading: "Get in Touch with Us",
          subheading: "Lets Bring Your Vision Into Reality",
          body: "27 Division St, NY 10002 indonesia / jakarta",
          ctaPrimary: "Send Message",
        },
      },
      footer("foot_contact"),
    ],
  };

  const faq: WebsitePage = {
    slug: "faq",
    title: "FAQ",
    sections: [
      {
        id: "hero_faq",
        type: "hero",
        variant: "hero-centered",
        content: {
          eyebrow: "(FREQUENTLY ASKED QUESTIONS)",
          headline: "FAQ",
          subheadline: "Popular Questions",
        },
        selectedImage: img(`${A}/faq-hero.png`, "The Thinker statue"),
      },
      {
        id: "list_faq",
        type: "faq",
        variant: "faq-accordion",
        content: {
          heading: "Popular Questions",
          questions: [
            "What is a digital agency?",
            "Why should I hire a digital agency?",
            "Can a digital agency help with content creation?",
            "How much does it cost to hire a digital agency?",
            "What industries does a digital agency typically serve?",
          ],
          answers: [
            "A digital agency is a company that offers a range of services to help businesses establish a strong online presence and achieve their digital marketing goals. These services may include web design, web development, search engine optimization, and more.",
            "A specialist team compresses the learning curve — design, build, and distribution sit in one place.",
            "Yes. Content can take many forms, including blog posts, articles, videos, infographics & high-quality and informative content.",
            "Plans start from a clear monthly package. We'll share a quote once we know the scope.",
            "We typically serve brands, studios, and product companies that need a sharper digital presence.",
          ],
        },
      },
      footer("foot_faq"),
    ],
  };

  const blog: WebsitePage = {
    slug: "blog",
    title: "Blog",
    sections: [
      {
        id: "hero_blog",
        type: "hero",
        variant: "hero-centered",
        content: {
          eyebrow: "Journal",
          headline: "BLOG LISTING",
          subheadline: "Notes from the studio.",
        },
      },
      {
        id: "posts_blog",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "BLOG LISTING",
          itemTitles: [
            "Exploring UI/UX Trends 2024",
            "Unraveling the SEO Secrets",
            "Unraveling the SEO Secrets",
            "Unraveling Marketing Trends",
            "Microinteractions with Macro Impact",
            "Augmented Reality (AR) Experiences",
            "Success is not the key to happiness.",
          ],
          itemBodies: [
            "DECEMBER 25, 2023",
            "DECEMBER 25, 2023",
            "DECEMBER 25, 2023",
            "DECEMBER 25, 2023",
            "DECEMBER 25, 2023",
            "DECEMBER 25, 2023",
            "DECEMBER 25, 2023",
          ],
        },
        itemImages: [
          img(`${A}/blog-1.png`, "UI screens on a desktop"),
          img(`${A}/blog-2.png`, "Analytics dashboard on a monitor"),
          img(`${A}/blog-3.png`, "Laptop with a design quote"),
          img(`${A}/blog-4.png`, "Related post thumbnail"),
          img(`${A}/blog-5.png`, "Related post thumbnail"),
          img(`${A}/blog-6.png`, "Related post thumbnail"),
          img(`${A}/blog-7.png`, "Related post thumbnail"),
        ],
      },
      footer("foot_blog"),
    ],
  };

  const portfolio: WebsitePage = {
    slug: "portfolio",
    title: "Portfolio",
    sections: [
      {
        id: "hero_portfolio",
        type: "hero",
        variant: "hero-centered",
        content: {
          eyebrow: "Work",
          headline: "PORTFOLIO 2 COL",
          subheadline:
            "OUR AGENCY IS A CREATIVE AND TECHNOLOGY-DRIVEN FIRM THAT SPECIALIZES IN PROVIDING A WIDE RANGE OF DIGITAL DESIGN SERVICES TO CLIENTS.",
        },
      },
      {
        id: "cases_portfolio",
        type: "portfolio",
        variant: "portfolio-case-studies",
        content: {
          heading: "Our Cases",
          subheading:
            "OUR AGENCY IS A CREATIVE AND TECHNOLOGY-DRIVEN FIRM THAT SPECIALIZES IN PROVIDING A WIDE RANGE OF DIGITAL DESIGN SERVICES TO CLIENTS.",
          itemTitles: ["QUBUS", "NYOLA", "TAPESHO", "URAGO"],
          itemBodies: ["brand strategy", "digital marketing", "seo page", "brand strategy"],
        },
        itemImages: [
          img(`${A}/case-1.png`, "QUBUS concrete still life"),
          img(`${A}/case-2.png`, "NYOLA book mockup"),
          img(`${A}/case-3.png`, "TAPESHO notebook mockup"),
          img(`${A}/case-4.png`, "URAGO ID card mockup"),
        ],
      },
      footer("foot_portfolio"),
    ],
  };

  return {
    business: {
      name: "REBO",
      industry: "Digital agency",
      description: "A creative design studio specializing in meeting the needs of the new generation.",
      location: "Jakarta, Indonesia",
    },
    design: {
      tone: "Bold & energetic",
      colorPalette: ["Warm coral"],
      typography: "Modern",
      visualStyle: "Bold",
    },
    seo: {
      title: "REBO | Creative design studio",
      description: "A creative design studio offering UI/UX, graphic design, web development, and motion graphics.",
    },
    quoteSignals: [],
    pages: [home, about, services, pricing, contact, faq, blog, portfolio],
  };
}
