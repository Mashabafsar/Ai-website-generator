import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { FM } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { templateFaces } from "../shared/template-faces";
import { TemplateContactForm } from "../shared/contact-form";





const faces = templateFaces([
  { family: "Syne", variable: "--fm-display", weights: ["600","700","800"] },
  { family: "Inter", variable: "--fm-body", weights: ["400","500"] },
]);

const HERO = "/templates/flowmint/hero.jpg";
const NAV = [
  { label: "Work", href: "#fm-main" },
  { label: "About", href: "#fm-about" },
  { label: "Contact", href: "#fm-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function FlowmintSite({
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
    "FlowMint";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="fm-top"
      className={`scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#1A1A1A"),
        ...faces.style,
        fontFamily: "var(--fm-body), ui-sans-serif, system-ui, sans-serif",
        color: FM.ink,
        backgroundColor: FM.bg,
        ...themeFontStyle(site?.theme, ["--fm-display", "--fm-body"]),
      }}
    >
      {<link rel="stylesheet" href={faces.href} />}
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: FM.line, backgroundColor: FM.bg }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#fm-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-xl"
                style={{ backgroundColor: FM.brand, color: FM.inverseFg, fontFamily: "var(--fm-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--fm-display)", color: FM.ink }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: FM.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#fm-end"}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: FM.brand, color: FM.inverseFg, fontFamily: "var(--fm-display)" }}
          >
            {text(hero.content, "ctaPrimary", "See the work")}
          </a>
        </div>
      </header>
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-end gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm" style={{ color: FM.brand }}>{text(hero.content, "eyebrow", "FlowMint")}</p>
            <h1 className="mt-4 text-5xl leading-[0.95] sm:text-7xl" style={{ fontFamily: "var(--fm-display)" }}>
              {text(hero.content, "headline", "Selected work, quietly made")}
            </h1>
            <p className="mt-6 max-w-md text-lg" style={{ color: FM.body }}>{text(hero.content, "subheadline", "Brand, web, and campaign work for teams who care how things feel.")}</p>
          </div>
          <img src={heroImage} alt="" className="h-[28rem] w-full object-cover rounded-xl" />
        </div>
      </section>
      <section id="fm-about" className="px-6 py-20" style={{ backgroundColor: FM.surface }}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl" style={{ fontFamily: "var(--fm-display)" }}>{text(about.content, "heading", "About")}</h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: FM.body }}>{text(about.content, "body", text(about.content, "subheadline", "Selected work from a design practice that moves slowly on purpose."))}</p>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {list(services.content, "itemTitles", ["Brand", "Product", "Campaign"]).map((title, i) => (
            <article key={i} className="p-6 rounded-xl" style={{ backgroundColor: FM.card, border: `1px solid ${FM.line}` }}>
              <h3 className="text-xl" style={{ fontFamily: "var(--fm-display)" }}>{title}</h3>
              <p className="mt-2 text-sm" style={{ color: FM.body }}>{list(services.content, "itemBodies")[i] || ""}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="fm-main" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          {list(work.content, "itemTitles", ["One", "Two", "Three"]).map((title, i) => (
            <article key={i} className="mb-10">
              <img src={work.itemImages[i] || heroImage} alt="" className="h-80 w-full object-cover rounded-xl" />
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-2xl" style={{ fontFamily: "var(--fm-display)" }}>{title}</h3>
                <p className="text-sm" style={{ color: FM.body }}>{list(work.content, "itemBodies")[i] || ""}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="text-2xl" style={{ fontFamily: "var(--fm-display)" }}>
              “{quote}”
              <footer className="mt-2 text-sm" style={{ color: FM.body, fontFamily: "var(--fm-body)" }}>{list(testimonials.content, "authors")[i]}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl" style={{ fontFamily: "var(--fm-display)" }}>{text(contactSlot.content, "heading", "Contact")}</h2>
          <p className="mt-3 max-w-xl" style={{ color: FM.body }}>{text(contactSlot.content, "subheading", "")}</p>
          {contactEmail ? <a className="mt-4 inline-block" href={`mailto:${contactEmail}`}>{contactEmail}</a> : null}
          <TemplateContactForm contactEmail={contactEmail} />
        </div>
      </section>
      <footer id="fm-end" className="border-t px-6 py-12" style={{ borderColor: FM.line, backgroundColor: FM.inverse, color: FM.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--fm-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Dark editorial portfolio with generous type and a mint-quiet surface.")}</p>
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
