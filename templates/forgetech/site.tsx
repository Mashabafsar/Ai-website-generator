import { Nunito_Sans, Space_Grotesk } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { FT } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--ft-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

const body = Nunito_Sans({
  subsets: ["latin"],
  variable: "--ft-body",
  weight: ["400", "600", "700"],
  display: "swap",
});

const ASSETS = {
  hero: "/templates/forgetech/hero.jpg",
  about: "/templates/forgetech/about.jpg",
  project: "/templates/forgetech/project.jpg",
} as const;

const NAV = [
  { label: "Home", href: "#ft-top" },
  { label: "About Us", href: "#ft-about" },
  { label: "Our Services", href: "#ft-services" },
  { label: "Projects", href: "#ft-projects" },
  { label: "Insights", href: "#ft-articles" },
  { label: "Contact Us", href: "#ft-contact" },
];

const METRICS = [
  { value: "25+", label: "Years of industry experience" },
  { value: "100K+", label: "Units manufactured annually" },
  { value: "15+", label: "Key industries served worldwide" },
  { value: "90%", label: "On-time delivery rate" },
];

/**
 * The complete ForgeTech design. The layout is locked — content is injected from
 * the blueprint's fixed slots, so AI copy and editor changes can never alter the
 * structure of the page.
 */
