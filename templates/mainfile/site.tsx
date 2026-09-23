import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { MR, MR_GRADIENTS, MR_BRAND_GRADIENT, MR_ICON_PATHS } from "./tokens";
import { list, slotAt, text, toSlots, pageSlugsOf, type TemplateSlot } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { templateFaces } from "../shared/template-faces";
import { IconGlyph } from "@/lib/icons/glyph";
import { isIconName } from "@/lib/icons/registry";

const faces = templateFaces([
  { family: "Hind", variable: "--mr-display", weights: ["400", "500", "600", "700"] },
  { family: "Open Sans", variable: "--mr-body", weights: ["400", "600", "700"] },
]);

const FALLBACK = {
  hero: "/templates/mainfile/hero.jpg",
  content: "/templates/mainfile/content.jpg",
  value: "/templates/mainfile/value.jpg",
  about: "/templates/mainfile/about.jpg",
  team: [
    "/templates/mainfile/team-1.png",
    "/templates/mainfile/team-2.png",
    "/templates/mainfile/team-3.png",
    "/templates/mainfile/team-4.png",
  ],
  services: [
    "/templates/mainfile/service-1.jpg",
    "/templates/mainfile/service-2.jpg",
    "/templates/mainfile/service-3.jpg",
  ],
  portfolio: [
    "/templates/mainfile/portfolio-1.jpg",
    "/templates/mainfile/portfolio-2.jpg",
    "/templates/mainfile/portfolio-3.jpg",
    "/templates/mainfile/portfolio-4.jpg",
    "/templates/mainfile/portfolio-5.jpg",
    "/templates/mainfile/portfolio-6.jpg",
  ],
  blog: ["/templates/mainfile/blog-1.jpg", "/templates/mainfile/blog-2.jpg", "/templates/mainfile/blog-3.jpg"],
} as const;

/**
 * The complete Mraval design — a colorful, gradient-forward creative/app-landing
 * look with a lavender hero, playful multicolor icon tiles, pill buttons and
 * floating gradient blobs. Multi-page: `pageSlug` picks which catalog page to
 * render, and the header links between the generated pages. Every page reads its
 * copy from the locked blueprint slots, so AI copy and editor changes can never
 * alter the structure.
 */
