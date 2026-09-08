import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

/** Content used for the public /templates/forgelime live demo. */
export function forgelimeDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Forge Lime",
      industry: "Sales consulting",
      description: "Growth-first sales and marketing strategy for ambitious teams.",
      location: "Austin, Texas",
    },
    design: {
      tone: "Modern & trustworthy",
      colorPalette: ["Neon lime"],
      typography: "Bold",
      visualStyle: "Bold",
    },
    seo: {
      title: "Forge Lime | Strategy-first sales growth",
      description: "Strategy, campaigns, and execution that turn opportunities into measurable growth.",
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
            variant: "hero-centered",
            content: {
              eyebrow: "What Others Say About Us",
              headline: "Grow Sales With Our Strategy First Approach",
              subheadline:
                "Forge Lime's sales and marketing solutions are strategically assigned each month to adapt quickly and hit your goals.",
              ctaPrimary: "Book a Free Consultation",
            },
          },
          {
            id: "feat_about_1",
            type: "features",
            variant: "features-grid",
            content: {
              heading: "Strategic Sales Growth Catalyst",
              subheading:
                "By integrating data-driven insight, market intelligence, and practical execution, we help your team close with confidence.",
              itemTitles: [
                "Fueling Progress with a Strategic Foundation",
                "Illuminating Pathways for Business Triumphs",
                "Elevating Achievements Through Collaboration",
              ],
              itemBodies: [
                "We combine planning, research, and tactical execution to create momentum that compounds quarter over quarter.",
                "Our experts analyze your funnel and customer journey to find the highest-leverage opportunities first.",
                "We work with your team side by side, translating strategy into campaigns that perform in-market.",
              ],
            },
            itemImages: [
              img("/templates/forgelime/about-main.png", "Green abstract layered structure"),
              img("/templates/forgelime/about-card-1.png", "Orange abstract layered structure"),
              img("/templates/forgelime/about-card-2.png", "Yellow abstract layered structure"),
            ],
          },
          {
            id: "services_1",
            type: "services",
            variant: "services-cards",
            content: {
              heading: "Innovative Solutions Hub",
              subheading: "From strategic consulting to seamless execution, we help you unlock measurable growth.",
              itemTitles: [
                "Strategic Insight Consulting",
                "Dynamic Marketing Solutions",
                "Agile Technology Integration",
              ],
              itemBodies: [
                "We assess market dynamics, sharpen positioning, and define the fastest path to revenue growth.",
                "We craft campaigns and content systems that increase reach, trust, and conversion quality.",
                "We deploy practical tooling and automation that scales your sales engine without adding chaos.",
              ],
            },
            itemImages: [
              img("/templates/forgelime/solution-rocket.png", "Rocket icon"),
              img("/templates/forgelime/solution-trophy.png", "Trophy icon"),
              img("/templates/forgelime/solution-gears.png", "Gears icon"),
            ],
          },
          {
            id: "process_1",
            type: "process",
            variant: "process-steps",
            content: {
              heading: "A Deep Dive into Our Collaborative Work Methodology",
              stepTitles: [
                "Strategic Planning and Collaboration",
                "Iterative Development and Feedback Integration",
                "Quality Finalization and Post-Support",
                "Ongoing Improvement and Future Refinement",
              ],
              stepBodies: [
                "We align on goals and map priorities before execution starts.",
                "We launch in iterations, review outcomes, and refine continuously.",
                "We finalize handoff-quality systems and support your rollout.",
                "We keep improving performance with data-backed experimentation.",
              ],
            },
          },
          {
            id: "feat_stats_1",
            type: "features",
            variant: "features-stats",
            content: {
              heading: "Empowering Success in Numbers",
              subheading:
                "From innovation to execution, we help teams perform with clarity and confidence.",
              itemTitles: ["97%", "50+", "10"],
              itemBodies: ["Satisfaction rate", "Delivered projects", "Years of experience"],
            },
          },
          {
            id: "testimonials_1",
            type: "testimonials",
            variant: "testimonials-grid",
            content: {
              heading: "Success Stories from Our Clients",
              quotes: [
                "Forge Lime transformed our growth strategy and helped us close enterprise deals faster.",
                "Their campaign architecture improved our pipeline quality within weeks.",
                "A true strategic partner that turns insight into revenue.",
                "The team brought structure, speed, and measurable outcomes to every sprint.",
                "We saw clearer positioning and better win rates quarter after quarter.",
                "Their iterative process kept our teams aligned and shipping.",
              ],
              authors: [
                "John Anderson",
                "Emily Siemens",
                "Alex Noon",
                "Rachel Simpson",
                "Emma Peterson",
                "Tom Green",
              ],
              roles: [
                "Revenue Lead",
                "Marketing Director",
                "Founder",
                "Operations Manager",
                "VP Growth",
                "CEO",
              ],
            },
          },
          {
            id: "feat_advantages_1",
            type: "features",
            variant: "features-grid",
            content: {
              heading: "Transform Challenges into Opportunities",
              subheading: "Campaigns and channel strategy designed for durable growth.",
              itemTitles: [
                "Precision in Targeted Audience Engagement",
                "Mastering Creativity in Campaign Craftsmanship",
                "Setting Trends and Shaping Futures Through Innovation",
                "Seamlessly Connecting Across Channels",
              ],
              itemBodies: [
                "We tailor messaging to audience intent, increasing relevance and conversion.",
                "Every campaign is crafted to be distinctive, memorable, and measurable.",
                "We pair creative experimentation with disciplined optimization.",
                "Your story stays consistent across channels while adapting to context.",
              ],
            },
            itemImages: [
              img("/templates/forgelime/advantage-banner-1.png", "Abstract yellow flowing pattern"),
              img("/templates/forgelime/advantage-banner-2.png", "Abstract orange flowing pattern"),
            ],
          },
          {
            id: "faq_1",
            type: "faq",
            variant: "faq-accordion",
            content: {
              heading: "Frequently Asked Questions",
              questions: [
                "How can your strategies be customized for my needs?",
                "How do you guarantee my message resonates on all channels?",
                "Can you explain the role of data intelligence in your process?",
                "How do I get started with your services?",
              ],
              answers: [
                "We tailor every roadmap to your market, funnel stage, and team capacity.",
                "We map narratives by channel while keeping core positioning consistent.",
                "Data guides prioritization, experimentation, and budget allocation.",
                "Book a consultation and we will outline a phased plan for your goals.",
              ],
            },
          },
          {
            id: "contact_1",
            type: "contact",
            variant: "contact-split",
            content: {
              heading: "Let's Connect and Ignite Success",
              subheading:
                "Ready to take the next step? Reach out today and we will map the highest-leverage opportunities for your growth.",
              email: "hello@forgelime.example",
              phone: "(555) 016-7740",
              address: "Austin, Texas",
              ctaLabel: "Send a Question",
            },
          },
          {
            id: "footer_1",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "Forge Lime",
              tagline: "Strategy-first growth for ambitious teams.",
              linkLabels: ["About Us", "Services", "How We Work", "Testimonials", "FAQ", "Contact Us"],
            },
          },
        ],
      },
    ],
  };
}
