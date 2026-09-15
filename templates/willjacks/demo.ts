import type { WebsiteBlueprint, WebsitePage } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

const A = "/templates/willjacks";

const footer = (id: string) => ({
  id,
  type: "footer" as const,
  variant: "footer-simple",
  content: {
    businessName: "Will Jacks",
    tagline: "Currently available for freelance projects",
    location: "Based in London, UK",
    body: "For any collaborative endeavors or inquiries, I warmly invite you to connect with me!",
    linkLabels: ["Behance", "Dribbble", "Contra", "Pinterest"],
    itemTitles: ["Instagram", "Facebook", "Twitter", "LinkedIn"],
  },
});

const contact = (id: string) => ({
  id,
  type: "contact" as const,
  variant: "contact-split",
  content: {
    heading: "Reach",
    subheading: "Out",
    body: "For any collaborative endeavors or inquiries, I warmly invite you to connect with me!",
    eyebrow: "Currently available for freelance projects",
  },
});

export function willjacksDemoBlueprint(): WebsiteBlueprint {
  const home: WebsitePage = {
    slug: "home",
    title: "Index",
    sections: [
      {
        id: "hero_home",
        type: "hero",
        variant: "hero-split-with-image",
        content: {
          eyebrow: "Currently available for freelance projects",
          headline: "Will Jacks",
          subheadline:
            "Developer and designer fueled by the rich cultural tapestry of Queens, operating as a solo innovator to create unforgettable experiences.",
          ctaPrimary: "Say hello",
          ctaSecondary: "UIUX Designer — Frontend Developer —",
        },
        selectedImage: img(`${A}/hero.jpg`, "Portrait of Will Jacks"),
      },
      {
        id: "about_home",
        type: "about",
        variant: "about-with-image",
        content: {
          heading: "About",
          body: "Beginning my journey as a graphic designer and evolving into a creative developer has endowed me with a distinctive insight, allowing me to seamlessly blend the realms of visual artistry and cutting-edge technology. This unique convergence of skills empowers me to create harmonious digital experiences that are both visually stunning and technologically advanced.",
          subheadline:
            "As a visionary developer with a flair for design, I immersive digital landscapes that marry innovation with crafting experiences.",
        },
        selectedImage: img(`${A}/hero.jpg`, "Portrait of Will Jacks"),
      },
      {
        id: "services_home",
        type: "services",
        variant: "services-cards",
        content: {
          heading: "Core Tools",
          itemTitles: ["Javascript", "WebGL", "NodeJs", "Framer"],
          itemBodies: [
            "Delving deep into the dynamic world of web development, my portfolio showcases a mastery of JavaScript — the heartbeat of modern websites. From interactive UIs to seamless user experiences, each project is a testament to the power and versatility of JavaScript in bringing creative visions to life.",
            "Explore the frontier of 3D web experiences through my portfolio, where WebGL's potent capabilities transform ideas into immersive realities. Each piece is a journey into high-performance graphics, showcasing how WebGL brings depth, motion, and interactivity to the canvas of the modern web.",
            "Dive into the server-side of innovation with my portfolio, highlighting Node.js as the backbone of scalable and efficient web applications. Through projects that blend speed with functionality, I demonstrate how Node.js empowers developers to build robust back-ends, APIs, and real-time applications.",
            "Venture into the realm of intuitive design and seamless prototyping with my portfolio, where Framer's no-code platform breathes life into interactive web experiences. Each project exemplifies the art of visual storytelling without a single line of code.",
          ],
        },
      },
      {
        id: "work_home",
        type: "portfolio",
        variant: "portfolio-case-studies",
        content: {
          heading: "Selected",
          subheading: "Works",
          body: "Discover a showcase of impactful projects where my UI/UX design and front-end development expertise converge to elevate user experiences. These works highlight my journey from conceptual design to flawless execution.",
          itemTitles: ["Banking", "Financilux", "Stride", "Wine & Donuts"],
          itemBodies: ["(01)", "(02)", "(03)", "(04)"],
        },
        itemImages: [
          img(`${A}/work-1.jpg`, "Banking landing page"),
          img(`${A}/work-2.png`, "Financilux tracking platform"),
          img(`${A}/work-3.jpg`, "Stride staking landing page"),
          img(`${A}/work-4.png`, "Wine and donuts illustration"),
        ],
      },
      {
        id: "quotes_home",
        type: "testimonials",
        variant: "testimonials-grid",
        content: {
          heading: "Kind words",
          quotes: [],
          authors: [],
        },
      },
      contact("contact_home"),
      footer("foot_home"),
    ],
  };

  const about: WebsitePage = {
    slug: "about",
    title: "Approach",
    sections: [
      {
        id: "hero_about",
        type: "hero",
        variant: "hero-centered",
        content: {
          headline: "Maximizing client satisfaction hinges on mastering the art of seamless collaboration.",
        },
      },
      {
        id: "services_about",
        type: "services",
        variant: "services-cards",
        content: {
          heading: "Services",
          subheading:
            "To create a website that not only meets but also exceeds client expectations, I adopt a detailed and careful approach that starts with thorough discussions with the client. This initial step allows me to fully grasp their vision, objectives, and the audience they aim to reach, setting a strong groundwork.",
          itemTitles: ["Web Design", "Motion Design", "Web Development", "No Code Development"],
        },
      },
      {
        id: "about_about",
        type: "about",
        variant: "about-with-image",
        content: {
          heading: "Disciplines",
          body: "As a Creative Developer and Modern Designer, I fuse innovation with artistry to create compelling digital experiences. My work transcends mere code and design; it's about crafting interactive moments that inspire and engage.",
          itemTitles: ["Creative Developer", "Modern Designer"],
        },
      },
      {
        id: "process_about",
        type: "process",
        variant: "process-steps",
        content: {
          heading: "Process",
          itemTitles: ["Art Direction", "Design", "Development", "No - Code"],
          itemBodies: [
            "In the initial stage of art direction, I craft the project's visual and narrative identity. By conducting thorough research, engaging in collaboration and consultation with clients, I capture the project's core, defining its atmosphere, emotional impact, and overall visual style.",
            "In the early phase of the design process, I develop the project's aesthetic and conceptual foundation. Through in-depth research and active engagement with clients, I pinpoint the essence of the project, shaping its visual language, emotional resonance, and design principles.",
            "In the initial stage of development, I establish the project's functional and conceptual framework. By conducting thorough research, engaging in collaboration and consultation with clients, I pinpoint the project's fundamental requirements, defining its goals, user experience objectives, and technical specifications.",
            "In the initial phase of no-code development, I define the project's functional blueprint and user interaction strategy. By undertaking comprehensive research, fostering collaboration, and consulting with clients, I distill the project's primary objectives, outlining its user journey, interface design, and interaction flow.",
          ],
        },
      },
      contact("contact_about"),
      footer("foot_about"),
    ],
  };

  return {
    business: {
      name: "Will Jacks",
      industry: "Personal studio",
      description: "A personal portfolio for a designer-developer with mint, blush, and lemon work tiles on charcoal ink.",
      location: "London, UK",
    },
    design: {
      tone: "Friendly & approachable",
      colorPalette: ["Monochrome"],
      typography: "Playful",
      visualStyle: "Playful",
    },
    seo: {
      title: "Will Jacks",
      description: "Developer and designer creating unforgettable digital experiences.",
    },
    quoteSignals: [],
    pages: [home, about],
  };
}
