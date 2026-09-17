import type { CSSProperties, ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { RB } from "./tokens";
import { list, slotAt, text, toSlots, pageSlugsOf, type TemplateSlot } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--rb-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--rb-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const A = "/templates/rebo";
const CLASH = "https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap";

const FALLBACK = {
  hero: `${A}/hero.png`,
  aboutVideo: `${A}/about-video.png`,
  aboutHero: `${A}/about-hero.png`,
  servicesHero: `${A}/services-hero.png`,
  faqHero: `${A}/faq-hero.png`,
  avatars: [`${A}/avatar-1.png`, `${A}/avatar-2.png`, `${A}/avatar-3.png`, `${A}/avatar-4.png`],
  serviceIcons: [`${A}/service-ux.png`, `${A}/service-graphic.png`, `${A}/service-web.png`, `${A}/service-motion.png`],
  work: [`${A}/work-1.png`, `${A}/work-2.png`, `${A}/work-3.png`, `${A}/work-4.png`],
  team: [`${A}/team-1.png`, `${A}/team-2.png`, `${A}/team-3.png`],
  aboutTeam: [`${A}/about-team-1.png`, `${A}/about-team-2.png`, `${A}/about-team-3.png`, `${A}/about-team-4.png`],
  blog: [`${A}/blog-1.png`, `${A}/blog-2.png`, `${A}/blog-3.png`, `${A}/blog-4.png`, `${A}/blog-5.png`, `${A}/blog-6.png`, `${A}/blog-7.png`],
  cases: [`${A}/case-1.png`, `${A}/case-2.png`, `${A}/case-3.png`, `${A}/case-4.png`],
  approach: [`${A}/approach-1.svg`, `${A}/approach-2.svg`, `${A}/approach-3.svg`, `${A}/approach-4.svg`],
} as const;

/**
 * Rebo — coral-on-cream digital agency from the Figma multi-layout pack.
 * Home follows the Design Agency desktop; catalog pages follow the inner
 * About / Services / FAQ / Price / Blog / Portfolio / Contacts frames.
 * `pageSlug` switches pages the same way other multi-page templates do.
 */
export function ReboSite({
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
  const businessName = text(footer.content, "businessName") || site?.businessName || blueprint?.business.name || "REBO";
  const customLogo = site?.theme?.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const contactPhone = details?.phone?.trim() || "";
  const isHome = active === "home";

  return (
    <div
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#E44F39"),
        fontFamily: "var(--rb-body), Inter, ui-sans-serif, system-ui, sans-serif",
        color: RB.ink,
        backgroundColor: isHome ? RB.bg : RB.innerBg,
        ...themeFontStyle(site?.theme, ["--rb-display", "--rb-body", "--rb-clash"]),
      }}
    >
      <link rel="stylesheet" href={CLASH} />
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <style>{`
        @keyframes rb-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .rb-marquee { animation: rb-marquee 18s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .rb-marquee { animation: none; } }
      `}</style>
      <Header pages={pages} active={active} businessName={businessName} customLogo={customLogo} dark={isHome} />
      <main>{renderPageBody(active, slots, { businessName, contactEmail, contactPhone })}</main>
      {isHome ? (
        <HomeContact slots={slots} contactEmail={contactEmail} contactPhone={contactPhone} businessName={businessName} customLogo={customLogo} />
      ) : (
        <InnerFooter
          businessName={businessName}
          customLogo={customLogo}
          tagline={text(footer.content, "tagline", "WE ARE PRIORITIZE COLLABORATION WITH OUR CLIENTS")}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
        />
      )}
    </div>
  );
}

type PageMeta = { businessName: string; contactEmail: string; contactPhone: string };

function renderPageBody(active: string, slots: TemplateSlot[], meta: PageMeta) {
  switch (active) {
    case "about":
      return <AboutBody slots={slots} />;
    case "services":
      return <ServicesBody slots={slots} />;
    case "pricing":
      return <PricingBody slots={slots} />;
    case "contact":
      return <ContactBody slots={slots} meta={meta} />;
    case "faq":
      return <FaqBody slots={slots} />;
    case "blog":
      return <BlogBody slots={slots} />;
    case "portfolio":
      return <PortfolioBody slots={slots} />;
    default:
      return <HomeBody slots={slots} />;
  }
}

function pageHref(slug: string): string {
  return `?page=${slug}`;
}

function displayFont(clash = false): CSSProperties {
  return {
    fontFamily: clash
      ? "var(--rb-clash), 'Clash Display', var(--rb-display), ui-sans-serif, sans-serif"
      : "var(--rb-display), 'Space Grotesk', ui-sans-serif, sans-serif",
  };
}

function Asterisk({ className = "" }: { className?: string }) {
  return <img src={`${A}/asterisk.svg`} alt="" width={52} height={52} className={`inline-block shrink-0 ${className}`} />;
}

function Logo({ businessName, customLogo, light }: { businessName: string; customLogo: string; light?: boolean }) {
  return (
    <a href={pageHref("home")} className="inline-grid grid-cols-[max-content] grid-rows-[max-content] items-start leading-none">
      {customLogo ? (
        <img src={customLogo} alt="" width={31} height={31} className="col-start-1 row-start-1 size-[31px] object-contain" />
      ) : (
        <img
          src={light ? `${A}/logo-light.svg` : `${A}/logo.svg`}
          alt=""
          width={31}
          height={31}
          className="col-start-1 row-start-1 size-[31px]"
        />
      )}
      <span
        className="col-start-1 row-start-1 ml-[38px] mt-1 text-[15px] font-bold leading-[22px]"
        style={{ color: light ? RB.white : RB.ink }}
      >
        {businessName}
      </span>
    </a>
  );
}

