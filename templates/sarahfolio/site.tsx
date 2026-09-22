import type { CSSProperties, ReactNode } from "react";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { SF } from "./tokens";
import { list, slotAt, text, toSlots, pageSlugsOf, type TemplateSlot } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { templateFaces } from "../shared/template-faces";

const faces = templateFaces([
  { family: "Anton", variable: "--sf-display", weights: ["400"] },
  { family: "Inter", variable: "--sf-body", weights: ["400", "500", "600", "700"] },
]);

const A = "/templates/sarahfolio";

const FALLBACK = {
  hero: `${A}/hero.png`,
  intro: `${A}/intro.png`,
  about: `${A}/about-portrait.png`,
  avatars: [`${A}/avatar-1.png`, `${A}/avatar-2.png`, `${A}/avatar-3.png`],
  services: [
    `${A}/icon-strategy.svg`,
    `${A}/icon-browsers.svg`,
    `${A}/icon-pencil.svg`,
    `${A}/icon-file.svg`,
  ],
  work: [`${A}/offer-4.png`, `${A}/offer-3.png`, `${A}/offer-6.png`, `${A}/offer-7.png`],
  blog: [
    `${A}/blog-1.png`,
    `${A}/blog-2.png`,
    `${A}/blog-3.png`,
    `${A}/blog-4.png`,
    `${A}/blog-5.png`,
    `${A}/blog-6.png`,
    `${A}/blog-7.png`,
    `${A}/blog-8.png`,
  ],
  steps: [`${A}/offer-2.png`, `${A}/offer-3.png`, `${A}/offer-4.png`, `${A}/offer-6.png`, `${A}/offer-7.png`],
} as const;

/**
 * Sarahfolio — personal copywriter portfolio from the Figma Personal Portfolio
 * Web UI Kit. Anton display, cream canvas, yellow offset CTAs, lime sunburst
 * heroes. `pageSlug` switches home / about / services / blog / contact.
 */
