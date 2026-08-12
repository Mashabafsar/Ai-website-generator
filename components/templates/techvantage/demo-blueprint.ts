import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

/** Content used for the public /templates/techvantage layout demo. */
export function techvantageDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Techvantage",
      industry: "Technology consulting",
      description: "Strategy, software, and cloud delivery for mid-market enterprises.",
      location: "Austin, Texas",
    },
    design: {
      tone: "Professional & corporate",
      colorPalette: ["Deep navy"],
      typography: "Modern",
      visualStyle: "Modern",
    },
    seo: {
      title: "Techvantage | Technology consulting",
      description: "IT consulting, custom software, and cloud migration for growing businesses.",
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
              headline: "Empowering Businesses with Cutting-Edge Technology",
              subheadline:
                "We plan, build, and run the systems your business depends on — from first architecture review through to production support.",
              ctaPrimary: "Our Services",
              ctaSecondary: "Learn More",
            },
            selectedImage: img("/templates/techvantage/hero.jpg", "Consultants reviewing work together"),
          },
          {
            id: "svc_1",
            type: "services",
            variant: "services-cards",
            content: {
              eyebrow: "Our services",
              heading: "Expert Services to Drive Digital Transformation",
              itemTitles: [
                "IT Consulting & Strategy",
                "Software Development",
                "Cloud Services & Migration",
              ],
              itemBodies: [
                "Roadmaps, architecture reviews, and vendor decisions grounded in what your team can actually run.",
                "Custom web and internal applications built to your workflow, shipped in reviewable increments.",
                "Migration planning and managed cloud operations with cost and uptime tracked from day one.",
              ],
            },
          },
          {
            id: "about_1",
            type: "about",
            variant: "about-with-image",
            content: {
              eyebrow: "Who we are",
              heading: "Our Journey From Vision to Reality",
              body: "Techvantage started as a two-person consultancy taking on the integration work larger firms turned down. Fifteen years later we run technology programmes for companies across finance, logistics, and healthcare.\n\nWe stay small enough that the people who scope your project are the ones who deliver it, and senior enough that the plan survives contact with your existing systems.",
            },
            selectedImage: img("/templates/techvantage/about-1.jpg", "Engineer working at a laptop"),
            itemImages: [img("/templates/techvantage/about-2.jpg", "Team collaborating in an office")],
          },
          {
            id: "feat_1",
            type: "features",
            variant: "features-grid",
            content: {
              heading: "By the numbers",
              itemTitles: ["500+", "15+", "300+", "98%"],
              itemBodies: [
                "Successful Projects Completed",
                "Years of Industry Experience",
                "Clients Served Globally",
                "Client Satisfaction Rate",
              ],
            },
          },
          {
            id: "feat_2",
            type: "features",
            variant: "features-grid",
            content: {
              eyebrow: "Why choose us",
              heading: "Expertise That Delivers Results",
              subheading:
                "We blend deep industry knowledge with current technology to deliver solutions that hold up in production.",
              itemTitles: [
                "Tailored Solutions",
                "Cutting-Edge Technology",
                "Reliable, Scalable & Secure",
                "Proven Track Record",
              ],
              itemBodies: [
                "Every engagement starts with your constraints, not a template proposal.",
                "Modern stacks chosen for maintainability, not for the pitch deck.",
                "Security review, load testing, and monitoring are part of delivery.",
                "Fifteen years of references across regulated and high-growth sectors.",
              ],
            },
          },
          {
            id: "feat_3",
            type: "features",
            variant: "features-grid",
            content: {
              eyebrow: "Our approach",
              heading: "Providing More Than Just Solutions",
              subheading:
                "Technology projects fail on handover, not on architecture. We plan for the day your team owns the system.",
              itemBodies: [
                "A named senior engineer stays with your project from scoping through to handover.",
                "Fortnightly demos against working software, so scope changes surface early.",
                "Documentation and runbooks written for your team, not for our next audit.",
              ],
            },
            selectedImage: img("/templates/techvantage/approach.jpg", "Team planning at a whiteboard"),
          },
          {
            id: "test_1",
            type: "testimonials",
            variant: "testimonials-grid",
            content: {
              eyebrow: "Testimonials",
              heading: "Hear from Our Satisfied Customers",
              quotes: [
                "They took the time to understand our problems with outdated systems and delivered a migration that ran without a single unplanned outage. Their team stayed on after go-live until our engineers were genuinely confident owning it.",
              ],
              authors: ["Diana Prince"],
              roles: ["CTO, CloudWave Systems"],
            },
          },
          {
            id: "port_1",
            type: "portfolio",
            variant: "portfolio-case-studies",
            content: {
              eyebrow: "Our work",
              heading: "See How We've Made a Difference",
              itemTitles: [
                "Next-Gen Cloud Platform",
                "Custom Software Boosts Productivity",
                "IoT Optimises Energy Use",
                "Reducing Cyber Threats in Finance",
              ],
              itemBodies: [
                "Rebuilt a legacy platform on managed Kubernetes, cutting hosting spend by a third.",
                "Replaced a spreadsheet workflow with a purpose-built tool for 200 field staff.",
                "Instrumented plant equipment to cut energy consumption across eight sites.",
                "Hardened a lending platform ahead of a regulatory audit it went on to pass.",
              ],
            },
            itemImages: [
              img("/templates/techvantage/case-1.jpg", "Cloud platform dashboard"),
              img("/templates/techvantage/case-2.jpg", "Developer working on custom software"),
              img("/templates/techvantage/case-3.jpg", "Connected industrial sensors"),
              img("/templates/techvantage/case-4.jpg", "Security operations monitoring"),
            ],
          },
          {
            id: "feat_4",
            type: "features",
            variant: "features-grid",
            content: {
              eyebrow: "Blogs",
              heading: "Discover the Latest Articles",
              itemTitles: [
                "The Future of Cloud Computing: Essential Trends and Predictions for Businesses",
                "Unlocking the Power of Data Analytics for Smarter Decisions",
                "What a Security Review Should Actually Cover",
              ],
              itemBodies: [
                "Where managed services genuinely reduce cost, and where they quietly add it.",
                "How to get from dashboards nobody opens to numbers your team acts on.",
                "The checks that catch real problems, and the ones that just fill a report.",
              ],
            },
            itemImages: [
              img("/templates/techvantage/article-1.jpg", "Cloud infrastructure illustration"),
              img("/templates/techvantage/article-2.jpg", "Analyst reviewing data"),
              img("/templates/techvantage/article-3.jpg", "Security dashboard"),
            ],
          },
          {
            id: "faq_1",
            type: "faq",
            variant: "faq-accordion",
            content: {
              heading: "Have any questions? We've got answers",
              questions: [
                "What types of IT solutions does Techvantage offer?",
                "What are cloud services, and why should my business consider them?",
                "How does consulting make an impact on the company?",
                "How long does a typical engagement take?",
              ],
              answers: [
                "Consulting and architecture, custom software delivery, and cloud migration with ongoing managed operations. Most clients start with a scoped review before committing to a build.",
                "Cloud services replace hardware you maintain with capacity you rent, which mainly buys you elasticity and a shorter path to recovery. It pays off when your load is uneven or your hardware is near end of life.",
                "Good consulting removes decisions your team keeps deferring. We give you a costed recommendation you can act on, and stay to help implement it.",
                "A review runs two to four weeks. Delivery engagements are scoped in fortnightly increments so you can stop or change direction at any point.",
              ],
            },
          },
          {
            id: "cta_1",
            type: "cta",
            variant: "cta-banner",
            content: {
              headline: "Have a project in mind?",
              subheadline: "Tell us what you're building and we'll come back with a costed next step.",
              ctaPrimary: "Contact Us",
            },
          },
          {
            id: "foot_1",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "Techvantage",
              tagline: "Technology partners for teams that need the system to actually work.",
              linkLabels: ["About Us", "Our Services", "Case Studies", "Blogs", "Contact Us"],
            },
          },
        ],
      },
    ],
  };
}
