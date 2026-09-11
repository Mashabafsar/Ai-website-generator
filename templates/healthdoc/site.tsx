import { Manrope, Inter } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { HD } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";

const display = Manrope({
  subsets: ["latin"],
  variable: "--hd-display",
  weight: ["500","600","700"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--hd-body",
  weight: ["400","500"],
  display: "swap",
});

const HERO = "/templates/healthdoc/hero.jpg";
const NAV = [
  { label: "Work", href: "#hd-main" },
  { label: "About", href: "#hd-about" },
  { label: "Contact", href: "#hd-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "HD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function HealthdocSite({
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
    "Health Doc";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="hd-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#8246FB"),
        fontFamily: "var(--hd-body), ui-sans-serif, system-ui, sans-serif",
        color: HD.ink,
        backgroundColor: HD.bg,
        ...themeFontStyle(site?.theme, ["--hd-display", "--hd-body"]),
      }}
    >
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: HD.line, backgroundColor: HD.inverse }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#hd-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-full"
                style={{ backgroundColor: HD.brand, color: HD.inverseFg, fontFamily: "var(--hd-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--hd-display)", color: HD.inverseFg }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: HD.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#hd-end"}
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: HD.brand, color: HD.inverseFg, fontFamily: "var(--hd-display)" }}
          >
            {text(hero.content, "ctaPrimary", "Try the assistant")}
          </a>
        </div>
      </header>
      <section className="px-6 py-20" style={{ ...sectionBandStyle(hero.theme) }}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest" style={{ backgroundColor: HD.brandSoft, color: HD.brand }}>
            {text(hero.content, "eyebrow", "Health Doc")}
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-6xl" style={{ fontFamily: "var(--hd-display)" }}>
            {text(hero.content, "headline", "A powerful virtual assistant for care")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg" style={{ color: HD.body }}>{text(hero.content, "subheadline", "AI-assisted intake, records, and follow-ups that still feel human.")}</p>
          <div className="mt-8 flex justify-center gap-3">
            <a href="#hd-main" className="rounded-full px-6 py-3 text-sm font-semibold" style={{ backgroundColor: HD.brand, color: HD.inverseFg }}>
              {text(hero.content, "ctaPrimary", "Try the assistant")}
            </a>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-full" style={{ border: `1px solid ${HD.line}` }}>
          <img src={heroImage} alt="" data-parallax="0.08" className="w-full object-cover" />
        </div>
      </section>
      <section id="hd-main" className="px-6 py-20" style={{ backgroundColor: HD.surface }}>
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list(features.content, "itemTitles", ["Fast", "Private", "Simple"]).map((title, i) => (
            <article key={i} className="p-6 rounded-full" style={{ backgroundColor: HD.card }}>
              <div className="mb-4 h-10 w-10 rounded-full" style={{ backgroundColor: HD.brand, opacity: 0.2 }} />
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--hd-display)" }}>{title}</h3>
              <p className="mt-2 text-sm" style={{ color: HD.body }}>{list(features.content, "itemBodies")[i] || ""}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {list(pricing.content, "planNames", ["Starter", "Studio", "House"]).map((name, i) => (
            <article key={i} className="p-6 rounded-full" style={{ backgroundColor: i === 1 ? HD.inverse : HD.card, color: i === 1 ? HD.inverseFg : HD.ink, border: `1px solid ${HD.line}` }}>
              <h3 className="text-sm uppercase tracking-widest">{name}</h3>
              <div className="mt-3 text-4xl" style={{ fontFamily: "var(--hd-display)" }}>{list(pricing.content, "planPrices", ["$29", "$79", "$199"])[i]}</div>
              <p className="mt-3 text-sm opacity-80">{list(pricing.content, "planFeatures")[i] || ""}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          {list(faq.content, "questions").map((q, i) => (
            <details key={i} className="border-b py-4" style={{ borderColor: HD.line }}>
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-sm" style={{ color: HD.body }}>{list(faq.content, "answers")[i]}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="min-w-[18rem] p-5 rounded-full" style={{ backgroundColor: HD.surface }}>
              <p className="text-sm">{quote}</p>
              <footer className="mt-3 text-xs" style={{ color: HD.body }}>{list(testimonials.content, "authors")[i]}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section id="hd-about" className="px-6 py-20 text-center">
        <h2 className="text-4xl" style={{ fontFamily: "var(--hd-display)" }}>{text(cta.content, "headline", "Ready")}</h2>
        <a href={contactEmail ? `mailto:${contactEmail}` : "#hd-end"} className="mt-8 inline-flex rounded-full px-8 py-3 font-semibold" style={{ backgroundColor: HD.brand, color: HD.inverseFg }}>
          {text(cta.content, "ctaPrimary", "Try the assistant")}
        </a>
      </section>
      <footer id="hd-end" className="border-t px-6 py-12" style={{ borderColor: HD.line, backgroundColor: HD.inverse, color: HD.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--hd-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Dark AI-health product: violet accent on near-black, assistant-first layout.")}</p>
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
