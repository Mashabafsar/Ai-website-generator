import { Syne, Inter } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { RB } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";

const display = Syne({
  subsets: ["latin"],
  variable: "--rb-display",
  weight: ["700","800"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--rb-body",
  weight: ["400","500"],
  display: "swap",
});

const HERO = "/templates/rebel/hero.jpg";
const NAV = [
  { label: "Work", href: "#rb-main" },
  { label: "About", href: "#rb-about" },
  { label: "Contact", href: "#rb-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "RB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function RebelSite({
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
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const work = slotAt(slots, "portfolio");
  const testimonials = slotAt(slots, "testimonials");
  const faq = slotAt(slots, "faq");
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");
  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "Rebel Grace";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="rb-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#111111"),
        fontFamily: "var(--rb-body), ui-sans-serif, system-ui, sans-serif",
        color: RB.ink,
        backgroundColor: RB.bg,
        ...themeFontStyle(site?.theme, ["--rb-display", "--rb-body"]),
      }}
    >
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: RB.line, backgroundColor: RB.inverse }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#rb-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-none"
                style={{ backgroundColor: RB.brand, color: RB.inverseFg, fontFamily: "var(--rb-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--rb-display)", color: RB.inverseFg }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: RB.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#rb-end"}
            className="rounded-none px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: RB.brand, color: RB.inverseFg, fontFamily: "var(--rb-display)" }}
          >
            {text(hero.content, "ctaPrimary", "Start a conversation")}
          </a>
        </div>
      </header>
      <section className="relative min-h-[80vh] overflow-hidden" style={{ ...sectionBandStyle(hero.theme) }}>
        <img src={heroImage} alt="" data-parallax="0.12" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${RB.bg}cc, ${RB.bg})` }} />
        <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-end px-6 pb-20">
          <p className="text-xs uppercase tracking-[0.25em]" style={{ color: RB.brand }}>{text(hero.content, "eyebrow", "Rebel Grace")}</p>
          <h1 className="mt-4 max-w-4xl text-5xl uppercase leading-[0.95] sm:text-7xl" style={{ fontFamily: "var(--rb-display)" }}>
            {text(hero.content, "headline", "Rebel. Grace.")}
          </h1>
          <p className="mt-6 max-w-xl text-lg" style={{ color: RB.body }}>{text(hero.content, "subheadline", "A designer-developer practice for brands that want more attitude than polish.")}</p>
        </div>
      </section>
      <section id="rb-about" className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <h2 className="text-4xl" style={{ fontFamily: "var(--rb-display)" }}>{text(about.content, "heading", "About")}</h2>
          <p className="text-lg leading-relaxed" style={{ color: RB.body }}>{text(about.content, "body", text(about.content, "subheadline", "UI/UX design and development with an unapologetic point of view."))}</p>
        </div>
      </section>
      <section id="rb-main" className="px-6 py-20" style={{ backgroundColor: RB.surface }}>
        <div className="mx-auto max-w-6xl">
          {list(services.content, "itemTitles", ["Direction", "Craft", "Delivery"]).map((title, i) => (
            <div key={i} className="flex items-baseline justify-between border-b py-8" style={{ borderColor: RB.line }}>
              <h3 className="text-2xl" style={{ fontFamily: "var(--rb-display)" }}>{title}</h3>
              <p className="max-w-md text-sm" style={{ color: RB.body }}>{list(services.content, "itemBodies")[i] || ""}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {list(work.content, "itemTitles", ["One", "Two", "Three"]).map((title, i) => (
            <article key={i} className="overflow-hidden rounded-none" style={{ backgroundColor: RB.card }}>
              <img src={work.itemImages[i] || heroImage} alt="" className="h-56 w-full object-cover" />
              <div className="p-5">
                <h3 style={{ fontFamily: "var(--rb-display)" }}>{title}</h3>
                <p className="mt-2 text-sm" style={{ color: RB.body }}>{list(work.content, "itemBodies")[i] || ""}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="p-6" style={{ borderLeft: `2px solid ${RB.brand}` }}>
              <p>{quote}</p>
              <footer className="mt-3 text-sm" style={{ color: RB.body }}>{list(testimonials.content, "authors")[i]}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          {list(faq.content, "questions").map((q, i) => (
            <details key={i} className="border-b py-4" style={{ borderColor: RB.line }}>
              <summary className="cursor-pointer">{q}</summary>
              <p className="mt-2 text-sm" style={{ color: RB.body }}>{list(faq.content, "answers")[i]}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl" style={{ fontFamily: "var(--rb-display)" }}>{text(cta.content, "headline", "Ready")}</h2>
        <a href={contactEmail ? `mailto:${contactEmail}` : "#rb-end"} className="mt-8 inline-flex rounded-none px-8 py-3 font-semibold" style={{ backgroundColor: RB.brand, color: RB.inverseFg }}>
          {text(cta.content, "ctaPrimary", "Start a conversation")}
        </a>
      </section>
      <footer id="rb-end" className="border-t px-6 py-12" style={{ borderColor: RB.line, backgroundColor: RB.inverse, color: RB.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--rb-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Huge-type personal portfolio: cinematic intro, editorial bio, project reel.")}</p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm opacity-80">
            {list(footer.content, "linkLabels", NAV.map((n) => n.label)).map((label) => (
              <span key={label}>{label}</span>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
