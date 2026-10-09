import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { LX_CSS } from "./css";
import {
  ABOUT_IMGS,
  ARROW,
  CLIENT_LOGOS,
  CONTACT_IMG,
  MORE_IMGS,
  NAV_IMG,
  PROJECTS,
  SERVICES,
  TEAM,
  TRAIL,
} from "./defaults";
import { list, slotAt, text, toSlots, pageSlugsOf, type TemplateSlot } from "../shared/content";
import { brandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { TemplateContactForm } from "../shared/contact-form";
import { socialHrefForLabel } from "@/lib/contact/links";

type PageRef = { slug: string; title: string };

/**
 * LuxeFrame — high-end photography house from the coded kit.
 * Charcoal canvas, acid-lime marks, Matter type. Pages: Home, Projects, About, Contact.
 */
export function LuxeframeSite({
  blueprint,
  site,
  contact,
  pageSlug,
}: {
  blueprint?: WebsiteBlueprint | null;
  site?: AssembledSite | null;
  contact?: SiteContact | null;
  pageSlug?: string;
}) {
  const pages = pageSlugsOf(blueprint, site);
  const navPages = pages.length
    ? pages
    : [
        { slug: "home", title: "Home" },
        { slug: "portfolio", title: "Projects" },
        { slug: "about", title: "About" },
        { slug: "contact", title: "Contact Us" },
      ];
  const active =
    (pageSlug && navPages.find((p) => p.slug === pageSlug)?.slug) ||
    navPages.find((p) => p.slug === "home")?.slug ||
    navPages[0]?.slug ||
    "home";
  const slots = toSlots(blueprint, site, active);
  const footer = slotAt(slots, "footer");
  const businessName =
    text(footer.content, "businessName") || site?.businessName || blueprint?.business.name || "LuxeFrame";
  const customLogo = site?.theme?.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const contactPhone = details?.phone?.trim() || "";
  const socials = list(footer.content, "itemTitles", ["Instagram", "Facebook", "X (Twitter)", "LinkedIn"]);

  return (
    <div
      className="lx-root scroll-smooth antialiased"
      style={{
        ...brandStyle(site?.theme, "#E0FD60"),
        ...themeFontStyle(site?.theme, ["--lx-display", "--lx-body"]),
      }}
    >
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <style>{LX_CSS}</style>
      <input id="lx-nav-toggle" type="checkbox" />
      <SiteNav businessName={businessName} customLogo={customLogo} />
      <Overlay pages={navPages} socials={socials} contact={details} />
      <main className="lx-main">{renderPage(active, slots, { businessName, contactEmail, contactPhone, contact: details })}</main>
      <SiteFooter
        slots={slots}
        pages={navPages}
        businessName={businessName}
        socials={socials}
        year={new Date().getFullYear()}
        contact={details}
      />
    </div>
  );
}

type Meta = {
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  contact?: SiteContact | null;
};

function renderPage(active: string, slots: TemplateSlot[], meta: Meta) {
  if (active === "about") return <AboutBody slots={slots} businessName={meta.businessName} />;
  if (active === "portfolio") return <PortfolioBody slots={slots} />;
  if (active === "contact") return <ContactBody slots={slots} meta={meta} />;
  return <HomeBody slots={slots} />;
}

function pageHref(slug: string) {
  return `?page=${slug}`;
}

function Heading({ label }: { label: string }) {
  return (
    <div className="lx-heading">
      <div className="lx-tag">
        <span className="lx-dot" />
        <h4 className="lx-font20">{label}</h4>
      </div>
      <div className="lx-rule" />
    </div>
  );
}

function SiteNav({ businessName, customLogo }: { businessName: string; customLogo: string }) {
  return (
    <nav className="lx-bar">
      <a href={pageHref("home")} className="lx-logo">
        {customLogo ? <img src={customLogo} alt={businessName} style={{ width: 36, height: 36, objectFit: "contain" }} /> : <span>{businessName}</span>}
      </a>
      <label htmlFor="lx-nav-toggle" className="lx-ham">
        <p>Menu</p>
        <span className="lx-circle">
          <span className="lx-line" />
          <span className="lx-line" />
        </span>
      </label>
    </nav>
  );
}

function Overlay({
  pages,
  socials,
  contact,
}: {
  pages: PageRef[];
  socials: string[];
  contact?: SiteContact | null;
}) {
  return (
    <div className="lx-menu" data-motion-skip>
      <div className="lx-menu-img">
        <label htmlFor="lx-nav-toggle" className="lx-menu-close" aria-label="Close menu" />
        <img src={NAV_IMG} alt="" />
      </div>
      <div className="lx-menu-links">
        <div className="lx-menu-top">
          {pages.map((p) => (
            <div key={p.slug} className="menu_link_block">
              <a href={pageHref(p.slug)} className="lx-under">
                {p.title}
              </a>
            </div>
          ))}
        </div>
        <div className="lx-menu-bottom">
          {socials.map((label) => {
            const href = socialHrefForLabel(contact, label);
            return href ? (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="lx-under">
                {label}
              </a>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}

function pickProjects(work: TemplateSlot, count: number, offset = 0) {
  const titles = list(
    work.content,
    "itemTitles",
    PROJECTS.slice(offset, offset + count).map((p) => p.title)
  );
  const places = list(
    work.content,
    "itemBodies",
    PROJECTS.slice(offset, offset + count).map((p) => p.place)
  );
  return titles.slice(0, count).map((title, i) => ({
    title,
    place: places[i] || PROJECTS[offset + i]?.place || "",
    img: work.itemImages[i] || PROJECTS[offset + i]?.img || TRAIL[0],
  }));
}

function ProjectRows({ items, rows }: { items: { title: string; place: string; img: string }[]; rows: number[] }) {
  const classes = ["lx-r1", "lx-r2", "lx-r3", "lx-r4", "lx-r5"];
  let cursor = 0;
  return (
    <>
      {rows.map((count, rowIndex) => {
        const slice = items.slice(cursor, cursor + count);
        cursor += count;
        if (!slice.length) return null;
        return (
          <div key={rowIndex} className={`lx-proj-row ${classes[rowIndex] || "lx-r1"}`}>
            {slice.map((item) => (
              <a key={item.title} href={pageHref("portfolio")}>
                <div className="lx-shot">
                  <img src={item.img} alt={item.title} />
                </div>
                <div>
                  <h5 className="lx-font24">{item.title}</h5>
                  <p className="lx-font16">{item.place}</p>
                </div>
              </a>
            ))}
          </div>
        );
      })}
    </>
  );
}

function Clients({ slots }: { slots: TemplateSlot[] }) {
  const quotes = slotAt(slots, "testimonials");
  const heading = text(quotes.content, "heading", "Selected Clients");
  const copy = text(
    quotes.content,
    "body",
    "Our clients had an amazing experience collaborating with us, praising our dedication, creativity, and professionalism every step of the way. We're confident you'll feel the same and enjoy a seamless, rewarding partnership with us!"
  );
  const quoteList = list(quotes.content, "quotes");
  const authors = list(quotes.content, "authors");
  const roles = list(quotes.content, "roles");
  return (
    <section className="lx-clients">
      <div className="lx-wrap">
        <Heading label={heading} />
        <div className="lx-logos">
          {CLIENT_LOGOS.map((src) => (
            <div key={src} className="lx-logo-cell">
              <img src={src} alt="" />
            </div>
          ))}
        </div>
        <div className="lx-client-copy">
          <h3 className="lx-font36">{copy}</h3>
        </div>
        {quoteList.length ? (
          <div className="lx-quotes">
            {quoteList.slice(0, 3).map((quote, i) => (
              <blockquote key={i} className="lx-quote">
                <div className="lx-quote-mark">“</div>
                <p className="lx-font16" style={{ marginTop: 20 }}>
                  {quote}
                </p>
                <div style={{ marginTop: 50 }}>
                  <p className="lx-font24">{authors[i]}</p>
                  <p className="lx-font16">{roles[i]}</p>
                </div>
              </blockquote>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function HomeBody({ slots }: { slots: TemplateSlot[] }) {
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const work = slotAt(slots, "portfolio");
  const services = slotAt(slots, "services");
  const cta = slotAt(slots, "cta");
  const trail = (hero.itemImages.filter(Boolean) as string[]).length ? (hero.itemImages.filter(Boolean) as string[]) : [...TRAIL];
  const serviceTitles = list(services.content, "itemTitles", [...SERVICES]);
  const moreImgs = [cta.image, ...(cta.itemImages || [])].filter(Boolean) as string[];
  const more = moreImgs.length >= 4 ? moreImgs : [...MORE_IMGS];

  return (
    <>
      <header className="lx-hero" data-lx-trail data-motion-skip>
        <div className="lx-hero-text">
          <h1>{text(hero.content, "headline", "High-end visual for exclusive exquisite moments")}</h1>
        </div>
        <div className="lx-scroll">
          <h2 className="lx-font16">{text(hero.content, "ctaPrimary", "Scroll Down")}</h2>
          <div className="lx-arrow">
            <img src={ARROW} alt="" />
          </div>
        </div>
        <div className="lx-trail">
          {trail.slice(0, 10).map((src, i) => (
            <div key={src + i} className="lx-trail-img">
              <img src={src} alt="" />
            </div>
          ))}
        </div>
      </header>
      <section className="lx-about">
        <div className="lx-wrap">
          <h3 className="lx-font36">
            {text(
              about.content,
              "body",
              "LuxeFrame is a visionary production company crafting captivating, awe-inspiring visual experiences through photography and videography for individuals, businesses, and organizations seeking timeless, high-end imagery."
            )}
          </h3>
        </div>
      </section>
      <section>
        <div className="lx-wrap">
          <Heading label={text(work.content, "heading", "Selected Projects")} />
          <ProjectRows items={pickProjects(work, 7)} rows={[2, 3, 2]} />
        </div>
      </section>
      <section className="lx-services">
        <div className="lx-wrap" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Heading label={text(services.content, "heading", "Service Areas")} />
          <div style={{ width: "100%", marginTop: 70 }}>
            {serviceTitles.map((title, i) => (
              <a key={title} href={pageHref("portfolio")} className="lx-svc">
                <div>
                  <p className="lx-font16">{`${String(i + 1).padStart(2, "0")}/`}</p>
                  <h4 className="lx-font36">{title}</h4>
                </div>
                <span className="lx-svc-arrow">→</span>
              </a>
            ))}
          </div>
          <a href={pageHref("portfolio")} className="lx-btn">
            <span className="lx-font16">View All Projects</span>
          </a>
        </div>
      </section>
      <section className="lx-more">
        <div className="lx-wrap" style={{ height: "100%", position: "relative" }}>
          <div className="lx-more-txt">
            <h2>{text(cta.content, "headline", "We ignite the passion that compels your audience to book their next unforgettable stay.")}</h2>
            <a href={pageHref("about")} className="lx-btn" style={{ marginTop: 50 }}>
              <span className="lx-font16">{text(cta.content, "ctaPrimary", "More About us")}</span>
            </a>
          </div>
          <div className="lx-more-row">
            <img src={more[0]} alt="" />
            <img src={more[1]} alt="" />
          </div>
          <div className="lx-more-row">
            <img src={more[2]} alt="" />
            <img src={more[3]} alt="" />
          </div>
        </div>
      </section>
      <Clients slots={slots} />
    </>
  );
}

function AboutBody({ slots, businessName }: { slots: TemplateSlot[]; businessName: string }) {
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const benefits = slotAt(slots, "features");
  const team = slotAt(slots, "services");
  const stills = (about.itemImages.filter(Boolean) as string[]).length >= 2 ? (about.itemImages.filter(Boolean) as string[]) : [...ABOUT_IMGS];
  const benefitTitles = list(benefits.content, "itemTitles", [
    "Exceptional Quality and Creativity",
    "Professional and Personalized Service",
    "Versatile and Comprehensive Solutions",
  ]);
  const benefitBodies = list(benefits.content, "itemBodies");
  const names = list(team.content, "itemTitles", TEAM.map((t) => t.name));
  const roles = list(team.content, "itemBodies", TEAM.map((t) => t.role));
  const marquee = Array.from({ length: 16 }, () => businessName).join(" - ");

  return (
    <>
      <header className="lx-pagehead">
        <div className="lx-wrap">
          <h1 className="lx-font90">{text(hero.content, "headline", "Discover Our Studio and Vision")}</h1>
        </div>
      </header>
      <section>
        <div className="lx-wrap">
          <Heading label={text(about.content, "heading", "About us")} />
          <div className="lx-about-lead">
            <h2 className="lx-font36">
              {text(
                about.content,
                "headline",
                "Welcome to LuxeFrame, where we transform moments into timeless visual narratives. Founded with a passion for capturing the essence of life's most cherished experiences, LuxeFrame is dedicated to crafting captivating photography and videography that resonates with authenticity and elegance."
              )}
            </h2>
          </div>
          <div className="lx-about-imgs">
            <div className="lx-shot">
              <img src={stills[0]} alt="" />
            </div>
            <div className="lx-shot">
              <img src={stills[1]} alt="" />
            </div>
          </div>
          <div className="lx-about-copy">
            <p className="lx-font16">{text(about.content, "body")}</p>
            <p className="lx-font16" style={{ marginTop: 70 }}>
              {text(about.content, "subheadline")}
            </p>
          </div>
        </div>
      </section>
      <section className="lx-benefits">
        <div className="lx-wrap">
          <Heading label={text(benefits.content, "heading", "Benefits")} />
          <h3 className="lx-font36" style={{ marginTop: 70 }}>
            {text(
              benefits.content,
              "subheading",
              "At LuxeFrame, we pride ourselves on delivering unparalleled photography and videography services that capture the essence of your unique story. Here are the key benefits of choosing our studio:"
            )}
          </h3>
          <div className="lx-ben-grid">
            {benefitTitles.map((title, i) => (
              <div key={title} className="lx-ben">
                <h5 className="lx-font24">{title}</h5>
                <p className="lx-font16" style={{ marginTop: 20 }}>
                  {benefitBodies[i]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="lx-marquee">
        <div className="lx-marquee-track">
          {marquee} - {marquee}
        </div>
      </div>
      <section>
        <div className="lx-wrap">
          <Heading label={text(team.content, "heading", "Team Members")} />
          <div className="lx-team">
            {names.map((name, i) => (
              <div key={name}>
                <img src={team.itemImages[i] || TEAM[i]?.img || TRAIL[0]} alt={name} />
                <h5 className="lx-font24" style={{ marginTop: 20 }}>
                  {name}
                </h5>
                <p className="lx-font16">{roles[i]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Clients slots={slots} />
    </>
  );
}

function PortfolioBody({ slots }: { slots: TemplateSlot[] }) {
  const hero = slotAt(slots, "hero");
  const work = slotAt(slots, "portfolio");
  return (
    <>
      <header className="lx-pagehead">
        <div className="lx-wrap">
          <h1 className="lx-font90">{text(hero.content, "headline", "Discover our stunning global photography projects.")}</h1>
        </div>
      </header>
      <section>
        <div className="lx-wrap">
          <Heading label={text(work.content, "heading", "All Projects")} />
          <ProjectRows items={pickProjects(work, 12)} rows={[2, 3, 2, 2, 3]} />
        </div>
      </section>
    </>
  );
}

function ContactBody({ slots, meta }: { slots: TemplateSlot[]; meta: Meta }) {
  const hero = slotAt(slots, "hero");
  const contact = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");
  const still = contact.image || CONTACT_IMG;
  const socials = list(contact.content, "itemTitles", list(footer.content, "itemTitles", ["Instagram", "Facebook", "X (Twitter)", "LinkedIn"]));
  const mail = meta.contactEmail;
  const phone = meta.contactPhone;
  return (
    <>
      <header className="lx-pagehead">
        <div className="lx-wrap">
          <h1 className="lx-font90">{text(hero.content, "headline", "Get in Touch with LuxeFrame")}</h1>
        </div>
      </header>
      <section>
        <div className="lx-wrap lx-contact">
          <div className="lx-contact-visual">
            <img src={still} alt="" />
            <img src={still} alt="" />
            <img src={still} alt="" />
            <img src={still} alt="" />
          </div>
          <div className="lx-contact-details">
            <div>
              <Heading label={text(contact.content, "heading", "Studio")} />
              <h2 className="lx-font24" style={{ marginTop: 30 }}>
                {meta.businessName}
              </h2>
              <h2 className="lx-font24">{text(contact.content, "subheading", "A Visionary Production Company")}</h2>
              <h2 className="lx-font24">{text(contact.content, "body", "73 Holburn Street, London, UK")}</h2>
              {mail ? (
                <a href={`mailto:${mail}`} className="lx-under">
                  <h2 className="lx-font24">{mail}</h2>
                </a>
              ) : null}
              {phone ? (
                <a href={`tel:${phone}`} className="lx-under">
                  <h2 className="lx-font24">{phone}</h2>
                </a>
              ) : null}
              <TemplateContactForm
                contactEmail={mail}
                className="mt-10 max-w-xl space-y-4 text-left"
                buttonStyle={{ backgroundColor: "var(--brand, #C8FF3D)", color: "#111" }}
              />
            </div>
            <div style={{ marginTop: 100 }}>
              <Heading label="Socials" />
              {socials.map((label) => {
                const href = socialHrefForLabel(meta.contact, label);
                return href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lx-under"
                    style={{ marginTop: 12 }}
                  >
                    <h2 className="lx-font24">{label}</h2>
                  </a>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SiteFooter({
  slots,
  pages,
  businessName,
  socials,
  year,
  contact,
}: {
  slots: TemplateSlot[];
  pages: PageRef[];
  businessName: string;
  socials: string[];
  year: number;
  contact?: SiteContact | null;
}) {
  const footer = slotAt(slots, "footer");
  const tagline = text(footer.content, "tagline", "LuxeFrame is a visionary production.");
  const labels = list(footer.content, "linkLabels", pages.map((p) => p.title));
  return (
    <footer id="lx-end" className="lx-foot">
      <div className="lx-wrap lx-foot-inner">
        <div className="lx-foot-col">
          <h5 className="lx-font24">{tagline}</h5>
          <h5 className="lx-font24">
            ©{year} {businessName}
          </h5>
        </div>
        <div className="lx-foot-col">
          <div className="lx-foot-links">
            {pages.map((p, i) => (
              <a key={p.slug} href={pageHref(p.slug)} className="lx-under">
                {labels[i] || p.title}
              </a>
            ))}
          </div>
          <div className="lx-foot-links">
            {socials.map((label) => {
              const href = socialHrefForLabel(contact, label);
              return href ? (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="lx-under">
                  {label}
                </a>
              ) : null;
            })}
          </div>
        </div>
      </div>
      <h5 className="lx-giant">{businessName}</h5>
    </footer>
  );
}