export function ForgeTechSite({
  blueprint,
  site,
  contact,
}: {
  blueprint?: WebsiteBlueprint | null;
  site?: AssembledSite | null;
  /** Overrides the persisted details while editing, where nothing is saved yet. */
  contact?: SiteContact | null;
}) {
  const slots = toSlots(blueprint, site);

  const hero = slotAt(slots, "hero");
  const capabilities = slotAt(slots, "features", 0);
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const value = slotAt(slots, "features", 1);
  const testimonials = slotAt(slots, "testimonials");
  const showcase = slotAt(slots, "portfolio");
  const faq = slotAt(slots, "faq");
  const articles = slotAt(slots, "features", 2);
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");

  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "ForgeTech";
  const monogram = initials(businessName);
  // Only a logo the user actually uploaded replaces the template mark; the
  // auto-generated `site.logo` wordmark is never used here.
  const customLogo = site?.theme.logoUrl?.trim() || "";

  const heroImage = hero.image || ASSETS.hero;
  const aboutImage = about.image || ASSETS.about;
  const showcaseImage = showcase.image || showcase.itemImages[0] || ASSETS.project;

  const capabilityTitles = list(capabilities.content, "itemTitles", [
    "Buildings",
    "Civil infrastructure",
    "Multipurpose",
  ]);
  const capabilityBodies = list(capabilities.content, "itemBodies");

  const serviceTitles = list(services.content, "itemTitles", [
    "Custom fabrication",
    "Welding & assembly",
    "Installation",
    "Maintenance",
  ]);
  const serviceBodies = list(services.content, "itemBodies");

  const valueTitles = list(value.content, "itemTitles", [
    "Industry expertise",
    "Uncompromising quality",
    "Modern facilities",
  ]);
  const valueBodies = list(value.content, "itemBodies");

  const quotes = list(testimonials.content, "quotes");
  const authors = list(testimonials.content, "authors");
  const roles = list(testimonials.content, "roles");

  const showcaseTitles = list(showcase.content, "itemTitles");
  const showcaseBodies = list(showcase.content, "itemBodies");

  const questions = list(faq.content, "questions");
  const answers = list(faq.content, "answers");

  const articleTitles = list(articles.content, "itemTitles");
  const articleBodies = list(articles.content, "itemBodies");

  const footerLinks = list(footer.content, "linkLabels", NAV.map((n) => n.label));

  // The design has no contact block, so the real details come from the site's
  // contact record. Never invent an address the business does not own.
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const contactPhone = details?.phone?.trim() || "";

  return (
    <div
      id="ft-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        fontFamily: "var(--ft-body), ui-sans-serif, system-ui, sans-serif",
        color: FT.ink,
        backgroundColor: "#ffffff",
      }}
    >
      {/* Promotion strip */}
      <div
        className="px-4 py-2.5 text-center text-[13px] leading-snug text-white sm:text-sm"
        style={{ backgroundColor: FT.trinidadInk }}
      >
        <strong className="font-semibold" style={{ fontFamily: "var(--ft-display)" }}>
          Now booking next quarter.
        </strong>{" "}
        Talk to {businessName} about your project schedule today.
      </div>

      {/* Utility bar */}
      <div className="border-b px-4 py-3.5 md:px-8" style={{ borderColor: FT.line }}>
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <a href="#ft-top" className="flex items-center gap-3">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-10 w-10 object-contain" />
            ) : (
              <span
                className="grid h-10 w-10 place-items-center text-sm font-bold text-white"
                style={{ backgroundColor: FT.trinidad, fontFamily: "var(--ft-display)" }}
              >
                {monogram}
              </span>
            )}
            <span
              className="text-lg font-bold tracking-tight sm:text-xl"
              style={{ fontFamily: "var(--ft-display)" }}
            >
              {businessName}
            </span>
          </a>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
            {contactEmail && <ContactMeta label="Email us" value={contactEmail} />}
            {contactPhone && <ContactMeta label="Call us" value={contactPhone} />}
            <ContactMeta label="Working hours" value="Mon – Fri · 8am – 7pm" />
          </div>
        </div>
      </div>

      {/* Primary navigation */}
      <div className="border-b px-4 md:px-8" style={{ borderColor: FT.line }}>
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 py-3">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-[var(--ft-accent)]"
                style={{ color: FT.body, ["--ft-accent" as string]: FT.trinidad }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="#ft-contact"
            className="shrink-0 px-5 py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: FT.trinidad, fontFamily: "var(--ft-display)" }}
          >
            Get a quote
          </a>
        </div>
      </div>

      {/* Hero */}
      <section
        className="relative flex min-h-[520px] items-center bg-cover bg-center px-4 py-24 md:min-h-[640px] md:px-8"
        style={{
          backgroundColor: FT.woodsmoke,
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%), url(${heroImage})`,
        }}
      >
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="max-w-2xl text-white">
            <Eyebrow onDark>{text(hero.content, "eyebrow", "Industrial fabrication")}</Eyebrow>
            <h1
              className="mt-4 text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[4rem]"
              style={{ fontFamily: "var(--ft-display)" }}
            >
              {text(hero.content, "headline", "Mastering the art of industrial fabrication")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              {text(
                hero.content,
                "subheadline",
                "Precision engineering and on-time delivery for demanding projects."
              )}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#ft-services"
                className="px-7 py-3.5 text-sm font-semibold text-white"
                style={{ backgroundColor: FT.trinidad, fontFamily: "var(--ft-display)" }}
              >
                {text(hero.content, "ctaPrimary", "Explore services")}
              </a>
              <a
                href="#ft-projects"
                className="border border-white/70 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#131416]"
                style={{ fontFamily: "var(--ft-display)" }}
              >
                See our work
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <Section>
        <SectionHeading
          eyebrow="What we build"
          heading={text(capabilities.content, "heading", "Core industries we serve")}
          subheading={text(capabilities.content, "subheading")}
        />
        <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {capabilityTitles.map((title, i) => (
            <div key={`${title}-${i}`}>
              <span
                className="grid h-14 w-14 place-items-center border-2 text-lg font-bold"
                style={{ borderColor: FT.trinidad, color: FT.trinidad, fontFamily: "var(--ft-display)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className="mt-5 text-xl font-semibold"
                style={{ fontFamily: "var(--ft-display)" }}
              >
                {title}
              </h3>
              <p className="mt-3 leading-relaxed" style={{ color: FT.body }}>
                {capabilityBodies[i] || "Purpose-built fabrication for demanding environments."}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* About & metrics */}
      <section id="ft-about" className="px-4 py-20 md:px-8 md:py-28" style={{ backgroundColor: FT.surface }}>
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>About us</Eyebrow>
              <h2
                className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]"
                style={{ fontFamily: "var(--ft-display)" }}
              >
                {text(
                  about.content,
                  "heading",
                  "Transforming vision into reality through innovation and expertise"
                )}
              </h2>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-base leading-relaxed md:text-lg" style={{ color: FT.body }}>
                {text(about.content, "body", "We deliver industrial fabrication with precision.")}
              </p>
              <a
                href="#ft-services"
                className="mt-8 inline-flex w-fit px-7 py-3.5 text-sm font-semibold text-white"
                style={{ backgroundColor: FT.trinidad, fontFamily: "var(--ft-display)" }}
              >
                What we do
              </a>
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={aboutImage}
            alt=""
            className="mt-14 h-[260px] w-full object-cover sm:h-[380px] lg:h-[520px]"
          />

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((metric) => (
              <div key={metric.label} className="border-t-2 pt-5" style={{ borderColor: FT.trinidad }}>
                <div
                  className="text-4xl font-bold lg:text-5xl"
                  style={{ fontFamily: "var(--ft-display)" }}
                >
                  {metric.value}
                </div>
                <div className="mt-2 text-sm" style={{ color: FT.body }}>
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <Section id="ft-services">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow center>Our services</Eyebrow>
          <h2
            className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]"
            style={{ fontFamily: "var(--ft-display)" }}
          >
            {text(services.content, "heading", "Crafting solutions to meet your unique challenges")}
          </h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: FT.body }}>
            {text(services.content, "subheading", "End-to-end delivery, built around your schedule.")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {serviceTitles.map((title, i) => (
            <article
              key={`${title}-${i}`}
              className="group flex flex-col border bg-white transition-colors hover:border-[color:var(--ft-accent)]"
              style={{ borderColor: FT.line, ["--ft-accent" as string]: FT.trinidad }}
            >
              <div
                className="h-44 bg-cover bg-center"
                style={{
                  backgroundColor: FT.trinidadWash,
                  backgroundImage: services.itemImages[i]
                    ? `url(${services.itemImages[i]})`
                    : `linear-gradient(140deg, ${FT.trinidadWash} 0%, ${FT.trinidad}55 100%)`,
                }}
              />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--ft-display)" }}>
                  {title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: FT.body }}>
                  {serviceBodies[i] || "Professional delivery from shop drawing to final install."}
                </p>
                <span
                  className="mt-6 text-sm font-semibold"
                  style={{ color: FT.trinidad, fontFamily: "var(--ft-display)" }}
                >
                  Learn more →
                </span>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Capability strip */}
      <div className="border-y px-4 py-8 md:px-8" style={{ borderColor: FT.line, backgroundColor: FT.surface }}>
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: FT.muted }}>
            Capabilities
          </span>
          {serviceTitles.slice(0, 5).map((title, i) => (
            <span
              key={`strip-${title}-${i}`}
              className="text-base font-bold uppercase tracking-tight sm:text-lg"
              style={{ fontFamily: "var(--ft-display)", color: `${FT.shark}66` }}
            >
              {title}
            </span>
          ))}
        </div>
      </div>

      {/* Value proposition */}
      <section
        className="px-4 py-20 text-white md:px-8 md:py-28"
        style={{ backgroundColor: FT.woodsmoke }}
      >
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow onDark>Why choose us</Eyebrow>
            <h2
              className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]"
              style={{ fontFamily: "var(--ft-display)" }}
            >
              {text(value.content, "heading", "Experience the difference in quality and service")}
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-white/70">
              {text(
                value.content,
                "subheading",
                "Every project is delivered by people who take the work personally."
              )}
            </p>
            <a
              href="#ft-contact"
              className="mt-9 inline-flex border border-white/70 px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-white hover:text-[#131416]"
              style={{ fontFamily: "var(--ft-display)" }}
            >
              Start a conversation
            </a>
          </div>
          <div className="space-y-4">
            {valueTitles.map((title, i) => (
              <div
                key={`${title}-${i}`}
                className="flex gap-5 border border-white/10 bg-white/[0.04] p-6"
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center text-sm font-bold text-white"
                  style={{ backgroundColor: FT.trinidad, fontFamily: "var(--ft-display)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--ft-display)" }}>
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {valueBodies[i] || "Built for industrial excellence, start to finish."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Section>
        <SectionHeading
          eyebrow="Testimonials"
          heading={text(testimonials.content, "heading", "What our clients say")}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {quotes.map((quote, i) => (
            <blockquote
              key={i}
              className="flex flex-col border p-7"
              style={{ borderColor: FT.line, backgroundColor: FT.surface }}
            >
              <span
                className="text-5xl leading-none"
                style={{ color: FT.trinidad, fontFamily: "var(--ft-display)" }}
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="mt-3 flex-1 leading-relaxed" style={{ color: FT.body }}>
                {quote}
              </p>
              <footer className="mt-7 border-t pt-4" style={{ borderColor: FT.line }}>
                <div className="font-semibold" style={{ fontFamily: "var(--ft-display)" }}>
                  {authors[i] || "Client"}
                </div>
                {roles[i] && (
                  <div className="text-sm" style={{ color: FT.muted }}>
                    {roles[i]}
                  </div>
                )}
              </footer>
            </blockquote>
          ))}
        </div>
      </Section>

      {/* Project showcase */}
      <section
        id="ft-projects"
        className="relative bg-cover bg-center px-4 py-20 md:px-8 md:py-28"
        style={{
          backgroundColor: FT.shark,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.62), rgba(0,0,0,0.62)), url(${showcaseImage})`,
        }}
      >
        <div className="mx-auto max-w-[1400px] text-white">
          <Eyebrow onDark>Our projects</Eyebrow>
          <h2
            className="mt-4 max-w-2xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]"
            style={{ fontFamily: "var(--ft-display)" }}
          >
            {text(showcase.content, "heading", "Examples of our work across industries")}
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {showcaseTitles.map((title, i) => (
              <article key={`${title}-${i}`} className="bg-black/45 p-7 backdrop-blur-sm">
                <span
                  className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: FT.trinidad }}
                >
                  {roles[i] || "Case study"}
                </span>
                <h3 className="mt-5 text-xl font-semibold" style={{ fontFamily: "var(--ft-display)" }}>
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {showcaseBodies[i] || "Delivered on schedule and to specification."}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <Eyebrow>FAQs</Eyebrow>
            <h2
              className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3rem]"
              style={{ fontFamily: "var(--ft-display)" }}
            >
              {text(faq.content, "heading", "Have questions? We have answers")}
            </h2>
          </div>
          <div className="border-t" style={{ borderColor: FT.line }}>
            {questions.map((question, i) => (
              <details
                key={`${question}-${i}`}
                open={i === 0}
                className="group border-b"
                style={{ borderColor: FT.line }}
              >
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold transition-colors group-open:text-[color:var(--ft-accent)] sm:text-lg"
                  style={{ fontFamily: "var(--ft-display)", ["--ft-accent" as string]: FT.trinidad }}
                >
                  {question}
                  <span
                    className="shrink-0 text-2xl leading-none transition-transform group-open:rotate-45"
                    style={{ color: FT.trinidad }}
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="pb-5 pr-10 leading-relaxed" style={{ color: FT.body }}>
                  {answers[i] || "Get in touch and we will walk you through the details."}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* Articles */}
      {articleTitles.length > 0 && (
        <section id="ft-articles" className="px-4 py-20 md:px-8 md:py-28" style={{ backgroundColor: FT.surface }}>
          <div className="mx-auto max-w-[1400px]">
            <SectionHeading
              eyebrow="Insights"
              heading={text(articles.content, "heading", "Latest from the workshop")}
              subheading={text(articles.content, "subheading")}
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {articleTitles.slice(0, 3).map((title, i) => (
                <article key={`${title}-${i}`} className="flex flex-col bg-white">
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${
                        articles.itemImages[i] || [ASSETS.hero, ASSETS.about, ASSETS.project][i % 3]
                      })`,
                    }}
                  />
                  <div className="flex flex-1 flex-col border border-t-0 p-6" style={{ borderColor: FT.line }}>
                    <h3 className="text-lg font-semibold leading-snug" style={{ fontFamily: "var(--ft-display)" }}>
                      {title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: FT.body }}>
                      {articleBodies[i] || ""}
                    </p>
                    <span
                      className="mt-6 text-sm font-semibold"
                      style={{ color: FT.trinidad, fontFamily: "var(--ft-display)" }}
                    >
                      Read article →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section
        id="ft-contact"
        className="px-4 py-20 text-center text-white md:px-8"
        style={{ backgroundColor: FT.trinidad }}
      >
        <div className="mx-auto max-w-3xl">
          <h2
            className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]"
            style={{ fontFamily: "var(--ft-display)" }}
          >
            {text(cta.content, "headline", "Have a project in mind?")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/90">
            {text(cta.content, "subheadline", "Tell us about the scope, schedule, and location.")}
          </p>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#ft-top"}
            className="mt-9 inline-flex bg-white px-8 py-4 text-sm font-semibold transition-colors hover:bg-[#fff3e8]"
            style={{ color: FT.trinidadInk, fontFamily: "var(--ft-display)" }}
          >
            {text(cta.content, "ctaPrimary", "Contact us")}
          </a>
          {(contactEmail || contactPhone) && (
            <p className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-white/90">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="underline-offset-4 hover:underline">
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="underline-offset-4 hover:underline">
                  {contactPhone}
                </a>
              )}
            </p>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 py-16 md:px-8" style={{ backgroundColor: FT.shark }}>
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg text-white">
            <h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--ft-display)" }}>
              Stay in the loop
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Project updates, capability news, and practical guidance from the{" "}
              {businessName} team. No noise.
            </p>
          </div>
          <div className="flex w-full max-w-md gap-3">
            <label className="sr-only" htmlFor="ft-newsletter">
              Email address
            </label>
            <input
              id="ft-newsletter"
              type="email"
              placeholder="you@company.com"
              className="min-w-0 flex-1 border border-white/20 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none"
            />
            <button
              type="button"
              className="shrink-0 px-6 py-3.5 text-sm font-semibold text-white"
              style={{ backgroundColor: FT.trinidad, fontFamily: "var(--ft-display)" }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-14 text-white md:px-8" style={{ backgroundColor: FT.woodsmoke }}>
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                {customLogo ? (
                  <img src={customLogo} alt="" className="h-10 w-10 object-contain" />
                ) : (
                  <span
                    className="grid h-10 w-10 place-items-center text-sm font-bold text-white"
                    style={{ backgroundColor: FT.trinidad, fontFamily: "var(--ft-display)" }}
                  >
                    {monogram}
                  </span>
                )}
                <span className="text-lg font-bold" style={{ fontFamily: "var(--ft-display)" }}>
                  {businessName}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                {text(footer.content, "tagline", "Industrial fabrication you can rely on.")}
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
              {footerLinks.map((label, i) => (
                <span key={`${label}-${i}`}>{label}</span>
              ))}
            </nav>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/45">
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1400px]">{children}</div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  heading,
  subheading,
}: {
  eyebrow: string;
  heading: string;
  subheading?: string;
}) {
  return (
    <div className="max-w-3xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]"
        style={{ fontFamily: "var(--ft-display)" }}
      >
        {heading}
      </h2>
      {subheading && (
        <p className="mt-5 text-base leading-relaxed" style={{ color: FT.body }}>
          {subheading}
        </p>
      )}
    </div>
  );
}

function Eyebrow({
  children,
  onDark,
  center,
}: {
  children: React.ReactNode;
  onDark?: boolean;
  center?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] ${
        center ? "justify-center" : ""
      }`}
      style={{ color: onDark ? "#FFB877" : FT.trinidad, fontFamily: "var(--ft-display)" }}
    >
      <span className="h-px w-6" style={{ backgroundColor: "currentColor" }} aria-hidden />
      {children}
    </span>
  );
}

function ContactMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider" style={{ color: FT.muted }}>
        {label}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