function Header({
  pages,
  active,
  businessName,
  customLogo,
  dark,
}: {
  pages: { slug: string; title: string }[];
  active: string;
  businessName: string;
  customLogo: string;
  dark: boolean;
}) {
  const fg = dark ? RB.white : RB.ink;
  return (
    <header className="relative z-50" style={{ backgroundColor: dark ? RB.header : "transparent" }}>
      <div className="mx-auto flex h-[86px] max-w-[1200px] items-center justify-between gap-6 px-8">
        <div className="flex items-center gap-16">
          <Logo businessName={businessName} customLogo={customLogo} light={dark} />
          <nav className="hidden items-center gap-8 lg:flex">
            {pages.map((p) => (
              <a
                key={p.slug}
                href={pageHref(p.slug)}
                className="text-[15px] font-semibold leading-[22px]"
                style={{ color: p.slug === active ? RB.brand : fg }}
              >
                {p.title}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <a href={pageHref("contact")} className="hidden text-[15px] font-semibold leading-[22px] sm:inline" style={{ color: fg }}>
            Sign Up
          </a>
          <a
            href={pageHref("contact")}
            className="inline-flex h-[46px] items-center justify-center gap-1.5 rounded-[33px] px-[18px] text-[15px] font-semibold leading-[22px] text-white"
            style={{ backgroundColor: RB.brand, boxShadow: dark ? "-5px 5px 0 0 #fff" : undefined }}
          >
            {dark ? "Log In" : "Get In Touch"}
            {dark ? null : <img src={`${A}/arrow-up-right.svg`} alt="" width={20} height={20} className="size-5" />}
          </a>
        </div>
      </div>
    </header>
  );
}

function PillButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex h-[58px] w-[269px] items-center justify-center gap-1.5 rounded-[33px] border-2 border-black px-[18px] text-[15px] font-semibold leading-[22px] text-white"
      style={{ backgroundColor: RB.brand, boxShadow: "-5px 5px 0 0 #fff" }}
    >
      {children}
    </a>
  );
}

function HomeBody({ slots }: { slots: TemplateSlot[] }) {
  const hero = slotAt(slots, "hero");
  const services = slotAt(slots, "services");
  const about = slotAt(slots, "about");
  const work = slotAt(slots, "portfolio");
  const process = slotAt(slots, "process");
  const quotes = slotAt(slots, "testimonials");
  const cta = slotAt(slots, "cta");
  const team = slotAt(slots, "features");
  const serviceTitles = list(services.content, "itemTitles", ["UI/UX Design", "Graphic Design", "Web Development", "Motion Graphics"]);
  const serviceBodies = list(services.content, "itemBodies");
  const workTitles = list(work.content, "itemTitles", ["Box mockup", "Editorial", "Tape kit", "Cup brand"]);
  const stepTitles = list(process.content, "stepTitles", ["01/ Project idea", "02/ Brainstorming", "03/ Launch"]);
  const stepBodies = list(process.content, "stepBodies");
  const quotesList = list(quotes.content, "quotes");
  const authors = list(quotes.content, "authors", ["Dave Jones"]);
  const roles = list(quotes.content, "roles", ["UI/UX"]);
  const teamNames = list(team.content, "itemTitles", ["Faris Miqdad", "Ghifari Syafi", "Fawwas Hamzah"]);
  const teamRoles = list(team.content, "itemBodies", ["Software Developer", "Team Leader", "UI/UX Designer"]);
  const stats = list(about.content, "itemTitles", ["15+", "120k", "100%"]);
  const statLabels = list(about.content, "itemBodies", ["Years of experience", "Successful projects", "Client satisfaction rate"]);
  const marquee = text(cta.content, "headline", "LET'S CREATE NEW EXPERIENCES");

  return (
    <>
      <section className="px-8 pb-16 pt-10" style={sectionBandStyle(hero.theme)}>
        <div className="mx-auto flex max-w-[1135px] flex-col items-start gap-[45px] lg:flex-row">
          <div className="flex max-w-[601px] flex-col items-start gap-[38px]">
            <div className="relative">
              <h1 className="whitespace-pre-line text-[clamp(3rem,7vw,86px)] font-bold leading-none" style={{ ...displayFont(), color: RB.ink }}>
                {text(hero.content, "headline", "A creative design studio").replace("design studio", "\ndesign studio")}
              </h1>
              <span className="absolute right-0 top-2 hidden md:block">
                <Asterisk />
              </span>
            </div>
            <p className="max-w-[600px] text-[18px] leading-normal">{text(hero.content, "subheadline")}</p>
            <div className="flex items-center gap-6">
              <div className="relative h-[63px] w-[156px]">
                {FALLBACK.avatars.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    width={63}
                    height={63}
                    className="absolute top-0 size-[63px] rounded-full border-2 border-white object-cover"
                    style={{ left: i * 31 }}
                  />
                ))}
              </div>
              <p className="text-[18px]">{text(hero.content, "ctaSecondary", "Believed by more than a thousand people")}</p>
            </div>
            <div className="relative">
              <PillButton href={pageHref("contact")}>
                {text(hero.content, "ctaPrimary", "Book a free consultant")}
                <img src={`${A}/phone-circle.svg`} alt="" width={24} height={24} className="size-6" />
              </PillButton>
              <img
                src={`${A}/scribble.svg`}
                alt=""
                width={177}
                height={178}
                className="pointer-events-none absolute -bottom-16 left-[85%] hidden w-[176px] lg:block"
              />
            </div>
          </div>
          <div className="relative h-[544px] w-full max-w-[489px] shrink-0 overflow-hidden rounded-[11px] border-[9px] border-white">
            <img src={hero.image || FALLBACK.hero} alt="" className="absolute inset-0 size-full object-cover" />
          </div>
        </div>
      </section>

      <section className="px-8 py-20" style={sectionBandStyle(services.theme)}>
        <div className="mx-auto flex max-w-[1138px] flex-col items-center gap-[52px]">
          <h2 className="max-w-[780px] text-center text-[52px] font-bold leading-none" style={displayFont()}>
            {text(services.content, "heading", "We provide effective design solutions")}
          </h2>
          <div className="grid w-full gap-5 md:grid-cols-2">
            {serviceTitles.map((title, i) => (
              <article
                key={title}
                className="flex flex-col items-start gap-10 rounded-[20px] border-2 border-black p-5"
                style={
                  i === 0
                    ? { backgroundColor: RB.brand, boxShadow: "4px 7px 0 0 #000" }
                    : { backgroundColor: RB.card }
                }
              >
                <img
                  src={services.itemImages[i] || FALLBACK.serviceIcons[i] || FALLBACK.serviceIcons[0]}
                  alt=""
                  width={64}
                  height={64}
                  className="size-16 object-contain"
                />
                <h3 className="text-[26px] font-bold" style={displayFont()}>
                  {title}
                </h3>
                <p className="text-[18px] leading-normal">{serviceBodies[i]}</p>
                <img src={`${A}/service-arrow.png`} alt="" width={34} height={28} className="h-7 w-[34px] object-contain" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20" style={sectionBandStyle(about.theme)}>
        <div className="mx-auto flex max-w-[1134px] flex-col gap-[52px]">
          <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-[94px]">
            <div className="relative max-w-[521px]">
              <h2 className="text-[52px] font-bold leading-none" style={displayFont()}>
                {text(about.content, "heading", "We make your business stand out")}
              </h2>
              <span className="absolute right-6 top-2 hidden md:block">
                <Asterisk />
              </span>
            </div>
            <p className="max-w-[519px] text-[18px] leading-normal">{text(about.content, "body")}</p>
          </div>
          <div className="flex flex-col gap-[22px] lg:flex-row">
            <div className="relative h-[450px] w-full overflow-hidden rounded-[20px] border-[5px] border-black lg:w-[751px]">
              <img src={about.image || FALLBACK.aboutVideo} alt="" className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
              <span
                className="absolute left-1/2 top-1/2 inline-flex h-[58px] w-[133px] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1.5 rounded-[33px] border-2 border-black text-[15px] font-semibold text-white"
                style={{ backgroundColor: RB.brand, boxShadow: "-5px 5px 0 0 #fff" }}
              >
                PLAY
                <img src={`${A}/play-circle.svg`} alt="" width={24} height={24} className="size-6" />
              </span>
            </div>
            <div className="flex w-full items-center justify-center rounded-[20px] px-[45px] py-[60px] lg:w-[361px]" style={{ backgroundColor: RB.inverse }}>
              <div className="flex w-[271px] flex-col items-center gap-[27px] text-center">
                {stats.map((value, i) => (
                  <div key={value}>
                    {i > 0 ? <div className="mb-[27px] h-px w-[271px] bg-white/20" /> : null}
                    <p className="text-[52px] font-bold leading-none" style={{ ...displayFont(), color: RB.brand }}>
                      {value}
                    </p>
                    <p className="mt-1 text-[18px]" style={{ color: RB.inverseFg }}>
                      {statLabels[i]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-20" style={{ backgroundColor: RB.inverse, ...sectionBandStyle(work.theme) }}>
        <div className="mx-auto flex max-w-[1137px] flex-col items-center gap-[52px]">
          <div className="relative max-w-[633px] text-center">
            <h2 className="text-[52px] font-bold leading-none text-white" style={displayFont()}>
              {text(work.content, "heading", "Have a wide range of creative project")}
            </h2>
            <span className="absolute -right-2 bottom-0 hidden md:block">
              <Asterisk />
            </span>
          </div>
          <div className="grid w-full gap-5 md:grid-cols-2">
            {workTitles.slice(0, 4).map((title, i) => (
              <div
                key={title}
                className="relative h-[560px] overflow-hidden rounded-[10px] border-[5px] border-white"
                style={i === 0 ? { boxShadow: "4px 7px 0 0 #fff" } : undefined}
              >
                <img src={work.itemImages[i] || FALLBACK.work[i]} alt={title} className="absolute inset-0 size-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20" style={sectionBandStyle(process.theme)}>
        <div className="mx-auto flex max-w-[1136px] flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="flex max-w-[557px] flex-col gap-[30px]">
            <div className="relative">
              <h2 className="text-[52px] font-bold leading-none" style={displayFont()}>
                {text(process.content, "heading", "Our high quality working processes")}
              </h2>
              <span className="absolute right-16 top-2 hidden md:block">
                <Asterisk />
              </span>
            </div>
            <p className="text-[18px] leading-normal">{text(process.content, "subheading")}</p>
            <p className="text-[18px] leading-normal">{text(process.content, "body")}</p>
          </div>
          <div className="flex w-full max-w-[462px] flex-col gap-[26px]">
            {stepTitles.map((title, i) => (
              <article
                key={title}
                className="flex items-start justify-between gap-4 rounded-[20px] p-5"
                style={
                  i === 0
                    ? { backgroundColor: RB.brand, boxShadow: "4px 7px 0 0 #000" }
                    : { backgroundColor: RB.card, border: "1px solid #000" }
                }
              >
                <div className="max-w-[322px]">
                  <h3 className="text-[32px] font-medium" style={displayFont()}>
                    {title}
                  </h3>
                  {i === 0 ? <p className="mt-[19px] text-[18px] leading-normal">{stepBodies[i]}</p> : null}
                </div>
                <img src={i === 0 ? `${A}/plus.svg` : `${A}/minus.svg`} alt="" width={24} height={24} className="size-6 shrink-0" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20" style={sectionBandStyle(quotes.theme)}>
        <div className="mx-auto flex max-w-[1138px] flex-col items-center gap-[52px]">
          <div className="relative max-w-[718px] text-center">
            <h2 className="text-[52px] font-bold leading-none" style={displayFont()}>
              {text(quotes.content, "heading", "Clients are always satisfied with us")}
            </h2>
            <span className="absolute right-16 top-1 hidden md:block">
              <Asterisk />
            </span>
          </div>
          <div className="grid w-full gap-[9px] md:grid-cols-3">
            {quotesList.slice(0, 6).map((quote, i) => (
              <article key={`${authors[i]}-${i}`} className="flex flex-col gap-6 overflow-hidden rounded-[20px] border-2 border-black p-[30px]">
                <div className="flex">
                  {[0, 1, 2, 3].map((s) => (
                    <img key={s} src={`${A}/star.svg`} alt="" width={24} height={24} className="size-6" />
                  ))}
                  <img src={`${A}/star-empty.svg`} alt="" width={24} height={24} className="size-6" />
                </div>
                <p className="text-[16px] font-medium leading-6 tracking-[-0.1px]">{quote}</p>
                <div className="flex items-center gap-2.5">
                  <img
                    src={quotes.itemImages[i] || `${A}/quote-avatar.png`}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[15px] font-medium leading-[22px]">{authors[i] || "Dave Jones"}</p>
                    <p className="text-[14px] font-medium leading-5" style={{ color: "#5F6D7E" }}>
                      {roles[i] || "UI/UX"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="overflow-hidden py-2.5" style={{ backgroundColor: RB.inverse }}>
        <div className="rb-marquee flex w-max items-center gap-[18px] px-5">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-[18px]">
              <img src={`${A}/service-arrow.png`} alt="" width={36} height={34} className="h-[34px] w-9 object-contain" />
              <p className="whitespace-nowrap text-[32px] font-medium" style={{ ...displayFont(), color: RB.brand }}>
                {marquee}
              </p>
              <Asterisk />
            </div>
          ))}
        </div>
      </div>

      <section className="px-8 py-20" style={sectionBandStyle(team.theme)}>
        <div className="mx-auto flex max-w-[1137px] flex-col items-center gap-[52px]">
          <div className="relative max-w-[718px] text-center">
            <h2 className="text-[52px] font-bold leading-none" style={displayFont()}>
              {text(team.content, "heading", "We have a team of creative people")}
            </h2>
            <span className="absolute -right-2 bottom-0 hidden md:block">
              <Asterisk />
            </span>
          </div>
          <div className="grid w-full gap-[21px] md:grid-cols-3">
            {teamNames.slice(0, 3).map((name, i) => (
              <article key={name} className="flex flex-col items-center gap-3.5">
                <div className="relative h-[441px] w-full overflow-hidden rounded-[10px] border-[5px] border-black">
                  <img src={team.itemImages[i] || FALLBACK.team[i]} alt={name} className="absolute inset-0 size-full object-cover grayscale" />
                  {i === 0 ? (
                    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-[11px]">
                      {[`${A}/social-fb.svg`, `${A}/social-x.svg`, `${A}/social-in.svg`, `${A}/social-ig.svg`].map((src) => (
                        <span key={src} className="grid size-[38px] place-items-center rounded-full bg-white">
                          <img src={src} alt="" width={24} height={24} className="size-6" />
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <h3 className="text-[32px] font-medium" style={displayFont()}>
                  {name}
                </h3>
                <p className="text-[18px]">{teamRoles[i]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function HomeContact({
  slots,
  contactEmail,
  contactPhone,
  businessName,
  customLogo,
}: {
  slots: TemplateSlot[];
  contactEmail: string;
  contactPhone: string;
  businessName: string;
  customLogo: string;
}) {
  const contact = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");
  return (
    <footer className="px-8 py-20" style={{ backgroundColor: RB.inverse, color: RB.inverseFg, ...sectionBandStyle(contact.theme) }}>
      <div className="mx-auto flex max-w-[1133px] flex-col gap-[45px] lg:flex-row lg:items-start">
        <div className="flex w-full max-w-[555px] flex-col gap-[49px]">
          <div className="relative">
            <h2 className="max-w-[521px] text-[52px] font-bold leading-none text-white" style={displayFont()}>
              {text(contact.content, "heading", "Let's start a project together")}
            </h2>
            <span className="absolute left-[303px] top-1 hidden md:block">
              <Asterisk />
            </span>
          </div>
          <p className="text-[18px] leading-normal text-white">{text(contact.content, "subheading")}</p>
          <div>
            <p className="text-[18px]" style={{ color: RB.brand }}>
              Give us a call:
            </p>
            <p className="mt-3.5 text-[18px] text-white">{contactPhone || "(123)456-780"}</p>
          </div>
          <div>
            <p className="text-[18px]" style={{ color: RB.brand }}>
              Send us an email:
            </p>
            <p className="mt-3.5 text-[18px] text-white">{contactEmail || "info@rebo.com"}</p>
          </div>
          <div className="flex gap-[21px]">
            {[`${A}/social-fb-light.svg`, `${A}/social-x-light.svg`, `${A}/social-ig-light.svg`, `${A}/social-in-light.svg`].map((src) => (
              <img key={src} src={src} alt="" width={24} height={24} className="size-6" />
            ))}
          </div>
        </div>
        <form className="flex w-full max-w-[558px] flex-col gap-6 rounded-lg p-8">
          <h3 className="text-[32px] font-medium text-white" style={displayFont()}>
            Send us a message
          </h3>
          <input className="h-[46px] rounded-md border border-white bg-transparent px-4 text-[15px] text-white placeholder:text-[#A5ACBA]" placeholder="Name" />
          <input className="h-[46px] rounded-md border border-white bg-transparent px-4 text-[15px] text-white placeholder:text-[#A5ACBA]" placeholder="Email" type="email" />
          <textarea className="min-h-[157px] rounded-md border border-white bg-transparent px-4 py-3 text-[15px] text-white placeholder:text-[#A5ACBA]" placeholder="Message" />
          <label className="flex items-start gap-3 text-[16px] font-medium text-white">
            <span className="mt-0.5 size-5 shrink-0 rounded-[5px] border-2 border-[#DAE0E6] bg-white" />
            {text(contact.content, "body", "I agree with Lookscout Privacy Policy")}
          </label>
          <PillButton href={pageHref("contact")}>
            {text(contact.content, "ctaPrimary", "Book a free consultant")}
            <img src={`${A}/phone-circle.svg`} alt="" width={24} height={24} className="size-6" />
          </PillButton>
        </form>
      </div>
      <div className="mx-auto mt-[45px] flex max-w-[1133px] items-center justify-between border-t pt-6" style={{ borderColor: "#2E3545" }}>
        <p className="text-[16px]" style={{ color: RB.graySoft }}>
          © Copyright {new Date().getFullYear()}, All Rights Reserved by {text(footer.content, "businessName", businessName)}
        </p>
        <Logo businessName={businessName} customLogo={customLogo} light />
      </div>
    </footer>
  );
}

function InnerFooter({
  businessName,
  customLogo,
  tagline,
  contactEmail,
  contactPhone,
}: {
  businessName: string;
  customLogo: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
}) {
  return (
    <footer className="relative overflow-hidden px-8 py-20" style={{ backgroundColor: RB.inverse, color: RB.inverseFg }}>
      <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center gap-[118px] text-[400px] font-bold leading-[220px] tracking-[2px] text-white/10" style={displayFont(true)}>
        <span>REBO</span>
        <span>REBO</span>
      </div>
      <div className="relative mx-auto flex max-w-[1149px] flex-col gap-10">
        <div className="flex items-start gap-[23px]">
          <Logo businessName={businessName} customLogo={customLogo} light />
          <p className="max-w-[262px] text-[18px] font-semibold uppercase leading-normal text-[#FFFFF5]">{tagline}</p>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[96px] font-semibold uppercase leading-none text-white" style={displayFont(true)}>
              get in <span style={{ color: RB.brand }}>touch</span>
            </p>
            <div className="mt-[27px] flex gap-[102px] text-[24px] font-bold text-[#8E8E8E]">
              <p>{contactPhone || "(+23)456-780"}</p>
              <p>{contactEmail || "info@rebo.com"}</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            {["twitter", "linkedin", "instagram"].map((label) => (
              <span key={label} className="inline-flex w-[105px] items-center justify-center rounded-[33px] border border-[#FFFFF5] p-[5px] text-[18px] text-[#FFFFF5]">
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: "#2E3545" }}>
          <p className="text-[16px]" style={{ color: RB.graySoft }}>
            © Copyright {new Date().getFullYear()}, All Rights Reserved by {businessName}
          </p>
          <Logo businessName={businessName} customLogo={customLogo} light />
        </div>
      </div>
    </footer>
  );
}

function PageTitle({ heading, image }: { heading: string; image?: string }) {
  return (
    <section className="px-8 pb-6 pt-12">
      <div className="mx-auto flex max-w-[1135px] flex-col items-center gap-[26px]">
        <h1 className="text-[52px] font-bold uppercase leading-none" style={displayFont(true)}>
          {heading}
        </h1>
        {image ? (
          <div className="relative h-[436px] w-full overflow-hidden">
            <img src={image} alt="" className="absolute inset-0 size-full object-cover grayscale" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function WordMarquee() {
  return (
    <div className="overflow-hidden py-6">
      <div className="flex flex-wrap justify-center gap-8 text-[96px] font-semibold uppercase leading-none" style={displayFont(true)}>
        <span>business</span>
        <span style={{ color: RB.brand }}>financial</span>
        <span>marketing</span>
        <span style={{ color: RB.brand }}>software</span>
      </div>
    </div>
  );
}

function AboutBody({ slots }: { slots: TemplateSlot[] }) {
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const stats = slotAt(slots, "features", 0);
  const team = slotAt(slots, "features", 1);
  const values = list(stats.content, "itemTitles", ["25+", "84k", "20k", "85%"]);
  const labels = list(stats.content, "itemBodies");
  const names = list(team.content, "itemTitles");
  const roles = list(team.content, "itemBodies");
  return (
    <>
      <PageTitle heading={text(hero.content, "headline", "ABOUT US")} image={hero.image || FALLBACK.aboutHero} />
      <section className="px-8 py-16" style={sectionBandStyle(about.theme)}>
        <div className="mx-auto flex max-w-[1136px] flex-col items-center gap-[30px]">
          <span className="rounded-[33px] border border-black px-2.5 py-2.5 text-[18px] font-semibold uppercase">
            {text(about.content, "eyebrow", "Our mission & vision")}
          </span>
          <p className="text-center text-[52px] font-bold leading-none" style={displayFont(true)}>
            {text(about.content, "heading")}
          </p>
        </div>
      </section>
      <section className="px-8 pb-16">
        <div className="mx-auto grid max-w-[1135px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, i) => (
            <div key={value}>
              <p className="text-[64px] font-bold leading-none" style={displayFont(true)}>
                {value}
              </p>
              <p className="mt-4 text-[18px]">{labels[i]}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-8 pb-20" style={sectionBandStyle(team.theme)}>
        <div className="mx-auto flex max-w-[1136px] flex-col items-center gap-[30px]">
          <span className="rounded-[33px] border border-black px-2.5 py-2.5 text-[18px] font-semibold uppercase">
            {text(team.content, "heading", "Our team profesional")}
          </span>
          <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {names.map((name, i) => (
              <article key={name}>
                <div className="relative h-[345px] w-full overflow-hidden">
                  <img src={team.itemImages[i] || FALLBACK.aboutTeam[i]} alt={name} className="absolute inset-0 size-full object-cover grayscale" />
                </div>
                <p className="mt-[18px] text-[14px]" style={{ color: "#5A5A5A" }}>
                  {roles[i]}
                </p>
                <h3 className="mt-2.5 text-[32px] font-medium" style={displayFont(true)}>
                  {name}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ServicesBody({ slots }: { slots: TemplateSlot[] }) {
  const hero = slotAt(slots, "hero");
  const services = slotAt(slots, "services");
  const approach = slotAt(slots, "process");
  const titles = list(services.content, "itemTitles", ["business", "financial", "marketing", "software"]);
  const bodies = list(services.content, "itemBodies");
  const steps = list(approach.content, "stepTitles");
  const stepBodies = list(approach.content, "stepBodies");
  return (
    <>
      <section className="px-8 pb-6 pt-12">
        <div className="mx-auto flex max-w-[1136px] flex-col items-center gap-[26px]">
          <h1 className="text-[52px] font-bold uppercase leading-none" style={displayFont(true)}>
            {text(hero.content, "headline", "SERVICES")}
          </h1>
          <div className="relative w-full overflow-hidden">
            <img src={hero.image || FALLBACK.servicesHero} alt="" className="h-[764px] w-full object-cover grayscale" />
            <div className="absolute inset-0 flex flex-col justify-center px-8">
              {titles.map((title, i) => (
                <div
                  key={title}
                  className="flex items-center justify-between border-y border-[#8F8F8F] p-2.5"
                  style={i === 1 ? { backgroundColor: RB.brand, borderColor: "transparent" } : undefined}
                >
                  <p className="text-[clamp(2.5rem,8vw,96px)] font-semibold uppercase leading-none" style={{ ...displayFont(true), color: i === 1 ? RB.ink : RB.white }}>
                    {title}
                  </p>
                  {i === 1 ? (
                    <div className="hidden max-w-[295px] items-center gap-4 lg:flex">
                      <p className="text-[18px] leading-normal">{bodies[i]}</p>
                      <img src={`${A}/mark-arrow.svg`} alt="" width={56} height={55} className="h-[55px] w-[56px] -rotate-90" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="px-8 py-16" style={sectionBandStyle(approach.theme)}>
        <div className="mx-auto max-w-[1136px]">
          <div className="mb-12 inline-flex items-center gap-[11px] rounded-[33px] border border-black px-5 py-2.5">
            <span className="size-5 rounded-full" style={{ backgroundColor: RB.ink }} />
            <h2 className="text-[32px] font-medium uppercase" style={displayFont(true)}>
              {text(approach.content, "heading", "Our Approach")}
            </h2>
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            {steps.map((title, i) => (
              <article key={title} className="flex flex-col gap-11 border-black px-[17px] py-4 md:border-r md:last:border-r-0">
                <img src={FALLBACK.approach[i] || FALLBACK.approach[0]} alt="" width={55} height={56} className="h-[56px] w-[55px] object-contain" />
                <div>
                  <h3 className="text-[18px] font-medium" style={displayFont(true)}>
                    {title}
                  </h3>
                  <p className="mt-2.5 text-[14px]" style={{ color: "#5A5A5A" }}>
                    {stepBodies[i]}
                  </p>
                </div>
                <img src={`${A}/arrow-right.svg`} alt="" width={24} height={24} className="size-6" />
              </article>
            ))}
          </div>
        </div>
      </section>
      <WordMarquee />
    </>
  );
}

function PricingBody({ slots }: { slots: TemplateSlot[] }) {
  const hero = slotAt(slots, "hero");
  const pricing = slotAt(slots, "pricing");
  const faq = slotAt(slots, "faq");
  const names = list(pricing.content, "planNames", ["Starter", "Beginner", "Best Value"]);
  const features = list(pricing.content, "planFeatures");
  const blurb = list(pricing.content, "itemBodies");
  const questions = list(faq.content, "questions");
  const answers = list(faq.content, "answers");
  return (
    <>
      <PageTitle heading={text(hero.content, "headline", "PRICING PLANS")} />
      <section className="px-8 pb-16" style={sectionBandStyle(pricing.theme)}>
        <div className="mx-auto grid max-w-[1136px] gap-5 md:grid-cols-3">
          {names.map((name, i) => (
            <article key={name} className="rounded-[20px] p-8 text-white" style={{ backgroundColor: RB.inverse }}>
              <span
                className="inline-flex rounded px-4 py-1 text-[14px] font-semibold"
                style={{ backgroundColor: i === 1 ? RB.brand : "#2A2A2A" }}
              >
                {name}
              </span>
              <p className="mt-3 text-[16px] leading-normal text-white/80">{blurb[i]}</p>
              <ul className="mt-6 space-y-2 border-t border-white/20 pt-6 text-[16px]">
                {(features[i] || features[0] || "").split("\n").map((line) => (
                  <li key={line} className="flex items-center gap-2">
                    <img src={`${A}/check.svg`} alt="" width={16} height={16} className="size-4" />
                    {line}
                  </li>
                ))}
              </ul>
              <a href={pageHref("contact")} className="mt-8 flex h-12 items-center justify-center rounded-md bg-[#2A2A2A] text-[14px] font-semibold uppercase">
                Contact our sales
              </a>
            </article>
          ))}
        </div>
      </section>
      <FaqList heading={text(faq.content, "heading", "Popular Questions")} questions={questions} answers={answers} />
      <WordMarquee />
    </>
  );
}

function FaqBody({ slots }: { slots: TemplateSlot[] }) {
  const hero = slotAt(slots, "hero");
  const faq = slotAt(slots, "faq");
  return (
    <>
      <PageTitle heading={text(hero.content, "headline", "FAQ")} image={hero.image || FALLBACK.faqHero} />
      <FaqList
        heading={text(faq.content, "heading", "Popular Questions")}
        questions={list(faq.content, "questions")}
        answers={list(faq.content, "answers")}
      />
      <WordMarquee />
    </>
  );
}

function FaqList({ heading, questions, answers }: { heading: string; questions: string[]; answers: string[] }) {
  return (
    <section className="px-8 py-16">
      <div className="mx-auto flex max-w-[1135px] flex-col gap-[22px] lg:flex-row lg:items-start">
        <div className="w-full max-w-[345px] uppercase">
          <p className="text-[18px] font-semibold">(FREQUENTLY ASKED QUESTIONS)</p>
          <h2 className="text-[52px] font-bold leading-none" style={displayFont(true)}>
            {heading}
          </h2>
        </div>
        <div className="flex-1">
          {questions.map((q, i) => (
            <details key={q} className="group border-y border-black/20 px-[5px] py-5" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[22px] font-semibold uppercase">
                {q}
                <img src={`${A}/arrow-down-right.svg`} alt="" width={24} height={24} className="size-6 shrink-0" />
              </summary>
              {answers[i] ? <p className="mt-[19px] max-w-[431px] text-[18px]" style={{ color: RB.gray }}>{answers[i]}</p> : null}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactBody({ slots, meta }: { slots: TemplateSlot[]; meta: PageMeta }) {
  const hero = slotAt(slots, "hero");
  const contact = slotAt(slots, "contact");
  return (
    <>
      <PageTitle heading={text(hero.content, "headline", "CONTACTS")} />
      <section className="px-8 py-16" style={sectionBandStyle(contact.theme)}>
        <div className="mx-auto flex max-w-[1136px] flex-col gap-[78px]">
          <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
            <div className="max-w-[458px] uppercase">
              <p className="text-[18px] font-semibold">{text(hero.content, "eyebrow", "(OUR CONTACTS)")}</p>
              <h2 className="text-[52px] font-bold leading-none" style={displayFont(true)}>
                {text(contact.content, "heading", "Get in Touch with Us")}
              </h2>
            </div>
            <div className="flex flex-col gap-5 text-[18px] font-semibold uppercase">
              <div className="flex gap-8">
                <p style={{ color: "#818181" }}>Location</p>
                <p className="whitespace-pre-line">{text(contact.content, "body", "27 Division St, NY 10002\nindonesia / jakarta")}</p>
              </div>
              <div className="flex gap-8">
                <p style={{ color: "#818181" }}>give us a call</p>
                <p>{meta.contactPhone || "+1 800 345 67 98"}</p>
              </div>
              <div className="flex gap-2.5">
                {["twitter", "linkedin", "instagram"].map((label) => (
                  <span key={label} className="inline-flex w-[105px] items-center justify-center rounded-[33px] border border-black p-[5px] text-[18px] font-normal normal-case">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-black" />
          <div className="mx-auto flex w-full max-w-[750px] flex-col items-center gap-[30px]">
            <h3 className="text-center text-[52px] font-bold uppercase leading-none" style={displayFont(true)}>
              {text(contact.content, "subheading", "Lets Bring Your Vision Into Reality")}
            </h3>
            <form className="flex w-full flex-col items-center gap-[53px]">
              <div className="grid w-full gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-3 text-[18px]" style={{ color: "#7E7E7E" }}>
                  Your Name
                  <span className="h-px w-full bg-black" />
                </label>
                <label className="flex flex-col gap-3 text-[18px]" style={{ color: "#7E7E7E" }}>
                  Email
                  <span className="h-px w-full bg-black" />
                </label>
              </div>
              <label className="flex h-40 w-full flex-col justify-between text-[18px]" style={{ color: "#7E7E7E" }}>
                Message
                <span className="h-px w-full bg-black" />
              </label>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-[18px] py-3 text-[15px] font-semibold text-white"
                style={{ backgroundColor: RB.brand }}
              >
                {text(contact.content, "ctaPrimary", "Send Message")}
                <img src={`${A}/arrow-up-right.svg`} alt="" width={20} height={20} className="size-5" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function BlogBody({ slots }: { slots: TemplateSlot[] }) {
  const hero = slotAt(slots, "hero");
  const posts = slotAt(slots, "features");
  const titles = list(posts.content, "itemTitles");
  const dates = list(posts.content, "itemBodies");
  const main = titles.slice(0, 3);
  const related = titles.slice(3, 7);
  return (
    <>
      <PageTitle heading={text(hero.content, "headline", "BLOG LISTING")} />
      <section className="px-8 pb-20" style={sectionBandStyle(posts.theme)}>
        <div className="mx-auto flex max-w-[1136px] flex-col gap-[18px] lg:flex-row lg:items-start">
          <div className="flex w-full max-w-[753px] flex-col gap-[37px]">
            {main.map((title, i) => (
              <article key={`${title}-${i}`} className="relative flex flex-col gap-[21px]">
                <div className="relative h-[570px] w-full overflow-hidden">
                  <img src={posts.itemImages[i] || FALLBACK.blog[i]} alt={title} className="absolute inset-0 size-full object-cover" />
                  <span className="absolute left-[22px] top-[22px] rounded-[33px] border border-black px-2.5 py-2.5 text-[14px] uppercase">
                    Branding
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[16px] font-medium capitalize" style={{ color: "#5F5C5C" }}>
                      {dates[i]}
                    </p>
                    <h2 className="mt-[21px] text-[22px] font-medium">{title}</h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold" style={{ color: RB.brand }}>
                    Read More
                    <img src={`${A}/arrow-down-right.svg`} alt="" width={20} height={20} className="size-5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
          <aside className="flex w-full max-w-[365px] flex-col gap-[46px]">
            <div>
              <div className="flex items-center gap-[17px] text-[18px]" style={{ color: "#7E7E7E" }}>
                <img src={`${A}/search.svg`} alt="" width={24} height={24} className="size-6" />
                Search
              </div>
              <div className="mt-3 h-px w-full bg-black" />
            </div>
            <div>
              <p className="text-[22px] font-medium">Categori</p>
              <ul className="mt-5 space-y-[7px] text-[18px]" style={{ color: RB.gray }}>
                {["Branding (4)", "Design (4)", "Digital (4)", "Ideas (4)", "Technology (4)"].map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[22px] font-medium">Related Posts</p>
              <div className="mt-5 flex flex-col gap-[15px]">
                {related.map((title, i) => (
                  <article key={title} className="flex gap-[11px]">
                    <img src={posts.itemImages[i + 3] || FALLBACK.blog[i + 3]} alt="" width={109} height={97} className="h-[97px] w-[109px] object-cover" />
                    <div>
                      <p className="text-[16px] font-medium capitalize" style={{ color: "#5F5C5C" }}>
                        {dates[i + 3]}
                      </p>
                      <p className="mt-[11px] text-[18px]">{title}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function PortfolioBody({ slots }: { slots: TemplateSlot[] }) {
  const hero = slotAt(slots, "hero");
  const work = slotAt(slots, "portfolio");
  const titles = list(work.content, "itemTitles", ["QUBUS", "NYOLA", "TAPESHO", "URAGO"]);
  const bodies = list(work.content, "itemBodies", ["brand strategy", "digital marketing", "seo page", "brand strategy"]);
  return (
    <>
      <PageTitle heading={text(hero.content, "headline", "PORTFOLIO 2 COL")} />
      <section className="px-8 pb-20" style={sectionBandStyle(work.theme)}>
        <div className="mx-auto flex max-w-[1136px] flex-col gap-[30px]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <h2 className="max-w-[462px] text-[52px] font-bold uppercase leading-none" style={displayFont(true)}>
              {text(work.content, "heading", "Our Cases")}
            </h2>
            <p className="max-w-[558px] text-right text-[18px] uppercase leading-normal">
              {text(work.content, "subheading", text(hero.content, "subheadline"))}
            </p>
          </div>
          <div className="grid gap-[52px]">
            <div className="grid gap-5 md:grid-cols-2">
              {titles.map((title, i) => (
                <article key={title} className="flex flex-col gap-[15px]">
                  <div className="relative h-[813px] w-full overflow-hidden">
                    <img src={work.itemImages[i] || FALLBACK.cases[i]} alt={title} className="absolute inset-0 size-full object-cover" />
                  </div>
                  <h3 className="text-[52px] uppercase leading-none" style={displayFont(true)}>
                    {title}
                  </h3>
                  <ul className="list-disc pl-[27px] text-[18px]">
                    <li>{bodies[i]}</li>
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