export function SarahfolioSite({
  blueprint,
  site,
  contact,
  pageSlug,
}: {
  blueprint?: WebsiteBlueprint | null;
  site?: AssembledSite | null;
  contact?: SiteContact | null;
  pageSlug?: string;
}) {
  const pages = pageSlugsOf(blueprint, site);
  const active =
    (pageSlug && pages.find((p) => p.slug === pageSlug)?.slug) ||
    pages.find((p) => p.slug === "home")?.slug ||
    pages[0]?.slug ||
    "home";
  const slots = toSlots(blueprint, site, active);
  const footer = slotAt(slots, "footer");
  const businessName = text(footer.content, "businessName") || site?.businessName || blueprint?.business.name || "Sarah";
  const customLogo = site?.theme?.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const tagline = text(
    footer.content,
    "tagline",
    "Passionate copywriter with a knack for creating engaging, persuasive content that resonates with your audience."
  );

  return (
    <div
      className={`scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#FFBF38"),
        ...faces.style,
        fontFamily: "var(--sf-body), Inter, ui-sans-serif, system-ui, sans-serif",
        color: SF.ink,
        backgroundColor: SF.bg,
        ...themeFontStyle(site?.theme, ["--sf-display", "--sf-body"]),
      }}
    >
      {<link rel="stylesheet" href={faces.href} />}
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <style>{`
        .sf-menu > summary { list-style: none; }
        .sf-menu > summary::-webkit-details-marker { display: none; }
        .sf-cta:active { transform: scale(0.97); }
        @media (prefers-reduced-motion: reduce) { .sf-cta:active { transform: none; } }
      `}</style>
      <main>{renderPageBody(active, slots, { businessName, customLogo, pages, active, contactEmail })}</main>
      <SiteFooter
        businessName={businessName}
        customLogo={customLogo}
        tagline={tagline}
        pages={pages}
        contactEmail={contactEmail}
      />
    </div>
  );
}

type PageMeta = {
  businessName: string;
  customLogo: string;
  pages: { slug: string; title: string }[];
  active: string;
  contactEmail: string;
};

function renderPageBody(active: string, slots: TemplateSlot[], meta: PageMeta) {
  switch (active) {
    case "about":
      return <AboutBody slots={slots} meta={meta} />;
    case "services":
      return <ServicesBody slots={slots} meta={meta} />;
    case "blog":
      return <BlogBody slots={slots} meta={meta} />;
    case "contact":
      return <ContactBody slots={slots} meta={meta} />;
    default:
      return <HomeBody slots={slots} meta={meta} />;
  }
}

function pageHref(slug: string): string {
  return `?page=${slug}`;
}

function displayFont(): CSSProperties {
  return { fontFamily: "var(--sf-display), Anton, ui-sans-serif, sans-serif" };
}

function Cta({ href, children, small }: { href: string; children: ReactNode; small?: boolean }) {
  return (
    <a
      href={href}
      className={`sf-cta inline-flex items-center justify-center rounded-[32px] border-2 border-[#0f0f0f] bg-[#ffbf38] font-semibold text-[#0f0f0f] drop-shadow-[0px_4px_0px_#0f0f0f] transition-transform ${
        small ? "px-4 py-2 text-[14px] leading-[22px]" : "gap-3 px-8 py-4 text-[18px] leading-[26px] drop-shadow-[0px_6px_0px_#0f0f0f]"
      }`}
      style={{ backgroundColor: SF.brand }}
    >
      {children}
    </a>
  );
}

function Logo({ businessName, customLogo, ink }: { businessName: string; customLogo: string; ink?: string }) {
  return (
    <a href={pageHref("home")} className="inline-flex items-center gap-2 pr-4">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white p-3">
        {customLogo ? (
          <img src={customLogo} alt="" width={32} height={32} className="size-8 object-contain" />
        ) : (
          <img src={`${A}/logo.svg`} alt="" width={32} height={32} className="size-8" />
        )}
      </span>
      <span className="text-[24px] font-bold leading-[1.4] tracking-[-0.48px]" style={{ color: ink || SF.limeInk }}>
        {businessName}
      </span>
    </a>
  );
}

function Header({ meta, ink }: { meta: PageMeta; ink?: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-7 pt-8 sm:px-8">
      <div className="pointer-events-auto">
        <Logo businessName={meta.businessName} customLogo={meta.customLogo} ink={ink} />
      </div>
      <details className="sf-menu pointer-events-auto relative">
        <summary className="flex size-16 cursor-pointer items-center justify-center rounded-full bg-white p-4">
          <img src={`${A}/menu.svg`} alt="Open menu" width={32} height={32} className="size-8" />
        </summary>
        <nav className="absolute right-0 mt-3 w-52 rounded-[24px] border border-[#e5e5e5] bg-white p-3 shadow-[0_12px_32px_rgba(15,15,15,0.12)]">
          {meta.pages.map((p) => (
            <a
              key={p.slug}
              href={pageHref(p.slug)}
              className="block rounded-[16px] px-3 py-2 text-[16px] font-medium"
              style={{ color: p.slug === meta.active ? SF.limeInk : SF.ink }}
            >
              {p.title}
            </a>
          ))}
        </nav>
      </details>
    </div>
  );
}

function SunburstHero({
  children,
  tall,
  style,
}: {
  children: ReactNode;
  tall?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div className="relative overflow-hidden px-4 pt-4 sm:px-5" style={style}>
      <div
        className={`relative overflow-hidden rounded-[40px] px-6 pb-16 pt-28 text-center sm:rounded-[56px] sm:px-10 ${
          tall ? "min-h-[720px] pb-0 pt-20 sm:min-h-[992px] sm:pt-20" : "min-h-[520px] py-40 sm:min-h-[640px]"
        }`}
        style={{ backgroundColor: SF.lime }}
      >
        <img
          src={`${A}/sunburst.svg`}
          alt=""
          width={1408}
          height={992}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90 object-cover opacity-80"
        />
        {children}
      </div>
    </div>
  );
}

function HomeBody({ slots, meta }: { slots: TemplateSlot[]; meta: PageMeta }) {
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const work = slotAt(slots, "portfolio");
  const quotes = slotAt(slots, "testimonials");
  const cta = slotAt(slots, "cta");
  const titles = list(services.content, "itemTitles", ["Content Strategy", "Website Copy", "Blog Writing", "Email Marketing"]);
  const bodies = list(services.content, "itemBodies", [
    "Crafting content plans that align with your business goals.",
    "Persuasive website copy that converts visitors into customers.",
    "SEO-optimized posts that rank and resonate with readers.",
    "Campaigns that get opened, clicked, and remembered.",
  ]);
  const workTitles = list(work.content, "itemTitles", [
    "Website Revamp for E-Commerce Brand",
    "Social Media Campaign for Tech Startup",
    "Email Marketing for Subscription Service",
    "Content Strategy for Health & Wellness Blog",
  ]);
  const workBodies = list(work.content, "itemBodies", [""]);
  const workMeta = ["WEBSITE COPY", "CONTENT STRATEGY", "CONTENT STRATEGY", "CONTENT STRATEGY"];

  return (
    <>
      <SunburstHero tall style={sectionBandStyle(hero.theme)}>
        <Header meta={meta} />
        <div className="relative z-[1] mx-auto flex max-w-[1068px] flex-col items-center gap-4">
          <h1
            className="text-[48px] uppercase leading-[1.2] tracking-[-1px] sm:text-[80px] lg:text-[104px]"
            style={{ ...displayFont(), color: SF.limeInk }}
          >
            {text(hero.content, "headline", "THE STORY BEHIND THE WORLD")}
          </h1>
          <p className="max-w-[618px] text-[18px] leading-[26px] tracking-[-0.09px]" style={{ color: SF.muted }}>
            {text(
              hero.content,
              "subheadline",
              "Hi, I'm Sarah, a passionate copywriter with a knack for creating engaging, persuasive content that resonates with your audience."
            )}
          </p>
          <Cta href={pageHref("contact")}>{text(hero.content, "ctaPrimary", "Let's Connect!")}</Cta>
        </div>
        <div className="relative z-[1] mx-auto mt-8 flex w-full max-w-[570px] flex-col items-center">
          <div className="relative w-full">
            <img
              src={`${A}/arch-1.svg`}
              alt=""
              width={354}
              height={120}
              className="absolute bottom-0 left-1/2 h-[120px] w-[354px] -translate-x-1/2"
            />
            <img
              src={`${A}/arch-2.svg`}
              alt=""
              width={234}
              height={90}
              className="absolute bottom-0 left-1/2 h-[90px] w-[234px] -translate-x-1/2"
            />
            <img
              src={`${A}/arch-3.svg`}
              alt=""
              width={112}
              height={60}
              className="absolute bottom-0 left-1/2 h-[60px] w-[112px] -translate-x-1/2"
            />
            <img
              src={hero.image || FALLBACK.hero}
              alt=""
              width={570}
              height={570}
              className="relative z-[1] mx-auto h-[570px] w-[570px] max-w-full object-contain object-bottom drop-shadow-[16px_4px_20px_rgba(0,0,0,0.25)]"
            />
          </div>
        </div>
      </SunburstHero>

      <section className="px-6 py-[60px] sm:px-20" style={sectionBandStyle(about.theme)}>
        <p className="mb-4 inline-flex rounded-[99px] border border-[#eaecf0] bg-[#f5f5f5] px-5 py-3 text-[16px] font-medium tracking-[-0.08px]">
          {text(about.content, "eyebrow", "ABOUT US")}
        </p>
        <h2 className="max-w-[928px] text-[36px] leading-[1.2] tracking-[1.12px] sm:text-[56px]" style={displayFont()}>
          <span style={{ color: SF.gray }}>Hi, I'm Sarah</span>
          <span style={{ color: "#262626" }}>
            {text(about.content, "heading", "Hi, I'm Sarah, a passionate copywriter with a knack for creating engaging, persuasive content that resonates with your audience.").replace(
              /^Hi, I'm Sarah/i,
              ""
            )}
          </span>
        </h2>
        <div className="mt-[80px] flex flex-col items-center gap-12 lg:flex-row lg:justify-between">
          <div className="relative h-[360px] w-full max-w-[443px] overflow-visible rounded-[32px] bg-[#f5f5f5]">
            <img
              src={about.image || FALLBACK.intro}
              alt=""
              width={480}
              height={480}
              className="absolute left-1/2 top-[-120px] h-[480px] w-[480px] max-w-none -translate-x-1/2 rotate-6 object-contain drop-shadow-[16px_8px_20px_rgba(0,0,0,0.2)]"
            />
          </div>
          <div className="flex max-w-[650px] flex-col items-start gap-14">
            <p className="whitespace-pre-line text-[18px] leading-[26px] tracking-[-0.09px] opacity-80" style={{ color: SF.ink }}>
              {text(
                about.content,
                "body",
                "With a love for storytelling and a keen understanding of audience psychology, I specialize in creating content that not only informs but also inspires action.\n\nMy journey as a copywriter has led me to work with diverse brands, helping them find their unique voice and connect with their target audience."
              )}
            </p>
            <Cta href={pageHref("about")}>{text(about.content, "ctaPrimary", "Read My Story")}</Cta>
          </div>
        </div>
      </section>

      <section className="overflow-hidden px-6 pb-20 pt-20 sm:px-20" style={sectionBandStyle(services.theme)}>
        <h2 className="text-[48px] leading-[1.2] tracking-[1.28px] sm:text-[64px]" style={{ ...displayFont(), color: "#262626" }}>
          {text(services.content, "heading", "What I Offer")}
        </h2>
        <p className="mt-6 max-w-[615px] text-[18px] leading-[26px]" style={{ color: "#404040" }}>
          {text(
            services.content,
            "subheading",
            "Whether you need persuasive sales copy, engaging blog content, or an entire content strategy, I've got you covered."
          )}
        </p>
        <div className="mt-14 flex gap-3 overflow-x-auto pb-2">
          {titles.map((title, i) => {
            const dark = i === 0;
            return (
              <article
                key={title}
                className="flex h-[476px] w-[min(413px,80vw)] shrink-0 flex-col justify-between rounded-[24px] p-6 sm:p-8"
                style={{ backgroundColor: dark ? SF.inverse : SF.white, color: dark ? SF.inverseFg : "#222420" }}
              >
                <div className="flex flex-col gap-6">
                  <span className="flex size-14 items-center justify-center">
                    <img src={FALLBACK.services[i] || FALLBACK.services[0]} alt="" width={56} height={56} className="size-14" />
                  </span>
                  <h3 className="text-[32px] font-medium leading-[1.2] tracking-[-0.16px]">{title}</h3>
                </div>
                <div className="flex flex-col items-end gap-6">
                  {bodies[i] ? <p className="w-full text-[20px] leading-[1.4]">{bodies[i]}</p> : null}
                  <img
                    src={dark ? `${A}/icon-arrow.svg` : `${A}/icon-plus.svg`}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-6 py-20 sm:px-20" style={sectionBandStyle(work.theme)}>
        <div className="mx-auto max-w-[615px] text-center">
          <h2 className="text-[48px] leading-[1.2] tracking-[1.28px] sm:text-[64px]" style={{ ...displayFont(), color: "#262626" }}>
            {text(work.content, "heading", "Words in Action")}
          </h2>
          <p className="mt-6 text-[18px] leading-[26px]" style={{ color: "#404040" }}>
            {text(
              work.content,
              "subheading",
              "From compelling ad copy to in-depth blog articles, here's a collection of my work that showcases my versatility and creativity."
            )}
          </p>
        </div>
        <div className="mt-14 grid gap-3 md:grid-cols-2">
          {workTitles.map((title, i) => (
            <article key={title} className="flex flex-col gap-8 rounded-[24px] bg-white p-6">
              <div className="flex items-start justify-between text-[16px] leading-6" style={{ color: SF.quiet }}>
                <span>04 . 08 . 2024</span>
                <span>{workMeta[i] || "CONTENT STRATEGY"}</span>
              </div>
              <h3 className="text-[32px] font-medium leading-[1.2] tracking-[-0.16px]">{title}</h3>
              {i === 0 && workBodies[0] ? (
                <>
                  <p className="text-[18px] leading-[26px]" style={{ color: "#404040" }}>
                    {workBodies[0]}
                  </p>
                  <Cta href={pageHref("services")} small>
                    View Project
                  </Cta>
                </>
              ) : (
                <div className="flex justify-end pt-2">
                  <img src={`${A}/icon-plus.svg`} alt="" width={32} height={32} className="size-8" />
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <TestimonialsBand slot={quotes} />
      <CtaBand slot={cta} />
    </>
  );
}

function AboutBody({ slots, meta }: { slots: TemplateSlot[]; meta: PageMeta }) {
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const values = slotAt(slots, "features");
  const quotes = slotAt(slots, "testimonials");
  const cta = slotAt(slots, "cta");
  const titles = list(values.content, "itemTitles", ["What drives me", "My philosophy", "Outside the office"]);
  const bodies = list(values.content, "itemBodies", []);

  return (
    <>
      <SunburstHero style={sectionBandStyle(hero.theme)}>
        <Header meta={meta} />
        <div className="relative z-[1] mx-auto flex max-w-[630px] flex-col items-center gap-6">
          <span className="inline-flex rounded-[99px] border border-[#eaecf0] bg-[#fafafa] px-5 py-3 text-[16px] font-medium">
            {text(hero.content, "eyebrow", "ABOUT")}
          </span>
          <h1
            className="text-[48px] uppercase leading-[1.2] tracking-[-0.36px] sm:text-[72px]"
            style={{ ...displayFont(), color: SF.limeInk }}
          >
            {text(hero.content, "headline", "CRAFTING WORDS THAT MAKE AN IMPACT")}
          </h1>
          <p className="max-w-[600px] text-[18px] leading-[26px]" style={{ color: "#404040" }}>
            {text(
              hero.content,
              "subheadline",
              "Transforming ideas into powerful messages that drive results—meet the creative mind behind the words."
            )}
          </p>
          <Cta href={pageHref("contact")}>{text(hero.content, "ctaPrimary", "Let's Connect!")}</Cta>
        </div>
      </SunburstHero>

      <section className="px-6 py-[60px] sm:px-20" style={sectionBandStyle(about.theme)}>
        <p className="mb-4 inline-flex rounded-[99px] border border-[#eaecf0] bg-[#f5f5f5] px-5 py-3 text-[16px] font-medium">
          {text(about.content, "eyebrow", "INTRODUCTION")}
        </p>
        <h2 className="max-w-[1162px] text-[32px] leading-[1.2] tracking-[0.96px] sm:text-[48px]" style={displayFont()}>
          <span style={{ color: SF.gray }}>It all started with a love for storytelling. </span>
          <span style={{ color: "#262626" }}>
            {text(
              about.content,
              "heading",
              "From a young age, I was fascinated by how words could evoke emotions, paint vivid pictures, and persuade people to take action."
            ).replace(/^It all started with a love for storytelling\.?\s*/i, "")}
          </span>
        </h2>
        <div className="mt-[80px] flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          <img
            src={about.image || FALLBACK.about}
            alt=""
            width={395}
            height={395}
            className="h-[395px] w-[395px] max-w-full rounded-[24px] object-cover drop-shadow-[16px_8px_20px_rgba(0,0,0,0.2)]"
          />
          <p className="max-w-[650px] whitespace-pre-line text-[18px] leading-[26px] opacity-80" style={{ color: SF.ink }}>
            {text(
              about.content,
              "body",
              "Over the years, I've worked with a diverse range of clients—from startups to established brands—across technology, fashion, and healthcare.\n\nThis journey has taught me the importance of understanding each brand's unique voice and audience."
            )}
          </p>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-20" style={sectionBandStyle(values.theme)}>
        <div className="grid gap-3 md:grid-cols-2">
          {titles.map((title, i) => (
            <article
              key={title}
              className={`flex flex-col gap-8 rounded-[24px] bg-white p-8 ${i === 2 ? "md:col-span-2" : ""}`}
            >
              <div className="flex justify-between text-[16px]" style={{ color: SF.quiet }}>
                <span>ABOUT ME</span>
                <span>INTRODUCTION</span>
              </div>
              <h3 className="text-[32px] font-medium leading-[1.2]">{title}</h3>
              <p className="text-[18px] leading-[26px]" style={{ color: "#404040" }}>
                {bodies[i] || ""}
              </p>
              {i === 2 ? <Cta href={pageHref("contact")}>Let's Connect!</Cta> : null}
            </article>
          ))}
        </div>
      </section>

      <TestimonialsBand slot={quotes} />
      <CtaBand slot={cta} />
    </>
  );
}

function ServicesBody({ slots, meta }: { slots: TemplateSlot[]; meta: PageMeta }) {
  const hero = slotAt(slots, "hero");
  const process = slotAt(slots, "process");
  const cta = slotAt(slots, "cta");
  const titles = list(process.content, "stepTitles", [
    "Discovery & Consultation",
    "Research & Strategy",
    "Content Creation",
    "Review & Feedback",
    "Final Delivery",
  ]);
  const bodies = list(process.content, "stepBodies", []);

  return (
    <>
      <SunburstHero style={sectionBandStyle(hero.theme)}>
        <Header meta={meta} />
        <div className="relative z-[1] mx-auto flex max-w-[721px] flex-col items-center gap-6">
          <span className="inline-flex rounded-[99px] border border-[#eaecf0] bg-[#fafafa] px-5 py-3 text-[16px] font-medium">
            {text(hero.content, "eyebrow", "PROCESS")}
          </span>
          <h1
            className="text-[48px] uppercase leading-[1.2] sm:text-[72px]"
            style={{ ...displayFont(), color: SF.limeInk }}
          >
            {text(hero.content, "headline", "HERE'S HOW WE CREATE WINNING CONTENT")}
          </h1>
          <p className="text-[18px] leading-[26px]" style={{ color: "#404040" }}>
            {text(
              hero.content,
              "subheadline",
              "Every successful project starts with a clear process. Here's how I turn your ideas into impactful content that drives results."
            )}
          </p>
        </div>
      </SunburstHero>

      <section className="px-6 py-16 sm:px-20" style={sectionBandStyle(process.theme)}>
        <p className="mb-4 inline-flex rounded-[99px] border border-[#eaecf0] bg-[#f5f5f5] px-5 py-3 text-[16px] font-medium">
          PROCESS
        </p>
        <h2 className="max-w-[964px] text-[40px] leading-[1.2] sm:text-[56px]" style={{ ...displayFont(), color: "#262626" }}>
          {text(process.content, "heading", "A clear path from brief to publish")}
        </h2>
        <div className="mt-16 flex flex-col gap-8">
          {titles.map((title, i) => {
            const flip = i % 2 === 1;
            const src = process.itemImages[i] || FALLBACK.steps[i] || FALLBACK.steps[0];
            return (
              <article
                key={title}
                className={`flex flex-col items-center gap-10 rounded-[32px] lg:flex-row ${flip ? "lg:flex-row-reverse" : ""}`}
              >
                <div className="relative flex size-[min(518px,100%)] items-center justify-center overflow-hidden rounded-[32px] bg-[#c9d69b]">
                  <img
                    src={`${A}/sunburst.svg`}
                    alt=""
                    width={518}
                    height={518}
                    className="pointer-events-none absolute inset-0 size-full rotate-90 object-cover opacity-70"
                  />
                  <img src={src} alt="" width={357} height={357} className="relative z-[1] size-[357px] max-w-[80%] object-contain" />
                </div>
                <div className="max-w-[594px] flex-1">
                  <span className="inline-flex rounded-[99px] border border-[#eaecf0] bg-[#f5f5f5] px-5 py-3 text-[16px] font-medium">
                    Step 0{i + 1}
                  </span>
                  <h3 className="mt-5 text-[32px] font-medium leading-[1.2] sm:text-[40px]" style={displayFont()}>
                    {title}
                  </h3>
                  <p className="mt-5 text-[18px] leading-[26px]" style={{ color: "#404040" }}>
                    {bodies[i] || ""}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <CtaBand slot={cta} />
    </>
  );
}

function BlogBody({ slots, meta }: { slots: TemplateSlot[]; meta: PageMeta }) {
  const hero = slotAt(slots, "hero");
  const posts = slotAt(slots, "features");
  const cta = slotAt(slots, "cta");
  const titles = list(posts.content, "itemTitles", []);
  const cats = list(posts.content, "itemBodies", []);
  const featured = titles[0];
  const side = titles.slice(1, 4);
  const more = titles.slice(4);

  return (
    <>
      <SunburstHero style={sectionBandStyle(hero.theme)}>
        <Header meta={meta} />
        <div className="relative z-[1] mx-auto flex max-w-[944px] flex-col items-center gap-6">
          <span className="inline-flex rounded-[99px] border border-[#eaecf0] bg-[#fafafa] px-5 py-3 text-[16px] font-medium">
            {text(hero.content, "eyebrow", "BLOG")}
          </span>
          <h1
            className="text-[40px] uppercase leading-[1.2] sm:text-[72px]"
            style={{ ...displayFont(), color: SF.limeInk }}
          >
            {text(hero.content, "headline", "INSIGHTS, IDEAS, AND INSPIRATION—WELCOME TO MY BLOG")}
          </h1>
          <p className="max-w-[726px] text-[18px] leading-[26px]" style={{ color: "#404040" }}>
            {text(
              hero.content,
              "subheadline",
              "Explore the latest trends, tips, and thought-provoking content designed to inspire and empower your creative journey."
            )}
          </p>
        </div>
      </SunburstHero>

      <section className="px-6 py-16 sm:px-20" style={sectionBandStyle(posts.theme)}>
        <h2 className="text-[40px] leading-[1.2] sm:text-[48px]" style={{ ...displayFont(), color: "#0f0f0f" }}>
          {text(posts.content, "heading", "Featured Posts")}
        </h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <article className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-[24px] border-4 border-white">
              <img
                src={posts.itemImages[0] || FALLBACK.blog[0]}
                alt=""
                width={620}
                height={420}
                className="h-[420px] w-full object-cover"
              />
            </div>
            <p className="text-[14px] tracking-[-0.07px]" style={{ color: SF.quiet }}>
              {cats[0] || "COPYWRITING"}
            </p>
            <h3 className="text-[32px] font-medium leading-[1.2]">{featured}</h3>
            <p className="text-[16px]" style={{ color: SF.quiet }}>
              by Desirae Rosser
            </p>
          </article>
          <div className="flex flex-col gap-10">
            {side.map((title, i) => (
              <a key={title} href={pageHref("blog")} className="flex gap-5">
                <img
                  src={posts.itemImages[i + 1] || FALLBACK.blog[i + 1]}
                  alt=""
                  width={196}
                  height={196}
                  className="size-[196px] shrink-0 rounded-[24px] border-4 border-white object-cover"
                />
                <div className="flex flex-col gap-3">
                  <p className="text-[14px]" style={{ color: SF.quiet }}>
                    {cats[i + 1] || "CONTENT STRATEGY"}
                  </p>
                  <h3 className="text-[20px] font-medium leading-[1.4]">{title}</h3>
                  <p className="text-[16px]" style={{ color: SF.quiet }}>
                    by Desirae Rosser
                  </p>
                  <span className="mt-2 inline-flex w-fit rounded-[32px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-2 text-[14px] font-medium">
                    Read More
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-20 flex items-center justify-between">
          <h2 className="text-[40px] leading-[1.2] sm:text-[48px]" style={{ ...displayFont(), color: "#0f0f0f" }}>
            More Posts
          </h2>
          <div className="flex gap-5">
            <span className="flex size-12 items-center justify-center rounded-full bg-white p-3">
              <img src={`${A}/arrow-left.svg`} alt="" width={24} height={24} className="size-6" />
            </span>
            <span className="flex size-12 items-center justify-center rounded-full bg-white p-3">
              <img src={`${A}/arrow-right.svg`} alt="" width={24} height={24} className="size-6" />
            </span>
          </div>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {more.map((title, i) => (
            <article key={title} className="flex flex-col gap-5">
              <img
                src={posts.itemImages[i + 4] || FALLBACK.blog[i + 4] || FALLBACK.blog[0]}
                alt=""
                width={312}
                height={312}
                className="h-[312px] w-[312px] max-w-full rounded-[24px] border-[6px] border-white object-cover"
              />
              <p className="text-[14px]" style={{ color: SF.quiet }}>
                {cats[i + 4] || "EDUCATION"}
              </p>
              <h3 className="text-[20px] font-medium leading-[1.4]">{title}</h3>
              <p className="text-[16px]" style={{ color: SF.quiet }}>
                by Desirae Rosser
              </p>
              <span className="inline-flex w-fit rounded-[32px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-2 text-[14px] font-medium">
                Read More
              </span>
            </article>
          ))}
        </div>
      </section>
      <CtaBand slot={cta} />
    </>
  );
}

function ContactBody({ slots, meta }: { slots: TemplateSlot[]; meta: PageMeta }) {
  const hero = slotAt(slots, "hero");
  const form = slotAt(slots, "contact");

  return (
    <>
      <SunburstHero style={sectionBandStyle(hero.theme)}>
        <Header meta={meta} />
        <div className="relative z-[1] mx-auto flex max-w-[720px] flex-col items-center gap-6">
          <span className="inline-flex rounded-[99px] border border-[#eaecf0] bg-[#fafafa] px-5 py-3 text-[16px] font-medium">
            {text(hero.content, "eyebrow", "CONTACT")}
          </span>
          <h1
            className="text-[48px] uppercase leading-[1.2] sm:text-[72px]"
            style={{ ...displayFont(), color: SF.limeInk }}
          >
            {text(hero.content, "headline", "GET IN TOUCH")}
          </h1>
          <p className="text-[18px] leading-[26px]" style={{ color: "#404040" }}>
            {text(
              hero.content,
              "subheadline",
              "Whether you have a project in mind or just want to say hello, I'm always open to new opportunities and collaborations."
            )}
          </p>
        </div>
      </SunburstHero>

      <section className="px-6 py-20 sm:px-20" style={sectionBandStyle(form.theme)}>
        <div className="mx-auto grid max-w-[1100px] gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-[48px] leading-[1.2] sm:text-[64px]" style={{ ...displayFont(), color: "#262626" }}>
              {text(form.content, "heading", "Get in touch")}
            </h2>
            <p className="mt-6 max-w-[480px] text-[18px] leading-[26px]" style={{ color: "#404040" }}>
              {text(form.content, "subheading", "Tell me about the story you want to tell. I'll write back soon.")}
            </p>
            {meta.contactEmail ? (
              <p className="mt-6 text-[18px] font-medium">{meta.contactEmail}</p>
            ) : null}
          </div>
          <form className="flex flex-col gap-4 rounded-[32px] bg-white p-8" action={`mailto:${meta.contactEmail || "hello@sarahfolio.com"}`} method="post" encType="text/plain">
            <label className="flex flex-col gap-2 text-[14px] font-medium">
              First Name
              <input name="firstName" className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-3 text-[14px] font-normal" placeholder="First Name" />
            </label>
            <label className="flex flex-col gap-2 text-[14px] font-medium">
              Sure Name
              <input name="sureName" className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-3 text-[14px] font-normal" placeholder="Sure Name" />
            </label>
            <label className="flex flex-col gap-2 text-[14px] font-medium">
              Email
              <input name="email" type="email" className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-3 text-[14px] font-normal" placeholder="Email" />
            </label>
            <button
              type="submit"
              className="sf-cta mt-2 inline-flex w-fit items-center rounded-[32px] border-2 border-[#0f0f0f] px-8 py-4 text-[18px] font-semibold drop-shadow-[0px_6px_0px_#0f0f0f]"
              style={{ backgroundColor: SF.brand }}
            >
              {text(form.content, "ctaPrimary", "Let's Connect!")}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function TestimonialsBand({ slot }: { slot: TemplateSlot }) {
  const quotes = list(slot.content, "quotes", []);
  const authors = list(slot.content, "authors", []);
  const roles = list(slot.content, "roles", []);
  const brands = list(slot.content, "itemTitles", ["FitLife", "Wellness Journey", "Opulence Interiors"]);
  if (!quotes.length && !text(slot.content, "heading")) return null;

  return (
    <section className="px-5 py-10">
      <div className="relative overflow-hidden rounded-[48px] px-6 py-16 sm:px-20" style={{ backgroundColor: SF.amber, ...sectionBandStyle(slot.theme) }}>
        <img
          src={`${A}/sunburst.svg`}
          alt=""
          width={1408}
          height={741}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08]"
        />
        <div className="relative z-[1] mx-auto max-w-[615px] text-center">
          <h2 className="text-[40px] leading-[1.2] tracking-[1.28px] sm:text-[64px]" style={{ ...displayFont(), color: "#262626" }}>
            {text(slot.content, "heading", "What Clients Are Saying")}
          </h2>
          <p className="mt-6 text-[18px] leading-[26px]" style={{ color: "#404040" }}>
            {text(
              slot.content,
              "subheading",
              "Don't just take my word for it. Hear from clients who have experienced the impact of my words firsthand."
            )}
          </p>
        </div>
        <div className="relative z-[1] mt-14 grid gap-3 lg:grid-cols-3">
          {quotes.slice(0, 3).map((quote, i) => (
            <article key={authors[i] || i} className="flex gap-4 rounded-[32px] border border-[#e5e5e5] bg-white p-6">
              <img src={`${A}/icon-quote.svg`} alt="" width={24} height={24} className="size-6 shrink-0" />
              <div className="flex flex-col gap-8">
                <div>
                  <p className="text-[20px] font-medium leading-[1.4]">{brands[i] || "Client"}</p>
                  <p className="mt-4 text-[18px] leading-[26px] opacity-80">{quote}</p>
                </div>
                <div className="flex items-center gap-5">
                  <img
                    src={slot.itemImages[i] || FALLBACK.avatars[i] || FALLBACK.avatars[0]}
                    alt=""
                    width={56}
                    height={56}
                    className="size-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[18px] font-medium leading-[26px]">{authors[i]}</p>
                    <p className="text-[12px] leading-[18px] opacity-60">{roles[i]}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="relative z-[1] mt-10 flex justify-center gap-6">
          <span className="flex size-12 items-center justify-center rounded-full border border-[#eaecf0] bg-white p-3">
            <img src={`${A}/icon-arrow-back.svg`} alt="" width={24} height={24} className="size-6" />
          </span>
          <span className="flex size-12 items-center justify-center rounded-full border border-[#eaecf0] bg-white p-3">
            <img src={`${A}/icon-arrow-fwd.svg`} alt="" width={24} height={24} className="size-6" />
          </span>
        </div>
      </div>
    </section>
  );
}

function CtaBand({ slot }: { slot: TemplateSlot }) {
  if (!text(slot.content, "headline") && !text(slot.content, "ctaPrimary")) return null;
  return (
    <section className="px-5 py-10">
      <div
        className="relative overflow-hidden rounded-[48px] px-6 py-24 text-center sm:px-20"
        style={{ backgroundColor: SF.pink, ...sectionBandStyle(slot.theme) }}
      >
        <img
          src={`${A}/sunburst.svg`}
          alt=""
          width={1408}
          height={911}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative z-[1] mx-auto flex max-w-[710px] flex-col items-center gap-6">
          <h2 className="text-[40px] uppercase leading-[1.2] tracking-[-0.36px] sm:text-[72px]" style={{ ...displayFont(), color: SF.pinkInk }}>
            {text(slot.content, "headline", "LET'S CREATE SOMETHING AMAZING TOGETHER")}
          </h2>
          <p className="text-[18px] leading-[26px]" style={{ color: SF.pinkMuted }}>
            {text(
              slot.content,
              "subheadline",
              "Whether you have a project in mind or just want to say hello, I'm always open to new opportunities and collaborations."
            )}
          </p>
          <Cta href={pageHref("contact")}>{text(slot.content, "ctaPrimary", "Let's Connect!")}</Cta>
        </div>
      </div>
    </section>
  );
}

function SiteFooter({
  businessName,
  customLogo,
  tagline,
  pages,
  contactEmail,
}: {
  businessName: string;
  customLogo: string;
  tagline: string;
  pages: { slug: string; title: string }[];
  contactEmail: string;
}) {
  const services = ["Content Strategy", "Website Copy", "Blog Writing", "Email Marketing"];
  return (
    <footer className="px-6 pb-8 pt-20 sm:px-24">
      <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
        <div className="max-w-[403px]">
          <Logo businessName={businessName} customLogo={customLogo} ink={SF.ink} />
          <p className="mt-3 text-[16px] leading-6" style={{ color: "#404040" }}>
            {tagline}
          </p>
          <div className="mt-4 flex gap-4">
            {[
              ["social-in.svg", "LinkedIn"],
              ["social-ig.svg", "Instagram"],
              ["social-x.svg", "X"],
            ].map(([file, label]) => (
              <a
                key={file}
                href={contactEmail ? `mailto:${contactEmail}` : pageHref("contact")}
                className="flex size-10 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] p-2"
                aria-label={label}
              >
                <img src={`${A}/${file}`} alt="" width={24} height={24} className="size-6" />
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-16">
          <div>
            <p className="mb-4 text-[16px] font-medium">Service</p>
            <ul className="flex flex-col gap-4 text-[16px]" style={{ color: SF.quiet }}>
              {services.map((s) => (
                <li key={s}>
                  <a href={pageHref("services")}>{s}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-[16px] font-medium">Company</p>
            <ul className="flex flex-col gap-4 text-[16px]" style={{ color: SF.quiet }}>
              {pages
                .filter((p) => p.slug !== "home")
                .map((p) => (
                  <li key={p.slug}>
                    <a href={pageHref(p.slug)}>{p.title}</a>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[16px]">Newsletter</p>
            <form className="flex gap-1" action={`mailto:${contactEmail || "hello@sarahfolio.com"}`} method="post">
              <input
                name="email"
                type="email"
                placeholder="Email..."
                className="w-[240px] rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-3 text-[14px]"
              />
              <button
                type="submit"
                className="sf-cta rounded-[32px] border-2 border-[#0f0f0f] px-4 py-2 text-[14px] font-medium drop-shadow-[0px_4px_0px_#0f0f0f]"
                style={{ backgroundColor: SF.brand }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-[14px] leading-[22px]" style={{ color: SF.muted }}>
        <p>Made with love😍</p>
        <div className="flex gap-3">
          <span>Terms of use</span>
          <span>Privacy policy</span>
        </div>
      </div>
    </footer>
  );
}