export function MainfileSite({
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
    "Mraval";
  const customLogo = site?.theme?.logoUrl?.trim() || "";

  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const contactPhone = details?.phone?.trim() || "";

  return (
    <div
      className={`scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#7DBCFF"),
        ...faces.style,
        fontFamily: "var(--mr-body), ui-sans-serif, system-ui, sans-serif",
        color: MR.body,
        backgroundColor: MR.white,
        ...themeFontStyle(site?.theme, ["--mr-display", "--mr-body"]),
      }}
    >
      <link rel="stylesheet" href={faces.href} />
      {themeFontHref(site?.theme) ? (
        <link rel="stylesheet" href={themeFontHref(site?.theme)!} />
      ) : null}
      <Header pages={pages} active={active} businessName={businessName} customLogo={customLogo} />

      <main className="overflow-x-clip">{renderPageBody(active, slots, { businessName, contactEmail, contactPhone })}</main>

      <Footer
        pages={pages}
        businessName={businessName}
        customLogo={customLogo}
        tagline={text(footer.content, "tagline", "A creative studio crafting colorful brands, apps, and landing pages.")}
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

function Logo({ businessName, customLogo, light }: { businessName: string; customLogo: string; light?: boolean }) {
  return (
    <a href={pageHref("home")} className="flex items-center gap-2.5">
      {customLogo ? (
        <img src={customLogo} alt="" className="h-9 w-9 rounded-2xl object-contain" />
      ) : (
        <span
          className="grid h-9 w-9 place-items-center rounded-2xl text-sm font-bold text-white"
          style={{ backgroundImage: MR_BRAND_GRADIENT, fontFamily: "var(--mr-display)" }}
        >
          {initials(businessName)}
        </span>
      )}
      <span
        className="text-2xl font-bold tracking-tight"
        style={{ fontFamily: "var(--mr-display)", color: light ? MR.white : MR.ink }}
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
}: {
  pages: { slug: string; title: string }[];
  active: string;
  businessName: string;
  customLogo: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ borderColor: MR.line, backgroundColor: MR.white }}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Logo businessName={businessName} customLogo={customLogo} />

        <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex" style={{ fontFamily: "var(--mr-display)" }}>
          {pages.map((p) => (
            <a
              key={p.slug}
              href={pageHref(p.slug)}
              className="transition-colors"
              style={{ color: p.slug === active ? MR.brandStrong : MR.ink }}
            >
              {p.title}
            </a>
          ))}
        </nav>

        <a
          href={pageHref("contact")}
          className="hidden rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg sm:inline-flex"
          style={{ backgroundImage: MR_BRAND_GRADIENT, fontFamily: "var(--mr-display)", boxShadow: "0 10px 20px -8px rgba(125,188,255,0.6)" }}
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
    <footer className="relative overflow-hidden pt-20 text-white" style={{ backgroundColor: MR.inverse }}>
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-40" style={{ backgroundImage: MR_BRAND_GRADIENT, filter: "blur(90px)" }} />
      <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full opacity-30" style={{ background: MR.violet, filter: "blur(90px)" }} />
      <div className="relative mx-auto max-w-[1200px] px-5 pb-10 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
          <div className="max-w-sm">
            <Logo businessName={businessName} customLogo={customLogo} light />
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/50" style={{ fontFamily: "var(--mr-display)" }}>
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/50" style={{ fontFamily: "var(--mr-display)" }}>
              Sign up for our newsletter
            </h3>
            <p className="mt-4 text-sm text-white/70">Subscribe to always stay in touch and get the latest news.</p>
            <form className="mt-4 flex gap-2" data-motion-skip>
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button type="button" className="rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundImage: MR_BRAND_GRADIENT, fontFamily: "var(--mr-display)" }}>
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
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em]"
      style={{ background: MR.brandSoft, color: MR.brandStrong, fontFamily: "var(--mr-display)" }}
    >
      {children}
    </span>
  );
}

function IconTile({ index, icon }: { index: number; icon?: string }) {
  return (
    <span
      className="grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg"
      style={{ backgroundImage: MR_GRADIENTS[index % MR_GRADIENTS.length], boxShadow: "0 14px 30px -12px rgba(52,49,75,0.35)" }}
    >
      {isIconName(icon) ? (
        <IconGlyph name={icon} className="h-8 w-8" strokeWidth={1.7} />
      ) : (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={MR_ICON_PATHS[index % MR_ICON_PATHS.length]} />
        </svg>
      )}
    </span>
  );
}

function PageHeader({ slot, fallbackTitle }: { slot: TemplateSlot; fallbackTitle: string }) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: MR.heroBg, ...sectionBandStyle(slot.theme) }}>
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-50" style={{ backgroundImage: MR_BRAND_GRADIENT, filter: "blur(70px)" }} data-parallax="0.1" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full opacity-40" style={{ background: MR.violet, filter: "blur(80px)" }} />
      <div className="relative mx-auto max-w-[1200px] px-5 py-20 text-center lg:px-8 lg:py-28">
        <Eyebrow>{text(slot.content, "eyebrow", fallbackTitle)}</Eyebrow>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight lg:text-6xl" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
          {text(slot.content, "headline", fallbackTitle)}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: MR.body }}>
          {text(slot.content, "subheadline", "")}
        </p>
      </div>
    </section>
  );
}

function Section({
  children,
  tint,
  theme,
}: {
  children: React.ReactNode;
  tint?: boolean;
  theme?: import("@/lib/blueprint/types").SectionTheme;
}) {
  return (
    <section
      className="px-5 py-20 lg:px-8 lg:py-24"
      style={{ ...(tint ? { background: MR.surface } : {}), ...sectionBandStyle(theme) }}
    >
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </section>
  );
}

function SectionHeading({ eyebrow, heading, subheading, center = true }: { eyebrow?: string; heading: string; subheading?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 text-3xl font-bold tracking-tight lg:text-5xl" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
        {heading}
      </h2>
      {subheading ? (
        <p className="mt-4 text-lg leading-relaxed" style={{ color: MR.body }}>
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
      style={{ backgroundImage: MR_BRAND_GRADIENT, fontFamily: "var(--mr-display)", boxShadow: "0 14px 26px -10px rgba(125,188,255,0.7)" }}
    >
      {children}
    </a>
  );
}

function FeatureCards({ slot, startIndex = 0 }: { slot: TemplateSlot; startIndex?: number }) {
  const titles = list(slot.content, "itemTitles", ["Responsive design", "Well documented", "Easy to change"]);
  const bodies = list(slot.content, "itemBodies");
  const heading = text(slot.content, "heading", "");
  const subheading = text(slot.content, "subheading", "");
  return (
    <Section theme={slot.theme}>
      {heading ? <SectionHeading heading={heading} subheading={subheading} /> : null}
      <div className={`grid gap-6 md:grid-cols-3 ${heading ? "mt-14" : ""}`}>
        {titles.map((title, i) => (
          <article
            key={`${title}-${i}`}
            className="rounded-[28px] border p-8 text-center transition-transform"
            style={{ borderColor: MR.line, backgroundColor: MR.card, boxShadow: "0 24px 60px -34px rgba(52,49,75,0.28)" }}
          >
            <div className="mx-auto w-16">
              <IconTile index={startIndex + i} icon={slot.icons[i]} />
            </div>
            <h3 className="mt-6 text-xl font-bold" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
              {title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: MR.body }}>
              {bodies[i] || "Beautifully crafted blocks you can restyle and reorder without touching code."}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function StorySection({ slot, image, flip }: { slot: TemplateSlot; image: string; flip?: boolean }) {
  return (
    <Section tint theme={slot.theme}>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className={flip ? "lg:order-2" : ""}>
          <div className="relative">
            <div className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-3xl opacity-80" style={{ backgroundImage: MR_GRADIENTS[1] }} data-parallax="0.08" />
            <div className="relative overflow-hidden rounded-[32px] border shadow-[0_30px_80px_-40px_rgba(52,49,75,0.4)]" style={{ borderColor: MR.line, backgroundColor: MR.card }}>
              <img src={slot.image || image} alt={text(slot.content, "heading", "")} className="h-full w-full object-cover" data-parallax="0.06" />
            </div>
          </div>
        </div>
        <div className={flip ? "lg:order-1" : ""}>
          <Eyebrow>{text(slot.content, "eyebrow", "Elements design")}</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight lg:text-5xl" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
            {text(slot.content, "heading", "Impressive elements for every idea")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: MR.body }}>
            {text(slot.content, "body", "Build something impressive in an afternoon, not a month.")}
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
  const titles = list(slot.content, "itemTitles", ["Responsive web", "High quality design", "Cool animations"]);
  const bodies = list(slot.content, "itemBodies");
  return (
    <Section theme={slot.theme}>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 lg:order-1">
          <div className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full opacity-70" style={{ backgroundImage: MR_GRADIENTS[3] }} data-parallax="0.1" />
          <div className="relative overflow-hidden rounded-[32px] border shadow-[0_30px_80px_-40px_rgba(52,49,75,0.4)]" style={{ borderColor: MR.line, backgroundColor: MR.card }}>
            <img src={slot.image || FALLBACK.value} alt="" className="h-full w-full object-cover" data-parallax="0.05" />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Why choose me"
            heading={text(slot.content, "heading", "Design helps creators do more")}
            subheading={text(slot.content, "subheading", "")}
            center={false}
          />
          <ul className="mt-8 space-y-6">
            {titles.map((title, i) => (
              <li key={`${title}-${i}`} className="flex gap-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white" style={{ backgroundImage: MR_GRADIENTS[i % MR_GRADIENTS.length], fontFamily: "var(--mr-display)" }}>
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: MR.body }}>
                    {bodies[i] || "Tasteful detail that brings your story to life."}
                  </p>
                </div>
              </li>
            ))}
          </ul>
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
    <Section tint theme={slot.theme}>
      <SectionHeading eyebrow="Testimonials" heading={text(slot.content, "heading", "What our clients say")} />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {quotes.map((quote, i) => (
          <figure key={i} className="rounded-[28px] border p-8 shadow-[0_20px_60px_-40px_rgba(52,49,75,0.35)]" style={{ borderColor: MR.line, backgroundColor: MR.card }}>
            <div className="flex items-center gap-1 text-lg" style={{ color: "#FFC187" }} aria-hidden>
              ★★★★★
            </div>
            <blockquote className="mt-4 text-base leading-relaxed" style={{ color: MR.ink }}>
              “{quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <img src={FALLBACK.team[i % FALLBACK.team.length]} alt="" className="h-11 w-11 rounded-full object-cover" />
              <span>
                <span className="block text-sm font-bold" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
                  {authors[i] || "Happy client"}
                </span>
                <span className="block text-xs" style={{ color: MR.muted }}>
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
  const titles = list(slot.content, "itemTitles", ["Brand & identity", "UI / UX design", "Web & app build"]);
  const bodies = list(slot.content, "itemBodies");
  return (
    <Section theme={slot.theme}>
      <SectionHeading eyebrow="Our services" heading={text(slot.content, "heading", "Everything you need to grow")} subheading={text(slot.content, "subheading", "")} />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {titles.map((title, i) => (
          <article key={`${title}-${i}`} className="group overflow-hidden rounded-[28px] border shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style={{ borderColor: MR.line, backgroundColor: MR.card }}>
            <div className="h-44 overflow-hidden">
              <img
                src={slot.itemImages[i] || FALLBACK.services[i % FALLBACK.services.length]}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-7">
              <h3 className="text-lg font-bold" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: MR.body }}>
                {bodies[i] || "Professional delivery from a team that cares about your outcome."}
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold" style={{ color: MR.brandStrong, fontFamily: "var(--mr-display)" }}>
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
  const titles = list(slot.content, "stepTitles", ["Discover", "Design", "Build", "Launch"]);
  const bodies = list(slot.content, "stepBodies");
  return (
    <Section tint theme={slot.theme}>
      <SectionHeading eyebrow="How it works" heading={text(slot.content, "heading", "A simple, proven process")} />
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {titles.map((title, i) => (
          <div key={`${title}-${i}`} className="rounded-[28px] border p-7 shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style={{ borderColor: MR.line, backgroundColor: MR.card }}>
            <span
              className="inline-block bg-clip-text text-4xl font-bold text-transparent"
              style={{ backgroundImage: MR_GRADIENTS[i % MR_GRADIENTS.length], fontFamily: "var(--mr-display)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-lg font-bold" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: MR.body }}>
              {bodies[i] || "A clear step in a process built around your goals."}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Pricing({ slot }: { slot: TemplateSlot }) {
  const names = list(slot.content, "planNames", ["Starter", "Professional", "Business"]);
  const features = list(slot.content, "planFeatures");
  return (
    <Section theme={slot.theme}>
      <SectionHeading eyebrow="Pricing" heading={text(slot.content, "heading", "Simple, transparent pricing")} subheading={text(slot.content, "subheading", "")} />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {names.map((name, i) => {
          const popular = i === 1 || names.length === 1;
          return (
            <div
              key={`${name}-${i}`}
              className="relative flex flex-col overflow-hidden rounded-[28px] border p-8 shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]"
              style={{ borderColor: popular ? "transparent" : MR.line, borderWidth: popular ? 0 : 1, backgroundColor: MR.card }}
            >
              {popular ? (
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1.5" style={{ backgroundImage: MR_BRAND_GRADIENT }} />
              ) : null}
              {popular ? (
                <span className="absolute -top-0 right-6 mt-4 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundImage: MR_GRADIENTS[3], fontFamily: "var(--mr-display)" }}>
                  Popular
                </span>
              ) : null}
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: MR.muted }}>
                {name}
              </p>
              <ul className="mt-6 space-y-3 text-sm" style={{ color: MR.body }}>
                {(features[i] || "")
                  .split("\n")
                  .filter(Boolean)
                  .map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] text-white" style={{ backgroundImage: MR_BRAND_GRADIENT }}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
              </ul>
              <a
                href={pageHref("contact")}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold"
                style={
                  popular
                    ? { backgroundImage: MR_BRAND_GRADIENT, color: MR.white, fontFamily: "var(--mr-display)" }
                    : { background: MR.ink, color: MR.white, fontFamily: "var(--mr-display)" }
                }
              >
                Contact our sales
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
    <Section theme={slot.theme}>
      <SectionHeading eyebrow="FAQ" heading={text(slot.content, "heading", "Frequently asked questions")} />
      <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-[28px] border shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style={{ borderColor: MR.line, backgroundColor: MR.card }}>
        {questions.map((question, i) => (
          <details key={`${question}-${i}`} open={i === 0} className="group border-b px-7 py-5 last:border-b-0" style={{ borderColor: MR.line }}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
              {question}
              <span className="shrink-0 text-2xl leading-none transition-transform group-open:rotate-45" style={{ color: MR.brandStrong }} aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: MR.body }}>
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
    <Section theme={slot.theme}>
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading eyebrow="Contact" heading={text(slot.content, "heading", "Get in touch")} subheading={text(slot.content, "subheading", "")} center={false} />
          <div className="mt-8 space-y-4">
            {email ? <ContactRow label="Email" value={email} /> : null}
            {phone ? <ContactRow label="Phone" value={phone} /> : null}
            {address ? <ContactRow label="Office" value={address} /> : null}
          </div>
        </div>
        <form className="rounded-[28px] border p-8 shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style={{ borderColor: MR.line, backgroundColor: MR.card }} data-motion-skip>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: MR.line }} placeholder="Your name" />
            <input className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: MR.line }} placeholder="Email" />
          </div>
          <textarea rows={4} className="mt-4 w-full rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: MR.line }} placeholder="How can we help?" />
          <button type="button" className="mt-4 w-full rounded-full py-3 text-sm font-semibold text-white" style={{ backgroundImage: MR_BRAND_GRADIENT, fontFamily: "var(--mr-display)" }}>
            {text(slot.content, "ctaLabel", "Send message")}
          </button>
        </form>
      </div>
    </Section>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border px-5 py-4" style={{ borderColor: MR.line, backgroundColor: MR.card }}>
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: MR.muted }}>
        {label}
      </div>
      <div className="mt-1 font-medium" style={{ color: MR.ink }}>
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
    <Section theme={slot.theme}>
      <SectionHeading eyebrow="Portfolio" heading={text(slot.content, "heading", "Our recent projects")} subheading={text(slot.content, "subheading", "")} />
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {titles.map((title, i) => (
          <article key={`${title}-${i}`} className="group overflow-hidden rounded-[28px] border shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style={{ borderColor: MR.line, backgroundColor: MR.card }}>
            <div className="h-52 overflow-hidden">
              <img
                src={slot.itemImages[i] || FALLBACK.portfolio[i % FALLBACK.portfolio.length]}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-7">
              {roles[i] ? (
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: MR.brandStrong }}>
                  {roles[i]}
                </span>
              ) : null}
              <h3 className="mt-2 text-lg font-bold" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: MR.body }}>
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
    <Section theme={slot.theme}>
      <SectionHeading eyebrow="Blog" heading={text(slot.content, "heading", "Latest articles")} subheading={text(slot.content, "subheading", "")} />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {titles.map((title, i) => (
          <article key={`${title}-${i}`} className="group overflow-hidden rounded-[28px] border shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style={{ borderColor: MR.line, backgroundColor: MR.card }}>
            <div className="h-48 overflow-hidden">
              <img
                src={slot.itemImages[i] || FALLBACK.blog[i % FALLBACK.blog.length]}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-7">
              <h3 className="text-lg font-bold leading-snug" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: MR.body }}>
                {bodies[i] || ""}
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold" style={{ color: MR.brandStrong, fontFamily: "var(--mr-display)" }}>
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
        className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[36px] px-8 py-16 text-center text-white lg:px-16 lg:py-20"
        style={{ backgroundImage: MR_BRAND_GRADIENT }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15" data-parallax="0.12" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/10" data-parallax="0.08" />
        <h2 className="relative text-3xl font-bold tracking-tight lg:text-5xl" style={{ fontFamily: "var(--mr-display)" }}>
          {text(slot.content, "headline", "Let's discover the multipurpose Mraval")}
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/90">
          {text(slot.content, "subheadline", "All that you need to create your creative website. Start enjoying your creativity today.")}
        </p>
        <a
          href={pageHref("contact")}
          className="relative mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold"
          style={{ color: MR.brandStrong, fontFamily: "var(--mr-display)" }}
        >
          {text(slot.content, "ctaPrimary", "Purchase now")}
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
    <section className="relative overflow-hidden" style={{ backgroundColor: MR.heroBg }}>
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full opacity-50" style={{ backgroundImage: MR_BRAND_GRADIENT, filter: "blur(70px)" }} />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full opacity-40" style={{ background: MR.violet, filter: "blur(90px)" }} />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div>
          <Eyebrow>{text(slot.content, "eyebrow", "Creative studio")}</Eyebrow>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight lg:text-6xl" style={{ fontFamily: "var(--mr-display)", color: MR.ink }}>
            {text(slot.content, "headline", "Creative app & landing page studio")}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed" style={{ color: MR.body }}>
            {text(slot.content, "subheadline", "We design colorful brands, apps, and landing pages that help creators do more of what they love.")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PrimaryButton href={pageHref("contact")}>{text(slot.content, "ctaPrimary", "Learn more")}</PrimaryButton>
            {text(slot.content, "ctaSecondary") ? (
              <a href={pageHref("services")} className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: MR.ink, fontFamily: "var(--mr-display)" }}>
                <span className="grid h-9 w-9 place-items-center rounded-full text-white" style={{ backgroundImage: MR_GRADIENTS[2] }} aria-hidden>
                  ▶
                </span>
                {text(slot.content, "ctaSecondary")}
              </a>
            ) : null}
          </div>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute -left-8 top-8 h-24 w-24 rounded-3xl opacity-80" style={{ backgroundImage: MR_GRADIENTS[4] }} data-parallax="0.14" />
          <div className="relative overflow-hidden rounded-[36px] border shadow-[0_40px_100px_-40px_rgba(125,188,255,0.6)]" style={{ borderColor: MR.line, backgroundColor: MR.card }}>
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

function HomeBody({ slots }: { slots: TemplateSlot[]; meta: PageMeta }) {
  return (
    <>
      <HomeHero slot={slotAt(slots, "hero")} />
      <FeatureCards slot={slotAt(slots, "features", 0)} startIndex={0} />
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
      <FeatureCards slot={slotAt(slots, "features", 0)} startIndex={0} />
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
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
