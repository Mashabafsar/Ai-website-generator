import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { SL, SL_FEATURE_COLORS, SL_ICON_PATHS } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { IconGlyph } from "@/lib/icons/glyph";
import { isIconName } from "@/lib/icons/registry";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--sl-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--sl-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const HERO_FALLBACK = "/templates/saasldg/hero.jpg";
const AVATARS = [
  "/templates/saasldg/avatar-1.png",
  "/templates/saasldg/avatar-2.png",
  "/templates/saasldg/avatar-3.png",
];

const NAV = [
  { label: "Features", href: "#sl-features" },
  { label: "Pricing", href: "#sl-pricing" },
  { label: "FAQ", href: "#sl-faq" },
  { label: "Reviews", href: "#sl-reviews" },
];

// The client strip uses neutral wordmarks rather than third-party brand logos,
// so the design ships cleanly without borrowing anyone's trademark.
const CLIENTS = ["Northwind", "Lumina", "Vertex", "Cascade", "Monarch", "Aerolab"];

/**
 * The complete Stratus design — a clean, cloud-blue SaaS landing with a big
 * product screenshot, soft rounded cards and a bright blue accent. Single-page:
 * every band reads its copy from the locked blueprint slots, so AI copy and
 * editor changes can never alter the structure of the page.
 */
