import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

/** Content used for the public /templates/craftedspaces layout demo. */
export function craftedspacesDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "CraftedSpaces",
      industry: "Interior & architectural design",
      description: "Elegant interiors, thoughtful renovations, and architecture-led space planning.",
      location: "Austin, Texas",
    },
    design: {
      tone: "Elegant & premium",
      colorPalette: ["Stone", "Charcoal", "Warm cream"],
      typography: "Modern",
      visualStyle: "Minimal",
    },
    seo: {
      title: "CraftedSpaces | Interior Design Studio",
      description:
        "Interior architecture, renovation, and styling services for homes and hospitality spaces.",
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
              eyebrow: "Interior & architectural design",
              headline: "Transforming Spaces with Elegance & Precision",
              subheadline:
                "From concept to final styling, we design refined environments that feel effortless to live in.",
              ctaPrimary: "View Projects",
              ctaSecondary: "Let's Connect",
            },
            selectedImage: img(
              "/templates/craftedspaces/rectangle5.jpg",
              "Modern interior with warm wood and shelving"
            ),
          },
          {
            id: "port_1",
            type: "portfolio",
            variant: "portfolio-case-studies",
            content: {
              heading: "Our Recent Interior Design Projects",
              subheading:
                "A curated collection of homes and workplaces transformed through architecture-led design.",
              itemTitles: [
                "Modern Urban Loft",
                "Contemporary Office Space",
                "Heritage Revival Mansion",
                "Coastal Retreat Villa",
              ],
              itemBodies: [
                "Interior and spatial planning for a light-filled city residence.",
                "A flexible workspace balancing collaboration with private focus zones.",
                "Sensitive restoration paired with contemporary living comfort.",
                "A calm coastal home designed for open living and seamless hosting.",
              ],
              authors: [
                "Interior Design|Space Planning",
                "Architecture|Interior Design",
                "Restoration|Interior Design",
                "Architecture|Interior Design",
              ],
            },
            itemImages: [
              img("/templates/craftedspaces/rectangle13.jpg", "Living room with sculptural furniture"),
              img("/templates/craftedspaces/rectangle11.jpg", "Bright office with custom shelving"),
              img("/templates/craftedspaces/rectangle14.jpg", "Elegant neutral-toned interior"),
              img("/templates/craftedspaces/rectangle15.jpg", "Architectural home detail"),
            ],
          },
          {
            id: "about_1",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "35 Years Combined Experience of Crafting Spaces",
              body: "Our studio blends interior design, architecture, and practical project delivery. We shape spaces around how people really live — layering layout, light, material, and function into environments that age beautifully.",
              ctaPrimary: "Learn More About Us",
            },
            selectedImage: img(
              "/templates/craftedspaces/rectangle8.jpg",
              "Refined living room with natural textures"
            ),
          },
          {
            id: "feat_1",
            type: "features",
            variant: "features-grid",
            content: {
              heading: "What we do",
              itemTitles: ["Space Planning", "Concept Development", "Renovation and Remodeling"],
              itemBodies: [
                "Layouts tuned to circulation, comfort, and long-term flexibility.",
                "Material palettes and visual direction shaped around your lifestyle.",
                "End-to-end renovation support from planning through final styling.",
              ],
            },
          },
          {
            id: "svc_1",
            type: "services",
            variant: "services-cards",
            content: {
              eyebrow: "Our services",
              heading: "Our Expertise for Every Space",
              subheading:
                "Whether you are reworking one room or redesigning an entire property, we tailor the process to your goals.",
              itemTitles: [
                "Architectural Design",
                "Home Renovation",
                "Interior Design",
                "Decor & Accessories",
              ],
              itemBodies: [
                "Architecture-aware interior planning for balanced, purposeful spaces.",
                "Renovation roadmaps that align budget, schedule, and craftsmanship.",
                "A cohesive interior language across furniture, lighting, and finishes.",
                "Layered styling details that complete the room with personality.",
              ],
            },
            itemImages: [
              img("/templates/craftedspaces/rectangle20.jpg", "Architectural facade detail"),
              img("/templates/craftedspaces/rectangle21.jpg", "Bright renovated interior"),
              img("/templates/craftedspaces/rectangle29.jpg", "Contemporary interior composition"),
              img("/templates/craftedspaces/rectangle35.jpg", "Decor accessories and styling"),
            ],
          },
          {
            id: "test_1",
            type: "testimonials",
            variant: "testimonials-grid",
            content: {
              eyebrow: "Testimonials",
              heading: "What Our Clients Say",
              quotes: [
                "Working with CraftedSpaces was an absolute delight. They truly listened, translated our ideas into a cohesive vision, and delivered a home that feels uniquely ours in both beauty and function.",
              ],
              authors: ["John Davies"],
              roles: ["Homeowner, Austin"],
            },
            selectedImage: img(
              "/templates/craftedspaces/rectangle6.jpg",
              "Interior with warm wood paneling and custom shelving"
            ),
          },
          {
            id: "port_2",
            type: "portfolio",
            variant: "portfolio-case-studies",
            content: {
              heading: "Gallery Highlights",
              itemTitles: ["Bespoke staircase", "Open-plan lounge", "Refined material details", "Sunlit living space"],
            },
            itemImages: [
              img("/templates/craftedspaces/rectangle23.jpg", "Architectural staircase"),
              img("/templates/craftedspaces/rectangle25.jpg", "Minimalist living room"),
              img("/templates/craftedspaces/rectangle27.jpg", "Decorative material detail"),
              img("/templates/craftedspaces/rectangle28.jpg", "Contemporary interior lighting"),
            ],
          },
          {
            id: "feat_2",
            type: "features",
            variant: "features-grid",
            content: {
              heading: "Our Latest Blogs",
              subheading:
                "Insights on interior design, renovation strategy, and architecture for modern living.",
              itemTitles: [
                "10 Interior Design Trends to Watch in 2024",
                "The Art of Sustainable Architecture: Building for the Future",
                "How to Choose the Perfect Color Palette for Your Home",
                "Creating Outdoor Spaces That Feel Like an Extension of Your Home",
              ],
              itemBodies: [
                "A practical look at trends worth adopting and those worth skipping.",
                "How sustainability and material choices shape timeless spaces.",
                "A simple framework for selecting palettes with confidence.",
                "Design principles for seamless indoor-outdoor living experiences.",
              ],
              authors: ["Interior Design", "Architecture", "Renovation & Remodeling", "Space Planning"],
            },
            itemImages: [
              img("/templates/craftedspaces/rectangle31.jpg", "Interior styling composition"),
              img("/templates/craftedspaces/rectangle32.jpg", "Geometric architectural detail"),
              img("/templates/craftedspaces/rectangle33.jpg", "Material sample palette"),
              img("/templates/craftedspaces/rectangle34.jpg", "Garden lounge space"),
            ],
          },
          {
            id: "faq_1",
            type: "faq",
            variant: "faq-accordion",
            content: {
              heading: "Frequently Asked Questions",
              subheading:
                "Answers to common questions about timelines, scope, and how we collaborate.",
              questions: [
                "What is the difference between interior design and interior architecture?",
                "How do I know which design style is right for my space?",
                "Can you work with my existing furniture and decor?",
                "What is the process for starting a project?",
              ],
              answers: [
                "Interior architecture shapes the space itself — layout, flow, built elements — while interior design curates finishes, furniture, and atmosphere. Most projects need both.",
                "We begin with a discovery session and visual references, then test options against your daily routines before locking direction.",
                "Absolutely. We often blend existing pieces with new selections to preserve character while elevating the overall result.",
                "After consultation, we provide a tailored scope, timeline, and phased plan. Once approved, we move into concept and development.",
              ],
            },
          },
          {
            id: "cta_1",
            type: "cta",
            variant: "cta-banner",
            content: {
              headline: "Ready to Transform Your Space? Let's Talk!",
              subheadline:
                "Tell us about your project goals and we will outline the next best step for your space.",
              ctaPrimary: "Let's Talk",
            },
          },
          {
            id: "foot_1",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "CraftedSpaces",
              tagline: "Elegant interiors and architectural spaces, crafted with purpose.",
              linkLabels: ["Home", "About Us", "Portfolio", "Gallery", "Blogs", "FAQs"],
            },
          },
        ],
      },
    ],
  };
}
