import { Inter, Rubik } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { WH } from "./tokens";
import { list, slotAt, text, toSlots, pageSlugsOf, type TemplateSlot } from "../shared/content";
import { brandStyle } from "../shared/brand";

const display = Rubik({
  subsets: ["latin"],
  variable: "--wh-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--wh-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ICONS = [
  "/templates/whiter/icon-target.svg",
  "/templates/whiter/icon-coin.svg",
  "/templates/whiter/icon-rocket.png",
  "/templates/whiter/icon-heart.svg",
  "/templates/whiter/icon-chart.svg",
] as const;

const FALLBACK = {
  hero: "/templates/whiter/hero.png",
  content: "/templates/whiter/content.png",
  value: "/templates/whiter/value.png",
  about: "/templates/whiter/about.png",
  team: ["/templates/whiter/team-1.png", "/templates/whiter/team-2.png", "/templates/whiter/team-3.png"],
  services: ["/templates/whiter/service-1.png", "/templates/whiter/service-2.png", "/templates/whiter/service-3.png"],
  portfolio: ["/templates/whiter/portfolio-1.png", "/templates/whiter/portfolio-2.png", "/templates/whiter/portfolio-3.png"],
  blog: ["/templates/whiter/blog-1.png", "/templates/whiter/blog-2.png", "/templates/whiter/blog-3.png"],
} as const;

/**
 * The complete Whiter design — a friendly, modern SaaS/agency look with a bright
 * blue accent, soft rounded cards and floating decorative shapes. Multi-page:
 * `pageSlug` picks which catalog page to render, and the header links between the
 * generated pages. Every page reads its copy from the locked blueprint slots, so
 * AI copy and editor changes can never alter the structure.
 */
export function WhiterSite({
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
  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "Whiter";
  const customLogo = site?.theme?.logoUrl?.trim() || "";

  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const contactPhone = details?.phone?.trim() || "";

  return (
    <div
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme?.colors, "#1787FC"),
        fontFamily: "var(--wh-body), ui-sans-serif, system-ui, sans-serif",
        color: WH.ink,
        backgroundColor: WH.white,
      }}
    >
      <Header
        pages={pages}
        active={active}
        businessName={businessName}
        customLogo={customLogo}
      />

      <main>{renderPageBody(active, slots, { businessName, contactEmail, contactPhone })}</main>

      <Footer
        pages={pages}
        businessName={businessName}
        customLogo={customLogo}
        tagline={text(footer.content, "tagline", "Build your next website, fast.")}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
      />
    </div>
  );
}

type PageMeta = { businessName: string; contactEmail: string; contactPhone: string };

function renderPageBody(active: string, slots: TemplateSlot[], meta: PageMeta) {
  switch (active) {
    case "home":
      return <HomeBody slots={slots} meta={meta} />;
    case "about":
      return <AboutBody slots={slots} meta={meta} />;
    case "services":
      return <ServicesBody slots={slots} meta={meta} />;
    case "pricing":
      return <PricingBody slots={slots} meta={meta} />;
    case "contact":
      return <ContactBody slots={slots} meta={meta} />;
    case "faq":
      return <FaqBody slots={slots} meta={meta} />;
    case "blog":
      return <BlogBody slots={slots} meta={meta} />;
    case "portfolio":
      return <PortfolioBody slots={slots} meta={meta} />;
    default:
      return <HomeBody slots={slots} meta={meta} />;
  }
}

/* -------------------------------------------------------------------------- */
/* Shared chrome                                                              */
/* -------------------------------------------------------------------------- */

function pageHref(slug: string): string {
  // In preview (editor iframe / demo) pages switch via the ?page query param.
  return `?page=${slug}`;
}

