import type { AssembledSite } from "@/lib/blueprint/types";
import { RS } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandCss, sectionBandCss } from "../shared/brand";
import { themeFontBodyCss, themeFontCss, themeFontHref } from "../shared/fonts";

function esc(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

function pageTitle(crumb: string, heading: string): string {
  return `<div class="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 pb-10 pt-20 md:flex-row md:items-end md:gap-16 md:px-10">
  <div class="flex shrink-0 items-center gap-2">
    <img src="${DOT}" alt="" width="8" height="8" class="size-2 shrink-0" />
    <p class="text-base tracking-[-0.05em]">${esc(crumb)}</p>
  </div>
  <h2 class="whitespace-pre-line text-[clamp(3.25rem,9.7vw,8.75rem)] font-medium leading-none tracking-[-0.06em]">${esc(heading)}</h2>
</div>`;
}

function cvList(titles: string[], orgs: string[], quotes: string[], dates: string[], offset: number): string {
  if (!titles.length) return "";
  return `<div class="mx-auto flex max-w-[668px] flex-col gap-8 px-6 py-10 md:px-0">
    ${titles
      .map((title, i) => {
        const idx = offset + i;
        return `<article class="flex items-start justify-between gap-8">
      <div class="flex items-start gap-6">
        <p class="text-base tracking-[-0.05em]">${i + 1}.</p>
        <p class="max-w-[206px] text-2xl leading-[1.4] tracking-[-0.05em]">${esc(title)}</p>
      </div>
      <div class="w-[300px] leading-[1.4]" style="color:${RS.body}">
        ${dates[idx] ? `<p class="text-[10px] tracking-[-0.02em]">${esc(dates[idx])}</p>` : ""}
        ${orgs[idx] ? `<p class="text-base tracking-[-0.05em] underline">${esc(orgs[idx])}</p>` : ""}
        ${quotes[idx] ? `<p class="text-base tracking-[-0.05em]">${esc(quotes[idx])}</p>` : ""}
      </div>
    </article>`;
      })
      .join("")}
  </div>`;
}

export function renderResumePage(site: AssembledSite): string {
  const slots = toSlots(null, site);
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const work = slotAt(slots, "portfolio");
  const testimonials = slotAt(slots, "testimonials");
  const contact = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");
  const businessName = text(footer.content, "businessName") || site.businessName || "folio";
  const customLogo = site.theme.logoUrl?.trim() || "";
  const contactEmail = site.contact?.email?.trim() || "";
  const contactPhone = site.contact?.phone?.trim() || "";
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
  const handleTitles = list(contact.content, "itemTitles", [
    "@brandkitpro",
    "@thebrandkit",
    contactEmail || "mail@thebrandkit.com",
    contactPhone || "647-432-1234",
  ]);
  const handleLabels = list(contact.content, "itemBodies", ["Instagram", "Twitter", "Email", "Phone"]);
  const workFrames = [
    { max: 1130, ratio: "1130 / 600", width: 1130, height: 600, align: "center" },
    { max: 553, ratio: "553 / 617", width: 553, height: 617, align: "end" },
    { max: 898, ratio: "898 / 443", width: 898, height: 443, align: "center" },
  ];
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" class="h-6 w-auto object-contain" />`
    : esc(businessName);

  const workArticles = workTitles
    .map((title, i) => {
      const frame = workFrames[i] ?? workFrames[0];
      const align = frame.align === "end" ? "ml-auto items-end" : "mx-auto items-center";
      return `<article class="flex w-full flex-col gap-2.5 ${align}" style="max-width:${frame.max}px">
        <div class="relative w-full overflow-hidden" style="aspect-ratio:${frame.ratio};border-radius:${RS.radius}">
          <img src="${esc(work.itemImages[i] || WORK[i] || heroImage)}" alt="" width="${frame.width}" height="${frame.height}" class="absolute inset-0 size-full object-cover" />
        </div>
        <div class="flex w-full items-start justify-between px-2.5 text-base tracking-[-0.05em]">
          <p>${esc(title)}</p>
          <p>${esc(workBodies[i] || padIndex(i))}</p>
        </div>
      </article>`;
    })
    .join("");

  const projectRows = projectTitles
    .map((title, i) => {
      const label =
        i === 0
          ? `<p class="hidden w-20 shrink-0 text-base tracking-[-0.05em] md:block">${esc(text(services.content, "subheading", "Projects"))}</p>`
          : "";
      return `<div class="flex w-full items-start justify-between gap-6 border-t pt-2 text-base md:text-2xl" style="border-color:${i === 0 ? RS.ink : RS.line};max-width:${i === 0 ? "100%" : "1014px"}">
        ${label}
        <div class="flex min-w-0 flex-1 items-start justify-between gap-4 tracking-[-0.05em]" style="max-width:1014px">
          <p>${esc(title)}</p>
          <div class="flex min-w-0 flex-1 items-start justify-between gap-4" style="color:${RS.body};max-width:437px">
            <p class="min-w-0 truncate">${esc(projectBodies[i] || "")}</p>
            <p class="shrink-0 text-right">${esc(projectDates[i] || "")}</p>
          </div>
        </div>
      </div>`;
    })
    .join("");

  const contactRows = handleTitles
    .map(
      (handle, i) => `<div class="flex items-start justify-between gap-6 border-t pt-2.5" style="border-color:${RS.line}">
        <div class="flex min-w-0 flex-1 items-start justify-between gap-6" style="max-width:831px">
          <img src="${BULLET}" alt="" width="22" height="22" class="mt-1 size-[22px] shrink-0" />
          <p class="w-full max-w-[485px] text-[clamp(1.35rem,2.8vw,2.5rem)] leading-none tracking-[-0.05em]">${esc(handle)}</p>
        </div>
        <p class="shrink-0 text-base tracking-[-0.05em]">(${esc(handleLabels[i] || "Link")})</p>
      </div>`
    )
    .join("");

  const body = `<header class="px-6 py-6 md:px-10" style="${sectionBandCss(hero.theme)}">
  <div class="mx-auto flex max-w-[1440px] flex-wrap items-start justify-between gap-4 text-base tracking-[-0.05em]">
    <a href="#rs-top" class="font-semibold tracking-[-0.05em]">${mark}</a>
    <nav class="flex flex-wrap gap-x-2 text-base tracking-[-0.03em]">
      ${navLabels
        .map(
          (label, i) =>
            `<span><a href="${hrefFor(label)}" class="hover:opacity-70">${esc(label)}</a>${i < navLabels.length - 1 ? "," : ""}</span>`
        )
        .join("")}
    </nav>
    <div class="leading-[1.1] tracking-[-0.05em]">
      ${contactEmail ? `<a href="mailto:${esc(contactEmail)}" class="block">${esc(contactEmail)}</a>` : ""}
      ${contactPhone ? `<p>${esc(contactPhone)}</p>` : ""}
    </div>
    <p class="text-right tracking-[-0.05em]">${esc(text(hero.content, "ctaSecondary", "ig, yt, fb"))}</p>
  </div>
</header>
<section class="overflow-hidden px-2 pb-4 md:px-4" style="${sectionBandCss(hero.theme)}">
  <h1 class="mx-auto max-w-[1440px] whitespace-nowrap text-[clamp(3.25rem,22vw,24.125rem)] font-medium leading-none tracking-[-0.09em]">${esc(text(hero.content, "headline", "Resumé"))}</h1>
  <div class="relative mx-auto mt-2 w-full max-w-[1360px] overflow-hidden" style="aspect-ratio:1360 / 634;border-radius:${RS.radius}">
    <img src="${esc(heroImage)}" alt="" width="1360" height="634" class="absolute inset-0 size-full object-cover" />
  </div>
</section>
<section id="rs-work" class="px-6 py-16 md:px-10" style="${sectionBandCss(work.theme)}">
  <div class="mx-auto flex max-w-[1440px] flex-col gap-16">${workArticles}</div>
</section>
<section id="rs-about" style="${sectionBandCss(about.theme)}">
  ${pageTitle("about/", text(about.content, "heading", "About &\nBackground"))}
  <div class="mx-auto max-w-[1440px] border-t px-6 py-20 md:px-10" style="border-color:${RS.line}">
    <div class="flex flex-col justify-between gap-10 md:flex-row md:items-start">
      <p class="shrink-0 text-base tracking-[-0.05em]">About</p>
      <p class="max-w-[1014px] text-[clamp(1.5rem,3.6vw,3.25rem)] leading-[1.1] tracking-[-0.05em]">${esc(text(about.content, "body", text(about.content, "subheadline", "A passionate brand designer with a relentless commitment to transforming visions into compelling visual narratives.")))}</p>
    </div>
  </div>
</section>
<section id="rs-projects" style="${sectionBandCss(services.theme)}">
  ${pageTitle("work/", text(services.content, "heading", "Previous\nProjects"))}
  <div class="mx-auto max-w-[1440px] px-6 py-20 md:px-10">
    <div class="flex flex-col items-end gap-2.5">${projectRows}</div>
  </div>
</section>
<section id="rs-resume" style="${sectionBandCss(testimonials.theme)}">
  ${pageTitle("resume/", text(testimonials.content, "heading", "Craft &\nExperience"))}
  ${cvList(experience, cvOrgs, cvQuotes, cvDates, 0)}
  ${education.length ? `${pageTitle("resume/", "Education")}${cvList(education, cvOrgs, cvQuotes, cvDates, 4)}` : ""}
  ${volunteer.length ? `${pageTitle("resume/", "Volunteer")}${cvList(volunteer, cvOrgs, cvQuotes, cvDates, 6)}` : ""}
</section>
<section id="rs-end" style="${sectionBandCss(contact.theme)}">
  ${pageTitle("contact/", text(contact.content, "heading", "Contact\nInformation"))}
  <div class="mx-auto max-w-[1440px] px-6 py-24 md:px-10">
    <div class="flex flex-col gap-2.5">${contactRows}</div>
  </div>
</section>
<footer class="px-6 py-6 text-xs tracking-[-0.03em] md:px-10" style="color:${RS.body};${sectionBandCss(footer.theme)}">
  <div class="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 leading-[1.1]">
    <p>${esc(businessName)} (${new Date().getFullYear()})</p>
    <p class="text-center">${esc(text(footer.content, "tagline", "A simple portfolio template for designers."))}</p>
    <p>${esc(list(footer.content, "linkLabels", ["about", "work", "contact"]).slice(0, 3).join(", "))}</p>
  </div>
</footer>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(site.seo.title)}</title>
  <meta name="description" content="${esc(site.seo.description)}" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&display=block" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --rs-sans: 'Poppins', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#000000")} ${themeFontCss(site.theme, ["--rs-sans"])} }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif;
      font-weight: 500;
      color: ${RS.ink};
      background: ${RS.bg};
      -webkit-font-smoothing: antialiased;
    }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body id="rs-top">
${body}
</body>
</html>`;
}
