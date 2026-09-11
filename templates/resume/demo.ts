import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

export function resumeDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "folio",
      industry: "Personal portfolio",
      description: "A simple portfolio template for designers.",
      location: "Toronto, Canada",
    },
    design: {
      tone: "Minimal & clean",
      colorPalette: ["Monochrome"],
      typography: "Minimal",
      visualStyle: "Minimal",
    },
    seo: {
      title: "Resume | folio",
      description: "A simple portfolio template for designers — work, resume, and contact.",
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
              eyebrow: "folio",
              headline: "Resumé",
              subheadline: "A simple portfolio template for designers.",
              ctaPrimary: "contact",
              ctaSecondary: "ig, yt, fb",
            },
            selectedImage: img("/templates/resume/hero.png", "Portrait with blue and red studio light"),
          },
          {
            id: "about_2",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "About &\nBackground",
              body: "A passionate brand designer with a relentless commitment to transforming visions into compelling visual narratives. With a keen eye for aesthetics and a knack for translating brand identities into impactful designs, I embark on each project as a unique storytelling journey.",
              headline: "About &\nBackground",
              subheadline: "A passionate brand designer with a relentless commitment to transforming visions into compelling visual narratives.",
            },
            selectedImage: img("/templates/resume/hero.png", "Portrait"),
          },
          {
            id: "services_3",
            type: "services",
            variant: "services-cards",
            content: {
              heading: "Previous\nProjects",
              subheading: "Projects",
              itemTitles: [
                "Apple Inc.",
                "Sony",
                "Dropbox",
                "Figma",
                "Adobe",
                "National Geographic",
                "Coca-Cola",
                "Leica",
                "Fujifilm",
                "Nike",
              ],
              itemBodies: [
                "Music Brand Refresh",
                "UI / UX Design",
                "Brand Updates",
                "Design Ambassador",
                "User Research",
                "Website Design",
                "Type System",
                "Product Design",
                "UI Refresh",
                "Branding",
              ],
              dates: ["07.24", "05.24", "03.24", "01.24", "12.23", "10.23", "07.23", "05.23", "02.23", "11.22"],
            },
          },
          {
            id: "portfolio_4",
            type: "portfolio",
            variant: "portfolio-case-studies",
            content: {
              heading: "Selected work",
              subheading: "Featured studies.",
              itemTitles: ["Branding Project", "Music Samples", "Photo Portraits"],
              itemBodies: ["(01)", "(02)", "(03)"],
            },
            itemImages: [
              img("/templates/resume/work-01.png", "Branding project portrait on orange"),
              img("/templates/resume/work-02.png", "Music samples portrait with headphones"),
              img("/templates/resume/work-03.png", "Photo portraits silhouette on teal"),
            ],
          },
          {
            id: "testimonials_5",
            type: "testimonials",
            variant: "testimonials-grid",
            content: {
              heading: "Craft &\nExperience",
              quotes: [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do.",
                "Eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do.",
                "Eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do.",
                "Eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do.",
                "Eiusmod tempor incididunt ut labore et dolore magna aliqua.",
              ],
              authors: [
                "Sr. Brand Designer",
                "UI/UX Lead",
                "Brand Designer",
                "Jr. Designer",
                "Bachelors Of Modern Arts",
                "Secondary Education",
                "Unicef Ambassador",
                "Soup Kitchen",
              ],
              roles: ["Apple Inc.", "Dropbox", "Unimark", "Disney", "Harvard", "Highschool", "Unicef", "Soup Kitchen"],
              dates: ["2020-Current", "2017-2020", "2016-2017", "2016-2017", "2013-2017", "2008-2013", "2013-2017", "2008-2013"],
            },
          },
          {
            id: "contact_6",
            type: "contact",
            variant: "contact-split",
            content: {
              heading: "Contact\nInformation",
              subheading: "Say hello.",
              body: "Email or call — I reply within one business day.",
              itemTitles: ["@brandkitpro", "@thebrandkit", "mail@thebrandkit.com", "647-432-1234"],
              itemBodies: ["Instagram", "Twitter", "Email", "Phone"],
            },
          },
          {
            id: "footer_7",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "folio",
              tagline: "A simple portfolio template for designers.",
              linkLabels: ["about", "work", "resume", "blog", "contact"],
            },
          },
        ],
      },
    ],
  };
}
