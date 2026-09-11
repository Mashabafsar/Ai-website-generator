import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { FK } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--fk-display",
  weight: ["500","600","700"],
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--fk-body",
  weight: ["400","500"],
  display: "swap",
});

const HERO = "/templates/foks/hero.jpg";
const NAV = [
  { label: "Work", href: "#fk-main" },
  { label: "About", href: "#fk-about" },
  { label: "Contact", href: "#fk-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FK";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function FoksSite({
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
  const about = slotAt(slots, "about");
  const testimonials = slotAt(slots, "testimonials");
  const faq = slotAt(slots, "faq");
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");
  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "Foks";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="fk-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#171717"),
        fontFamily: "var(--fk-body), ui-sans-serif, system-ui, sans-serif",
        color: FK.ink,
        backgroundColor: FK.bg,
        ...themeFontStyle(site?.theme, ["--fk-display", "--fk-body"]),
      }}
    >
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: FK.line, backgroundColor: FK.bg }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#fk-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-xl"
                style={{ backgroundColor: FK.brand, color: FK.inverseFg, fontFamily: "var(--fk-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--fk-display)", color: FK.ink }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: FK.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#fk-end"}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: FK.brand, color: FK.inverseFg, fontFamily: "var(--fk-display)" }}
          >
            {text(hero.content, "ctaPrimary", "Read the issue")}
          </a>
        </div>
      </header>
      <section className="px-6 pt-10">
        <div className="mx-auto max-w-6xl border-y py-10" style={{ borderColor: FK.line }}>
          <p className="text-center text-xs uppercase tracking-[0.35em]">{text(hero.content, "eyebrow", "Foks")}</p>
          <h1 className="mx-auto mt-4 max-w-4xl text-center text-5xl leading-[1.05] sm:text-7xl" style={{ fontFamily: "var(--fk-display)" }}>
            {text(hero.content, "headline", "Stories worth lingering over")}
          </h1>
        </div>
        <div className="mx-auto mt-8 max-w-6xl">
          <img src={heroImage} alt="" className="h-[28rem] w-full object-cover" />
          <p className="mt-6 max-w-2xl text-lg" style={{ color: FK.body }}>{text(hero.content, "subheadline", "Essays, interviews, and visual features from independent culture.")}</p>
        </div>
      </section>
      <section id="fk-main" className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {list(features.content, "itemTitles", ["Culture", "Craft", "People"]).map((title, i) => (
            <article key={i} className="border-t pt-4" style={{ borderColor: FK.ink }}>
              <h3 className="text-2xl" style={{ fontFamily: "var(--fk-display)" }}>{title}</h3>
              <p className="mt-3 text-sm" style={{ color: FK.body }}>{list(features.content, "itemBodies")[i] || ""}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="fk-about" className="px-6 py-16" style={{ backgroundColor: FK.surface }}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl" style={{ fontFamily: "var(--fk-display)" }}>{text(about.content, "heading", "The masthead")}</h2>
          <p className="mt-4" style={{ color: FK.body }}>{text(about.content, "body", text(about.content, "subheadline", "A creative magazine for culture, craft, and the people making it."))}</p>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl columns-1 md:columns-3 gap-6">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="mb-6 break-inside-avoid text-lg">“{quote}”</blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-12">
        {list(faq.content, "questions").map((q, i) => (
          <details key={i} className="mx-auto max-w-3xl border-b py-4" style={{ borderColor: FK.line }}>
            <summary className="cursor-pointer">{q}</summary>
            <p className="mt-2 text-sm" style={{ color: FK.body }}>{list(faq.content, "answers")[i]}</p>
          </details>
        ))}
      </section>
      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl" style={{ fontFamily: "var(--fk-display)" }}>{text(cta.content, "headline", "Subscribe")}</h2>
        <a href={contactEmail ? `mailto:${contactEmail}` : "#fk-end"} className="mt-8 inline-flex rounded-xl px-8 py-3 font-semibold" style={{ backgroundColor: FK.ink, color: FK.bg }}>
          {text(cta.content, "ctaPrimary", "Read the issue")}
        </a>
      </section>
      <footer id="fk-end" className="border-t px-6 py-12" style={{ borderColor: FK.line, backgroundColor: FK.inverse, color: FK.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--fk-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Creative magazine masthead: Bricolage headlines, DM Sans body, editorial columns.")}</p>
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
