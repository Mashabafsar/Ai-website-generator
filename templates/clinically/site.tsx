import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { CL } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { templateFaces } from "../shared/template-faces";
import { TemplateContactForm } from "../shared/contact-form";





const faces = templateFaces([
  { family: "Inter", variable: "--cl-display", weights: ["500","600","700"] },
  { family: "Inter", variable: "--cl-body", weights: ["400","500"] },
]);

const HERO = "/templates/clinically/hero.jpg";
const NAV = [
  { label: "Work", href: "#cl-main" },
  { label: "About", href: "#cl-about" },
  { label: "Contact", href: "#cl-end" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function ClinicallySite({
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
    "Clinically";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const heroImage = hero.image || HERO;

  return (
    <div
      id="cl-top"
      className={`scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#1E5DBC"),
        ...faces.style,
        fontFamily: "var(--cl-body), ui-sans-serif, system-ui, sans-serif",
        color: CL.ink,
        backgroundColor: CL.bg,
        ...themeFontStyle(site?.theme, ["--cl-display", "--cl-body"]),
      }}
    >
      {<link rel="stylesheet" href={faces.href} />}
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: CL.line, backgroundColor: CL.bg }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <a href="#cl-top" className="mr-auto flex items-center gap-2">
            {customLogo ? (
              <img src={customLogo} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center text-xs font-bold rounded-full"
                style={{ backgroundColor: CL.brand, color: CL.inverseFg, fontFamily: "var(--cl-display)" }}
              >
                {initials(businessName)}
              </span>
            )}
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "var(--cl-display)", color: CL.ink }}>
              {businessName}
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: CL.body }}>
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:opacity-70">{item.label}</a>
            ))}
          </nav>
          <a
            href={contactEmail ? `mailto:${contactEmail}` : "#cl-end"}
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: CL.brand, color: CL.inverseFg, fontFamily: "var(--cl-display)" }}
          >
            {text(hero.content, "ctaPrimary", "Find a clinic")}
          </a>
        </div>
      </header>
      <section className="px-6 py-20" style={{ ...sectionBandStyle(hero.theme) }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: CL.brand }}>{text(hero.content, "eyebrow", "Clinically")}</p>
            <h1 className="mt-4 text-4xl leading-[1.1] sm:text-6xl" style={{ fontFamily: "var(--cl-display)" }}>
              {text(hero.content, "headline", "Care that is easy to find, and easier to trust")}
            </h1>
            <p className="mt-5 max-w-lg text-lg" style={{ color: CL.body }}>{text(hero.content, "subheadline", "Locations, specialists, and bookings in one medical-grade experience.")}</p>
            <a href={contactEmail ? `mailto:${contactEmail}` : "#cl-end"} className="mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold" style={{ backgroundColor: CL.brand, color: CL.inverseFg }}>
              {text(hero.content, "ctaPrimary", "Find a clinic")}
            </a>
          </div>
          <div className="overflow-hidden rounded-3xl" style={{ backgroundColor: CL.surface }}>
            <img src={heroImage} alt="" data-parallax="0.08" className="h-[28rem] w-full object-cover" />
          </div>
        </div>
      </section>
      <section id="cl-main" className="px-6 py-20" style={{ backgroundColor: CL.surface, ...sectionBandStyle(services.theme) }}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl" style={{ fontFamily: "var(--cl-display)" }}>{text(services.content, "heading", "What we offer")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {list(services.content, "itemTitles", ["Care", "Support", "Guidance"]).map((title, i) => (
              <article key={i} className="p-6 rounded-2xl" style={{ backgroundColor: CL.card, border: `1px solid ${CL.line}` }}>
                <div className="text-sm font-semibold" style={{ color: CL.brand }}>0{i + 1}</div>
                <h3 className="mt-3 text-xl" style={{ fontFamily: "var(--cl-display)" }}>{title}</h3>
                <p className="mt-2 text-sm" style={{ color: CL.body }}>{list(services.content, "itemBodies")[i] || ""}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="cl-about" className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <img src={about.image || heroImage} alt="" className="h-80 w-full object-cover rounded-3xl" />
          <div>
            <h2 className="text-3xl" style={{ fontFamily: "var(--cl-display)" }}>{text(about.content, "heading", "The practice")}</h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: CL.body }}>{text(about.content, "body", text(about.content, "subheadline", "Coordinated care across clinics, with a front door patients actually use."))}</p>
          </div>
        </div>
      </section>
      <section className="px-6 py-16" style={{ backgroundColor: CL.inverse, color: CL.inverseFg }}>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {list(stats.content, "itemTitles", ["12 yrs", "4.9", "2k+"]).map((n, i) => (
            <div key={i}>
              <div className="text-4xl" style={{ fontFamily: "var(--cl-display)", color: CL.brand }}>{n}</div>
              <p className="mt-2 text-sm opacity-70">{list(stats.content, "itemBodies")[i] || ""}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl columns-1 gap-6 md:columns-3">
          {list(testimonials.content, "quotes").map((quote, i) => (
            <blockquote key={i} className="mb-6 break-inside-avoid p-6 rounded-2xl" style={{ backgroundColor: CL.surface }}>
              <p>“{quote}”</p>
              <footer className="mt-4 text-sm" style={{ color: CL.body }}>{list(testimonials.content, "authors")[i]}</footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {list(faq.content, "questions").map((q, i) => (
            <details key={i} className="border-b py-4" style={{ borderColor: CL.line }}>
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-sm" style={{ color: CL.body }}>{list(faq.content, "answers")[i]}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl px-8 py-14 text-center rounded-3xl" style={{ backgroundColor: CL.brand, color: CL.inverseFg }}>
          <h2 className="text-3xl" style={{ fontFamily: "var(--cl-display)" }}>{text(cta.content, "headline", "Ready when you are")}</h2>
          <a href={contactEmail ? `mailto:${contactEmail}` : "#cl-end"} className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold" style={{ backgroundColor: CL.inverse, color: CL.inverseFg }}>
            {text(cta.content, "ctaPrimary", "Find a clinic")}
          </a>
        </div>
      </section>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl" style={{ fontFamily: "var(--cl-display)" }}>{text(contactSlot.content, "heading", "Contact")}</h2>
          <p className="mt-3 max-w-xl" style={{ color: CL.body }}>{text(contactSlot.content, "subheading", "")}</p>
          {contactEmail ? <a className="mt-4 inline-block underline" href={`mailto:${contactEmail}`}>{contactEmail}</a> : null}
          <TemplateContactForm contactEmail={contactEmail} />
        </div>
      </section>
      <footer id="cl-end" className="border-t px-6 py-12" style={{ borderColor: CL.line, backgroundColor: CL.inverse, color: CL.inverseFg, ...sectionBandStyle(footer.theme) }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--cl-display)" }}>{businessName}</div>
            <p className="mt-2 max-w-sm text-sm opacity-70">{text(footer.content, "tagline", "Trust-blue medical system: Inter, ice surfaces, appointment-led home.")}</p>
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
