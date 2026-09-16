import type { WebsiteBlueprint, WebsitePage } from "@/lib/blueprint/types";
import { A, ABOUT_IMGS, CONTACT_IMG, PROJECTS, SERVICES, TEAM, TRAIL } from "./defaults";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder" as const, url, altText });

const footer = (id: string) => ({
  id,
  type: "footer" as const,
  variant: "footer-simple",
  content: {
    businessName: "LuxeFrame",
    tagline: "LuxeFrame is a visionary production.",
    location: "73 Holburn Street, London, UK",
    linkLabels: ["Home", "Projects", "About", "Contact Us"],
    itemTitles: ["Instagram", "Facebook", "X (Twitter)", "LinkedIn"],
  },
});

export function luxeframeDemoBlueprint(): WebsiteBlueprint {
  const home: WebsitePage = {
    slug: "home",
    title: "Home",
    sections: [
      {
        id: "hero_home",
        type: "hero",
        variant: "hero-background-image",
        content: {
          headline: "High-end visual for exclusive exquisite moments",
          ctaPrimary: "Scroll Down",
        },
        selectedImage: img(TRAIL[0], "LuxeFrame still"),
        itemImages: TRAIL.map((url, i) => img(url, `Trail frame ${i + 1}`)),
      },
      {
        id: "about_home",
        type: "about",
        variant: "about-with-image",
        content: {
          heading: "Studio",
          body: "LuxeFrame is a visionary production company crafting captivating, awe-inspiring visual experiences through photography and videography for individuals, businesses, and organizations seeking timeless, high-end imagery.",
        },
        selectedImage: img(ABOUT_IMGS[0], "Studio still"),
      },
      {
        id: "work_home",
        type: "portfolio",
        variant: "portfolio-case-studies",
        content: {
          heading: "Selected Projects",
          itemTitles: PROJECTS.slice(0, 7).map((p) => p.title),
          itemBodies: PROJECTS.slice(0, 7).map((p) => p.place),
        },
        itemImages: PROJECTS.slice(0, 7).map((p) => img(p.img, p.title)),
      },
      {
        id: "services_home",
        type: "services",
        variant: "services-cards",
        content: {
          heading: "Service Areas",
          itemTitles: [...SERVICES],
        },
      },
      {
        id: "cta_home",
        type: "cta",
        variant: "cta-banner",
        content: {
          headline: "We ignite the passion that compels your audience to book their next unforgettable stay.",
          ctaPrimary: "More About us",
        },
        selectedImage: img(`${A}/moreAboutus1.webp`, "More about us"),
      },
      {
        id: "quotes_home",
        type: "testimonials",
        variant: "testimonials-grid",
        content: {
          heading: "Selected Clients",
          body: "Our clients had an amazing experience collaborating with us, praising our dedication, creativity, and professionalism every step of the way. We're confident you'll feel the same and enjoy a seamless, rewarding partnership with us!",
          quotes: [
            "Recently, we teamed up with Kristijan and his family for content creation with a family-focused approach. Their communication was efficient and clear, and the quality of the photos and videos they produced perfectly captured the essence of our resort.",
            "The LuxeFrame team has brought their exceptional talent and charm to our properties. Their remarkable work resonated wonderfully with our audience and enhanced our marketing efforts.",
            "The visuals created have not only enriched our promotional materials but also evoke the emotions and experiences we aim to provide our discerning clientele.",
          ],
          authors: ["Mike Green", "Mike Green", "Elsa Alex"],
          roles: ["CEO at DIOR", "Manager at Cosmic", "Director at Pinterest"],
        },
      },
      footer("foot_home"),
    ],
  };

  const portfolio: WebsitePage = {
    slug: "portfolio",
    title: "Projects",
    sections: [
      {
        id: "hero_work",
        type: "hero",
        variant: "hero-centered",
        content: { headline: "Discover our stunning global photography projects." },
      },
      {
        id: "work_all",
        type: "portfolio",
        variant: "portfolio-case-studies",
        content: {
          heading: "All Projects",
          itemTitles: PROJECTS.map((p) => p.title),
          itemBodies: PROJECTS.map((p) => p.place),
        },
        itemImages: PROJECTS.map((p) => img(p.img, p.title)),
      },
      footer("foot_work"),
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
        content: { headline: "Discover Our Studio and Vision" },
      },
      {
        id: "about_about",
        type: "about",
        variant: "about-with-image",
        content: {
          heading: "About us",
          headline:
            "Welcome to LuxeFrame, where we transform moments into timeless visual narratives. Founded with a passion for capturing the essence of life's most cherished experiences, LuxeFrame is dedicated to crafting captivating photography and videography that resonates with authenticity and elegance.",
          body: "We believe in the power of storytelling through imagery. Whether it's the serene landscapes of the Dolomites, the bustling streets of Paris, or the vibrant energy of an event at sunset, our team of talented photographers and videographers is committed to exceeding expectations.",
          subheadline:
            "Driven by innovation and a deep understanding of visual arts, LuxeFrame is not just a photography studio; it's a creative hub where ideas come to life. From concept to execution, we collaborate closely with our clients to deliver outstanding results that resonate with their vision.",
        },
        selectedImage: img(ABOUT_IMGS[0], "About still one"),
        itemImages: ABOUT_IMGS.map((url, i) => img(url, `About still ${i + 1}`)),
      },
      {
        id: "benefits_about",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "Benefits",
          subheading:
            "At LuxeFrame, we pride ourselves on delivering unparalleled photography and videography services that capture the essence of your unique story. Here are the key benefits of choosing our studio:",
          itemTitles: [
            "Exceptional Quality and Creativity",
            "Professional and Personalized Service",
            "Versatile and Comprehensive Solutions",
          ],
          itemBodies: [
            "Our team of highly skilled photographers and videographers specialize in creating timeless, eye-catching images and videos that leave a lasting impression.",
            "We prioritize your needs and preferences, offering personalized services that cater to your specific requirements from the initial consultation to the final delivery.",
            "Whether you need photography, videography, or a combination of both, we offer a comprehensive suite of services to meet all your visual content needs.",
          ],
        },
      },
      {
        id: "team_about",
        type: "services",
        variant: "services-cards",
        content: {
          heading: "Team Members",
          itemTitles: TEAM.map((t) => t.name),
          itemBodies: TEAM.map((t) => t.role),
        },
        itemImages: TEAM.map((t) => img(t.img, t.name)),
      },
      {
        id: "quotes_about",
        type: "testimonials",
        variant: "testimonials-grid",
        content: {
          heading: "Selected Clients",
          body: "Our clients had an amazing experience collaborating with us, praising our dedication, creativity, and professionalism every step of the way.",
          quotes: [
            "Recently, we teamed up with Kristijan and his family for content creation with a family-focused approach.",
            "The LuxeFrame team has brought their exceptional talent and charm to our properties.",
            "The visuals created have not only enriched our promotional materials but also evoke the emotions we aim to provide.",
          ],
          authors: ["Mike Green", "Mike Green", "Elsa Alex"],
          roles: ["CEO at DIOR", "Manager at Cosmic", "Director at Pinterest"],
        },
      },
      footer("foot_about"),
    ],
  };

  const contact: WebsitePage = {
    slug: "contact",
    title: "Contact Us",
    sections: [
      {
        id: "hero_contact",
        type: "hero",
        variant: "hero-centered",
        content: { headline: "Get in Touch with LuxeFrame" },
      },
      {
        id: "contact_page",
        type: "contact",
        variant: "contact-split",
        content: {
          heading: "Studio",
          subheading: "A Visionary Production Company",
          body: "73 Holburn Street, London, UK",
          itemTitles: ["Instagram", "Facebook", "X (Twitter)", "LinkedIn"],
        },
        selectedImage: img(CONTACT_IMG, "Studio contact still"),
      },
      footer("foot_contact"),
    ],
  };

  return {
    business: {
      name: "LuxeFrame",
      industry: "Photography studio",
      description: "High-end visual for exclusive, exquisite moments.",
      location: "London, UK",
    },
    design: {
      tone: "Elegant & premium",
      colorPalette: ["Green & black"],
      typography: "Luxury",
      visualStyle: "Luxury",
    },
    seo: {
      title: "LuxeFrame | Photography studio",
      description: "High-end visual for exclusive exquisite moments.",
    },
    quoteSignals: [],
    pages: [home, portfolio, about, contact],
  };
}
