import { Barlow_Condensed, Onest } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { FL } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";

const display = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--fl-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const body = Onest({
  subsets: ["latin"],
  variable: "--fl-body",
  weight: ["400", "500", "700"],
  display: "swap",
});

const ASSETS = {
  heroPattern: "/templates/forgelime/hero-pattern.png",
  heroArrow: "/templates/forgelime/hero-arrow.svg",
  heroAvatars: [
    "/templates/forgelime/hero-avatar-1.png",
    "/templates/forgelime/hero-avatar-2.png",
    "/templates/forgelime/hero-avatar-3.png",
  ],
  logoHeader: "/templates/forgelime/logo-header.svg",
  logoFooter: "/templates/forgelime/logo.svg",
  aboutMain: "/templates/forgelime/about-main.png",
  aboutCard1: "/templates/forgelime/about-card-1.png",
  aboutCard2: "/templates/forgelime/about-card-2.png",
  aboutRocket: "/templates/forgelime/about-rocket.svg",
  solutionIcons: [
    "/templates/forgelime/solution-rocket.png",
    "/templates/forgelime/solution-trophy.png",
    "/templates/forgelime/solution-gears.png",
  ],
  processMorph: "/templates/forgelime/process-morph.png",
  statsCard: "/templates/forgelime/stats-card.png",
  statsMedal: "/templates/forgelime/stats-medal.png",
  iconChat: "/templates/forgelime/icon-chat.svg",
  iconArrow: "/templates/forgelime/icon-arrow.svg",
  advantageBanner1: "/templates/forgelime/advantage-banner-1.png",
  advantageBanner2: "/templates/forgelime/advantage-banner-2.png",
  faqAdd: "/templates/forgelime/faq-add.svg",
  faqDismiss: "/templates/forgelime/faq-dismiss.svg",
  contactMail: "/templates/forgelime/contact-mail.svg",
  contactCalendly: "/templates/forgelime/contact-calendly.svg",
  contactImage: "/templates/forgelime/contact-image.png",
  socialFacebook: "/templates/forgelime/social-facebook.svg",
  socialLinkedin: "/templates/forgelime/social-linkedin.svg",
  socialTwitter: "/templates/forgelime/social-twitter.svg",
  testimonialAvatars: [
    "/templates/forgelime/testimonial-avatar-1.png",
    "/templates/forgelime/testimonial-avatar-2.png",
    "/templates/forgelime/testimonial-avatar-3.png",
    "/templates/forgelime/testimonial-avatar-4.png",
    "/templates/forgelime/testimonial-avatar-5.png",
    "/templates/forgelime/testimonial-avatar-6.png",
    "/templates/forgelime/testimonial-avatar-7.png",
    "/templates/forgelime/testimonial-avatar-8.png",
    "/templates/forgelime/testimonial-avatar-9.png",
    "/templates/forgelime/testimonial-avatar-10.png",
    "/templates/forgelime/testimonial-avatar-11.png",
    "/templates/forgelime/testimonial-avatar-12.png",
  ],
} as const;

const NAV = [
  { label: "About Us", href: "#fl-about" },
  { label: "Services", href: "#fl-solutions" },
  { label: "How We Work", href: "#fl-process" },
  { label: "Testimonials", href: "#fl-testimonials" },
  { label: "FAQ", href: "#fl-faq" },
];

const DISPLAY_STACK = "'Barlow Condensed', 'Oswald', ui-sans-serif, system-ui, sans-serif";
const BODY_STACK = "'Onest', 'Inter', ui-sans-serif, system-ui, sans-serif";

/**
 * Forge Lime is a single-page high-contrast design; copy and media can change,
 * but slot order and structure stay locked to the template.
 */