export function SaasLandingSite({
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
  const features = slotAt(slots, "features");
  const pricing = slotAt(slots, "pricing");
  const faq = slotAt(slots, "faq");
  const testimonials = slotAt(slots, "testimonials");
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");

  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "Stratus";
  const monogram = initials(businessName);
  const customLogo = site?.theme.logoUrl?.trim() || "";

  const heroImage = hero.image || HERO_FALLBACK;

  const featureTitles = list(features.content, "itemTitles", [
    "Scalable infrastructure",
    "Real-time analytics",
    "Advanced security",
    "Intuitive interface",
    "24/7 support",
    "Automated workflows",
  ]);
  const featureBodies = list(features.content, "itemBodies");

  const planNames = list(pricing.content, "planNames", ["Personal", "Pro", "Enterprise"]);
  const planPrices = list(pricing.content, "planPrices", ["$19", "$39", "$79"]);
  const planFeatures = list(pricing.content, "planFeatures");
  const popularIndex = planNames.length > 2 ? 1 : planNames.length - 1;

  const questions = list(faq.content, "questions");
  const answers = list(faq.content, "answers");

  const quotes = list(testimonials.content, "quotes");
  const authors = list(testimonials.content, "authors");
  const roles = list(testimonials.content, "roles");

  const footerLinks = list(footer.content, "linkLabels", NAV.map((n) => n.label));

  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";

  return (
    <div
      id="sl-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#2A85FF"),
        fontFamily: "var(--sl-body), ui-sans-serif, system-ui, sans-serif",
        color: SL.ink,
        backgroundColor: SL.white,
        ...themeFontStyle(site?.theme, ["--sl-display", "--sl-body"]),
      }}
    >
      {themeFontHref(site?.theme) ? (
        <link rel="stylesheet" href={themeFontHref(site?.theme)!} />
      ) : null}
      {/* Announcement strip */}
      <div
        className="px-4 py-2.5 text-center text-[13px] font-medium leading-snug text-white sm:text-sm"
        style={{ backgroundColor: SL.dark }}
      >
        <span className="font-semibold" style={{ fontFamily: "var(--sl-display)" }}>
          New —
        </span>{" "}
        {businessName} automations now launch in minutes, not weeks.
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur" style={{ borderColor: SL.line }}>
        <div className="mx-auto flex max-w-[80rem] items-center gap-4 px-6 py-4 lg:px-6">
          <a href="#sl-top" className="mr-auto flex items-center gap-2.5">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 rounded-xl object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: SL.brand, fontFamily: "var(--sl-display)" }}
              >
                {monogram}
              </span>
            )}
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--sl-display)" }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-[color:var(--sl-accent)]"
                style={{ color: SL.body, ["--sl-accent" as string]: SL.brand }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="#sl-pricing"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: SL.brand, fontFamily: "var(--sl-display)" }}
          >
            Get started free
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        className="mx-4 mt-6 rounded-[2rem] border px-5 pt-16 sm:mx-6 md:pt-20"
        style={{ backgroundColor: SL.surface, borderColor: SL.line, ...sectionBandStyle(hero.theme) }}
      >
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Eyebrow center>{text(hero.content, "eyebrow", "Cloud workspace")}</Eyebrow>
          <h1
            className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--sl-display)" }}
          >
            {text(hero.content, "headline", "Unleash and transform your business potential")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: SL.body }}>
            {text(
              hero.content,
              "subheadline",
              "Empower your team, streamline workflows, and scale your operations effortlessly with our intuitive cloud-based platform."
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#sl-pricing"
              className="rounded-full px-7 py-3.5 text-sm font-semibold text-white"
              style={{ backgroundColor: SL.brand, fontFamily: "var(--sl-display)" }}
            >
              {text(hero.content, "ctaPrimary", "Start free trial")}
            </a>
            <a
              href="#sl-features"
              className="rounded-full border px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-white"
              style={{ borderColor: SL.line, color: SL.ink, fontFamily: "var(--sl-display)" }}
            >
              {text(hero.content, "ctaSecondary", "Book a demo")}
            </a>
          </div>
          <p className="mt-4 text-sm" style={{ color: SL.muted }}>
            No credit card required
          </p>
        </div>
        <div className="mx-auto max-w-5xl overflow-hidden rounded-t-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            data-parallax="0.08"
            className="w-full translate-y-2 rounded-t-2xl border border-b-0 object-cover"
            style={{ borderColor: SL.line }}
          />
        </div>
      </section>

      {/* Client strip */}
      <section className="px-6 py-16 md:py-20">
        <p className="text-center text-base font-medium" style={{ color: SL.body }}>
          Trusted by fast-growing teams
        </p>
        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {CLIENTS.map((name) => (
            <span
              key={name}
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--sl-display)", color: SL.muted }}
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="sl-features" className="px-6 py-8 md:py-12" style={sectionBandStyle(features.theme)}>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow center>Features</Eyebrow>
          <h2
            className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--sl-display)" }}
          >
            {text(features.content, "heading", "Everything you need to run faster")}
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: SL.body }}>
            {text(
              features.content,
              "subheading",
              "Empowering your business with cutting-edge tools and functionalities."
            )}
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureTitles.map((title, i) => (
            <article
              key={`${title}-${i}`}
              className="rounded-3xl border p-8"
              style={{ backgroundColor: SL.surface, borderColor: SL.line }}
            >
              <FeatureIcon index={i} icon={features.icons[i]} />
              <h3 className="mt-8 text-xl font-bold" style={{ fontFamily: "var(--sl-display)" }}>
                {title}
              </h3>
              <p className="mt-3 leading-relaxed" style={{ color: SL.body }}>
                {featureBodies[i] || "A powerful, thoughtfully designed capability built to help your team move faster."}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="sl-pricing" className="px-4 py-16 sm:px-6 md:py-24" style={sectionBandStyle(pricing.theme)}>
        <div
          className="mx-auto max-w-6xl rounded-[2rem] border px-6 py-16 md:px-10"
          style={{ backgroundColor: SL.surface, borderColor: SL.line }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow center>Pricing</Eyebrow>
            <h2
              className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--sl-display)" }}
            >
              {text(pricing.content, "heading", "Simple, transparent pricing")}
            </h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: SL.body }}>
              {text(
                pricing.content,
                "subheading",
                "Transparent and flexible options tailored to suit your needs."
              )}
            </p>
            <div className="mt-7 flex items-center justify-center gap-3 text-sm font-medium">
              <span style={{ color: SL.ink }}>Monthly</span>
              <span
                className="relative inline-flex h-6 w-11 items-center rounded-full"
                style={{ backgroundColor: SL.brand }}
                aria-hidden
              >
                <span className="ml-0.5 h-5 w-5 rounded-full bg-white" />
              </span>
              <span style={{ color: SL.body }}>Yearly</span>
              <span
                className="rounded px-1.5 py-1 text-xs font-semibold uppercase leading-none"
                style={{ backgroundColor: "#B5E4CA", color: SL.dark }}
              >
                Save 20%
              </span>
            </div>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {planNames.map((name, i) => {
              const popular = i === popularIndex;
              const featureLines = (planFeatures[i] || "").split("\n").map((f) => f.trim()).filter(Boolean);
              return (
                <div
                  key={`${name}-${i}`}
                  className="flex flex-col rounded-3xl p-8 shadow-[0_0.25rem_1.25rem_0_rgba(0,0,0,0.06)]"
                  style={{
                    backgroundColor: popular ? SL.dark : SL.white,
                    color: popular ? SL.white : SL.ink,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-lg font-semibold" style={{ fontFamily: "var(--sl-display)" }}>
                      {name}
                    </div>
                    {popular && (
                      <span
                        className="rounded px-1.5 py-1 text-xs font-semibold uppercase leading-none"
                        style={{ backgroundColor: "#FFBC99", color: SL.dark }}
                      >
                        Most popular
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-3 text-5xl font-extrabold tracking-tight"
                    style={{ fontFamily: "var(--sl-display)" }}
                  >
                    {planPrices[i] || "$0"}
                    <span
                      className="align-baseline text-base font-medium"
                      style={{ color: popular ? "rgba(255,255,255,0.6)" : SL.muted }}
                    >
                      {" "}
                      /mo
                    </span>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3">
                    {featureLines.map((line, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 border-b pb-3 text-sm last:border-b-0"
                        style={{ borderColor: popular ? "rgba(255,255,255,0.12)" : SL.line }}
                      >
                        <Check popular={popular} />
                        <span style={{ color: popular ? "rgba(255,255,255,0.85)" : SL.body }}>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#sl-top"
                    className="mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold"
                    style={
                      popular
                        ? { backgroundColor: SL.brand, color: SL.white, fontFamily: "var(--sl-display)" }
                        : {
                            border: `1px solid ${SL.line}`,
                            color: SL.ink,
                            fontFamily: "var(--sl-display)",
                          }
                    }
                  >
                    Get started
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="sl-faq" className="px-6 py-8 md:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow center>FAQ</Eyebrow>
          <h2
            className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--sl-display)" }}
          >
            {text(faq.content, "heading", "Got questions? We have answers")}
          </h2>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          {questions.map((question, i) => (
            <details
              key={`${question}-${i}`}
              open={i === 0}
              className="group mb-4 rounded-2xl border px-6"
              style={{ backgroundColor: SL.surface, borderColor: SL.line }}
            >
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold sm:text-lg"
                style={{ fontFamily: "var(--sl-display)" }}
              >
                {question}
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-lg leading-none text-white transition-transform group-open:rotate-45"
                  style={{ backgroundColor: SL.brand }}
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="pb-5 leading-relaxed" style={{ color: SL.body }}>
                {answers[i] || "Reach out any time — our team is glad to walk you through the details."}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Testimonials — Wall of Love */}
      <section id="sl-reviews" className="px-6 py-8 md:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow center>Wall of Love</Eyebrow>
          <h2
            className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--sl-display)" }}
          >
            {text(testimonials.content, "heading", "Discover what our happy users have to say.")}
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
          {quotes.map((quote, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-3xl border p-7"
              style={{ backgroundColor: SL.surface, borderColor: SL.line }}
            >
              <div className="mb-5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={AVATARS[i % AVATARS.length]}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
                <figcaption>
                  <div className="text-sm font-semibold" style={{ fontFamily: "var(--sl-display)" }}>
                    {authors[i] || "Happy customer"}
                  </div>
                  {roles[i] && (
                    <div className="text-xs" style={{ color: SL.muted }}>
                      {roles[i]}
                    </div>
                  )}
                </figcaption>
              </div>
              <blockquote className="flex-1 text-sm leading-6" style={{ color: SL.body }}>
                {quote}
              </blockquote>
            </figure>
          ))}
        </div>
      </section>

      {/* Download / final CTA */}
      <section className="px-4 py-16 sm:px-6 md:py-20">
        <div
          className="mx-auto max-w-6xl rounded-[2rem] px-6 py-20 text-center text-white md:px-10"
          style={{ backgroundColor: SL.dark }}
        >
          <h2
            className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--sl-display)" }}
          >
            {text(cta.content, "headline", "Ready to start?")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base" style={{ color: "rgba(255,255,255,0.65)" }}>
            {text(cta.content, "subheadline", "Get the easiest access and launch your workspace today.")}
          </p>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#sl-top"}
            className="mt-9 inline-flex rounded-full px-8 py-4 text-sm font-semibold text-white"
            style={{ backgroundColor: SL.brand, fontFamily: "var(--sl-display)" }}
          >
            {text(cta.content, "ctaPrimary", "Download now")}
          </a>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 pb-16 sm:px-6">
        <div
          className="mx-auto max-w-6xl rounded-[2rem] border px-6 py-16 text-center md:px-10"
          style={{ backgroundColor: SL.white, borderColor: SL.line }}
        >
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ fontFamily: "var(--sl-display)" }}>
            Join our newsletter
          </h2>
          <p className="mt-3 text-base" style={{ color: SL.body }}>
            And stay in touch with us!
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-md gap-3">
            <label className="sr-only" htmlFor="sl-newsletter">
              Email address
            </label>
            <input
              id="sl-newsletter"
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 rounded-full border px-5 py-3.5 text-sm outline-none focus:border-[color:var(--sl-accent)]"
              style={{ backgroundColor: SL.surface, borderColor: SL.line, ["--sl-accent" as string]: SL.brand }}
            />
            <button
              type="button"
              className="shrink-0 rounded-full px-6 py-3.5 text-sm font-semibold text-white"
              style={{ backgroundColor: SL.brand, fontFamily: "var(--sl-display)" }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-14" style={{ borderColor: SL.line, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto max-w-[80rem]">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                {customLogo ? (
                  <img src={customLogo} alt="" className="h-9 w-9 rounded-xl object-contain" />
                ) : (
                  <span
                    className="grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: SL.brand, fontFamily: "var(--sl-display)" }}
                  >
                    {monogram}
                  </span>
                )}
                <span className="text-lg font-bold" style={{ fontFamily: "var(--sl-display)" }}>
                  {businessName}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: SL.body }}>
                {text(footer.content, "tagline", "The intuitive cloud workspace for fast-growing teams.")}
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium" style={{ color: SL.body }}>
              {footerLinks.map((label, i) => (
                <span key={`${label}-${i}`}>{label}</span>
              ))}
            </nav>
          </div>
          <div className="mt-10 border-t pt-6 text-sm" style={{ borderColor: SL.line, color: SL.muted }}>
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureIcon({ index, icon }: { index: number; icon?: string }) {
  const color = SL_FEATURE_COLORS[index % SL_FEATURE_COLORS.length];
  const path = SL_ICON_PATHS[index % SL_ICON_PATHS.length];
  return (
    <span className="relative grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-white shadow-[0_0.25rem_0.5rem_0_rgba(0,0,0,0.08)]">
      <span className="absolute inset-0 rounded-full" style={{ backgroundColor: color, opacity: 0.25 }} aria-hidden />
      {isIconName(icon) ? (
        <IconGlyph name={icon} className="relative z-[1] h-7 w-7" color={SL.ink} strokeWidth={1.7} />
      ) : (
        <svg
          className="relative z-[1] h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke={SL.ink}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d={path} />
        </svg>
      )}
    </span>
  );
}

function Check({ popular }: { popular: boolean }) {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke={popular ? "#FFFFFF" : SL.brand}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5 12 5 5L20 6" />
    </svg>
  );
}

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        center ? "justify-center" : ""
      }`}
      style={{ backgroundColor: SL.brandSoft, color: SL.brandDeep, fontFamily: "var(--sl-display)" }}
    >
      {children}
    </span>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
