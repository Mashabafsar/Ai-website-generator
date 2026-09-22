import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { RS } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { templateFaces } from "../shared/template-faces";

const faces = templateFaces([
  { family: "Poppins", variable: "--rs-sans", weights: ["500", "600"] },
]);

const HERO = "/templates/resume/hero.png";
const WORK = [
  "/templates/resume/work-01.png",
  "/templates/resume/work-02.png",
  "/templates/resume/work-03.png",
];
const DOT = "/templates/resume/dot.svg";
const BULLET = "/templates/resume/bullet.svg";
const NAV_HREFS: Record<string, string> = {
  about: "#rs-about",
  work: "#rs-work",
  resume: "#rs-resume",
  blog: "#rs-work",
  contact: "#rs-end",
};

function hrefFor(label: string): string {
  return NAV_HREFS[label.trim().toLowerCase()] || "#rs-top";
}

function padIndex(i: number): string {
  return `(${String(i + 1).padStart(2, "0")})`;
}

export function ResumeSite({
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
    "folio";
  const customLogo = site?.theme.logoUrl?.trim() || "";
  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const contactPhone = details?.phone?.trim() || "";
  const heroImage = hero.image || HERO;
  const navLabels = list(footer.content, "linkLabels", ["about", "work", "resume", "blog", "contact"]);
  const workTitles = list(work.content, "itemTitles", ["Branding Project", "Music Samples", "Photo Portraits"]);
  const workBodies = list(work.content, "itemBodies", ["(01)", "(02)", "(03)"]);
  const projectTitles = list(services.content, "itemTitles", ["Apple Inc.", "Sony", "Dropbox"]);
  const projectBodies = list(services.content, "itemBodies");
  const projectDates = list(services.content, "dates");
  const cvTitles = list(testimonials.content, "authors");
  const cvOrgs = list(testimonials.content, "roles");
  const cvQuotes = list(testimonials.content, "quotes");
  const cvDates = list(testimonials.content, "dates");
  const experience = cvTitles.slice(0, 4);
  const education = cvTitles.slice(4, 6);
  const volunteer = cvTitles.slice(6);
  const handleTitles = list(contactSlot.content, "itemTitles", [
    "@brandkitpro",
    "@thebrandkit",
    contactEmail || "mail@thebrandkit.com",
    contactPhone || "647-432-1234",
  ]);
  const handleLabels = list(contactSlot.content, "itemBodies", ["Instagram", "Twitter", "Email", "Phone"]);
  const workFrames = [
    { max: 1130, ratio: "1130 / 600", width: 1130, height: 600, align: "center" as const },
    { max: 553, ratio: "553 / 617", width: 553, height: 617, align: "end" as const },
    { max: 898, ratio: "898 / 443", width: 898, height: 443, align: "center" as const },
  ];

  return (
    <div
      id="rs-top"
      className={`scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#000000"),
        ...faces.style,
        fontFamily: "var(--rs-sans), ui-sans-serif, system-ui, sans-serif",
        fontWeight: 500,
        color: RS.ink,
        backgroundColor: RS.bg,
        ...themeFontStyle(site?.theme, ["--rs-sans"]),
      }}
    >
      {<link rel="stylesheet" href={faces.href} />}
      {themeFontHref(site?.theme) ? <link rel="stylesheet" href={themeFontHref(site?.theme)!} /> : null}
      <header className="px-6 py-6 md:px-10" style={{ ...sectionBandStyle(hero.theme) }}>
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-start justify-between gap-4 text-base tracking-[-0.05em]">
          <a href="#rs-top" className="font-semibold tracking-[-0.05em]">
            {customLogo ? <img src={customLogo} alt="" className="h-6 w-auto object-contain" /> : businessName}
          </a>
          <nav className="flex flex-wrap gap-x-2 text-base tracking-[-0.03em]">
            {navLabels.map((label, i) => (
              <span key={label}>
                <a href={hrefFor(label)} className="hover:opacity-70">
                  {label}
                </a>
                {i < navLabels.length - 1 ? "," : ""}
              </span>
            ))}
          </nav>
          <div className="leading-[1.1] tracking-[-0.05em]">
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="block">
                {contactEmail}
              </a>
            ) : null}
            {contactPhone ? <p>{contactPhone}</p> : null}
          </div>
          <p className="text-right tracking-[-0.05em]">{text(hero.content, "ctaSecondary", "ig, yt, fb")}</p>
        </div>
      </header>

      <section className="overflow-hidden px-2 pb-4 md:px-4" style={sectionBandStyle(hero.theme)}>
        <h1
          className="mx-auto max-w-[1440px] whitespace-nowrap text-[clamp(3.25rem,22vw,24.125rem)] font-medium leading-none tracking-[-0.09em]"
        >
          {text(hero.content, "headline", "Resumé")}
        </h1>
        <div
          className="relative mx-auto mt-2 w-full max-w-[1360px] overflow-hidden"
          style={{ aspectRatio: "1360 / 634", borderRadius: RS.radius }}
        >
          <img
            src={heroImage}
            alt=""
            width={1360}
            height={634}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </section>

      <section id="rs-work" className="px-6 py-16 md:px-10" style={sectionBandStyle(work.theme)}>
        <div className="mx-auto flex max-w-[1440px] flex-col gap-16">
          {workTitles.map((title, i) => {
            const frame = workFrames[i] ?? workFrames[0];
            return (
              <article
                key={title}
                className={`flex w-full flex-col gap-2.5 ${frame.align === "end" ? "ml-auto items-end" : "mx-auto items-center"}`}
                style={{ maxWidth: frame.max }}
              >
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: frame.ratio, borderRadius: RS.radius }}
                >
                  <img
                    src={work.itemImages[i] || WORK[i] || heroImage}
                    alt=""
                    width={frame.width}
                    height={frame.height}
                    className="absolute inset-0 size-full object-cover"
                  />
                </div>
                <div className="flex w-full items-start justify-between px-2.5 text-base tracking-[-0.05em]">
                  <p>{title}</p>
                  <p>{workBodies[i] || padIndex(i)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="rs-about" style={sectionBandStyle(about.theme)}>
        <PageTitle crumb="about/">{text(about.content, "heading", "About &\nBackground")}</PageTitle>
        <div className="mx-auto max-w-[1440px] border-t px-6 py-20 md:px-10" style={{ borderColor: RS.line }}>
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
            <p className="shrink-0 text-base tracking-[-0.05em]">About</p>
            <p className="max-w-[1014px] text-[clamp(1.5rem,3.6vw,3.25rem)] leading-[1.1] tracking-[-0.05em]">
              {text(about.content, "body", text(about.content, "subheadline", "A passionate brand designer with a relentless commitment to transforming visions into compelling visual narratives."))}
            </p>
          </div>
        </div>
      </section>

      <section id="rs-projects" style={sectionBandStyle(services.theme)}>
        <PageTitle crumb="work/">{text(services.content, "heading", "Previous\nProjects")}</PageTitle>
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10">
          <div className="flex flex-col items-end gap-2.5">
            {projectTitles.map((title, i) => (
              <div
                key={`${title}-${i}`}
                className="flex w-full items-start justify-between gap-6 border-t pt-2 text-base md:text-2xl"
                style={{ borderColor: i === 0 ? RS.ink : RS.line, maxWidth: i === 0 ? "100%" : 1014 }}
              >
                {i === 0 ? (
                  <p className="hidden w-20 shrink-0 text-base tracking-[-0.05em] md:block">
                    {text(services.content, "subheading", "Projects")}
                  </p>
                ) : null}
                <div className="flex min-w-0 flex-1 items-start justify-between gap-4 tracking-[-0.05em]" style={{ maxWidth: 1014 }}>
                  <p>{title}</p>
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-4" style={{ color: RS.body, maxWidth: 437 }}>
                    <p className="min-w-0 truncate">{projectBodies[i] || ""}</p>
                    <p className="shrink-0 text-right">{projectDates[i] || ""}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="rs-resume" style={sectionBandStyle(testimonials.theme)}>
        <PageTitle crumb="resume/">{text(testimonials.content, "heading", "Craft &\nExperience")}</PageTitle>
        <CvList
          titles={experience}
          orgs={cvOrgs}
          quotes={cvQuotes}
          dates={cvDates}
          offset={0}
        />
        {education.length ? (
          <>
            <PageTitle crumb="resume/">Education</PageTitle>
            <CvList titles={education} orgs={cvOrgs} quotes={cvQuotes} dates={cvDates} offset={4} />
          </>
        ) : null}
        {volunteer.length ? (
          <>
            <PageTitle crumb="resume/">Volunteer</PageTitle>
            <CvList titles={volunteer} orgs={cvOrgs} quotes={cvQuotes} dates={cvDates} offset={6} />
          </>
        ) : null}
      </section>

      <section id="rs-end" style={sectionBandStyle(contactSlot.theme)}>
        <PageTitle crumb="contact/">{text(contactSlot.content, "heading", "Contact\nInformation")}</PageTitle>
        <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-10">
          <div className="flex flex-col gap-2.5">
            {handleTitles.map((handle, i) => (
              <div
                key={`${handle}-${i}`}
                className="flex items-start justify-between gap-6 border-t pt-2.5"
                style={{ borderColor: RS.line }}
              >
                <div className="flex min-w-0 flex-1 items-start justify-between gap-6" style={{ maxWidth: 831 }}>
                  <img src={BULLET} alt="" width={22} height={22} className="mt-1 size-[22px] shrink-0" />
                  <p className="w-full max-w-[485px] text-[clamp(1.35rem,2.8vw,2.5rem)] leading-none tracking-[-0.05em]">
                    {handle}
                  </p>
                </div>
                <p className="shrink-0 text-base tracking-[-0.05em]">({handleLabels[i] || "Link"})</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        className="px-6 py-6 text-xs tracking-[-0.03em] md:px-10"
        style={{ color: RS.body, ...sectionBandStyle(footer.theme) }}
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 leading-[1.1]">
          <p>
            {businessName} ({new Date().getFullYear()})
          </p>
          <p className="text-center">{text(footer.content, "tagline", "A simple portfolio template for designers.")}</p>
          <p>{list(footer.content, "linkLabels", ["about", "work", "contact"]).slice(0, 3).join(", ")}</p>
        </div>
      </footer>
    </div>
  );
}

function PageTitle({ crumb, children }: { crumb: string; children: string }) {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 pb-10 pt-20 md:flex-row md:items-end md:gap-16 md:px-10">
      <div className="flex shrink-0 items-center gap-2">
        <img src={DOT} alt="" width={8} height={8} className="size-2 shrink-0" />
        <p className="text-base tracking-[-0.05em]">{crumb}</p>
      </div>
      <h2 className="whitespace-pre-line text-[clamp(3.25rem,9.7vw,8.75rem)] font-medium leading-none tracking-[-0.06em]">
        {children}
      </h2>
    </div>
  );
}

function CvList({
  titles,
  orgs,
  quotes,
  dates,
  offset,
}: {
  titles: string[];
  orgs: string[];
  quotes: string[];
  dates: string[];
  offset: number;
}) {
  if (!titles.length) return null;
  return (
    <div className="mx-auto flex max-w-[668px] flex-col gap-8 px-6 py-10 md:px-0">
      {titles.map((title, i) => {
        const idx = offset + i;
        return (
          <article key={`${title}-${idx}`} className="flex items-start justify-between gap-8">
            <div className="flex items-start gap-6">
              <p className="text-base tracking-[-0.05em]">{idx - offset + 1}.</p>
              <p className="max-w-[206px] text-2xl leading-[1.4] tracking-[-0.05em]">{title}</p>
            </div>
            <div className="w-[300px] leading-[1.4]" style={{ color: RS.body }}>
              {dates[idx] ? <p className="text-[10px] tracking-[-0.02em]">{dates[idx]}</p> : null}
              {orgs[idx] ? <p className="text-base tracking-[-0.05em] underline">{orgs[idx]}</p> : null}
              {quotes[idx] ? <p className="text-base tracking-[-0.05em]">{quotes[idx]}</p> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
