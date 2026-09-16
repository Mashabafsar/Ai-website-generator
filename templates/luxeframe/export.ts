import type { AssembledSite } from "@/lib/blueprint/types";
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
import { brandCss } from "../shared/brand";
import { themeFontBodyCss, themeFontCss, themeFontHref } from "../shared/fonts";

function esc(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageHref(slug: string): string {
  return slug === "home" ? "/" : `/${slug}/`;
}

function heading(label: string): string {
  return `<div class="lx-heading"><div class="lx-tag"><span class="lx-dot"></span><h4 class="lx-font20">${esc(label)}</h4></div><div class="lx-rule"></div></div>`;
}

function pickProjects(work: TemplateSlot, count: number) {
  const titles = list(work.content, "itemTitles", PROJECTS.slice(0, count).map((p) => p.title));
  const places = list(work.content, "itemBodies", PROJECTS.slice(0, count).map((p) => p.place));
  return titles.slice(0, count).map((title, i) => ({
    title,
    place: places[i] || PROJECTS[i]?.place || "",
    img: work.itemImages[i] || PROJECTS[i]?.img || TRAIL[0],
  }));
}

function projectRows(items: { title: string; place: string; img: string }[], counts: number[]): string {
  const classes = ["lx-r1", "lx-r2", "lx-r3", "lx-r4", "lx-r5"];
  let cursor = 0;
  return counts
    .map((count, rowIndex) => {
      const slice = items.slice(cursor, cursor + count);
      cursor += count;
      if (!slice.length) return "";
      return `<div class="lx-proj-row ${classes[rowIndex] || "lx-r1"}">${slice
        .map(
          (item) =>
            `<a href="${pageHref("portfolio")}"><div class="lx-shot"><img src="${esc(item.img)}" alt="${esc(item.title)}" /></div><div><h5 class="lx-font24">${esc(item.title)}</h5><p class="lx-font16">${esc(item.place)}</p></div></a>`
        )
        .join("")}</div>`;
    })
    .join("");
}

function clients(slots: TemplateSlot[]): string {
  const quotes = slotAt(slots, "testimonials");
  const headingLabel = text(quotes.content, "heading", "Selected Clients");
  const copy = text(
    quotes.content,
    "body",
    "Our clients had an amazing experience collaborating with us, praising our dedication, creativity, and professionalism every step of the way. We're confident you'll feel the same and enjoy a seamless, rewarding partnership with us!"
  );
  const quoteList = list(quotes.content, "quotes");
  const authors = list(quotes.content, "authors");
  const roles = list(quotes.content, "roles");
  const logos = CLIENT_LOGOS.map((src) => `<div class="lx-logo-cell"><img src="${esc(src)}" alt="" /></div>`).join("");
  const cards = quoteList
    .slice(0, 3)
    .map(
      (quote, i) =>
        `<blockquote class="lx-quote"><div class="lx-quote-mark">“</div><p class="lx-font16" style="margin-top:20px">${esc(quote)}</p><div style="margin-top:50px"><p class="lx-font24">${esc(authors[i] || "")}</p><p class="lx-font16">${esc(roles[i] || "")}</p></div></blockquote>`
    )
    .join("");
  return `<section class="lx-clients"><div class="lx-wrap">${heading(headingLabel)}<div class="lx-logos">${logos}</div><div class="lx-client-copy"><h3 class="lx-font36">${esc(copy)}</h3></div>${cards ? `<div class="lx-quotes">${cards}</div>` : ""}</div></section>`;
}

function homeBody(slots: TemplateSlot[]): string {
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const work = slotAt(slots, "portfolio");
  const services = slotAt(slots, "services");
  const cta = slotAt(slots, "cta");
  const trail = (hero.itemImages.filter(Boolean) as string[]).length ? (hero.itemImages.filter(Boolean) as string[]) : [...TRAIL];
  const serviceTitles = list(services.content, "itemTitles", [...SERVICES]);
  const moreImgs = [cta.image, ...(cta.itemImages || [])].filter(Boolean) as string[];
  const more = moreImgs.length >= 4 ? moreImgs : [...MORE_IMGS];
  const trailHtml = trail
    .slice(0, 10)
    .map((src) => `<div class="lx-trail-img"><img src="${esc(src)}" alt="" /></div>`)
    .join("");
  const svc = serviceTitles
    .map(
      (title, i) =>
        `<a href="${pageHref("portfolio")}" class="lx-svc"><div><p class="lx-font16">${String(i + 1).padStart(2, "0")}/</p><h4 class="lx-font36">${esc(title)}</h4></div><span class="lx-svc-arrow">→</span></a>`
    )
    .join("");
  return `<header class="lx-hero" data-motion-skip><div class="lx-hero-text"><h1>${esc(text(hero.content, "headline", "High-end visual for exclusive exquisite moments"))}</h1></div><div class="lx-scroll"><h2 class="lx-font16">${esc(text(hero.content, "ctaPrimary", "Scroll Down"))}</h2><div class="lx-arrow"><img src="${ARROW}" alt="" /></div></div><div class="lx-trail">${trailHtml}</div></header>
<section class="lx-about"><div class="lx-wrap"><h3 class="lx-font36">${esc(text(about.content, "body", "LuxeFrame is a visionary production company crafting captivating, awe-inspiring visual experiences through photography and videography for individuals, businesses, and organizations seeking timeless, high-end imagery."))}</h3></div></section>
<section><div class="lx-wrap">${heading(text(work.content, "heading", "Selected Projects"))}${projectRows(pickProjects(work, 7), [2, 3, 2])}</div></section>
<section class="lx-services"><div class="lx-wrap" style="width:100%;display:flex;flex-direction:column;align-items:center">${heading(text(services.content, "heading", "Service Areas"))}<div style="width:100%;margin-top:70px">${svc}</div><a href="${pageHref("portfolio")}" class="lx-btn"><span class="lx-font16">View All Projects</span></a></div></section>
<section class="lx-more"><div class="lx-wrap" style="height:100%;position:relative"><div class="lx-more-txt"><h2>${esc(text(cta.content, "headline", "We ignite the passion that compels your audience to book their next unforgettable stay."))}</h2><a href="${pageHref("about")}" class="lx-btn" style="margin-top:50px"><span class="lx-font16">${esc(text(cta.content, "ctaPrimary", "More About us"))}</span></a></div><div class="lx-more-row"><img src="${esc(more[0])}" alt="" /><img src="${esc(more[1])}" alt="" /></div><div class="lx-more-row"><img src="${esc(more[2])}" alt="" /><img src="${esc(more[3])}" alt="" /></div></div></section>
${clients(slots)}`;
}

function aboutBody(slots: TemplateSlot[], businessName: string): string {
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
  const bens = benefitTitles
    .map((title, i) => `<div class="lx-ben"><h5 class="lx-font24">${esc(title)}</h5><p class="lx-font16" style="margin-top:20px">${esc(benefitBodies[i] || "")}</p></div>`)
    .join("");
  const people = names
    .map(
      (name, i) =>
        `<div><img src="${esc(team.itemImages[i] || TEAM[i]?.img || TRAIL[0])}" alt="${esc(name)}" /><h5 class="lx-font24" style="margin-top:20px">${esc(name)}</h5><p class="lx-font16">${esc(roles[i] || "")}</p></div>`
    )
    .join("");
  return `<header class="lx-pagehead"><div class="lx-wrap"><h1 class="lx-font90">${esc(text(hero.content, "headline", "Discover Our Studio and Vision"))}</h1></div></header>
<section><div class="lx-wrap">${heading(text(about.content, "heading", "About us"))}<div class="lx-about-lead"><h2 class="lx-font36">${esc(text(about.content, "headline", "Welcome to LuxeFrame, where we transform moments into timeless visual narratives."))}</h2></div><div class="lx-about-imgs"><div class="lx-shot"><img src="${esc(stills[0])}" alt="" /></div><div class="lx-shot"><img src="${esc(stills[1])}" alt="" /></div></div><div class="lx-about-copy"><p class="lx-font16">${esc(text(about.content, "body"))}</p><p class="lx-font16" style="margin-top:70px">${esc(text(about.content, "subheadline"))}</p></div></div></section>
<section class="lx-benefits"><div class="lx-wrap">${heading(text(benefits.content, "heading", "Benefits"))}<h3 class="lx-font36" style="margin-top:70px">${esc(text(benefits.content, "subheading", "At LuxeFrame, we pride ourselves on delivering unparalleled photography and videography services that capture the essence of your unique story."))}</h3><div class="lx-ben-grid">${bens}</div></div></section>
<div class="lx-marquee"><div class="lx-marquee-track">${esc(marquee)} - ${esc(marquee)}</div></div>
<section><div class="lx-wrap">${heading(text(team.content, "heading", "Team Members"))}<div class="lx-team">${people}</div></div></section>
${clients(slots)}`;
}

function portfolioBody(slots: TemplateSlot[]): string {
  const hero = slotAt(slots, "hero");
  const work = slotAt(slots, "portfolio");
  return `<header class="lx-pagehead"><div class="lx-wrap"><h1 class="lx-font90">${esc(text(hero.content, "headline", "Discover our stunning global photography projects."))}</h1></div></header>
<section><div class="lx-wrap">${heading(text(work.content, "heading", "All Projects"))}${projectRows(pickProjects(work, 12), [2, 3, 2, 2, 3])}</div></section>`;
}

function contactBody(slots: TemplateSlot[], businessName: string, email: string, phone: string): string {
  const hero = slotAt(slots, "hero");
  const contact = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");
  const still = contact.image || CONTACT_IMG;
  const socials = list(contact.content, "itemTitles", list(footer.content, "itemTitles", ["Instagram", "Facebook", "X (Twitter)", "LinkedIn"]));
  const mail = email
    ? `<a href="mailto:${esc(email)}" class="lx-under"><h2 class="lx-font24">${esc(email)}</h2></a>`
    : "";
  const tel = phone
    ? `<a href="tel:${esc(phone)}" class="lx-under"><h2 class="lx-font24">${esc(phone)}</h2></a>`
    : "";
  const socialHtml = socials
    .map((label) => `<a href="#lx-end" class="lx-under" style="margin-top:12px"><h2 class="lx-font24">${esc(label)}</h2></a>`)
    .join("");
  return `<header class="lx-pagehead"><div class="lx-wrap"><h1 class="lx-font90">${esc(text(hero.content, "headline", "Get in Touch with LuxeFrame"))}</h1></div></header>
<section><div class="lx-wrap lx-contact"><div class="lx-contact-visual"><img src="${esc(still)}" alt="" /><img src="${esc(still)}" alt="" /><img src="${esc(still)}" alt="" /><img src="${esc(still)}" alt="" /></div><div class="lx-contact-details"><div>${heading(text(contact.content, "heading", "Studio"))}<h2 class="lx-font24" style="margin-top:30px">${esc(businessName)}</h2><h2 class="lx-font24">${esc(text(contact.content, "subheading", "A Visionary Production Company"))}</h2><h2 class="lx-font24">${esc(text(contact.content, "body", "73 Holburn Street, London, UK"))}</h2>${mail}${tel}</div><div style="margin-top:100px">${heading("Socials")}${socialHtml}</div></div></div></section>`;
}

function nav(businessName: string, customLogo: string, pages: { slug: string; title: string }[], socials: string[]): string {
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="${esc(businessName)}" style="width:36px;height:36px;object-fit:contain" />`
    : `<span>${esc(businessName)}</span>`;
  const links = pages
    .map((p) => `<div class="menu_link_block"><a href="${pageHref(p.slug)}" class="lx-under">${esc(p.title)}</a></div>`)
    .join("");
  const socialHtml = socials.map((label) => `<a href="#lx-end" class="lx-under">${esc(label)}</a>`).join("");
  return `<input id="lx-nav-toggle" type="checkbox" />
<nav class="lx-bar"><a href="${pageHref("home")}" class="lx-logo">${mark}</a><label for="lx-nav-toggle" class="lx-ham"><p>Menu</p><span class="lx-circle"><span class="lx-line"></span><span class="lx-line"></span></span></label></nav>
<div class="lx-menu"><label for="lx-nav-toggle" style="position:absolute;inset:0;z-index:0" aria-label="Close menu"></label><div class="lx-menu-img"><img src="${NAV_IMG}" alt="" /><img src="${NAV_IMG}" alt="" /><img src="${NAV_IMG}" alt="" /><img src="${NAV_IMG}" alt="" /></div><div class="lx-menu-links"><div class="lx-menu-top">${links}</div><div class="lx-menu-bottom">${socialHtml}</div></div></div>`;
}

function footerBlock(
  slots: TemplateSlot[],
  pages: { slug: string; title: string }[],
  businessName: string,
  socials: string[]
): string {
  const footer = slotAt(slots, "footer");
  const tagline = text(footer.content, "tagline", "LuxeFrame is a visionary production.");
  const labels = list(footer.content, "linkLabels", pages.map((p) => p.title));
  const year = new Date().getFullYear();
  const pageLinks = pages
    .map((p, i) => `<a href="${pageHref(p.slug)}" class="lx-under">${esc(labels[i] || p.title)}</a>`)
    .join("");
  const socialHtml = socials.map((label) => `<a href="#lx-end" class="lx-under">${esc(label)}</a>`).join("");
  return `<footer id="lx-end" class="lx-foot"><div class="lx-wrap lx-foot-inner"><div class="lx-foot-col"><h5 class="lx-font24">${esc(tagline)}</h5><h5 class="lx-font24">©${year} ${esc(businessName)}</h5></div><div class="lx-foot-col"><div class="lx-foot-links">${pageLinks}</div><div class="lx-foot-links">${socialHtml}</div></div></div><h5 class="lx-giant">${esc(businessName)}</h5></footer>`;
}

export function renderLuxeframePage(site: AssembledSite, pageSlug?: string): string {
  const pages = pageSlugsOf(null, site);
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
  const slots = toSlots(null, site, active);
  const footer = slotAt(slots, "footer");
  const businessName = text(footer.content, "businessName") || site.businessName || "LuxeFrame";
  const customLogo = site.theme?.logoUrl?.trim() || "";
  const contactEmail = site.contact?.email?.trim() || "";
  const contactPhone = site.contact?.phone?.trim() || "";
  const socials = list(footer.content, "itemTitles", ["Instagram", "Facebook", "X (Twitter)", "LinkedIn"]);
  const body =
    active === "about"
      ? aboutBody(slots, businessName)
      : active === "portfolio"
        ? portfolioBody(slots)
        : active === "contact"
          ? contactBody(slots, businessName, contactEmail, contactPhone)
          : homeBody(slots);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(site.seo.title)}</title>
  <meta name="description" content="${esc(site.seo.description)}" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --lx-display: MatterSemiBold, Inter, sans-serif; --lx-body: MatterLight, Inter, sans-serif; ${brandCss(site.theme, "#E0FD60")} ${themeFontCss(site.theme, ["--lx-display","--lx-body"])} }
    html { scroll-behavior: smooth; }
    ${themeFontBodyCss(site.theme)}
    ${LX_CSS}
  </style>
</head>
<body class="lx-root">
${nav(businessName, customLogo, navPages, socials)}
<main class="lx-main">${body}</main>
${footerBlock(slots, navPages, businessName, socials)}
</body>
</html>`;
}
