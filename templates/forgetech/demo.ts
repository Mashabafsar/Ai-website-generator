import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

/** Content used for the public /templates/forgetech layout demo. */
export function forgetechDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "ForgeTech Engineering",
      industry: "Industrial fabrication",
      description: "Precision industrial fabrication for demanding projects.",
      location: "Milwaukee, Wisconsin",
    },
    design: {
      tone: "Modern & trustworthy",
      colorPalette: ["Warm sunset"],
      typography: "Bold",
      visualStyle: "Bold",
    },
    seo: {
      title: "ForgeTech Engineering | Industrial fabrication",
      description: "Structural steel, welding, and installation for industrial programs.",
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
              eyebrow: "Industrial fabrication",
              headline: "Mastering the art of industrial fabrication",
              subheadline:
                "Precision engineering, certified welding, and on-time delivery for buildings, infrastructure, and energy programs.",
              ctaPrimary: "Explore services",
            },
            selectedImage: img("/templates/forgetech/hero.jpg", "Active construction site"),
          },
          {
            id: "feat_1",
            type: "features",
            variant: "features-grid",
            content: {
              heading: "Core industries we serve",
              subheading: "Three decades of shop-to-site delivery across heavy industry.",
              itemTitles: ["Buildings", "Civil infrastructure", "Energy & multipurpose"],
              itemBodies: [
                "Structural steel and custom assemblies for commercial builds.",
                "Bridges, transit, and heavy civil components built to spec.",
                "Flexible manufacturing for complex multi-industry programs.",
              ],
            },
          },
          {
            id: "about_1",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "Transforming vision into reality through innovation and expertise",
              body: "ForgeTech partners with owners and general contractors from design assist through final install. We keep fabrication, quality control, and field coordination under one roof so schedules hold and rework stays rare.",
            },
            selectedImage: img("/templates/forgetech/about.jpg", "Steelworkers on site at dusk"),
          },
          {
            id: "svc_1",
            type: "services",
            variant: "services-cards",
            content: {
              heading: "Crafting solutions to meet your unique challenges",
              subheading: "End-to-end fabrication services tailored to your schedule.",
              itemTitles: [
                "Custom fabrication",
                "Welding & assembly",
                "Solar integration",
                "Energy management",
              ],
              itemBodies: [
                "Purpose-built assemblies engineered for demanding environments.",
                "Certified welding with documented, inspection-ready quality control.",
                "High-rise solar and facade system support from survey to sign-off.",
                "Smart energy components retrofitted into modern facilities.",
              ],
            },
            itemImages: [
              img("/templates/forgetech/hero.jpg", "Fabrication crew on site"),
              img("/templates/forgetech/about.jpg", "Welded structural assembly"),
              img("/templates/forgetech/project.jpg", "Facade-integrated solar glazing"),
              img("/templates/forgetech/about.jpg", "Plant equipment installation"),
            ],
          },
          {
            id: "feat_2",
            type: "features",
            variant: "features-grid",
            content: {
              heading: "Experience the difference in quality and service",
              subheading: "Every project is delivered by people who take the work personally.",
              itemTitles: [
                "Industry expertise",
                "Uncompromising quality",
                "State-of-the-art facilities",
              ],
              itemBodies: [
                "Decades of field-proven industrial know-how on every job.",
                "Inspection-ready workmanship documented at every release.",
                "Modern shops equipped for complex, large-format builds.",
              ],
            },
          },
          {
            id: "test_1",
            type: "testimonials",
            variant: "testimonials-grid",
            content: {
              heading: "What our clients say",
              quotes: [
                "ForgeTech hit every milestone without cutting a single corner.",
                "Clear communication and fabrication that installed cleanly first time.",
                "Our go-to partner for complex industrial packages.",
              ],
              authors: ["Alex Morgan", "Jordan Lee", "Sam Rivera"],
              roles: ["Project director", "Operations lead", "Owner's representative"],
            },
          },
          {
            id: "port_1",
            type: "portfolio",
            variant: "portfolio-case-studies",
            content: {
              heading: "Examples of our work across industries",
              subheading: "A sample of recent industrial programs.",
              itemTitles: [
                "High-rise solar window installation",
                "Transit bridge girder package",
                "Process plant expansion",
              ],
              itemBodies: [
                "Facade-integrated solar glazing delivered on a live urban site.",
                "Girders fabricated, coated, and shipped to a nine-week schedule.",
                "Structural steel and platforms installed without a production stop.",
              ],
              authors: ["Architecture", "Infrastructure", "Energy"],
              roles: ["Architecture", "Infrastructure", "Energy"],
            },
            selectedImage: img("/templates/forgetech/project.jpg", "Modern glass tower facade"),
          },
          {
            id: "faq_1",
            type: "faq",
            variant: "faq-accordion",
            content: {
              heading: "Have questions? We have answers",
              questions: [
                "What industries do you serve?",
                "How do lead times work?",
                "Can you support design assist?",
              ],
              answers: [
                "Buildings, civil infrastructure, energy, and multipurpose industrial work.",
                "We lock a firm schedule as soon as shop drawings are approved.",
                "Yes — early involvement measurably reduces RFIs and field rework.",
              ],
            },
          },
          {
            id: "feat_3",
            type: "features",
            variant: "features-grid",
            content: {
              heading: "Latest from the workshop",
              subheading: "Practical guidance from our engineering and field teams.",
              itemTitles: [
                "Choosing the right weld procedure",
                "Cutting rework with design assist",
                "What drives fabrication lead times",
              ],
              itemBodies: [
                "How procedure qualification affects cost, schedule, and inspection.",
                "Where early shop involvement saves the most time on site.",
                "The five inputs that actually move your delivery date.",
              ],
            },
          },
          {
            id: "cta_1",
            type: "cta",
            variant: "cta-banner",
            content: {
              headline: "Have a project in mind?",
              subheadline: "Tell us about the scope, schedule, and location.",
              ctaPrimary: "Contact us",
            },
          },
          {
            id: "foot_1",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "ForgeTech Engineering",
              tagline: "Industrial fabrication you can rely on.",
              linkLabels: ["Home", "About Us", "Our Services", "Projects", "Insights", "Contact Us"],
            },
          },
        ],
      },
    ],
  };
}
