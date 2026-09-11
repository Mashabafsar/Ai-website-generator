import { Instrument_Serif, Inter } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { LU } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";

const display = Instrument_Serif({
  subsets: ["latin"],
  variable: "--lu-display",
  weight: "400",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--lu-body",
  weight: ["400","500"],
  display: "swap",
});

const HERO = "/templates/lukasz/hero.jpg";
const NAV = [
  { label: "Work", href: "#lu-main" },
  { label: "About", href: "#lu-about" },
  { label: "Contact", href: "#lu-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "LU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function LukaszSite({
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
    "Lukasz";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="lu-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#1A1A1A"),
        fontFamily: "var(--lu-body), ui-sans-serif, system-ui, sans-serif",
        color: LU.ink,
        backgroundColor: LU.bg,
        ...themeFontStyle(site?.theme, ["--lu-display", "--lu-body"]),
      }}
    >
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: LU.line, backgroundColor: LU.bg }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#lu-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-xl"
                style={{ backgroundColor: LU.brand, color: LU.inverseFg, fontFamily: "var(--lu-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--lu-display)", color: LU.ink }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: LU.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#lu-end"}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: LU.brand, color: LU.inverseFg, fontFamily: "var(--lu-display)" }}
          >
            {text(hero.content, "ctaPrimary", "Get in touch")}
          </a>
        </div>
      </header>
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-end gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm" style={{ color: LU.brand }}>{text(hero.content, "eyebrow", "Lukasz")}</p>
            <h1 className="mt-4 text-5xl leading-[0.95] sm:text-7xl" style={{ fontFamily: "var(--lu-display)" }}>
              {text(hero.content, "headline", "Pictures, then the words around them")}
            </h1>
            <p className="mt-6 max-w-md text-lg" style={{ color: LU.body }}>{text(hero.content, "subheadline", "Direction, stills, and sites for people who already know their taste.")}</p>
          </div>
          <img src={heroImage} alt="" className="h-[28rem] w-full object-cover rounded-xl" />
        </div>
      </section>
      <section id="lu-about" className="px-6 py-20" style={{ backgroundColor: LU.surface }}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl" style={{ fontFamily: "var(--lu-display)" }}>{text(about.content, "heading", "About")}</h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: LU.body }}>{text(about.content, "body", text(about.content, "subheadline", "A focused practice for image-led brands and editorial work."))}</p>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {list(services.content, "itemTitles", ["Brand", "Product", "Campaign"]).map((title, i) => (
            <article key={i} className="p-6 rounded-xl" style={{ backgroundColor: LU.card, border: `1px solid ${LU.line}` }}>
              <h3 className="text-xl" style={{ fontFamily: "var(--lu-display)" }}>{title}</h3>
              <p className="mt-2 text-sm" style={{ color: LU.body }}>{list(services.content, "itemBodies")[i] || ""}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="lu-main" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          {list(work.content, "itemTitles", ["One", "Two", "Three"]).map((title, i) => (
            <article key={i} className="mb-10">
              <img src={work.itemImages[i] || heroImage} alt="" className="h-80 w-full object-cover rounded-xl" />
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-2xl" style={{ fontFamily: "var(--lu-display)" }}>{title}</h3>
                <p className="text-sm" style={{ color: LU.body }}>{list(work.content, "itemBodies")[i] || ""}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="text-2xl" style={{ fontFamily: "var(--lu-display)" }}>
              “{quote}”
              <footer className="mt-2 text-sm" style={{ color: LU.body, fontFamily: "var(--lu-body)" }}>{list(testimonials.content, "authors")[i]}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl" style={{ fontFamily: "var(--lu-display)" }}>{text(contactSlot.content, "heading", "Contact")}</h2>
          <p className="mt-3 max-w-xl" style={{ color: LU.body }}>{text(contactSlot.content, "subheading", "")}</p>
          {contactEmail ? <a className="mt-4 inline-block" href={`mailto:${contactEmail}`}>{contactEmail}</a> : null}
        </div>
      </section>
      <footer id="lu-end" className="border-t px-6 py-12" style={{ borderColor: LU.line, backgroundColor: LU.inverse, color: LU.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--lu-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Quiet personal studio: generous whitespace, project grid, conversational about.")}</p>
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