export function ForgeLimeSite({
  blueprint,
  site,
  contact,
}: {
  blueprint?: WebsiteBlueprint | null;
  site?: AssembledSite | null;
  contact?: SiteContact | null;
}) {
  const slots = toSlots(blueprint, site);

  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "features", 0);
  const solutions = slotAt(slots, "services");
  const process = slotAt(slots, "process");
  const stats = slotAt(slots, "features", 1);
  const testimonials = slotAt(slots, "testimonials");
  const advantages = slotAt(slots, "features", 2);
  const faq = slotAt(slots, "faq");
  const contactSlot = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");

  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "Forge Lime";
  const customLogo = site?.theme.logoUrl?.trim() || "";

  const aboutTitles = list(about.content, "itemTitles", [
    "Fueling Progress with a Strategic Foundation for Growth",
    "Illuminating Pathways for Business Triumphs",
    "Elevating Achievements Through Collaboration",
  ]);
  const aboutBodies = list(about.content, "itemBodies");
  const aboutMain = about.itemImages[0] || ASSETS.aboutMain;
  const aboutCard1 = about.itemImages[1] || ASSETS.aboutCard1;
  const aboutCard2 = about.itemImages[2] || ASSETS.aboutCard2;

  const solutionTitles = list(solutions.content, "itemTitles", [
    "Strategic Insight Consulting",
    "Dynamic Marketing Solutions",
    "Agile Technology Integration",
  ]);
  const solutionBodies = list(solutions.content, "itemBodies");
  const solutionIcon = (i: number) => solutions.itemImages[i] || ASSETS.solutionIcons[i % ASSETS.solutionIcons.length];

  const stepTitles = list(process.content, "stepTitles", [
    "Strategic Planning and Collaboration",
    "Iterative Development and Feedback Integration",
    "Quality Finalization and Post-Support",
    "Ongoing Improvement and Future Refinement",
  ]);
  const stepBodies = list(process.content, "stepBodies");

  const statValues = list(stats.content, "itemTitles", ["97%", "50+", "10"]);
  const statLabels = list(stats.content, "itemBodies", ["Satisfaction rate", "Delivered projects", "Years of experience"]);

  const quoteList = list(testimonials.content, "quotes");
  const authorList = list(testimonials.content, "authors");
  const roleList = list(testimonials.content, "roles");
  const testimonialCols: number[][] = [[], [], [], []];
  quoteList.forEach((_, i) => testimonialCols[i % 4].push(i));

  const advantageTitles = list(advantages.content, "itemTitles", [
    "Precision in Targeted Audience Engagement",
    "Mastering Creativity in Campaign Craftsmanship",
    "Setting Trends and Shaping Futures Through Campaign Innovation",
    "Seamlessly Connecting Across Channels",
  ]);
  const advantageBodies = list(advantages.content, "itemBodies");
  const advantageImg1 = advantages.itemImages[0] || ASSETS.advantageBanner1;
  const advantageImg2 = advantages.itemImages[1] || ASSETS.advantageBanner2;

  const questions = list(faq.content, "questions");
  const answers = list(faq.content, "answers");

  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || text(contactSlot.content, "email");
  const contactPhone = details?.phone?.trim() || text(contactSlot.content, "phone");
  const contactAddress = text(contactSlot.content, "address", "Remote-first, worldwide");
  const contactCta = text(contactSlot.content, "ctaLabel", "Send a Question");
  const contactHref = contactEmail ? `mailto:${contactEmail}` : "#fl-contact";

  const footerLinks = list(footer.content, "linkLabels", [...NAV.map((n) => n.label), "Contact Us"]);

  return (
    <div
      id="fl-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#A9FF5C"),
        ["--fl-display" as string]: DISPLAY_STACK,
        ["--fl-body" as string]: BODY_STACK,
        fontFamily: "var(--fl-body)",
        color: FL.ink,
        backgroundColor: FL.canvas,
        ...themeFontStyle(site?.theme, ["--fl-display", "--fl-body"]),
      }}
    >
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}

      <section className="relative overflow-hidden" style={sectionBandStyle(hero.theme)}>
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ASSETS.heroPattern}
            alt=""
            className="h-full w-full object-cover opacity-35"
            data-parallax="0.08"
          />
          <div className="absolute inset-0 bg-[#090D06]/85" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[900px] max-w-[90rem] flex-col px-4 pb-20 pt-8 lg:px-20">
          <div className="flex items-center justify-between">
            <a href="#fl-top" className="inline-flex items-center gap-3">
              {customLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customLogo} alt="" className="h-11 w-11 object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ASSETS.logoHeader} alt="" className="h-12 w-12 object-contain" />
              )}
            </a>
            <nav className="hidden items-center gap-4 md:flex">
              {NAV.map((item) => (
                <a key={item.href} href={item.href} className="rounded-lg px-2 py-1 text-base text-[#F1FBE8] transition-colors hover:text-[#A9FF5C]">
                  {item.label}
                </a>
              ))}
            </nav>
            <a
              href={contactHref}
              className="rounded-xl border border-[#A9FF5C] px-5 py-3 text-sm font-semibold text-[#F1FBE8] transition-colors hover:bg-[#A9FF5C]/10"
            >
              Get In Touch
            </a>
          </div>

          <div className="mx-auto mt-24 flex max-w-[52rem] flex-col items-center text-center">
            <div className="flex items-center gap-4 rounded-full border border-[#426027] bg-[#1F2B15] px-3 py-2">
              <div className="flex items-center">
                {ASSETS.heroAvatars.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className={`h-8 w-8 rounded-full border-2 border-[#1F2B15] object-cover ${i > 0 ? "-ml-2" : ""}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#E1FFC7]">
                <span>{text(hero.content, "eyebrow", "What Others Say About Us")}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ASSETS.heroArrow} alt="" className="h-4 w-4 object-contain" />
              </div>
            </div>

            <h1
              className="mt-8 text-[clamp(3rem,9vw,6.5rem)] uppercase leading-[0.9] tracking-[-1.6px]"
              style={{ fontFamily: "var(--fl-display)" }}
            >
              <AccentWords text={text(hero.content, "headline", "Grow Sales With Our Strategy First Approach")} words={2} accent={FL.brand} />
            </h1>
            <p className="mt-6 max-w-[40rem] text-lg leading-relaxed text-[#979F90]">
              {text(
                hero.content,
                "subheadline",
                "Forge's sales and marketing solutions are strategically assigned each month to adapt quickly and hit your goals."
              )}
            </p>
            <a
              href="#fl-contact"
              className="mt-10 rounded-xl bg-[#A9FF5C] px-8 py-5 text-base font-bold text-[#090D06] transition hover:bg-[#95EA4F]"
            >
              {text(hero.content, "ctaPrimary", "Book a Free Consultation")}
            </a>
          </div>
        </div>
      </section>

      <section id="fl-about" className="mx-auto max-w-[90rem] px-4 py-20 lg:px-20" style={sectionBandStyle(about.theme)}>
        <div className="max-w-[36rem]">
          <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style={{ fontFamily: "var(--fl-display)" }}>
            <AccentWords text={text(about.content, "heading", "Strategic Sales Growth Catalyst")} words={2} accent={FL.brand} />
          </h2>
          <p className="mt-5 text-xl leading-relaxed text-[#979F90]">
            {text(
              about.content,
              "subheading",
              "By seamlessly integrating data-driven insights, market intelligence, and a deep understanding of your business, we propel your sales to new heights."
            )}
          </p>
        </div>

        <div className="mt-14 grid gap-4">
          <article className="grid overflow-hidden rounded-[28px] lg:grid-cols-2" style={{ backgroundColor: FL.brandSoft }}>
            <div className="p-8 lg:p-14">
              <span className="inline-grid h-20 w-20 place-items-center rounded-full bg-[#356905]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ASSETS.aboutRocket} alt="" className="h-10 w-10 object-contain" />
              </span>
              <h3
                className="mt-10 text-[clamp(2rem,5vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px]"
                style={{ color: "#356905", fontFamily: "var(--fl-display)" }}
              >
                {aboutTitles[0]}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-[#090D06]">
                {aboutBodies[0] ||
                  "As a dynamic and forward-thinking powerhouse, we craft innovative strategies that move beyond convention."}
              </p>
            </div>
            <div className="relative min-h-[320px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={aboutMain} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </article>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="overflow-hidden rounded-[28px]" style={{ backgroundColor: FL.orangeSoft }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={aboutCard1} alt="" className="h-64 w-full object-cover" />
              <div className="p-8 lg:p-12">
                <h3
                  className="text-[clamp(2rem,4.6vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px]"
                  style={{ color: FL.orangeInk, fontFamily: "var(--fl-display)" }}
                >
                  {aboutTitles[1]}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-[#090D06]">
                  {aboutBodies[1] ||
                    "We craft success through strategies integrating data-driven insight and deep understanding of your business."}
                </p>
              </div>
            </article>

            <article className="overflow-hidden rounded-[28px]" style={{ backgroundColor: FL.yellowSoft }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={aboutCard2} alt="" className="h-64 w-full object-cover" />
              <div className="p-8 lg:p-12">
                <h3
                  className="text-[clamp(2rem,4.6vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px]"
                  style={{ color: FL.yellowInk, fontFamily: "var(--fl-display)" }}
                >
                  {aboutTitles[2]}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-[#090D06]">
                  {aboutBodies[2] ||
                    "We don't just work for our clients; we work with them to deliver outcomes that last."}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="fl-solutions" className="mx-auto max-w-[90rem] px-4 py-20 lg:px-20" style={sectionBandStyle(solutions.theme)}>
        <div className="mx-auto max-w-[36rem] text-center">
          <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style={{ fontFamily: "var(--fl-display)" }}>
            <AccentWords text={text(solutions.content, "heading", "Innovative Solutions Hub")} words={1} accent={FL.brand} />
          </h2>
          <p className="mt-5 text-xl leading-relaxed text-[#979F90]">
            {text(
              solutions.content,
              "subheading",
              "From strategic consulting to seamless execution, we are your partners in unlocking unparalleled success."
            )}
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {solutionTitles.map((title, i) => (
            <article
              key={`${title}-${i}`}
              className="flex flex-col items-center rounded-[28px] px-8 pb-12 pt-8 text-center"
              style={{ backgroundColor: FL.brandSoft }}
            >
              <div className="relative h-[264px] w-[264px]">
                <div className="absolute inset-[12%] rounded-full bg-[#7FD136]" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={solutionIcon(i)} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <h3 className="mt-8 text-[2.5rem] uppercase leading-[0.92] tracking-[-0.8px] text-[#356905]" style={{ fontFamily: "var(--fl-display)" }}>
                {title}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-[#090D06]">
                {solutionBodies[i] ||
                  "Our experts design practical, high-impact systems that improve consistency and growth performance."}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="fl-process" className="mx-auto max-w-[90rem] px-4 py-24 lg:px-20" style={sectionBandStyle(process.theme)}>
        <h2
          className="mx-auto max-w-[36rem] text-center text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]"
          style={{ fontFamily: "var(--fl-display)" }}
        >
          <AccentWords text={text(process.content, "heading", "A Deep Dive into Our Collaborative Work Methodology")} words={7} accent={FL.brand} />
        </h2>

        <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_692px]">
          <div className="grid grid-cols-[4px_1fr] gap-10">
            <div className="rounded-full bg-[#1F2B15]">
              <div className="h-28 w-[4px] rounded-full bg-[#A9FF5C]" />
            </div>
            <div className="space-y-16">
              {stepTitles.map((title, i) => (
                <article key={`${title}-${i}`}>
                  <h3 className="text-[2.5rem] uppercase leading-[0.92] tracking-[-0.8px] text-[#A9FF5C]" style={{ fontFamily: "var(--fl-display)" }}>
                    {title}
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed text-[#979F90]">
                    {stepBodies[i] ||
                      "We collaborate closely with your team, iterate with feedback, and keep progress aligned to measurable outcomes."}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="relative h-[480px] overflow-hidden rounded-[28px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ASSETS.processMorph} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] overflow-hidden rounded-[28px] px-0" style={{ background: FL.sectionGreen, ...sectionBandStyle(stats.theme) }}>
        <div className="relative px-6 pb-14 pt-20 lg:px-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ASSETS.statsCard} alt="" className="pointer-events-none absolute -left-40 top-24 hidden h-[420px] w-[420px] object-contain opacity-70 lg:block" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ASSETS.statsMedal} alt="" className="pointer-events-none absolute -bottom-36 -right-28 hidden h-[460px] w-[460px] object-contain opacity-70 lg:block" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#356905] bg-[#002D00] px-5 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ASSETS.iconChat} alt="" className="h-5 w-5 object-contain" />
              <span className="text-base text-[#7FD136]">Have Questions?</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ASSETS.iconArrow} alt="" className="h-4 w-4 object-contain" />
            </div>

            <h2 className="mt-6 max-w-[36rem] text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style={{ fontFamily: "var(--fl-display)" }}>
              <AccentWords text={text(stats.content, "heading", "Empowering Success in Numbers")} words={1} accent={FL.brand} />
            </h2>
            <p className="mt-5 max-w-[36rem] text-xl leading-relaxed text-[#F1FBE8]">
              {text(
                stats.content,
                "subheading",
                "We redefine collaboration, innovation, and success through a practical strategy and delivery model."
              )}
            </p>
            <a href="#fl-contact" className="mt-8 rounded-xl bg-[#A9FF5C] px-8 py-5 text-base font-bold text-[#090D06]">
              Get In Touch
            </a>
          </div>
        </div>

        <div className="grid gap-8 rounded-[28px] bg-[#002D00] px-6 py-12 text-center md:grid-cols-3 md:px-16">
          {statValues.slice(0, 3).map((value, i) => (
            <div key={`${value}-${i}`}>
              <div className="text-[clamp(3.5rem,8vw,7rem)] uppercase leading-[0.92] tracking-[-2px] text-[#A9FF5C]" style={{ fontFamily: "var(--fl-display)" }}>
                {value}
              </div>
              <p className="mt-2 text-xl text-[#F1FBE8]">{statLabels[i] || "Measured growth"}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="fl-testimonials" className="mx-auto max-w-[90rem] px-4 py-24 lg:px-20" style={sectionBandStyle(testimonials.theme)}>
        <div className="max-w-[36rem]">
          <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style={{ fontFamily: "var(--fl-display)" }}>
            <AccentWords text={text(testimonials.content, "heading", "Success Stories from Our Clients")} words={2} accent={FL.brand} />
          </h2>
          <p className="mt-5 text-xl leading-relaxed text-[#979F90]">
            Explore the firsthand experiences of teams who partnered with us to unlock sustainable growth.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {testimonialCols.map((col, colIndex) => (
              <div key={colIndex} className="space-y-4">
                {col.map((i) => (
                  <article key={i} className="rounded-[20px] bg-[#1F2B15] px-6 pb-8 pt-6">
                    <div className="mb-4 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ASSETS.testimonialAvatars[i % ASSETS.testimonialAvatars.length]}
                        alt=""
                        className="h-9 w-9 rounded-full border border-[#7FD136] object-cover"
                      />
                      <span className="text-base text-[#7FD136]">{authorList[i] || "Client"}</span>
                    </div>
                    <p className="text-base leading-relaxed text-[#979F90]">{quoteList[i]}</p>
                    {roleList[i] ? <p className="mt-4 text-sm text-[#E1FFC7]/70">{roleList[i]}</p> : null}
                  </article>
                ))}
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#090D06] to-transparent" />
        </div>
      </section>

      <section id="fl-advantages" className="mx-auto max-w-[90rem] px-4 py-24 lg:px-20" style={sectionBandStyle(advantages.theme)}>
        <h2
          className="mx-auto max-w-[36rem] text-center text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]"
          style={{ fontFamily: "var(--fl-display)" }}
        >
          <AccentWords text={text(advantages.content, "heading", "Transform Challenges into Opportunities")} words={3} accent={FL.brand} />
        </h2>

        <div className="mt-14 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <article className="relative min-h-[24rem] overflow-hidden rounded-[28px] p-8 lg:p-14">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={advantageImg1} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative z-10 max-w-[30rem]">
              <h3 className="text-[clamp(2rem,4.5vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px] text-[#F1FBE8]" style={{ fontFamily: "var(--fl-display)" }}>
                {advantageTitles[0]}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-[#F1FBE8]">
                {advantageBodies[0] ||
                  "We tailor every interaction to your audience's intent and context to create meaningful conversion lift."}
              </p>
            </div>
          </article>
          <article className="rounded-[28px] px-8 py-10 lg:px-14 lg:py-14" style={{ backgroundColor: FL.yellowSoft }}>
            <h3 className="text-[clamp(2rem,4.5vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px]" style={{ color: FL.yellowInk, fontFamily: "var(--fl-display)" }}>
              {advantageTitles[1]}
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-[#090D06]">
              {advantageBodies[1] ||
                "Our campaigns are crafted to stand out while staying anchored to business goals and measurable outcomes."}
            </p>
          </article>
          <article className="rounded-[28px] px-8 py-10 lg:px-14 lg:py-14" style={{ backgroundColor: FL.orangeSoft }}>
            <h3 className="text-[clamp(2rem,4.5vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px]" style={{ color: FL.orangeInk, fontFamily: "var(--fl-display)" }}>
              {advantageTitles[2] || "Setting Trends and Shaping Futures Through Campaign Innovation"}
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-[#090D06]">
              {advantageBodies[2] ||
                "We merge trend sensing with strategic experimentation to keep your brand ahead of the market."}
            </p>
          </article>
          <article className="relative min-h-[24rem] overflow-hidden rounded-[28px] p-8 lg:p-14">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={advantageImg2} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative z-10 max-w-[30rem]">
              <h3 className="text-[clamp(2rem,4.5vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px] text-[#F1FBE8]" style={{ fontFamily: "var(--fl-display)" }}>
                {advantageTitles[3] || "Seamlessly Connecting Across Channels"}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-[#F1FBE8]">
                {advantageBodies[3] ||
                  "We orchestrate your channel mix so every touchpoint reinforces the same strategic message."}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section id="fl-faq" className="mx-auto max-w-[90rem] px-4 py-24 lg:px-20" style={sectionBandStyle(faq.theme)}>
        <div className="mx-auto max-w-[36rem] text-center">
          <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style={{ fontFamily: "var(--fl-display)" }}>
            <AccentWords text={text(faq.content, "heading", "Frequently Asked Questions")} words={2} accent={FL.brand} />
          </h2>
          <p className="mt-5 text-xl leading-relaxed text-[#979F90]">
            We address common queries and provide clear guidance as you evaluate your next growth phase.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-[53rem] space-y-4">
          {questions.map((question, i) => (
            <details key={`${question}-${i}`} open={i === 0} className="group overflow-hidden rounded-[20px] bg-[#1F2B15]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[20px] bg-[#E1FFC7] px-8 py-6">
                <span className="text-2xl text-[#003800]">{question}</span>
                <span className="grid h-[76px] w-[76px] place-items-center rounded-[20px] bg-[#7FD136]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ASSETS.faqAdd} alt="" className="h-7 w-7 object-contain group-open:hidden" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ASSETS.faqDismiss} alt="" className="hidden h-7 w-7 object-contain group-open:block" />
                </span>
              </summary>
              <p className="px-8 pb-7 pt-6 text-xl leading-relaxed text-[#E1FFC7]">
                {answers[i] ||
                  "Our team will tailor the solution to your goals, timeline, and team setup while keeping communication transparent."}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section id="fl-contact" className="mx-auto max-w-[90rem] px-4 py-24 lg:px-20" style={sectionBandStyle(contactSlot.theme)}>
        <div className="max-w-[36rem]">
          <h2 className="text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style={{ fontFamily: "var(--fl-display)" }}>
            <AccentWords text={text(contactSlot.content, "heading", "Let's Connect and Ignite Success")} words={2} accent={FL.brand} />
          </h2>
          <p className="mt-5 text-xl leading-relaxed text-[#979F90]">
            {text(
              contactSlot.content,
              "subheading",
              "Ready to take the next step? Contact us to explore how our strategies can propel your business forward."
            )}
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <article className="rounded-[28px] bg-[#E1FFC7] px-8 py-12 text-center">
            <span className="mx-auto inline-grid h-16 w-16 place-items-center rounded-[20px] bg-[#356905]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ASSETS.contactMail} alt="" className="h-8 w-8 object-contain" />
            </span>
            <h3 className="mt-6 text-[2.5rem] uppercase leading-[0.92] tracking-[-0.8px] text-[#356905]" style={{ fontFamily: "var(--fl-display)" }}>
              Drop Us a Line
            </h3>
            <p className="mt-2 text-xl text-[#003800]">{contactEmail || "hello@forgelime.example"}</p>
          </article>

          <article className="rounded-[28px] bg-[#E1FFC7] px-8 py-12 text-center">
            <span className="mx-auto inline-grid h-16 w-16 place-items-center rounded-[20px] bg-[#356905]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ASSETS.contactCalendly} alt="" className="h-8 w-8 object-contain" />
            </span>
            <h3 className="mt-6 text-[2.5rem] uppercase leading-[0.92] tracking-[-0.8px] text-[#356905]" style={{ fontFamily: "var(--fl-display)" }}>
              Book a Call
            </h3>
            <p className="mt-2 text-xl text-[#003800]">{contactPhone || "(555) 016-7740"}</p>
          </article>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[524px_1fr]">
          <article className="rounded-[28px] bg-[#243317] p-10">
            <h3 className="text-[2.5rem] uppercase leading-[0.92] tracking-[-0.8px] text-[#E1FFC7]" style={{ fontFamily: "var(--fl-display)" }}>
              Connect with Ease
            </h3>
            <p className="mt-4 text-xl leading-relaxed text-[#E1FFC7]">
              Your inquiries, ideas, and collaboration opportunities are just a click away.
            </p>
            <div className="mt-8 space-y-7">
              <InputField label="Full Name" placeholder={businessName} />
              <InputField label="Email" placeholder={contactEmail || "john.anderson@gmail.com"} />
              <InputField label="Question" placeholder="How can we help you?" />
            </div>
            <a href={contactHref} className="mt-8 inline-block rounded-xl bg-[#A9FF5C] px-8 py-5 text-base font-bold text-[#090D06]">
              {contactCta}
            </a>
            <p className="mt-6 text-sm text-[#F1FBE8]/65">{contactAddress}</p>
          </article>

          <div className="relative min-h-[480px] overflow-hidden rounded-[28px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ASSETS.contactImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <footer className="px-4 pb-10 lg:px-20" style={sectionBandStyle(footer.theme)}>
        <div className="rounded-[28px] bg-[#131C0B] p-8 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <a href="#fl-top" className="inline-flex items-center gap-3">
              {customLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customLogo} alt="" className="h-11 w-11 object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ASSETS.logoFooter} alt="" className="h-11 w-11 object-contain" />
              )}
              <span className="text-2xl uppercase tracking-wide text-[#E1FFC7]" style={{ fontFamily: "var(--fl-display)" }}>
                {businessName}
              </span>
            </a>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[#E1FFC7]">
              {footerLinks.map((label, i) => (
                <a key={`${label}-${i}`} href={i < NAV.length ? NAV[i].href : "#fl-contact"} className="transition-colors hover:text-[#A9FF5C]">
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <SocialIcon src={ASSETS.socialFacebook} />
              <SocialIcon src={ASSETS.socialLinkedin} />
              <SocialIcon src={ASSETS.socialTwitter} />
            </div>
          </div>
          <div className="mt-8 border-t border-[#1F2B15] pt-6 text-center text-sm text-[#979F90]">
            © {new Date().getFullYear()} {businessName}, All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}

function AccentWords({
  text: value,
  words,
  accent,
}: {
  text: string;
  words: number;
  accent: string;
}) {
  const bits = value.trim().split(/\s+/).filter(Boolean);
  if (!bits.length) return null;
  const lead = bits.slice(0, words).join(" ");
  const rest = bits.slice(words).join(" ");
  return (
    <>
      <span style={{ color: accent }}>{lead}</span>
      {rest ? ` ${rest}` : ""}
    </>
  );
}

function InputField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-base text-[#F1FBE8]">{label}</span>
      <span className="flex rounded-xl border border-[#F1FBE8]/30 px-6 py-5 text-base text-[#F1FBE8]/50">{placeholder}</span>
    </label>
  );
}

function SocialIcon({ src }: { src: string }) {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#A9FF5C]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-[18px] w-[18px] object-contain" />
    </span>
  );
}
