import { Fraunces, Manrope } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { LV } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--lv-display",
  weight: ["500","600","700"],
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--lv-body",
  weight: ["400","500"],
  display: "swap",
});

const HERO = "/templates/levyna/hero.jpg";
const NAV = [
  { label: "Work", href: "#lv-main" },
  { label: "About", href: "#lv-about" },
  { label: "Contact", href: "#lv-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "LV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function LevynaSite({
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
  const work = slotAt(slots, "portfolio");
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const testimonials = slotAt(slots, "testimonials");
  const faq = slotAt(slots, "faq");
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");
  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "Levyna";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="lv-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#D8F366"),
        fontFamily: "var(--lv-body), ui-sans-serif, system-ui, sans-serif",
        color: LV.ink,
        backgroundColor: LV.bg,
        ...themeFontStyle(site?.theme, ["--lv-display", "--lv-body"]),
      }}
    >
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: LV.line, backgroundColor: LV.inverse }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#lv-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-xl"
                style={{ backgroundColor: LV.brand, color: LV.inverseFg, fontFamily: "var(--lv-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--lv-display)", color: LV.inverseFg }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: LV.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#lv-end"}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: LV.brand, color: LV.inverseFg, fontFamily: "var(--lv-display)" }}
          >
            {text(hero.content, "ctaPrimary", "View interiors")}
          </a>
        </div>
      </header>
      <section className="relative h-[85vh] overflow-hidden">
        <img src={heroImage} alt="" data-parallax="0.1" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.55), transparent)" }} />
        <div className="relative flex h-full items-end px-6 pb-16">
          <div className="mx-auto w-full max-w-6xl text-white">
            <p className="text-xs uppercase tracking-[0.25em]">{text(hero.content, "eyebrow", "Levyna")}</p>
            <h1 className="mt-4 max-w-3xl text-5xl sm:text-6xl" style={{ fontFamily: "var(--lv-display)" }}>
              {text(hero.content, "headline", "Rooms composed, not decorated")}
            </h1>
          </div>
        </div>
      </section>
      <section id="lv-main" className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {list(work.content, "itemTitles", ["Atrium", "House", "Lobby"]).map((title, i) => (
            <article key={i}>
              <img src={work.itemImages[i] || heroImage} alt="" className="h-72 w-full object-cover rounded-xl" />
              <h3 className="mt-4 text-xl" style={{ fontFamily: "var(--lv-display)" }}>{title}</h3>
              <p className="mt-1 text-sm" style={{ color: LV.body }}>{list(work.content, "itemBodies")[i] || ""}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="lv-about" className="px-6 py-20" style={{ backgroundColor: LV.surface }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <img src={about.image || heroImage} alt="" className="h-80 w-full object-cover rounded-xl" />
          <div>
            <h2 className="text-4xl" style={{ fontFamily: "var(--lv-display)" }}>{text(about.content, "heading", "The studio")}</h2>
            <p className="mt-4 leading-relaxed" style={{ color: LV.body }}>{text(about.content, "body", text(about.content, "subheadline", "Interiors with the patience of architecture."))}</p>
          </div>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {list(services.content, "itemTitles", ["Residence", "Hospitality", "Object"]).map((title, i) => (
            <article key={i} className="p-6" style={{ borderTop: `2px solid ${LV.brand}` }}>
              <h3 className="text-xl" style={{ fontFamily: "var(--lv-display)" }}>{title}</h3>
              <p className="mt-2 text-sm" style={{ color: LV.body }}>{list(services.content, "itemBodies")[i] || ""}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="text-lg" style={{ fontFamily: "var(--lv-display)" }}>“{quote}”</blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-12">
        {list(faq.content, "questions").map((q, i) => (
          <details key={i} className="mx-auto max-w-3xl border-b py-4" style={{ borderColor: LV.line }}>
            <summary className="cursor-pointer">{q}</summary>
            <p className="mt-2 text-sm" style={{ color: LV.body }}>{list(faq.content, "answers")[i]}</p>
          </details>
        ))}
      </section>
      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl" style={{ fontFamily: "var(--lv-display)" }}>{text(cta.content, "headline", "Visit the studio")}</h2>
        <a href={contactEmail ? `mailto:${contactEmail}` : "#lv-end"} className="mt-8 inline-flex rounded-xl px-8 py-3 font-semibold" style={{ backgroundColor: LV.brand, color: LV.inverseFg }}>
          {text(cta.content, "ctaPrimary", "View interiors")}
        </a>
      </section>
      <footer id="lv-end" className="border-t px-6 py-12" style={{ borderColor: LV.line, backgroundColor: LV.inverse, color: LV.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--lv-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Interior studio on charcoal with a lime architectural mark.")}</p>
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
