import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { MH } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { templateFaces } from "../shared/template-faces";





const faces = templateFaces([
  { family: "Manrope", variable: "--mh-display", weights: ["600","700"] },
  { family: "Inter", variable: "--mh-body", weights: ["400","500"] },
]);

const HERO = "/templates/medhealth/hero.jpg";
const NAV = [
  { label: "Work", href: "#mh-main" },
  { label: "About", href: "#mh-about" },
  { label: "Contact", href: "#mh-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MH";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function MedhealthSite({
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
  const services = slotAt(slots, "services");
  const about = slotAt(slots, "about");
  const stats = slotAt(slots, "features");
  const testimonials = slotAt(slots, "testimonials");
  const faq = slotAt(slots, "faq");
  const cta = slotAt(slots, "cta");
  const contactSlot = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");
  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "MedHealth";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="mh-top"
      className={`scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#224171"),
        ...faces.style,
        fontFamily: "var(--mh-body), ui-sans-serif, system-ui, sans-serif",
        color: MH.ink,
        backgroundColor: MH.bg,
        ...themeFontStyle(site?.theme, ["--mh-display", "--mh-body"]),
      }}
    >
      {<link rel="stylesheet" href={faces.href} />}
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: MH.line, backgroundColor: MH.bg }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#mh-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-full"
                style={{ backgroundColor: MH.brand, color: MH.inverseFg, fontFamily: "var(--mh-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--mh-display)", color: MH.ink }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: MH.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#mh-end"}
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: MH.brand, color: MH.inverseFg, fontFamily: "var(--mh-display)" }}
          >
            {text(hero.content, "ctaPrimary", "Request an appointment")}
          </a>
        </div>
      </header>
      <section className="px-6 py-20" style={{ ...sectionBandStyle(hero.theme) }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: MH.brand }}>{text(hero.content, "eyebrow", "MedHealth")}</p>
            <h1 className="mt-4 text-4xl leading-[1.1] sm:text-6xl" style={{ fontFamily: "var(--mh-display)" }}>
              {text(hero.content, "headline", "Healthcare, explained without the noise")}
            </h1>
            <p className="mt-5 max-w-lg text-lg" style={{ color: MH.body }}>{text(hero.content, "subheadline", "Doctors, services, and visiting hours presented the way patients look for them.")}</p>
            <a href={contactEmail ? `mailto:${contactEmail}` : "#mh-end"} className="mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold" style={{ backgroundColor: MH.brand, color: MH.inverseFg }}>
              {text(hero.content, "ctaPrimary", "Request an appointment")}
            </a>
          </div>
          <div className="overflow-hidden rounded-3xl" style={{ backgroundColor: MH.surface }}>
            <img src={heroImage} alt="" data-parallax="0.08" className="h-[28rem] w-full object-cover" />
          </div>
        </div>
      </section>
      <section id="mh-main" className="px-6 py-20" style={{ backgroundColor: MH.surface, ...sectionBandStyle(services.theme) }}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl" style={{ fontFamily: "var(--mh-display)" }}>{text(services.content, "heading", "What we offer")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {list(services.content, "itemTitles", ["Care", "Support", "Guidance"]).map((title, i) => (
              <article key={i} className="p-6 rounded-2xl" style={{ backgroundColor: MH.card, border: `1px solid ${MH.line}` }}>
                <div className="text-sm font-semibold" style={{ color: MH.brand }}>0{i + 1}</div>
                <h3 className="mt-3 text-xl" style={{ fontFamily: "var(--mh-display)" }}>{title}</h3>
                <p className="mt-2 text-sm" style={{ color: MH.body }}>{list(services.content, "itemBodies")[i] || ""}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="mh-about" className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <img src={about.image || heroImage} alt="" className="h-80 w-full object-cover rounded-3xl" />
          <div>
            <h2 className="text-3xl" style={{ fontFamily: "var(--mh-display)" }}>{text(about.content, "heading", "The practice")}</h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: MH.body }}>{text(about.content, "body", text(about.content, "subheadline", "Primary and specialty care with a clear path from search to appointment."))}</p>
          </div>
        </div>
      </section>
      <section className="px-6 py-16" style={{ backgroundColor: MH.inverse, color: MH.inverseFg }}>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {list(stats.content, "itemTitles", ["12 yrs", "4.9", "2k+"]).map((n, i) => (
            <div key={i}>
              <div className="text-4xl" style={{ fontFamily: "var(--mh-display)", color: MH.brand }}>{n}</div>
              <p className="mt-2 text-sm opacity-70">{list(stats.content, "itemBodies")[i] || ""}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl columns-1 gap-6 md:columns-3">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="mb-6 break-inside-avoid p-6 rounded-2xl" style={{ backgroundColor: MH.surface }}>
              <p>“{quote}”</p>
              <footer className="mt-4 text-sm" style={{ color: MH.body }}>{list(testimonials.content, "authors")[i]}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {list(faq.content, "questions").map((q, i) => (
            <details key={i} className="border-b py-4" style={{ borderColor: MH.line }}>
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-sm" style={{ color: MH.body }}>{list(faq.content, "answers")[i]}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl px-8 py-14 text-center rounded-3xl" style={{ backgroundColor: MH.brand, color: MH.inverseFg }}>
          <h2 className="text-3xl" style={{ fontFamily: "var(--mh-display)" }}>{text(cta.content, "headline", "Ready when you are")}</h2>
          <a href={contactEmail ? `mailto:${contactEmail}` : "#mh-end"} className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold" style={{ backgroundColor: MH.inverse, color: MH.inverseFg }}>
            {text(cta.content, "ctaPrimary", "Request an appointment")}
          </a>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl" style={{ fontFamily: "var(--mh-display)" }}>{text(contactSlot.content, "heading", "Contact")}</h2>
          <p className="mt-3 max-w-xl" style={{ color: MH.body }}>{text(contactSlot.content, "subheading", "")}</p>
          {contactEmail ? <a className="mt-4 inline-block underline" href={`mailto:${contactEmail}`}>{contactEmail}</a> : null}
        </div>
      </section>
      <footer id="mh-end" className="border-t px-6 py-12" style={{ borderColor: MH.line, backgroundColor: MH.inverse, color: MH.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--mh-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Clean clinical marketing site with navy trust marks and soft informational cards.")}</p>
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
