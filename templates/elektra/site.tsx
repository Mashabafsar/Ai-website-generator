import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { EL } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--el-display",
  weight: ["600","700","800"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--el-body",
  weight: ["400","500","600"],
  display: "swap",
});

const HERO = "/templates/elektra/hero.jpg";
const NAV = [
  { label: "Work", href: "#el-main" },
  { label: "About", href: "#el-about" },
  { label: "Contact", href: "#el-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "EL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function ElektraSite({
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
    "Elektra";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="el-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#3B82F6"),
        fontFamily: "var(--el-body), ui-sans-serif, system-ui, sans-serif",
        color: EL.ink,
        backgroundColor: EL.bg,
        ...themeFontStyle(site?.theme, ["--el-display", "--el-body"]),
      }}
    >
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: EL.line, backgroundColor: EL.inverse }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#el-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-xl"
                style={{ backgroundColor: EL.brand, color: EL.inverseFg, fontFamily: "var(--el-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--el-display)", color: EL.inverseFg }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: EL.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#el-end"}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: EL.brand, color: EL.inverseFg, fontFamily: "var(--el-display)" }}
          >
            {text(hero.content, "ctaPrimary", "Reserve yours")}
          </a>
        </div>
      </header>
      <section className="relative min-h-[80vh] overflow-hidden" style={{ ...sectionBandStyle(hero.theme) }}>
        <img src={heroImage} alt="" data-parallax="0.12" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${EL.bg}cc, ${EL.bg})` }} />
        <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-end px-6 pb-20">
          <p className="text-xs uppercase tracking-[0.25em]" style={{ color: EL.brand }}>{text(hero.content, "eyebrow", "Elektra")}</p>
          <h1 className="mt-4 max-w-4xl text-5xl uppercase leading-[0.95] sm:text-7xl" style={{ fontFamily: "var(--el-display)" }}>
            {text(hero.content, "headline", "The quiet power of going further")}
          </h1>
          <p className="mt-6 max-w-xl text-lg" style={{ color: EL.body }}>{text(hero.content, "subheadline", "Precision-built electric vehicles with range, charge speed, and cabin calm as the brief.")}</p>
        </div>
      </section>
      <section id="el-about" className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <h2 className="text-4xl" style={{ fontFamily: "var(--el-display)" }}>{text(about.content, "heading", "About")}</h2>
          <p className="text-lg leading-relaxed" style={{ color: EL.body }}>{text(about.content, "body", text(about.content, "subheadline", "Electric vehicles engineered for the long road ahead."))}</p>
        </div>
      </section>
      <section id="el-main" className="px-6 py-20" style={{ backgroundColor: EL.surface }}>
        <div className="mx-auto max-w-6xl">
          {list(services.content, "itemTitles", ["Direction", "Craft", "Delivery"]).map((title, i) => (
            <div key={i} className="flex items-baseline justify-between border-b py-8" style={{ borderColor: EL.line }}>
              <h3 className="text-2xl" style={{ fontFamily: "var(--el-display)" }}>{title}</h3>
              <p className="max-w-md text-sm" style={{ color: EL.body }}>{list(services.content, "itemBodies")[i] || ""}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {list(work.content, "itemTitles", ["One", "Two", "Three"]).map((title, i) => (
            <article key={i} className="overflow-hidden rounded-xl" style={{ backgroundColor: EL.card }}>
              <img src={work.itemImages[i] || heroImage} alt="" className="h-56 w-full object-cover" />
              <div className="p-5">
                <h3 style={{ fontFamily: "var(--el-display)" }}>{title}</h3>
                <p className="mt-2 text-sm" style={{ color: EL.body }}>{list(work.content, "itemBodies")[i] || ""}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="p-6" style={{ borderLeft: `2px solid ${EL.brand}` }}>
              <p>{quote}</p>
              <footer className="mt-3 text-sm" style={{ color: EL.body }}>{list(testimonials.content, "authors")[i]}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          {list(faq.content, "questions").map((q, i) => (
            <details key={i} className="border-b py-4" style={{ borderColor: EL.line }}>
              <summary className="cursor-pointer">{q}</summary>
              <p className="mt-2 text-sm" style={{ color: EL.body }}>{list(faq.content, "answers")[i]}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl" style={{ fontFamily: "var(--el-display)" }}>{text(cta.content, "headline", "Ready")}</h2>
        <a href={contactEmail ? `mailto:${contactEmail}` : "#el-end"} className="mt-8 inline-flex rounded-xl px-8 py-3 font-semibold" style={{ backgroundColor: EL.brand, color: EL.inverseFg }}>
          {text(cta.content, "ctaPrimary", "Reserve yours")}
        </a>
      </section>
      <footer id="el-end" className="border-t px-6 py-12" style={{ borderColor: EL.line, backgroundColor: EL.inverse, color: EL.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--el-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Midnight EV showroom: charcoal canvas, electric blue, precision type.")}</p>
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
