import type { WebsiteBlueprint, WebsitePage } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

const A = "/templates/sarahfolio";

const footer = (id: string) => ({
  id,
  type: "footer" as const,
  variant: "footer-simple",
  content: {
    businessName: "Sarah",
    tagline: "Passionate copywriter with a knack for creating engaging, persuasive content that resonates with your audience.",
    linkLabels: ["Content Strategy", "Website Copy", "Blog Writing", "Email Marketing"],
  },
});

const cta = (id: string, headline: string, subheadline: string) => ({
  id,
  type: "cta" as const,
  variant: "cta-banner",
  content: {
    headline,
    subheadline,
    ctaPrimary: "Let's Connect!",
  },
});

/** Content used for the public /templates/sarahfolio multi-page demo. */
export function sarahfolioDemoBlueprint(): WebsiteBlueprint {
  const home: WebsitePage = {
    slug: "home",
    title: "Home",
    sections: [
      {
        id: "hero_home",
        type: "hero",
        variant: "hero-split-with-image",
        content: {
          eyebrow: "Copywriter",
          headline: "THE STORY BEHIND THE WORLD",
          subheadline:
            "Hi, I'm Sarah, a passionate copywriter with a knack for creating engaging, persuasive content that resonates with your audience.",
          ctaPrimary: "Let's Connect!",
        },
        selectedImage: img(`${A}/hero.png`, "Sarah smiling in a yellow sweater"),
      },
      {
        id: "about_home",
        type: "about",
        variant: "about-with-image",
        content: {
          eyebrow: "ABOUT US",
          heading: "Hi, I'm Sarah, a passionate copywriter with a knack for creating engaging, persuasive content that resonates with your audience.",
          body: "With a love for storytelling and a keen understanding of audience psychology, I specialize in creating content that not only informs but also inspires action.\n\nMy journey as a copywriter has led me to work with diverse brands, helping them find their unique voice and connect with their target audience.",
          ctaPrimary: "Read My Story",
        },
        selectedImage: img(`${A}/intro.png`, "Sarah with arms crossed in a yellow sweater"),
      },
      {
        id: "services_home",
        type: "services",
        variant: "services-cards",
        content: {
          heading: "What I Offer",
          subheading:
            "Whether you need persuasive sales copy, engaging blog content, or an entire content strategy, I've got you covered.",
          itemTitles: ["Content Strategy", "Website Copy", "Blog Writing", "Email Marketing"],
          itemBodies: [
            "Crafting content plans that align with your business goals.",
            "Persuasive website copy that converts visitors into customers.",
            "SEO-optimized posts that rank and resonate with readers.",
            "Campaigns that get opened, clicked, and remembered.",
          ],
        },
      },
      {
        id: "work_home",
        type: "portfolio",
        variant: "portfolio-case-studies",
        content: {
          heading: "Words in Action",
          subheading:
            "From compelling ad copy to in-depth blog articles, here's a collection of my work that showcases my versatility and creativity.",
          itemTitles: [
            "Website Revamp for E-Commerce Brand",
            "Social Media Campaign for Tech Startup",
            "Email Marketing for Subscription Service",
            "Content Strategy for Health & Wellness Blog",
          ],
          itemBodies: [
            "Redesigned website copy focused on user experience and conversion optimization, resulting in a 35% increase in sales within three months.",
            "A launch sequence that made a new product feel inevitable.",
            "Nurture emails that turned trial users into paying members.",
            "An editorial calendar that grew a wellness audience week after week.",
          ],
        },
      },
      {
        id: "quotes_home",
        type: "testimonials",
        variant: "testimonials-grid",
        content: {
          heading: "What Clients Are Saying",
          subheading:
            "Don't just take my word for it. Hear from clients who have experienced the impact of my words firsthand.",
          quotes: [
            "Sarah has transformed our brand's voice. The results speak for themselves—higher engagement and more leads!",
            "Working with Sarah was seamless. They understood our needs and delivered beyond expectations.",
            "Sarah has transformed our brand's voice. The results speak for themselves—higher engagement and more leads!",
          ],
          authors: ["Cooper Siphron", "Jaydon Siphron", "Corey Philips"],
          roles: [
            "Founder of GreenWorld E-Commerce",
            "Marketing Director at BrightFuture",
            "Head of Content at SmartFinance",
          ],
          itemTitles: ["FitLife", "Wellness Journey", "Opulence Interiors"],
        },
        itemImages: [
          img(`${A}/avatar-1.png`, "Cooper Siphron"),
          img(`${A}/avatar-2.png`, "Jaydon Siphron"),
          img(`${A}/avatar-3.png`, "Corey Philips"),
        ],
      },
      cta(
        "cta_home",
        "LET'S CREATE SOMETHING AMAZING TOGETHER",
        "Whether you have a project in mind or just want to say hello, I'm always open to new opportunities and collaborations."
      ),
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
          eyebrow: "ABOUT",
          headline: "CRAFTING WORDS THAT MAKE AN IMPACT",
          subheadline:
            "Transforming ideas into powerful messages that drive results—meet the creative mind behind the words.",
          ctaPrimary: "Let's Connect!",
        },
        selectedImage: img(`${A}/about-portrait.png`, "Sarah in a yellow sweater"),
      },
      {
        id: "intro_about",
        type: "about",
        variant: "about-with-image",
        content: {
          eyebrow: "INTRODUCTION",
          heading:
            "It all started with a love for storytelling. From a young age, I was fascinated by how words could evoke emotions, paint vivid pictures, and persuade people to take action.",
          body: "Over the years, I've worked with a diverse range of clients—from startups to established brands—across technology, fashion, and healthcare.\n\nThis journey has taught me the importance of understanding each brand's unique voice and audience, allowing me to create tailored content that truly speaks to their needs.",
        },
        selectedImage: img(`${A}/about-portrait.png`, "Sarah portrait"),
      },
      {
        id: "values_about",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "About me",
          itemTitles: ["What drives me", "My philosophy", "Outside the office"],
          itemBodies: [
            "Every project is a new opportunity to learn, grow, and make an impact. What drives me is the challenge of turning complex ideas into clear, compelling messages. I take pride in my ability to listen, understand, and collaborate with clients to bring their visions to life through words.",
            "I believe that great copy is more than just words on a page. It's about understanding your audience, connecting with them on a personal level, and guiding them toward the desired action. My approach is always strategic and user-focused, ensuring that every piece of content serves a purpose and adds value.",
            "When I'm not writing, you can find me exploring new coffee shops, traveling, or diving into a good book. I believe that creativity is fueled by experiences, and I'm always on the lookout for new inspiration.",
          ],
        },
      },
      {
        id: "quotes_about",
        type: "testimonials",
        variant: "testimonials-grid",
        content: {
          heading: "What Clients Are Saying",
          subheading:
            "Don't just take my word for it. Hear from clients who have experienced the impact of my words firsthand.",
          quotes: [
            "Sarah has transformed our brand's voice. The results speak for themselves—higher engagement and more leads!",
            "Working with Sarah was seamless. They understood our needs and delivered beyond expectations.",
            "Sarah has transformed our brand's voice. The results speak for themselves—higher engagement and more leads!",
          ],
          authors: ["Cooper Siphron", "Jaydon Siphron", "Corey Philips"],
          roles: [
            "Founder of GreenWorld E-Commerce",
            "Marketing Director at BrightFuture",
            "Head of Content at SmartFinance",
          ],
          itemTitles: ["FitLife", "Wellness Journey", "Opulence Interiors"],
        },
        itemImages: [
          img(`${A}/avatar-1.png`, "Cooper Siphron"),
          img(`${A}/avatar-2.png`, "Jaydon Siphron"),
          img(`${A}/avatar-3.png`, "Corey Philips"),
        ],
      },
      cta(
        "cta_about",
        "LET'S CREATE SOMETHING AMAZING TOGETHER",
        "Whether you have a project in mind or just want to say hello, I'm always open to new opportunities and collaborations."
      ),
      footer("foot_about"),
    ],
  };

  const services: WebsitePage = {
    slug: "services",
    title: "Process",
    sections: [
      {
        id: "hero_services",
        type: "hero",
        variant: "hero-centered",
        content: {
          eyebrow: "PROCESS",
          headline: "HERE'S HOW WE CREATE WINNING CONTENT",
          subheadline:
            "Every successful project starts with a clear process. Here's how I turn your ideas into impactful content that drives results.",
        },
      },
      {
        id: "steps_services",
        type: "process",
        variant: "process-steps",
        content: {
          heading: "A clear path from brief to publish",
          stepTitles: [
            "Discovery & Consultation",
            "Research & Strategy",
            "Content Creation",
            "Review & Feedback",
            "Final Delivery",
          ],
          stepBodies: [
            "Before we dive into creating content, it's crucial to get to know you and your business. During our initial consultation, we'll discuss your objectives, target audience, brand voice, and any specific requirements you have in mind.",
            "I'll conduct in-depth research into your industry, competitors, and target audience to ensure that the content we create is relevant, timely, and effective—including structure, key messages, and SEO strategy.",
            "With a clear strategy in place, I'll start crafting the content. Whether it's website copy, blog posts, email campaigns, or social media, I focus on copy that resonates and drives action.",
            "After delivering the initial draft, we'll go through a review process where you can provide input and suggest revisions. I'm committed to ensuring the final content meets your expectations.",
            "Once the content has been refined and approved, I'll deliver the final version in your preferred format—ready to publish and perform.",
          ],
        },
        itemImages: [
          img(`${A}/offer-2.png`, "Discovery workshop notes"),
          img(`${A}/offer-3.png`, "Research and strategy"),
          img(`${A}/offer-4.png`, "Writing at a laptop"),
          img(`${A}/offer-6.png`, "Reviewing drafts"),
          img(`${A}/offer-7.png`, "Final delivery"),
        ],
      },
      cta(
        "cta_services",
        "READY TO TRANSFORM YOUR CONTENT?",
        "Let's create copy that keeps you apart."
      ),
      footer("foot_services"),
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
          eyebrow: "BLOG",
          headline: "INSIGHTS, IDEAS, AND INSPIRATION—WELCOME TO MY BLOG",
          subheadline:
            "Explore the latest trends, tips, and thought-provoking content designed to inspire and empower your creative journey.",
        },
      },
      {
        id: "posts_blog",
        type: "features",
        variant: "features-grid",
        content: {
          heading: "Featured Posts",
          itemTitles: [
            "The Art of Persuasive Copywriting: How to Convert Words into Actions",
            "Content Strategy 101: Building a Plan That Aligns with Your Business Goals",
            "How to Write Headlines That Grab Attention and Increase Click-Through Rates",
            "SEO Copywriting Tips: Writing Content That Ranks and Resonates",
            "Storytelling in Marketing: How to Create Compelling Narratives That Engage Your Audience",
            "Email Marketing Best Practices: Crafting Campaigns That Get Results",
            "The Power of Visual Content: How to Use Imagery and Design to Enhance Your Copy",
            "Common Copywriting Mistakes and How to Avoid Them",
          ],
          itemBodies: [
            "COPYWRITING",
            "CONTENT STRATEGY",
            "CONTENT STRATEGY",
            "WEBSITE COPY",
            "EDUCATION",
            "EDUCATION",
            "EDUCATION",
            "EDUCATION",
          ],
        },
        itemImages: [
          img(`${A}/blog-1.png`, "Laptop on a wooden desk"),
          img(`${A}/blog-2.png`, "Hands holding a notebook"),
          img(`${A}/blog-3.png`, "Notebook and keyboard"),
          img(`${A}/blog-4.png`, "Colorful stationery"),
          img(`${A}/blog-5.png`, "Charts and planning papers"),
          img(`${A}/blog-6.png`, "Laptop with sticky notes"),
          img(`${A}/blog-7.png`, "Team reviewing a whiteboard"),
          img(`${A}/blog-8.png`, "Two colleagues collaborating"),
        ],
      },
      cta(
        "cta_blog",
        "READY TO TRANSFORM YOUR CONTENT?",
        "Let's create a strategy that sets you apart."
      ),
      footer("foot_blog"),
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
          eyebrow: "CONTACT",
          headline: "GET IN TOUCH",
          subheadline:
            "Whether you have a project in mind or just want to say hello, I'm always open to new opportunities and collaborations.",
        },
      },
      {
        id: "form_contact",
        type: "contact",
        variant: "contact-split",
        content: {
          heading: "Get in touch",
          subheading: "Tell me about the story you want to tell. I'll write back soon.",
          body: "Newsletter — first name, sure name, and email.",
          ctaPrimary: "Let's Connect!",
        },
      },
      footer("foot_contact"),
    ],
  };

  return {
    business: {
      name: "Sarah",
      industry: "Copywriting",
      description:
        "Personal copywriter portfolio — Anton display, yellow offset CTAs, multi-page.",
      location: "Remote",
    },
    design: {
      tone: "Bold & energetic",
      colorPalette: ["Warning yellow"],
      typography: "Modern",
      visualStyle: "Bold",
    },
    seo: {
      title: "Sarah | Copywriter portfolio",
      description:
        "Personal copywriter portfolio with Anton display type, yellow offset CTAs, and multi-page storytelling.",
    },
    quoteSignals: [],
    pages: [home, about, services, blog, contact],
  };
}
