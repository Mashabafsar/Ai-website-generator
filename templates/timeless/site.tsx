import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { TI } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { templateFaces } from "../shared/template-faces";





const faces = templateFaces([
  { family: "Instrument Sans", variable: "--ti-display", weights: ["500","600","700"] },
  { family: "Inter", variable: "--ti-body", weights: ["400","500"] },
]);

const HERO = "/templates/timeless/hero.jpg";
const NAV = [
  { label: "Work", href: "#ti-main" },
  { label: "About", href: "#ti-about" },
  { label: "Contact", href: "#ti-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TI";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function TimelessSite({
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
  const work = slotAt(slots, "portfolio");
  const process = slotAt(slots, "process");
  const testimonials = slotAt(slots, "testimonials");
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");
  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "Timeless";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="ti-top"
      className={`scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#0885FF"),
        ...faces.style,
        fontFamily: "var(--ti-body), ui-sans-serif, system-ui, sans-serif",
        color: TI.ink,
        backgroundColor: TI.bg,
        ...themeFontStyle(site?.theme, ["--ti-display", "--ti-body"]),
      }}
    >
      {<link rel="stylesheet" href={faces.href} />}
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: TI.line, backgroundColor: TI.bg }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#ti-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-xl"
                style={{ backgroundColor: TI.brand, color: TI.inverseFg, fontFamily: "var(--ti-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--ti-display)", color: TI.ink }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: TI.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#ti-end"}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: TI.brand, color: TI.inverseFg, fontFamily: "var(--ti-display)" }}
          >
            {text(hero.content, "ctaPrimary", "See cases")}
          </a>
        </div>
      </header>
      <section className="px-6 py-24" style={{ ...sectionBandStyle(hero.theme) }}>
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.2em]" style={{ color: TI.brand }}>{text(hero.content, "eyebrow", "Timeless")}</p>
          <h1 className="mt-6 max-w-5xl text-5xl leading-[0.95] sm:text-7xl" style={{ fontFamily: "var(--ti-display)" }}>
            {text(hero.content, "headline", "Work that still looks right in ten years")}
          </h1>
          <p className="mt-8 max-w-xl text-lg" style={{ color: TI.body }}>{text(hero.content, "subheadline", "Brand, film, and digital for houses that refuse seasonal thinking.")}</p>
        </div>
      </section>
      <section id="ti-main" className="px-6 py-16" style={{ backgroundColor: TI.surface }}>
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {list(features.content, "itemTitles", ["Strategy", "Identity", "Product"]).map((title, i) => (
            <article key={i} className="p-6 rounded-xl" style={{ backgroundColor: TI.card }}>
              <div className="text-xs" style={{ color: TI.brand }}>0{i + 1}</div>
              <h3 className="mt-3 text-2xl" style={{ fontFamily: "var(--ti-display)" }}>{title}</h3>
              <p className="mt-2 text-sm" style={{ color: TI.body }}>{list(features.content, "itemBodies")[i] || ""}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-3xl" style={{ fontFamily: "var(--ti-display)" }}>{text(work.content, "heading", "Selected work")}</h2>
          {list(work.content, "itemTitles", ["Atlas", "Harbor", "North"]).map((title, i) => (
            <article key={i} className="mb-8 grid items-center gap-8 border-t py-8 lg:grid-cols-2" style={{ borderColor: TI.line }}>
              <img src={work.itemImages[i] || heroImage} alt="" className="h-64 w-full object-cover rounded-xl" />
              <div>
                <h3 className="text-3xl" style={{ fontFamily: "var(--ti-display)" }}>{title}</h3>
                <p className="mt-3" style={{ color: TI.body }}>{list(work.content, "itemBodies")[i] || ""}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="ti-about" className="px-6 py-16" style={{ backgroundColor: TI.inverse, color: TI.inverseFg }}>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
          {list(process.content, "itemTitles", ["Listen", "Frame", "Make", "Launch"]).map((title, i) => (
            <div key={i}>
              <div className="text-sm opacity-60">Step {i + 1}</div>
              <h3 className="mt-2 text-xl" style={{ fontFamily: "var(--ti-display)" }}>{title}</h3>
              <p className="mt-2 text-sm opacity-70">{list(process.content, "itemBodies")[i] || ""}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="p-6 rounded-xl" style={{ backgroundColor: TI.surface }}>
              <p>{quote}</p>
              <footer className="mt-3 text-sm" style={{ color: TI.body }}>{list(testimonials.content, "authors")[i]}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl" style={{ fontFamily: "var(--ti-display)" }}>{text(cta.content, "headline", "Let's talk")}</h2>
        <a href={contactEmail ? `mailto:${contactEmail}` : "#ti-end"} className="mt-8 inline-flex rounded-xl px-8 py-3 font-semibold" style={{ backgroundColor: TI.brand, color: TI.inverseFg }}>
          {text(cta.content, "ctaPrimary", "See cases")}
        </a>
      </section>
      <footer id="ti-end" className="border-t px-6 py-12" style={{ borderColor: TI.line, backgroundColor: TI.inverse, color: TI.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--ti-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Creative-agency home with cool mist surfaces and a long-form case grid.")}</p>
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
