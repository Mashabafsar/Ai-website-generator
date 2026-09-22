import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { GR } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { templateFaces } from "../shared/template-faces";





const faces = templateFaces([
  { family: "Playfair Display", variable: "--gr-display", weights: ["500","600","700"], kind: "serif" },
  { family: "IBM Plex Mono", variable: "--gr-body", weights: ["400","500"], kind: "mono" },
]);

const HERO = "/templates/grit/hero.jpg";
const NAV = [
  { label: "Work", href: "#gr-main" },
  { label: "About", href: "#gr-about" },
  { label: "Contact", href: "#gr-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function GritSite({
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
    "Grit";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="gr-top"
      className={`scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#FF5050"),
        ...faces.style,
        fontFamily: "var(--gr-body), ui-sans-serif, system-ui, sans-serif",
        color: GR.ink,
        backgroundColor: GR.bg,
        ...themeFontStyle(site?.theme, ["--gr-display", "--gr-body"]),
      }}
    >
      {<link rel="stylesheet" href={faces.href} />}
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: GR.line, backgroundColor: GR.bg }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#gr-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-xl"
                style={{ backgroundColor: GR.brand, color: GR.inverseFg, fontFamily: "var(--gr-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--gr-display)", color: GR.ink }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: GR.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#gr-end"}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: GR.brand, color: GR.inverseFg, fontFamily: "var(--gr-display)" }}
          >
            {text(hero.content, "ctaPrimary", "Hire me")}
          </a>
        </div>
      </header>
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-end gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm" style={{ color: GR.brand }}>{text(hero.content, "eyebrow", "Grit")}</p>
            <h1 className="mt-4 text-5xl leading-[0.95] sm:text-7xl" style={{ fontFamily: "var(--gr-display)" }}>
              {text(hero.content, "headline", "Work with teeth still in it")}
            </h1>
            <p className="mt-6 max-w-md text-lg" style={{ color: GR.body }}>{text(hero.content, "subheadline", "Selected projects, a clear offer, and a resume that doesn't look like a resume.")}</p>
          </div>
          <img src={heroImage} alt="" className="h-[28rem] w-full object-cover rounded-xl" />
        </div>
      </section>
      <section id="gr-about" className="px-6 py-20" style={{ backgroundColor: GR.surface }}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl" style={{ fontFamily: "var(--gr-display)" }}>{text(about.content, "heading", "About")}</h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: GR.body }}>{text(about.content, "body", text(about.content, "subheadline", "A sharp personal site for people who ship, then prove it."))}</p>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {list(services.content, "itemTitles", ["Brand", "Product", "Campaign"]).map((title, i) => (
            <article key={i} className="p-6 rounded-xl" style={{ backgroundColor: GR.card, border: `1px solid ${GR.line}` }}>
              <h3 className="text-xl" style={{ fontFamily: "var(--gr-display)" }}>{title}</h3>
              <p className="mt-2 text-sm" style={{ color: GR.body }}>{list(services.content, "itemBodies")[i] || ""}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="gr-main" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          {list(work.content, "itemTitles", ["One", "Two", "Three"]).map((title, i) => (
            <article key={i} className="mb-10">
              <img src={work.itemImages[i] || heroImage} alt="" className="h-80 w-full object-cover rounded-xl" />
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-2xl" style={{ fontFamily: "var(--gr-display)" }}>{title}</h3>
                <p className="text-sm" style={{ color: GR.body }}>{list(work.content, "itemBodies")[i] || ""}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="text-2xl" style={{ fontFamily: "var(--gr-display)" }}>
              “{quote}”
              <footer className="mt-2 text-sm" style={{ color: GR.body, fontFamily: "var(--gr-body)" }}>{list(testimonials.content, "authors")[i]}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl" style={{ fontFamily: "var(--gr-display)" }}>{text(contactSlot.content, "heading", "Contact")}</h2>
          <p className="mt-3 max-w-xl" style={{ color: GR.body }}>{text(contactSlot.content, "subheading", "")}</p>
          {contactEmail ? <a className="mt-4 inline-block" href={`mailto:${contactEmail}`}>{contactEmail}</a> : null}
        </div>
      </section>
      <footer id="gr-end" className="border-t px-6 py-12" style={{ borderColor: GR.line, backgroundColor: GR.inverse, color: GR.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--gr-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Resume-forward portfolio: Playfair display, IBM Plex Mono labels, coral strike marks.")}</p>
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