function Header({
  pages,
  active,
  businessName,
  customLogo,
}: {
  pages: { slug: string; title: string }[];
  active: string;
  businessName: string;
  customLogo: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur-md" style={{ borderColor: WH.line }}>
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a href={pageHref("home")} className="flex items-center gap-2.5">
          {customLogo ? (
            <img src={customLogo} alt="" className="h-9 w-9 rounded-xl object-contain" />
          ) : (
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-white"
              style={{ background: WH.brand, fontFamily: "var(--wh-display)" }}
            >
              {initials(businessName)}
            </span>
          )}
          <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
            {businessName}
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
          {pages.map((p) => (
            <a
              key={p.slug}
              href={pageHref(p.slug)}
              className="transition-colors"
              style={{ color: p.slug === active ? WH.brand : WH.body }}
            >
              {p.title}
            </a>
          ))}
        </nav>

        <a
          href={pageHref("contact")}
          className="hidden rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-transform sm:inline-flex"
          style={{ background: WH.brand, fontFamily: "var(--wh-display)" }}
        >
          Get started
        </a>
      </div>
    </header>
  );
}

function Footer({
  pages,
  businessName,
  customLogo,
  tagline,
  contactEmail,
  contactPhone,
}: {
  pages: { slug: string; title: string }[];
  businessName: string;
  customLogo: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
}) {
  return (
    <footer className="relative overflow-hidden pt-20 text-white" style={{ background: WH.mirage }}>
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-30" style={{ background: WH.brand, filter: "blur(80px)" }} />
      <div className="relative mx-auto max-w-[1240px] px-5 pb-10 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr] md:gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              {customLogo ? (
                <img src={customLogo} alt="" className="h-9 w-9 rounded-xl object-contain" />
              ) : (
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-white"
                  style={{ background: WH.brand, fontFamily: "var(--wh-display)" }}
                >
                  {initials(businessName)}
                </span>
              )}
              <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "var(--wh-display)" }}>
                {businessName}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{tagline}</p>
            {(contactEmail || contactPhone) && (
              <div className="mt-5 space-y-1.5 text-sm text-white/70">
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} className="block transition-colors hover:text-white">
                    {contactEmail}
                  </a>
                )}
                {contactPhone && (
                  <a href={`tel:${contactPhone}`} className="block transition-colors hover:text-white">
                    {contactPhone}
                  </a>
                )}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50" style={{ fontFamily: "var(--wh-display)" }}>
              Pages
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              {pages.map((p) => (
                <li key={p.slug}>
                  <a href={pageHref(p.slug)} className="transition-colors hover:text-white">
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50" style={{ fontFamily: "var(--wh-display)" }}>
              Newsletter
            </h3>
            <p className="mt-4 text-sm text-white/70">Get monthly updates in your inbox.</p>
            <form className="mt-4 flex gap-2" data-motion-skip>
              <input
                type="email"
                placeholder="you@company.com"
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button type="button" className="rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ background: WH.brand, fontFamily: "var(--wh-display)" }}>
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/45">
          © {new Date().getFullYear()} {businessName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Building blocks                                                            */
/* -------------------------------------------------------------------------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]"
      style={{ background: WH.brandSoft, color: WH.brandDeep, fontFamily: "var(--wh-display)" }}
    >
      {children}
    </span>
  );
}

function PageHeader({ slot, fallbackTitle }: { slot: TemplateSlot; fallbackTitle: string }) {
  return (
    <section className="relative overflow-hidden" style={{ background: WH.surface }}>
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-40" style={{ background: WH.brandSoft, filter: "blur(60px)" }} data-parallax="0.1" />
      <div className="relative mx-auto max-w-[1240px] px-5 py-20 text-center lg:px-8 lg:py-28">
        <Eyebrow>{text(slot.content, "eyebrow", fallbackTitle)}</Eyebrow>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight lg:text-6xl" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
          {text(slot.content, "headline", fallbackTitle)}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: WH.body }}>
          {text(slot.content, "subheadline", "")}
        </p>
      </div>
    </section>
  );
}

function Section({ children, tint }: { children: React.ReactNode; tint?: boolean }) {
  return (
    <section className="px-5 py-20 lg:px-8 lg:py-28" style={tint ? { background: WH.surface } : undefined}>
      <div className="mx-auto max-w-[1240px]">{children}</div>
    </section>
  );
}

function SectionHeading({ eyebrow, heading, subheading, center = true }: { eyebrow?: string; heading: string; subheading?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight lg:text-5xl" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
        {heading}
      </h2>
      {subheading ? (
        <p className="mt-4 text-lg leading-relaxed" style={{ color: WH.body }}>
          {subheading}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white"
      style={{ background: WH.brand, fontFamily: "var(--wh-display)" }}
    >
      {children}
    </a>
  );
}

function FeatureCards({ slot }: { slot: TemplateSlot }) {
  const titles = list(slot.content, "itemTitles", ["User centered design", "Earn extra money", "Launch your service"]);
  const bodies = list(slot.content, "itemBodies");
  return (
    <Section>
      <div className="grid gap-6 md:grid-cols-3">
        {titles.map((title, i) => (
          <article
            key={`${title}-${i}`}
            className="rounded-[28px] border bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(23,135,252,0.35)]"
            style={{ borderColor: WH.line }}
          >
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl" style={{ background: WH.brandSoft }}>
              <img src={slot.itemImages[i] || ICONS[i % ICONS.length]} alt="" className="h-11 w-11 object-contain" />
            </div>
            <h3 className="mt-6 text-xl font-bold" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
              {title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: WH.body }}>
              {bodies[i] || "With lots of unique blocks, you can easily build a page without coding."}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function StorySection({ slot, image, flip }: { slot: TemplateSlot; image: string; flip?: boolean }) {
  return (
    <Section tint>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className={flip ? "lg:order-2" : ""}>
          <div className="relative">
            <div className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-3xl opacity-70" style={{ background: WH.skeptic }} data-parallax="0.08" />
            <div className="relative overflow-hidden rounded-[32px] border bg-white shadow-[0_30px_80px_-40px_rgba(29,38,58,0.4)]" style={{ borderColor: WH.line }}>
              <img src={slot.image || image} alt={text(slot.content, "heading", "")} className="h-full w-full object-cover" data-parallax="0.06" />
            </div>
          </div>
        </div>
        <div className={flip ? "lg:order-1" : ""}>
          <Eyebrow>{text(slot.content, "eyebrow", "About us")}</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight lg:text-5xl" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
            {text(slot.content, "heading", "We create value to your business")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: WH.body }}>
            {text(slot.content, "body", "With lots of unique blocks, you can easily build a page without coding.")}
          </p>
          <div className="mt-8">
            <PrimaryButton href={pageHref("services")}>Learn more</PrimaryButton>
          </div>
        </div>
      </div>
    </Section>
  );
}

function ValueList({ slot }: { slot: TemplateSlot }) {
  const titles = list(slot.content, "itemTitles", ["User centered design", "Get latest updates", "Transparent pricing"]);
  const bodies = list(slot.content, "itemBodies");
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow={text(slot.content, "subheading") ? undefined : "Why choose us"}
            heading={text(slot.content, "heading", "We create value to your business")}
            subheading={text(slot.content, "subheading", "")}
            center={false}
          />
          <ul className="mt-8 space-y-6">
            {titles.map((title, i) => (
              <li key={`${title}-${i}`} className="flex gap-5">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white"
                  style={{ background: i % 2 === 0 ? WH.brand : WH.cloudburst, fontFamily: "var(--wh-display)" }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: WH.body }}>
                    {bodies[i] || "With lots of unique blocks, you can easily build a page without coding."}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full opacity-60" style={{ background: WH.brandSoft }} data-parallax="0.1" />
          <div className="relative overflow-hidden rounded-[32px] border bg-white shadow-[0_30px_80px_-40px_rgba(29,38,58,0.4)]" style={{ borderColor: WH.line }}>
            <img src={slot.image || FALLBACK.value} alt="" className="h-full w-full object-cover" data-parallax="0.05" />
          </div>
        </div>
      </div>
    </Section>
  );
}

function Testimonials({ slot }: { slot: TemplateSlot }) {
  const quotes = list(slot.content, "quotes");
  const authors = list(slot.content, "authors");
  const roles = list(slot.content, "roles");
  return (
    <Section tint>
      <SectionHeading eyebrow="Testimonials" heading={text(slot.content, "heading", "Customers are loving it")} />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {quotes.map((quote, i) => (
          <figure key={i} className="rounded-[28px] border bg-white p-8 shadow-[0_20px_60px_-40px_rgba(29,38,58,0.35)]" style={{ borderColor: WH.line }}>
            <div className="flex items-center gap-1 text-lg" style={{ color: WH.accent }} aria-hidden>
              ★★★★★
            </div>
            <blockquote className="mt-4 text-base leading-relaxed" style={{ color: WH.ink }}>
              “{quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <img src={FALLBACK.team[i % FALLBACK.team.length]} alt="" className="h-11 w-11 rounded-full object-cover" />
              <span>
                <span className="block text-sm font-bold" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
                  {authors[i] || "Happy customer"}
                </span>
                <span className="block text-xs" style={{ color: WH.muted }}>
                  {roles[i] || "Verified client"}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

function ServicesCards({ slot }: { slot: TemplateSlot }) {
  const titles = list(slot.content, "itemTitles", ["Digital Marketing", "Content Writing", "UI Design"]);
  const bodies = list(slot.content, "itemBodies");
  return (
    <Section>
      <SectionHeading eyebrow="Our services" heading={text(slot.content, "heading", "Everything you need to grow")} subheading={text(slot.content, "subheading", "")} />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {titles.map((title, i) => (
          <article key={`${title}-${i}`} className="group overflow-hidden rounded-[28px] border bg-white shadow-[0_20px_60px_-40px_rgba(29,38,58,0.3)]" style={{ borderColor: WH.line }}>
            <div className="h-44 overflow-hidden">
              <img
                src={slot.itemImages[i] || FALLBACK.services[i % FALLBACK.services.length]}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-7">
              <h3 className="text-lg font-bold" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: WH.body }}>
                {bodies[i] || "Professional delivery from a team that cares about your outcome."}
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold" style={{ color: WH.brand, fontFamily: "var(--wh-display)" }}>
                Learn more →
              </span>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function ProcessSteps({ slot }: { slot: TemplateSlot }) {
  const titles = list(slot.content, "stepTitles", ["Discover", "Plan", "Build", "Launch"]);
  const bodies = list(slot.content, "stepBodies");
  return (
    <Section tint>
      <SectionHeading eyebrow="How it works" heading={text(slot.content, "heading", "A simple, proven process")} />
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {titles.map((title, i) => (
          <div key={`${title}-${i}`} className="rounded-[28px] border bg-white p-7 shadow-[0_20px_60px_-40px_rgba(29,38,58,0.3)]" style={{ borderColor: WH.line }}>
            <span className="text-4xl font-extrabold" style={{ fontFamily: "var(--wh-display)", color: WH.brand }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-lg font-bold" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: WH.body }}>
              {bodies[i] || "A clear step in a process built around your goals."}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Pricing({ slot }: { slot: TemplateSlot }) {
  const names = list(slot.content, "planNames", ["Starter", "Growth", "Premium"]);
  const prices = list(slot.content, "planPrices", ["$99", "$299", "$599"]);
  const features = list(slot.content, "planFeatures");
  return (
    <Section>
      <SectionHeading eyebrow="Pricing" heading={text(slot.content, "heading", "Simple, transparent pricing")} subheading={text(slot.content, "subheading", "")} />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {names.map((name, i) => {
          const popular = i === 1 || names.length === 1;
          return (
            <div
              key={`${name}-${i}`}
              className="relative flex flex-col rounded-[28px] border bg-white p-8 shadow-[0_20px_60px_-40px_rgba(29,38,58,0.3)]"
              style={{ borderColor: popular ? WH.brand : WH.line, borderWidth: popular ? 2 : 1 }}
            >
              {popular ? (
                <span className="absolute -top-3 right-6 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: WH.accent, fontFamily: "var(--wh-display)" }}>
                  Popular
                </span>
              ) : null}
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: WH.muted }}>
                {name}
              </p>
              <div className="mt-3 text-5xl font-extrabold tracking-tight" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
                {prices[i] || ""}
              </div>
              <ul className="mt-6 space-y-3 text-sm" style={{ color: WH.body }}>
                {(features[i] || "")
                  .split("\n")
                  .filter(Boolean)
                  .map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] text-white" style={{ background: WH.brand }}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
              </ul>
              <a
                href={pageHref("contact")}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold text-white"
                style={{ background: popular ? WH.brand : WH.cloudburst, fontFamily: "var(--wh-display)" }}
              >
                Get started
              </a>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function Faq({ slot }: { slot: TemplateSlot }) {
  const questions = list(slot.content, "questions");
  const answers = list(slot.content, "answers");
  return (
    <Section>
      <SectionHeading eyebrow="FAQ" heading={text(slot.content, "heading", "Frequently asked questions")} />
      <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-[28px] border bg-white shadow-[0_20px_60px_-40px_rgba(29,38,58,0.3)]" style={{ borderColor: WH.line }}>
        {questions.map((question, i) => (
          <details key={`${question}-${i}`} open={i === 0} className="group border-b px-7 py-5 last:border-b-0" style={{ borderColor: WH.line }}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
              {question}
              <span className="shrink-0 text-2xl leading-none transition-transform group-open:rotate-45" style={{ color: WH.brand }} aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: WH.body }}>
              {answers[i] || ""}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function Contact({ slot, meta }: { slot: TemplateSlot; meta: PageMeta }) {
  const email = text(slot.content, "email", meta.contactEmail);
  const phone = text(slot.content, "phone", meta.contactPhone);
  const address = text(slot.content, "address", "");
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading eyebrow="Contact" heading={text(slot.content, "heading", "Get in touch")} subheading={text(slot.content, "subheading", "")} center={false} />
          <div className="mt-8 space-y-4">
            {email ? <ContactRow label="Email" value={email} /> : null}
            {phone ? <ContactRow label="Phone" value={phone} /> : null}
            {address ? <ContactRow label="Office" value={address} /> : null}
          </div>
        </div>
        <form className="rounded-[28px] border bg-white p-8 shadow-[0_20px_60px_-40px_rgba(29,38,58,0.3)]" style={{ borderColor: WH.line }} data-motion-skip>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: WH.line }} placeholder="Your name" />
            <input className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: WH.line }} placeholder="Email" />
          </div>
          <textarea rows={4} className="mt-4 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: WH.line }} placeholder="How can we help?" />
          <button type="button" className="mt-4 w-full rounded-full py-3 text-sm font-semibold text-white" style={{ background: WH.brand, fontFamily: "var(--wh-display)" }}>
            {text(slot.content, "ctaLabel", "Send message")}
          </button>
        </form>
      </div>
    </Section>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white px-5 py-4" style={{ borderColor: WH.line }}>
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: WH.muted }}>
        {label}
      </div>
      <div className="mt-1 font-medium" style={{ color: WH.mirage }}>
        {value}
      </div>
    </div>
  );
}

function Portfolio({ slot }: { slot: TemplateSlot }) {
  const titles = list(slot.content, "itemTitles");
  const bodies = list(slot.content, "itemBodies");
  const roles = list(slot.content, "roles");
  return (
    <Section>
      <SectionHeading eyebrow="Portfolio" heading={text(slot.content, "heading", "Selected work")} subheading={text(slot.content, "subheading", "")} />
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {titles.map((title, i) => (
          <article key={`${title}-${i}`} className="group overflow-hidden rounded-[28px] border bg-white shadow-[0_20px_60px_-40px_rgba(29,38,58,0.3)]" style={{ borderColor: WH.line }}>
            <div className="h-52 overflow-hidden">
              <img
                src={slot.itemImages[i] || FALLBACK.portfolio[i % FALLBACK.portfolio.length]}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-7">
              {roles[i] ? (
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: WH.brand }}>
                  {roles[i]}
                </span>
              ) : null}
              <h3 className="mt-2 text-lg font-bold" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: WH.body }}>
                {bodies[i] || ""}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function BlogGrid({ slot }: { slot: TemplateSlot }) {
  const titles = list(slot.content, "itemTitles");
  const bodies = list(slot.content, "itemBodies");
  return (
    <Section>
      <SectionHeading eyebrow="Blog" heading={text(slot.content, "heading", "Latest articles")} subheading={text(slot.content, "subheading", "")} />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {titles.map((title, i) => (
          <article key={`${title}-${i}`} className="group overflow-hidden rounded-[28px] border bg-white shadow-[0_20px_60px_-40px_rgba(29,38,58,0.3)]" style={{ borderColor: WH.line }}>
            <div className="h-48 overflow-hidden">
              <img
                src={slot.itemImages[i] || FALLBACK.blog[i % FALLBACK.blog.length]}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-7">
              <h3 className="text-lg font-bold leading-snug" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: WH.body }}>
                {bodies[i] || ""}
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold" style={{ color: WH.brand, fontFamily: "var(--wh-display)" }}>
                Read more →
              </span>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function CtaBanner({ slot }: { slot: TemplateSlot }) {
  return (
    <section className="px-5 py-20 lg:px-8">
      <div
        className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[36px] px-8 py-16 text-center text-white lg:px-16 lg:py-20"
        style={{ background: `linear-gradient(120deg, ${WH.brand}, ${WH.cloudburst})` }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" data-parallax="0.12" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/10" data-parallax="0.08" />
        <h2 className="relative text-3xl font-extrabold tracking-tight lg:text-5xl" style={{ fontFamily: "var(--wh-display)" }}>
          {text(slot.content, "headline", "Ready to get started?")}
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/85">
          {text(slot.content, "subheadline", "Build your next website fast — no credit card necessary.")}
        </p>
        <a
          href={pageHref("contact")}
          className="relative mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold"
          style={{ color: WH.brandDeep, fontFamily: "var(--wh-display)" }}
        >
          {text(slot.content, "ctaPrimary", "Create a free account")}
        </a>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Home hero                                                                  */
/* -------------------------------------------------------------------------- */

function HomeHero({ slot }: { slot: TemplateSlot }) {
  return (
    <section className="relative overflow-hidden" style={{ background: WH.surface }}>
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full opacity-50" style={{ background: WH.brandSoft, filter: "blur(70px)" }} />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full opacity-40" style={{ background: WH.skeptic, filter: "blur(80px)" }} />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div>
          <Eyebrow>{text(slot.content, "eyebrow", "SaaS platform")}</Eyebrow>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight lg:text-6xl" style={{ fontFamily: "var(--wh-display)", color: WH.mirage }}>
            {text(slot.content, "headline", "Get started with your business")}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed" style={{ color: WH.body }}>
            {text(slot.content, "subheadline", "With lots of unique blocks, you can easily build a page without coding. Build your next website fast.")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PrimaryButton href={pageHref("contact")}>{text(slot.content, "ctaPrimary", "Create a free account")} →</PrimaryButton>
            {text(slot.content, "ctaSecondary") ? (
              <a href={pageHref("services")} className="text-sm font-semibold" style={{ color: WH.brandDeep, fontFamily: "var(--wh-display)" }}>
                {text(slot.content, "ctaSecondary")}
              </a>
            ) : null}
          </div>
          <p className="mt-4 text-sm" style={{ color: WH.muted }}>
            No credit card necessary
          </p>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute -left-8 top-8 h-24 w-24 rounded-3xl opacity-80" style={{ background: WH.brand, filter: "blur(2px)" }} data-parallax="0.14" />
          <div className="relative overflow-hidden rounded-[36px] border bg-white shadow-[0_40px_100px_-40px_rgba(23,135,252,0.5)]" style={{ borderColor: WH.line }}>
            <img src={slot.image || FALLBACK.hero} alt={text(slot.content, "headline", "")} className="h-full w-full object-cover" data-parallax="0.05" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Page bodies                                                                */
/* -------------------------------------------------------------------------- */

function HomeBody({ slots, meta }: { slots: TemplateSlot[]; meta: PageMeta }) {
  return (
    <>
      <HomeHero slot={slotAt(slots, "hero")} />
      <FeatureCards slot={slotAt(slots, "features", 0)} />
      <StorySection slot={slotAt(slots, "about")} image={FALLBACK.content} />
      <ValueList slot={slotAt(slots, "features", 1)} />
      <Testimonials slot={slotAt(slots, "testimonials")} />
      <CtaBanner slot={slotAt(slots, "cta")} />
    </>
  );
}

function AboutBody({ slots }: { slots: TemplateSlot[]; meta: PageMeta }) {
  return (
    <>
      <PageHeader slot={slotAt(slots, "hero")} fallbackTitle="About Us" />
      <StorySection slot={slotAt(slots, "about")} image={FALLBACK.about} />
      <FeatureCards slot={slotAt(slots, "features", 0)} />
      <Testimonials slot={slotAt(slots, "testimonials")} />
      <CtaBanner slot={slotAt(slots, "cta")} />
    </>
  );
}

function ServicesBody({ slots }: { slots: TemplateSlot[]; meta: PageMeta }) {
  return (
    <>
      <PageHeader slot={slotAt(slots, "hero")} fallbackTitle="Services" />
      <ServicesCards slot={slotAt(slots, "services")} />
      <ProcessSteps slot={slotAt(slots, "process")} />
      <CtaBanner slot={slotAt(slots, "cta")} />
    </>
  );
}

function PricingBody({ slots }: { slots: TemplateSlot[]; meta: PageMeta }) {
  return (
    <>
      <PageHeader slot={slotAt(slots, "hero")} fallbackTitle="Pricing" />
      <Pricing slot={slotAt(slots, "pricing")} />
      <Faq slot={slotAt(slots, "faq")} />
      <CtaBanner slot={slotAt(slots, "cta")} />
    </>
  );
}

function ContactBody({ slots, meta }: { slots: TemplateSlot[]; meta: PageMeta }) {
  return (
    <>
      <PageHeader slot={slotAt(slots, "hero")} fallbackTitle="Contact" />
      <Contact slot={slotAt(slots, "contact")} meta={meta} />
    </>
  );
}

function FaqBody({ slots }: { slots: TemplateSlot[]; meta: PageMeta }) {
  return (
    <>
      <PageHeader slot={slotAt(slots, "hero")} fallbackTitle="FAQ" />
      <Faq slot={slotAt(slots, "faq")} />
      <CtaBanner slot={slotAt(slots, "cta")} />
    </>
  );
}

function BlogBody({ slots }: { slots: TemplateSlot[]; meta: PageMeta }) {
  return (
    <>
      <PageHeader slot={slotAt(slots, "hero")} fallbackTitle="Blog" />
      <BlogGrid slot={slotAt(slots, "features", 0)} />
      <CtaBanner slot={slotAt(slots, "cta")} />
    </>
  );
}

function PortfolioBody({ slots }: { slots: TemplateSlot[]; meta: PageMeta }) {
  return (
    <>
      <PageHeader slot={slotAt(slots, "hero")} fallbackTitle="Portfolio" />
      <Portfolio slot={slotAt(slots, "portfolio")} />
      <CtaBanner slot={slotAt(slots, "cta")} />
    </>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "W";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
