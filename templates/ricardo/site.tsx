import { Cormorant_Garamond, Inter } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { RC } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--rc-display",
  weight: ["500","600","700"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--rc-body",
  weight: ["400","500"],
  display: "swap",
});

const HERO = "/templates/ricardo/hero.jpg";
const NAV = [
  { label: "Work", href: "#rc-main" },
  { label: "About", href: "#rc-about" },
  { label: "Contact", href: "#rc-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "RC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function RicardoSite({
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
  const contactSlot = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");
  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "Ricardo Rowen";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="rc-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#DB2777"),
        fontFamily: "var(--rc-body), ui-sans-serif, system-ui, sans-serif",
        color: RC.ink,
        backgroundColor: RC.bg,
        ...themeFontStyle(site?.theme, ["--rc-display", "--rc-body"]),
      }}
    >
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: RC.line, backgroundColor: RC.bg }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#rc-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-xl"
                style={{ backgroundColor: RC.brand, color: RC.inverseFg, fontFamily: "var(--rc-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--rc-display)", color: RC.ink }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: RC.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#rc-end"}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: RC.brand, color: RC.inverseFg, fontFamily: "var(--rc-display)" }}
          >
            {text(hero.content, "ctaPrimary", "Enquire")}
          </a>
        </div>
      </header>
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-end gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm" style={{ color: RC.brand }}>{text(hero.content, "eyebrow", "Ricardo Rowen")}</p>
            <h1 className="mt-4 text-5xl leading-[0.95] sm:text-7xl" style={{ fontFamily: "var(--rc-display)" }}>
              {text(hero.content, "headline", "Made slowly, worn often")}
            </h1>
            <p className="mt-6 max-w-md text-lg" style={{ color: RC.body }}>{text(hero.content, "subheadline", "Bespoke work, private clients, and a studio that still answers the phone.")}</p>
          </div>
          <img src={heroImage} alt="" className="h-[28rem] w-full object-cover rounded-xl" />
        </div>
      </section>
      <section id="rc-about" className="px-6 py-20" style={{ backgroundColor: RC.surface }}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl" style={{ fontFamily: "var(--rc-display)" }}>{text(about.content, "heading", "About")}</h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: RC.body }}>{text(about.content, "body", text(about.content, "subheadline", "An atelier site for a name people already whisper."))}</p>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {list(services.content, "itemTitles", ["Brand", "Product", "Campaign"]).map((title, i) => (
            <article key={i} className="p-6 rounded-xl" style={{ backgroundColor: RC.card, border: `1px solid ${RC.line}` }}>
              <h3 className="text-xl" style={{ fontFamily: "var(--rc-display)" }}>{title}</h3>
              <p className="mt-2 text-sm" style={{ color: RC.body }}>{list(services.content, "itemBodies")[i] || ""}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="rc-main" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          {list(work.content, "itemTitles", ["One", "Two", "Three"]).map((title, i) => (
            <article key={i} className="mb-10">
              <img src={work.itemImages[i] || heroImage} alt="" className="h-80 w-full object-cover rounded-xl" />
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-2xl" style={{ fontFamily: "var(--rc-display)" }}>{title}</h3>
                <p className="text-sm" style={{ color: RC.body }}>{list(work.content, "itemBodies")[i] || ""}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="text-2xl" style={{ fontFamily: "var(--rc-display)" }}>
              “{quote}”
              <footer className="mt-2 text-sm" style={{ color: RC.body, fontFamily: "var(--rc-body)" }}>{list(testimonials.content, "authors")[i]}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl" style={{ fontFamily: "var(--rc-display)" }}>{text(contactSlot.content, "heading", "Contact")}</h2>
          <p className="mt-3 max-w-xl" style={{ color: RC.body }}>{text(contactSlot.content, "subheading", "")}</p>
          {contactEmail ? <a className="mt-4 inline-block" href={`mailto:${contactEmail}`}>{contactEmail}</a> : null}
        </div>
      </section>
      <footer id="rc-end" className="border-t px-6 py-12" style={{ borderColor: RC.line, backgroundColor: RC.inverse, color: RC.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--rc-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Romantic personal atelier: Cormorant serif, rose ink, script asides.")}</p>
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
