import type { WebsiteBlueprint } from "@/lib/blueprint/types";

const img = (url: string, altText: string) =>
  ({ provider: "placeholder", url, altText }) as const;

/** Content used for the public /templates/sports single-page live demo. */
export function sportsDemoBlueprint(): WebsiteBlueprint {
  return {
    business: {
      name: "Athlo",
      industry: "Sports & fitness club",
      description:
        "A team of coaches and sport enthusiasts focused on one thing: helping you train better with structured programs, clear guidance, and a community that keeps you consistent.",
      location: "San Francisco, California",
    },
    design: {
      tone: "Bold & energetic",
      colorPalette: ["Amber"],
      typography: "Bold",
      visualStyle: "Bold",
    },
    seo: {
      title: "Athlo | Where athletes are made",
      description:
        "Personalized training for every athlete — expert coaching, flexible memberships, and a community built to help you push past your limits.",
    },
    quoteSignals: [],
    pages: [
      {
        slug: "home",
        title: "Home",
        sections: [
          {
            id: "hero_home",
            type: "hero",
            variant: "hero-background-image",
            content: {
              eyebrow: "12k+ memberships",
              headline: "Where athletes are made",
              subheadline:
                "Structured programs, expert coaches, and a community that makes it easier to show up, train hard, and stay consistent.",
              ctaPrimary: "Join Athlo",
            },
            selectedImage: img("/templates/sports/hero.jpg", "Athletes training at Athlo"),
          },
          {
            id: "about_home",
            type: "about",
            variant: "about-with-image",
            content: {
              heading: "Personalized training for every athlete",
              body: "We're a team of coaches and sport enthusiasts focused on one thing: helping you train better. At Athlo you get structured programs, clear guidance, and a community that makes it easier to stay consistent — whatever your goal.",
            },
            selectedImage: img("/templates/sports/about.jpg", "Athlo sport center"),
          },
          {
            id: "features_home",
            type: "features",
            variant: "features-grid",
            content: {
              heading: "Smarter training, better results",
              subheading:
                "Athlo combines expert coaching with clear structure and smart tools, so every session moves you closer to your goals — without guesswork.",
              itemTitles: [
                "Over 10 years of coaching experience",
                "Solo & group sessions available",
                "Achieve your goals, faster",
              ],
              itemBodies: [
                "Beginner-friendly classes that build confidence, rhythm, and endurance at your own pace.",
                "Individualized training for all levels — book a private slot or train alongside the community.",
                "Goal-based programs that adapt as you improve, so you always know your next step.",
              ],
            },
            itemImages: [
              img("/templates/sports/feature-1.jpg", "Coaching session"),
              img("/templates/sports/session.jpg", "Group training session"),
              img("/templates/sports/shirt-bg.jpg", "Athlo member gear"),
            ],
          },
          {
            id: "categories_home",
            type: "services",
            variant: "services-cards",
            content: {
              heading: "Everything you need, nothing you don't",
              subheading:
                "A supportive community where passion, movement, and discipline come together — pick the format that fits how you like to train.",
              itemTitles: [
                "Solo Sport — Cycling",
                "Group Sport — Basketball",
                "Duo Sport — Tennis",
                "Squad Sport — Padel",
              ],
              itemBodies: [
                "Starting from $44 — endurance rides and indoor cycling for every level.",
                "Starting from $34 — fast-paced team sessions and league-style play.",
                "Starting from $44 — coached one-on-one drills and match practice.",
                "Starting from $44 — high-energy squad games on our indoor courts.",
              ],
            },
            itemImages: [
              img("/templates/sports/category-1.jpg", "Cycling"),
              img("/templates/sports/category-2.jpg", "Basketball"),
              img("/templates/sports/category-3.jpg", "Tennis"),
              img("/templates/sports/category-4.jpg", "Padel"),
            ],
          },
          {
            id: "pricing_home",
            type: "pricing",
            variant: "pricing-tiers",
            content: {
              heading: "Flexible pricing",
              subheading:
                "Built to give every athlete access to expert coaching and structured training — without hidden fees or long-term lock-ins.",
              planNames: ["Starter Plan", "Active Balance", "Inner Mastery"],
              planPrices: ["$25", "$49", "$89"],
              planFeatures: [
                "2 studio or court sessions per week\nAccess to beginner training videos\nCommunity support group\nBasic performance tracking\nFree equipment rental on your first visit",
                "5 studio or court sessions per week\nFull library of training videos\n1-on-1 monthly coach check-in\nAdvanced performance dashboard\nPriority booking for group sessions\n10% discount on merchandise",
                "Unlimited studio & court access\nWeekly 1-on-1 coaching sessions\nCustom nutrition & recovery plan\nFull analytics + goal tracking\nExclusive member events & workshops\nFree gear kit on sign-up",
              ],
            },
          },
          {
            id: "testimonials_home",
            type: "testimonials",
            variant: "testimonials-grid",
            content: {
              heading: "Here's why athletes trust us",
              quotes: [
                "Finally, a coaching platform that speaks my language. The program took days to start showing results, and the community makes staying consistent enjoyable.",
                "The structure is unreal. I always know what to work on next, and my coach actually pays attention to my progress.",
                "I came in as a total beginner and never felt out of place. The group sessions are the highlight of my week.",
                "Booking is effortless, the coaches are world-class, and the facilities are spotless. Worth every penny.",
                "My performance dashboard keeps me honest. Seeing the streaks build up is weirdly addictive.",
                "The padel squad games are the most fun I've had training in years. Athlo built a real community here.",
              ],
              authors: [
                "Sarah Olsson",
                "Marcus Reid",
                "Elena Voss",
                "James Park",
                "Aisha Nour",
                "Tom Hargrove",
              ],
              roles: [
                "Founder & CEO",
                "Pro Athlete",
                "Fitness Director",
                "Coach & Trainer",
                "Wellness Coach",
                "Sports Manager",
              ],
            },
          },
          {
            id: "faq_home",
            type: "faq",
            variant: "faq-accordion",
            content: {
              heading: "Your questions, answered",
              questions: [
                "Do I need experience to join your classes?",
                "Can I pause or cancel my membership anytime?",
                "How long is each class and how often are they held?",
                "Are online or recorded sessions available?",
                "What should I bring or wear to my first class?",
              ],
              answers: [
                "Not at all — our beginner-friendly classes are built to meet you exactly where you are, and coaches scale every session to your level.",
                "Yes. Memberships are flexible with no long-term lock-in — pause or cancel anytime from your member dashboard.",
                "Most sessions run 45–60 minutes and are scheduled throughout the day, seven days a week, so there's always a slot that fits.",
                "Absolutely. Every membership includes our full library of training videos plus recorded sessions you can follow at home.",
                "Just comfortable athletic wear and a water bottle — we provide the equipment, and your first-visit rental is on us.",
              ],
            },
          },
          {
            id: "event_home",
            type: "cta",
            variant: "cta-banner",
            content: {
              headline: "Ultimate padel adventure",
              subheadline:
                "Join us for an exhilarating one-day padel tournament — compete, connect, and push your limits like never before.",
              ctaPrimary: "Register now",
            },
          },
          {
            id: "footer_home",
            type: "footer",
            variant: "footer-simple",
            content: {
              businessName: "Athlo",
              tagline: "We're doing everything for your future health.",
              linkLabels: ["Home", "About us", "Features", "Categories", "Pricing", "Contact us"],
            },
          },
        ],
      },
    ],
  };
}
