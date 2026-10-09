import type { CSSProperties, ReactNode } from "react";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { WJ } from "./tokens";
import { list, slotAt, text, toSlots, pageSlugsOf, type TemplateSlot } from "../shared/content";
import { brandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { templateFaces } from "../shared/template-faces";
import { TemplateContactForm } from "../shared/contact-form";
import { configuredSocialLinks, socialHrefForLabel } from "@/lib/contact/links";

const faces = templateFaces([
  { family: "Inter", variable: "--wj-sans", weights: ["400", "500", "600"] },
]);

const A = "/templates/willjacks";
const HERO = `${A}/hero.jpg`;
const ARROW = `${A}/arrow.svg`;
const WORK = [`${A}/work-1.jpg`, `${A}/work-2.png`, `${A}/work-3.jpg`, `${A}/work-4.png`] as const;

/** Gallery sample only. A generated business must not inherit Will Jacks' projects. */
function isWilljacksDemo(businessName: string) {
  return businessName.trim().toLowerCase() === "will jacks";
}

function indexLabel(i: number) {
  return `(${String(i + 1).padStart(2, "0")})`;
}

/**
 * Will Jacks — personal designer-developer portfolio from the Figma file.
 * Inter stands in for TT Hoves. `pageSlug` switches Index (home) / Approach (about).
 */
export function WilljacksSite({
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
  const active =
    (pageSlug && pages.find((p) => p.slug === pageSlug)?.slug) ||
    pages.find((p) => p.slug === "home")?.slug ||
    pages[0]?.slug ||
    "home";
  const slots = toSlots(blueprint, site, active);
  const footer = slotAt(slots, "footer");
  const businessName =
    text(footer.content, "businessName") || site?.businessName || blueprint?.business.name || "Will Jacks";
  const customLogo = site?.theme?.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const demo = isWilljacksDemo(businessName);
  const location = text(
    footer.content,
    "location",
    blueprint?.business.location
      ? `Based in ${blueprint.business.location}`
      : details?.address?.trim() || (demo ? "Based in London, UK" : "")
  );

  return (
    <div
      className={`overflow-x-hidden scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#181818"),
        ...faces.style,
        fontFamily: "var(--wj-sans), ui-sans-serif, system-ui, sans-serif",
        color: WJ.ink,
        backgroundColor: WJ.bg,
        ...themeFontStyle(site?.theme, ["--wj-sans"]),
      }}
    >
      {<link rel="stylesheet" href={faces.href} />}
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <style>{WJ_CSS}</style>
      <SiteNav pages={pages} active={active} businessName={businessName} customLogo={customLogo} location={location} />
      <main>{renderPageBody(active, slots, { businessName, contactEmail, location }, demo)}</main>
      <SiteFooter
        slots={slots}
        businessName={businessName}
        contactEmail={contactEmail}
        location={location}
        demo={demo}
        siteContact={contact ?? site?.contact}
      />
    </div>
  );
}

type PageMeta = { businessName: string; contactEmail: string; location: string };

function renderPageBody(active: string, slots: TemplateSlot[], meta: PageMeta, demo: boolean) {
  if (active === "about") return <AboutBody slots={slots} demo={demo} />;
  return <HomeBody slots={slots} meta={meta} demo={demo} />;
}

function pageHref(slug: string): string {
  return `?page=${slug}`;
}

function displayFont(): CSSProperties {
  return { fontFamily: "var(--wj-sans), ui-sans-serif, sans-serif" };
}

function SiteNav({
  pages,
  active,
  businessName,
  customLogo,
  location,
}: {
  pages: { slug: string; title: string }[];
  active: string;
  businessName: string;
  customLogo: string;
  location: string;
}) {
  const links = pages.length
    ? pages
    : [
        { slug: "home", title: "Index" },
        { slug: "about", title: "Approach" },
      ];
  return (
    <nav className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between px-[35px] py-[35px] max-md:flex-col max-md:gap-[2vw] max-md:px-[15px] max-md:py-[25px]">
      <div className="pointer-events-auto flex gap-[15vw] max-md:gap-[30vw]">
        <a href={pageHref("home")} className="text-[36px] font-semibold tracking-[-1.5px] max-md:text-[24px] max-md:tracking-[-0.5px]" style={displayFont()}>
          {customLogo ? (
            <img src={customLogo} alt={businessName} width={36} height={36} className="h-9 w-9 object-contain" />
          ) : (
            businessName
          )}
        </a>
        <div className="flex flex-col">
          {links.map((p) => (
            <a
              key={p.slug}
              href={pageHref(p.slug)}
              className="wj-under text-[24px] font-semibold tracking-[-1.5px] max-md:pb-1 max-md:text-[20px] max-md:tracking-[-0.5px]"
              style={{ ...displayFont(), opacity: p.slug === active ? 1 : 0.85 }}
            >
              {p.title}
            </a>
          ))}
        </div>
      </div>
      <p className="pointer-events-auto w-[120px] whitespace-pre-line text-[16px] tracking-[-0.3px]">{location.replace(/^(Based in)\s+/i, "$1\n")}</p>
    </nav>
  );
}

function HomeBody({ slots, meta, demo }: { slots: TemplateSlot[]; meta: PageMeta; demo: boolean }) {
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const work = slotAt(slots, "portfolio");
  const heroImage = hero.image || (demo ? HERO : services.itemImages[0] || "");
  const marquee = text(hero.content, "ctaSecondary", demo ? "UIUX Designer — Frontend Developer —" : meta.businessName);
  const marqueeLine = `${marquee} ${marquee} ${marquee} ${marquee}`;

  return (
    <>
      <section className="relative flex h-screen items-end overflow-hidden px-[35px] max-md:h-auto max-md:px-[15px] max-md:pt-[200px] max-[560px]:pt-[200px]">
        <div className="flex w-full gap-[6vw] max-md:flex-col-reverse">
          <img
            src={heroImage}
            alt=""
            width={2000}
            height={2668}
            className="h-[80vh] w-[60%] object-cover max-md:h-auto max-md:w-full max-[560px]:h-[60vh] max-[560px]:object-cover"
          />
          <div className="mt-[6vw] flex w-full flex-col gap-[6vw] max-md:gap-[2vw] max-[560px]:gap-[8vw]">
            <p className="w-full max-w-[200px] text-[16px] tracking-[-0.3px]">{text(hero.content, "eyebrow", demo ? "Currently available for freelance projects" : "")}</p>
            <p className="w-full max-w-[400px] text-[16px] tracking-[-0.3px]">{text(hero.content, "subheadline")}</p>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 h-[10vw] w-full overflow-hidden max-md:bottom-[30vw] max-md:h-[17vw] max-[560px]:bottom-[20vw] max-[560px]:h-[25vw]">
          <p className="wj-marquee absolute whitespace-nowrap text-[9vw] font-normal leading-none tracking-[-0.4vw] text-white mix-blend-difference" style={displayFont()}>
            {marqueeLine}&nbsp;{marqueeLine}
          </p>
        </div>
      </section>

      <section className="px-[35px] py-[10vw] max-md:px-[15px] max-[560px]:py-[20vw]">
        <div className="overflow-hidden">
          <h2 className="text-[9vw] font-normal leading-none tracking-[-0.4vw] max-md:text-[15vw] max-[560px]:text-[20vw] max-[560px]:tracking-[-1vw]" style={displayFont()}>
            {text(about.content, "heading", "About")}
          </h2>
        </div>
        <div className="flex items-end gap-[6vw] py-[10vw] pr-[4vw] max-[1068px]:flex-col max-[1068px]:items-start max-[1068px]:gap-[5vw] max-[1068px]:py-[5vw] max-[1068px]:pb-[20vw] max-[1068px]:pr-0 max-[560px]:gap-[10vw] max-[560px]:py-[10vw] max-[560px]:pb-[30vw]">
          <p className="w-1/4 text-[16px] tracking-[-0.3px] max-[1068px]:w-full">{text(about.content, "body")}</p>
          <h3 className="w-3/4 text-[5vw] font-normal leading-[0.95] tracking-[-0.15vw] max-md:text-[7vw] max-[1068px]:w-full max-[560px]:text-[12vw]" style={displayFont()}>
            {text(about.content, "subheadline")}
          </h3>
        </div>
        <ToolsBand
          heading={text(services.content, "heading", demo ? "Core Tools" : "What we offer")}
          titles={list(services.content, "itemTitles", demo ? ["Javascript", "WebGL", "NodeJs", "Framer"] : [])}
          bodies={list(services.content, "itemBodies")}
        />
      </section>

      <section className="wj-works overflow-hidden">
        <div className="px-[35px] pb-[10vw] pt-[10vw] max-md:px-[15px] max-[560px]:pb-[20vw] max-[560px]:pt-[20vw]">
          <div className="text-right">
            <h2 className="text-[9vw] font-normal leading-none tracking-[-0.4vw] max-md:text-[15vw] max-[560px]:text-[20vw]" style={displayFont()}>
              {text(work.content, "heading", "Selected")}
            </h2>
            <h2 className="text-[9vw] font-normal leading-none tracking-[-0.4vw] max-md:text-[15vw] max-[560px]:text-[20vw]" style={displayFont()}>
              {text(work.content, "subheading", "Works")}
            </h2>
          </div>
          <p className="mt-[5vw] max-w-[600px] text-[16px] tracking-[-0.3px] max-[560px]:mt-[10vw]">{text(work.content, "body")}</p>
        </div>
        <WorkList work={work} services={services} demo={demo} />
      </section>
      <span className="sr-only">{meta.businessName}</span>
    </>
  );
}

function AboutBody({ slots, demo }: { slots: TemplateSlot[]; demo: boolean }) {
  const hero = slotAt(slots, "hero");
  const services = slotAt(slots, "services");
  const about = slotAt(slots, "about");
  const process = slotAt(slots, "process");
  const serviceTitles = list(
    services.content,
    "itemTitles",
    demo ? ["Web Design", "Motion Design", "Web Development", "No Code Development"] : []
  );
  const disciplineTitles = list(about.content, "itemTitles", demo ? ["Creative Developer", "Modern Designer"] : []);
  const processTitles = list(process.content, "itemTitles").length
    ? list(process.content, "itemTitles")
    : list(process.content, "stepTitles", demo ? ["Art Direction", "Design", "Development", "No - Code"] : []);
  const processBodies = list(process.content, "itemTitles").length
    ? list(process.content, "itemBodies")
    : list(process.content, "stepBodies");

  return (
    <>
      <section className="flex h-screen w-full items-end px-[35px] pb-[35px] max-md:px-[15px] max-md:pb-5">
        <h2 className="w-[70%] text-[5vw] font-normal leading-[0.95] tracking-[-0.15vw] max-md:w-full max-md:text-[7vw] max-[560px]:text-[12vw]" style={displayFont()}>
          {text(hero.content, "headline")}
        </h2>
      </section>
      <section className="flex gap-[5vw] px-[35px] py-[10vw] max-md:gap-[10vw] max-md:px-[15px] max-md:py-[20vw] max-[560px]:flex-col max-[560px]:gap-0">
        <div className="flex w-full flex-col gap-[300px] max-md:gap-[200px] max-[560px]:gap-[100px]">
          <div>
            <p className="mb-5 text-[16px] tracking-[-0.3px] opacity-50">{text(services.content, "heading", "Services")}</p>
            {serviceTitles.map((title) => (
              <p key={title} className="text-[16px] tracking-[-0.3px]">
                {title}
              </p>
            ))}
          </div>
          <p className="max-w-[500px] text-[16px] tracking-[-0.3px]">{text(services.content, "subheading")}</p>
        </div>
        <div className="mt-[300px] flex w-full flex-col gap-[300px] max-md:mt-[200px] max-md:gap-[200px] max-[560px]:mt-[100px] max-[560px]:gap-[100px]">
          <div>
            <p className="mb-5 text-[16px] tracking-[-0.3px] opacity-50">{text(about.content, "heading", "Disciplines")}</p>
            {disciplineTitles.map((title) => (
              <p key={title} className="text-[16px] tracking-[-0.3px]">
                {title}
              </p>
            ))}
          </div>
          <p className="max-w-[500px] text-[16px] tracking-[-0.3px]">{text(about.content, "body")}</p>
        </div>
      </section>
      <section className="px-[35px] pb-[10vw] max-md:px-[15px]">
        <ToolsBand heading={text(process.content, "heading", "Process")} titles={processTitles} bodies={processBodies} />
      </section>
    </>
  );
}

function ToolsBand({ heading, titles, bodies }: { heading: string; titles: string[]; bodies: string[] }) {
  return (
    <div
      className="relative left-1/2 flex w-screen -translate-x-1/2 gap-[6vw] overflow-hidden px-[35px] py-[10vw] max-md:px-[15px] max-[560px]:flex-col max-[560px]:gap-[10vw]"
      style={{ backgroundColor: WJ.inverse, color: WJ.inverseFg }}
    >
      <p className="w-[23.5%] text-[16px] tracking-[-0.3px] max-[560px]:w-full">{heading}</p>
      <div className="flex w-[75%] flex-col gap-[4vw] overflow-hidden max-[560px]:w-full max-[560px]:gap-[12vw]">
        {titles.map((title, i) => (
          <div key={title}>
            <h3 className="text-[5vw] font-normal leading-[0.95] tracking-[-0.15vw] max-md:text-[7vw] max-[560px]:text-[12vw]" style={displayFont()}>
              {title}
            </h3>
            <p className="mt-5 max-w-[650px] text-[16px] tracking-[-0.3px]" style={{ color: WJ.body }}>
              {bodies[i] || ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkList({ work, services, demo }: { work: TemplateSlot; services: TemplateSlot; demo: boolean }) {
  const portfolioTitles = list(work.content, "itemTitles");
  const titles = (portfolioTitles.length ? portfolioTitles : list(services.content, "itemTitles")).slice(0, 4);
  const shown = titles.length ? titles : demo ? ["Banking", "Financilux", "Stride", "Wine & Donuts"] : [];
  if (!shown.length) return null;
  const fromPortfolio = portfolioTitles.length > 0;
  const images = fromPortfolio ? work.itemImages : services.itemImages;
  const indexes =
    demo && fromPortfolio
      ? list(work.content, "itemBodies", shown.map((_, i) => indexLabel(i)))
      : shown.map((_, i) => indexLabel(i));
  const preview = (i: number) => images[i] || (demo ? WORK[i] || HERO : "");
  return (
    <div className="wj-work relative w-full overflow-hidden px-[35px] py-[10vw] max-md:px-[15px] max-[560px]:py-[20vw]">
      <div className="wj-overlay pointer-events-none absolute left-[15.25%] top-0 flex h-full w-full items-center justify-center gap-[1em] opacity-0 transition-opacity duration-1000">
        {shown.map((_, i) => {
          const src = preview(i);
          if (!src) return null;
          return (
          <div key={i} className={`wj-prev wj-prev-${i} relative w-[500px]`} style={{ top: `${-500 + i * 500}px`, transform: "rotate(10deg)" }}>
            <img
              src={src}
              alt=""
              width={i === 3 ? 752 : 1024}
              height={i === 3 ? 564 : 768}
              className="h-auto w-[500px] object-cover"
            />
          </div>
          );
        })}
      </div>
      {shown.map((title, i) => (
        <a
          key={title}
          href="#wj-end"
          className={`wj-item wj-item-${i} relative flex w-full items-center gap-8 border-b border-[rgba(198,198,198,0.5)] py-8 max-md:gap-8 max-md:py-4 ${i === shown.length - 1 ? "border-b-0" : ""}`}
        >
          <div className="flex gap-5">
            <span className="text-[14px]">{indexes[i] || `(${String(i + 1).padStart(2, "0")})`}</span>
            <h3 className="text-[4vw] font-normal max-md:text-[7vw] max-md:tracking-[-0.2vw] max-[560px]:text-[10vw]" style={displayFont()}>
              {title}
            </h3>
          </div>
          <span className="wj-icon relative left-[-20px] size-[70px] overflow-hidden rounded-full opacity-0 max-md:scale-90" style={{ backgroundColor: WJ.icon }}>
            <span className="wj-icon-a absolute left-[-70px] flex size-[70px] items-center justify-center">
              <img src={ARROW} alt="" width={24} height={24} className="size-6" />
            </span>
            <span className="wj-icon-b absolute left-0 flex size-[70px] items-center justify-center">
              <img src={ARROW} alt="" width={24} height={24} className="size-6" />
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}

function SiteFooter({
  slots,
  businessName,
  contactEmail,
  location,
  demo,
  siteContact,
}: {
  slots: TemplateSlot[];
  businessName: string;
  contactEmail: string;
  location: string;
  demo: boolean;
  siteContact?: SiteContact | null;
}) {
  const contact = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");
  const socials = list(footer.content, "itemTitles", demo ? ["Instagram", "Facebook", "Twitter", "LinkedIn"] : []);
  const links = list(footer.content, "linkLabels", demo ? ["Behance", "Dribbble", "Contra", "Pinterest"] : []);
  return (
    <footer id="wj-end">
      <div className="px-[35px] py-[10vw] max-md:px-[15px] max-md:py-[20vw] max-[560px]:pb-[10vw]">
        <div className="w-full text-right">
          <h2 className="text-[9vw] font-normal leading-none tracking-[-0.4vw] max-md:text-[15vw] max-[560px]:text-[20vw]" style={displayFont()}>
            {text(contact.content, "heading", "Reach")}
          </h2>
          <h2 className="text-[9vw] font-normal leading-none tracking-[-0.4vw] max-md:text-[15vw] max-[560px]:text-[20vw]" style={displayFont()}>
            {text(contact.content, "subheading", "Out")}
          </h2>
        </div>
        <TemplateContactForm
          contactEmail={contactEmail}
          className="mt-10 ml-auto max-w-xl space-y-4 text-left"
          buttonStyle={{ backgroundColor: "var(--brand, #181818)", color: "#fff" }}
        />
        <p className="mt-[10vw] whitespace-pre-line text-[16px] tracking-[-0.3px]">{text(footer.content, "tagline", demo ? "Currently available for freelance projects" : "").replace(" for ", "\nfor ")}</p>
        <div className="flex gap-[6vw] py-[10vw] max-md:flex-col max-md:gap-[10vw] max-md:py-[20vw]">
          <p className="w-1/4 whitespace-pre-line text-[16px] tracking-[-0.3px] max-md:w-full">{location.replace(/^(Based in)\s+/i, "$1\n")}</p>
          <div className="w-3/4 max-w-[750px] max-md:w-full">
            <p className="text-[3vw] font-normal leading-[0.95] tracking-[-0.09vw] max-md:text-[5vw] max-[560px]:text-[8vw]" style={displayFont()}>
              {text(contact.content, "body", text(footer.content, "body"))}
            </p>
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="wj-under mt-[5vw] inline-block text-[3vw] max-md:mt-[10vw] max-md:text-[5vw]" style={displayFont()}>
                {contactEmail}
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex gap-[6vw] max-md:flex-col-reverse max-md:gap-[4vw]">
          <p className="w-[27%] text-[16px] tracking-[-0.3px] max-md:w-full">© {businessName}. All rights reserved.</p>
          <div className="flex w-3/4 flex-wrap items-center gap-5 max-md:w-full">
            {links.map((label) => (
              <span key={label} className="wj-under text-[20px] max-md:text-[18px]">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <SocialBand socials={socials} siteContact={siteContact} demo={demo} />
    </footer>
  );
}

function SocialBand({
  socials,
  siteContact,
  demo,
}: {
  socials: string[];
  siteContact?: SiteContact | null;
  demo: boolean;
}) {
  const labels =
    socials.length > 0
      ? socials
      : configuredSocialLinks(siteContact).map((l) => l.label);
  const row1 = labels.slice(0, 1);
  const row2 = labels.slice(1, 3);
  const row3 = labels.slice(3, 4);
  if (labels.length === 0) return null;
  return (
    <div className="relative z-10 flex h-screen flex-col justify-between" style={{ backgroundColor: WJ.inverse, color: WJ.inverseFg }}>
      <div className="flex h-full items-center justify-center">
        <svg viewBox="0 0 1000 1000" width={1000} height={1000} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <g>
            <circle cx="400" cy="500" r="100" stroke="#181818" strokeWidth="2" fill="#e9e9e9" />
            <circle cx="480" cy="500" r="20" fill="#181818" />
          </g>
          <g>
            <circle cx="600" cy="500" r="100" stroke="#181818" strokeWidth="2" fill="#e9e9e9" />
            <circle cx="680" cy="500" r="20" fill="#181818" />
          </g>
        </svg>
        <div className="flex w-full flex-col items-center justify-between">
          <div className="flex gap-[5vw] max-md:flex-col max-md:items-center max-md:gap-[10vw] max-[560px]:gap-[15vw]">
            {row1.map((label) => (
              <SocialLink key={label} href={socialHrefForLabel(siteContact, label)} demo={demo}>
                {label}
              </SocialLink>
            ))}
          </div>
          <div className="flex gap-[5vw] max-md:flex-col max-md:items-center max-md:gap-[10vw]">
            {row2.map((label) => (
              <SocialLink key={label} href={socialHrefForLabel(siteContact, label)} demo={demo}>
                {label}
              </SocialLink>
            ))}
          </div>
          <div className="flex gap-[5vw] max-md:flex-col max-md:items-center max-md:gap-[10vw]">
            {row3.map((label) => (
              <SocialLink key={label} href={socialHrefForLabel(siteContact, label)} demo={demo}>
                {label}
              </SocialLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialLink({
  children,
  href,
  demo,
}: {
  children: ReactNode;
  href?: string;
  demo: boolean;
}) {
  const className =
    "wj-social relative block h-[11vw] text-[11vw] tracking-[-0.5vw] max-md:h-[18vw] max-md:text-[18vw] max-md:tracking-[-0.8vw] max-[560px]:h-[21vw] max-[560px]:text-[21vw]";
  const style = { color: WJ.inverseFg };
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
      </a>
    );
  }
  if (demo) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }
  return null;
}

const WJ_CSS = `
  .wj-under { position: relative; width: fit-content; }
  .wj-under::before { content: ""; background: ${WJ.ink}; width: 0; height: 1px; position: absolute; bottom: 0; left: 0; transition: width 280ms cubic-bezier(0.23, 1, 0.32, 1); }
  .wj-under:hover::before { width: 100%; }
  .wj-marquee { animation: wj-marquee 64s linear infinite; will-change: transform; }
  @keyframes wj-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .wj-item { transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), border-color 200ms ease; }
  .wj-item:active { transform: scale(0.97); }
  .wj-icon { transition: opacity 200ms cubic-bezier(0.23, 1, 0.32, 1), left 200ms cubic-bezier(0.23, 1, 0.32, 1); }
  .wj-icon-a, .wj-icon-b { transition: left 500ms cubic-bezier(0.23, 1, 0.32, 1); }
  .wj-icon-a { transition-delay: 200ms; }
  @media (hover: hover) and (pointer: fine) {
    .wj-item:hover .wj-icon { opacity: 1; left: 0; }
    .wj-item:hover .wj-icon-a { left: 0; }
    .wj-item:hover .wj-icon-b { left: 70px; }
    .wj-works:hover .wj-overlay { opacity: 0.5; }
    .wj-works:has(.wj-item-0:hover) { background-color: ${WJ.mint}; }
    .wj-works:has(.wj-item-1:hover) { background-color: ${WJ.blush}; }
    .wj-works:has(.wj-item-2:hover) { background-color: ${WJ.lemon}; }
    .wj-works:has(.wj-item-3:hover) { background-color: ${WJ.sage}; }
    .wj-works:has(.wj-item-0:hover) .wj-prev-0,
    .wj-works:has(.wj-item-1:hover) .wj-prev-1,
    .wj-works:has(.wj-item-2:hover) .wj-prev-2,
    .wj-works:has(.wj-item-3:hover) .wj-prev-3 { transform: rotate(12.5deg); }
  }
  .wj-prev { transition: transform 500ms ease; }
  .wj-social::before { content: ""; background: #e9e9e9; width: 0; height: 2px; position: absolute; bottom: 0; left: 0; transition: width 280ms cubic-bezier(0.23, 1, 0.32, 1); }
  .wj-social:hover::before { width: 100%; }
  @media (prefers-reduced-motion: reduce) {
    .wj-marquee { animation: none; }
    .wj-item:active { transform: none; }
    .wj-under::before, .wj-icon, .wj-icon-a, .wj-icon-b, .wj-social::before { transition: none; }
  }
`;
