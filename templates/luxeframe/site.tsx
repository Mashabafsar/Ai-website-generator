import { Syne, Inter } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { LX } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";

const display = Syne({
  subsets: ["latin"],
  variable: "--lx-display",
  weight: ["600","700","800"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--lx-body",
  weight: ["400","500"],
  display: "swap",
});

const HERO = "/templates/luxeframe/hero.jpg";
const NAV = [
  { label: "Work", href: "#lx-main" },
  { label: "About", href: "#lx-about" },
  { label: "Contact", href: "#lx-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "LX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function LuxeframeSite({
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
    "LuxeFrame";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="lx-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#E0FD60"),
        fontFamily: "var(--lx-body), ui-sans-serif, system-ui, sans-serif",
        color: LX.ink,
        backgroundColor: LX.bg,
        ...themeFontStyle(site?.theme, ["--lx-display", "--lx-body"]),
      }}
    >
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: LX.line, backgroundColor: LX.inverse }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#lx-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-xl"
                style={{ backgroundColor: LX.brand, color: LX.inverseFg, fontFamily: "var(--lx-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--lx-display)", color: LX.inverseFg }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: LX.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#lx-end"}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: LX.brand, color: LX.inverseFg, fontFamily: "var(--lx-display)" }}
          >
            {text(hero.content, "ctaPrimary", "Request a treatment")}
          </a>
        </div>
      </header>
      <section className="relative min-h-[80vh] overflow-hidden" style={{ ...sectionBandStyle(hero.theme) }}>
        <img src={heroImage} alt="" data-parallax="0.12" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${LX.bg}cc, ${LX.bg})` }} />
        <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-end px-6 pb-20">
          <p className="text-xs uppercase tracking-[0.25em]" style={{ color: LX.brand }}>{text(hero.content, "eyebrow", "LuxeFrame")}</p>
          <h1 className="mt-4 max-w-4xl text-5xl uppercase leading-[0.95] sm:text-7xl" style={{ fontFamily: "var(--lx-display)" }}>
            {text(hero.content, "headline", "High-end visual for exclusive moments")}
          </h1>
          <p className="mt-6 max-w-xl text-lg" style={{ color: LX.body }}>{text(hero.content, "subheadline", "Campaign, editorial, and private commissions with cinematic finish.")}</p>
        </div>
      </section>
      <section id="lx-about" className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <h2 className="text-4xl" style={{ fontFamily: "var(--lx-display)" }}>{text(about.content, "heading", "About")}</h2>
          <p className="text-lg leading-relaxed" style={{ color: LX.body }}>{text(about.content, "body", text(about.content, "subheadline", "High-end visual for exclusive, exquisite moments."))}</p>
        </div>
      </section>
      <section id="lx-main" className="px-6 py-20" style={{ backgroundColor: LX.surface }}>
        <div className="mx-auto max-w-6xl">
          {list(services.content, "itemTitles", ["Direction", "Craft", "Delivery"]).map((title, i) => (
            <div key={i} className="flex items-baseline justify-between border-b py-8" style={{ borderColor: LX.line }}>
              <h3 className="text-2xl" style={{ fontFamily: "var(--lx-display)" }}>{title}</h3>
              <p className="max-w-md text-sm" style={{ color: LX.body }}>{list(services.content, "itemBodies")[i] || ""}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {list(work.content, "itemTitles", ["One", "Two", "Three"]).map((title, i) => (
            <article key={i} className="overflow-hidden rounded-xl" style={{ backgroundColor: LX.card }}>
              <img src={work.itemImages[i] || heroImage} alt="" className="h-56 w-full object-cover" />
              <div className="p-5">
                <h3 style={{ fontFamily: "var(--lx-display)" }}>{title}</h3>
                <p className="mt-2 text-sm" style={{ color: LX.body }}>{list(work.content, "itemBodies")[i] || ""}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="p-6" style={{ borderLeft: `2px solid ${LX.brand}` }}>
              <p>{quote}</p>
              <footer className="mt-3 text-sm" style={{ color: LX.body }}>{list(testimonials.content, "authors")[i]}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          {list(faq.content, "questions").map((q, i) => (
            <details key={i} className="border-b py-4" style={{ borderColor: LX.line }}>
              <summary className="cursor-pointer">{q}</summary>
              <p className="mt-2 text-sm" style={{ color: LX.body }}>{list(faq.content, "answers")[i]}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl" style={{ fontFamily: "var(--lx-display)" }}>{text(cta.content, "headline", "Ready")}</h2>
        <a href={contactEmail ? `mailto:${contactEmail}` : "#lx-end"} className="mt-8 inline-flex rounded-xl px-8 py-3 font-semibold" style={{ backgroundColor: LX.brand, color: LX.inverseFg }}>
          {text(cta.content, "ctaPrimary", "Request a treatment")}
        </a>
      </section>
      <footer id="lx-end" className="border-t px-6 py-12" style={{ borderColor: LX.line, backgroundColor: LX.inverse, color: LX.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--lx-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "High-end photography house: charcoal, acid-lime marks, cinematic frames.")}</p>
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
