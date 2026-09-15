import { WJ } from "./tokens";
import { list, slotAt, text, toSlots, pageSlugsOf, type TemplateSlot } from "../shared/content";
import { brandCss } from "../shared/brand";
import { themeFontBodyCss, themeFontCss, themeFontHref } from "../shared/fonts";
import type { AssembledSite } from "@/lib/blueprint/types";

// Static HTML twin of templates/willjacks/site.tsx. Exported and deployed sites
// must look like the design the customer chose. Multi-page: home -> "/", others
// -> "/<slug>/". Motion is injected centrally by withMotion.

function esc(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const A = "/templates/willjacks";
const HERO = `${A}/hero.jpg`;
const ARROW = `${A}/arrow.svg`;
const WORK = [`${A}/work-1.jpg`, `${A}/work-2.png`, `${A}/work-3.jpg`, `${A}/work-4.png`];

function pageHref(slug: string): string {
  return slug === "home" ? "/" : `/${slug}/`;
}

function dFont(): string {
  return "font-family:var(--wj-sans),Inter,ui-sans-serif,sans-serif";
}

function nav(
  pages: { slug: string; title: string }[],
  active: string,
  businessName: string,
  customLogo: string,
  location: string
): string {
  const links = (pages.length ? pages : [{ slug: "home", title: "Index" }, { slug: "about", title: "Approach" }])
    .map(
      (p) =>
        `<a href="${pageHref(p.slug)}" class="wj-under text-[24px] font-semibold tracking-[-1.5px] max-md:pb-1 max-md:text-[20px] max-md:tracking-[-0.5px]" style="${dFont()};opacity:${p.slug === active ? 1 : 0.85}">${esc(p.title)}</a>`
    )
    .join("");
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="${esc(businessName)}" width="36" height="36" class="h-9 w-9 object-contain" />`
    : esc(businessName);
  return `<nav class="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between px-[35px] py-[35px] max-md:flex-col max-md:gap-[2vw] max-md:px-[15px] max-md:py-[25px]">
    <div class="pointer-events-auto flex gap-[15vw] max-md:gap-[30vw]">
      <a href="${pageHref("home")}" class="text-[36px] font-semibold tracking-[-1.5px] max-md:text-[24px] max-md:tracking-[-0.5px]" style="${dFont()}">${mark}</a>
      <div class="flex flex-col">${links}</div>
    </div>
    <p class="pointer-events-auto w-[120px] whitespace-pre-line text-[16px] tracking-[-0.3px]">${esc(location.replace(/^(Based in)\s+/i, "$1\n"))}</p>
  </nav>`;
}

function toolsBand(heading: string, titles: string[], bodies: string[]): string {
  const items = titles
    .map((title, i) => {
      return `<div>
        <h3 class="text-[5vw] font-normal leading-[0.95] tracking-[-0.15vw] max-md:text-[7vw] max-[560px]:text-[12vw]" style="${dFont()}">${esc(title)}</h3>
        <p class="mt-5 max-w-[650px] text-[16px] tracking-[-0.3px]" style="color:${WJ.body}">${esc(bodies[i] || "")}</p>
      </div>`;
    })
    .join("");
  return `<div class="relative left-1/2 flex w-screen -translate-x-1/2 gap-[6vw] overflow-hidden px-[35px] py-[10vw] max-md:px-[15px] max-[560px]:flex-col max-[560px]:gap-[10vw]" style="background-color:${WJ.inverse};color:${WJ.inverseFg}">
    <p class="w-[23.5%] text-[16px] tracking-[-0.3px] max-[560px]:w-full">${esc(heading)}</p>
    <div class="flex w-[75%] flex-col gap-[4vw] overflow-hidden max-[560px]:w-full max-[560px]:gap-[12vw]">${items}</div>
  </div>`;
}

function workList(work: TemplateSlot): string {
  const titles = list(work.content, "itemTitles", ["Banking", "Financilux", "Stride", "Wine & Donuts"]);
  const indexes = list(work.content, "itemBodies", ["(01)", "(02)", "(03)", "(04)"]);
  const previews = titles
    .map((_, i) => {
      const w = i === 3 ? 752 : 1024;
      const h = i === 3 ? 564 : 768;
      const src = work.itemImages[i] || WORK[i] || HERO;
      return `<div class="wj-prev wj-prev-${i} relative w-[500px]" style="top:${-500 + i * 500}px;transform:rotate(10deg)">
        <img src="${esc(src)}" alt="" width="${w}" height="${h}" class="h-auto w-[500px] object-cover" />
      </div>`;
    })
    .join("");
  const items = titles
    .map((title, i) => {
      const last = i === titles.length - 1 ? "border-b-0" : "";
      return `<a href="#wj-end" class="wj-item wj-item-${i} relative flex w-full items-center gap-8 border-b border-[rgba(198,198,198,0.5)] py-8 max-md:gap-8 max-md:py-4 ${last}">
        <div class="flex gap-5">
          <span class="text-[14px]">${esc(indexes[i] || `(${String(i + 1).padStart(2, "0")})`)}</span>
          <h3 class="text-[4vw] font-normal max-md:text-[7vw] max-md:tracking-[-0.2vw] max-[560px]:text-[10vw]" style="${dFont()}">${esc(title)}</h3>
        </div>
        <span class="wj-icon relative left-[-20px] size-[70px] overflow-hidden rounded-full opacity-0 max-md:scale-90" style="background-color:${WJ.icon}">
          <span class="wj-icon-a absolute left-[-70px] flex size-[70px] items-center justify-center"><img src="${ARROW}" alt="" width="24" height="24" class="size-6" /></span>
          <span class="wj-icon-b absolute left-0 flex size-[70px] items-center justify-center"><img src="${ARROW}" alt="" width="24" height="24" class="size-6" /></span>
        </span>
      </a>`;
    })
    .join("");
  return `<div class="wj-work relative w-full overflow-hidden px-[35px] py-[10vw] max-md:px-[15px] max-[560px]:py-[20vw]">
    <div class="wj-overlay pointer-events-none absolute left-[15.25%] top-0 flex h-full w-full items-center justify-center gap-[1em] opacity-0 transition-opacity duration-1000">${previews}</div>
    ${items}
  </div>`;
}

function homeBody(slots: TemplateSlot[]): string {
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const work = slotAt(slots, "portfolio");
  const heroImage = hero.image || HERO;
  const marquee = text(hero.content, "ctaSecondary", "UIUX Designer — Frontend Developer —");
  const marqueeLine = `${marquee} ${marquee} ${marquee} ${marquee}`;
  return `<section class="relative flex h-screen items-end overflow-hidden px-[35px] max-md:h-auto max-md:px-[15px] max-md:pt-[200px]">
    <div class="flex w-full gap-[6vw] max-md:flex-col-reverse">
      <img src="${esc(heroImage)}" alt="" width="2000" height="2668" class="h-[80vh] w-[60%] object-cover max-md:h-auto max-md:w-full max-[560px]:h-[60vh] max-[560px]:object-cover" />
      <div class="mt-[6vw] flex w-full flex-col gap-[6vw] max-md:gap-[2vw] max-[560px]:gap-[8vw]">
        <p class="w-full max-w-[200px] text-[16px] tracking-[-0.3px]">${esc(text(hero.content, "eyebrow", "Currently available for freelance projects"))}</p>
        <p class="w-full max-w-[400px] text-[16px] tracking-[-0.3px]">${esc(text(hero.content, "subheadline"))}</p>
      </div>
    </div>
    <div class="pointer-events-none absolute bottom-0 left-0 h-[10vw] w-full overflow-hidden max-md:bottom-[30vw] max-md:h-[17vw] max-[560px]:bottom-[20vw] max-[560px]:h-[25vw]">
      <p class="wj-marquee absolute whitespace-nowrap text-[9vw] font-normal leading-none tracking-[-0.4vw] text-white mix-blend-difference" style="${dFont()}">${esc(marqueeLine)}&nbsp;${esc(marqueeLine)}</p>
    </div>
  </section>
  <section class="px-[35px] py-[10vw] max-md:px-[15px] max-[560px]:py-[20vw]">
    <div class="overflow-hidden">
      <h2 class="text-[9vw] font-normal leading-none tracking-[-0.4vw] max-md:text-[15vw] max-[560px]:text-[20vw] max-[560px]:tracking-[-1vw]" style="${dFont()}">${esc(text(about.content, "heading", "About"))}</h2>
    </div>
    <div class="flex items-end gap-[6vw] py-[10vw] pr-[4vw] max-[1068px]:flex-col max-[1068px]:items-start max-[1068px]:gap-[5vw] max-[1068px]:py-[5vw] max-[1068px]:pb-[20vw] max-[1068px]:pr-0 max-[560px]:gap-[10vw] max-[560px]:py-[10vw] max-[560px]:pb-[30vw]">
      <p class="w-1/4 text-[16px] tracking-[-0.3px] max-[1068px]:w-full">${esc(text(about.content, "body"))}</p>
      <h3 class="w-3/4 text-[5vw] font-normal leading-[0.95] tracking-[-0.15vw] max-md:text-[7vw] max-[1068px]:w-full max-[560px]:text-[12vw]" style="${dFont()}">${esc(text(about.content, "subheadline"))}</h3>
    </div>
    ${toolsBand(text(services.content, "heading", "Core Tools"), list(services.content, "itemTitles", ["Javascript", "WebGL", "NodeJs", "Framer"]), list(services.content, "itemBodies"))}
  </section>
  <section class="wj-works overflow-hidden">
    <div class="px-[35px] pb-[10vw] pt-[10vw] max-md:px-[15px] max-[560px]:pb-[20vw] max-[560px]:pt-[20vw]">
      <div class="text-right">
        <h2 class="text-[9vw] font-normal leading-none tracking-[-0.4vw] max-md:text-[15vw] max-[560px]:text-[20vw]" style="${dFont()}">${esc(text(work.content, "heading", "Selected"))}</h2>
        <h2 class="text-[9vw] font-normal leading-none tracking-[-0.4vw] max-md:text-[15vw] max-[560px]:text-[20vw]" style="${dFont()}">${esc(text(work.content, "subheading", "Works"))}</h2>
      </div>
      <p class="mt-[5vw] max-w-[600px] text-[16px] tracking-[-0.3px] max-[560px]:mt-[10vw]">${esc(text(work.content, "body"))}</p>
    </div>
    ${workList(work)}
  </section>`;
}

function aboutBody(slots: TemplateSlot[]): string {
  const hero = slotAt(slots, "hero");
  const services = slotAt(slots, "services");
  const about = slotAt(slots, "about");
  const process = slotAt(slots, "process");
  const serviceTitles = list(services.content, "itemTitles", ["Web Design", "Motion Design", "Web Development", "No Code Development"]);
  const disciplineTitles = list(about.content, "itemTitles", ["Creative Developer", "Modern Designer"]);
  return `<section class="flex h-screen w-full items-end px-[35px] pb-[35px] max-md:px-[15px] max-md:pb-5">
    <h2 class="w-[70%] text-[5vw] font-normal leading-[0.95] tracking-[-0.15vw] max-md:w-full max-md:text-[7vw] max-[560px]:text-[12vw]" style="${dFont()}">${esc(text(hero.content, "headline"))}</h2>
  </section>
  <section class="flex gap-[5vw] px-[35px] py-[10vw] max-md:gap-[10vw] max-md:px-[15px] max-md:py-[20vw] max-[560px]:flex-col max-[560px]:gap-0">
    <div class="flex w-full flex-col gap-[300px] max-md:gap-[200px] max-[560px]:gap-[100px]">
      <div>
        <p class="mb-5 text-[16px] tracking-[-0.3px] opacity-50">${esc(text(services.content, "heading", "Services"))}</p>
        ${serviceTitles.map((t) => `<p class="text-[16px] tracking-[-0.3px]">${esc(t)}</p>`).join("")}
      </div>
      <p class="max-w-[500px] text-[16px] tracking-[-0.3px]">${esc(text(services.content, "subheading"))}</p>
    </div>
    <div class="mt-[300px] flex w-full flex-col gap-[300px] max-md:mt-[200px] max-md:gap-[200px] max-[560px]:mt-[100px] max-[560px]:gap-[100px]">
      <div>
        <p class="mb-5 text-[16px] tracking-[-0.3px] opacity-50">${esc(text(about.content, "heading", "Disciplines"))}</p>
        ${disciplineTitles.map((t) => `<p class="text-[16px] tracking-[-0.3px]">${esc(t)}</p>`).join("")}
      </div>
      <p class="max-w-[500px] text-[16px] tracking-[-0.3px]">${esc(text(about.content, "body"))}</p>
    </div>
  </section>
  <section class="px-[35px] pb-[10vw] max-md:px-[15px]">
    ${toolsBand(text(process.content, "heading", "Process"), list(process.content, "itemTitles", ["Art Direction", "Design", "Development", "No - Code"]), list(process.content, "itemBodies"))}
  </section>`;
}

function footerBlock(slots: TemplateSlot[], businessName: string, contactEmail: string, location: string): string {
  const contact = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");
  const socials = list(footer.content, "itemTitles", ["Instagram", "Facebook", "Twitter", "LinkedIn"]);
  const links = list(footer.content, "linkLabels", ["Behance", "Dribbble", "Contra", "Pinterest"]);
  const row1 = socials.slice(0, 1);
  const row2 = socials.slice(1, 3);
  const row3 = socials.slice(3, 4);
  const social = (label: string) =>
    `<span class="wj-social relative block h-[11vw] text-[11vw] tracking-[-0.5vw] max-md:h-[18vw] max-md:text-[18vw] max-md:tracking-[-0.8vw] max-[560px]:h-[21vw] max-[560px]:text-[21vw]" style="color:${WJ.inverseFg}">${esc(label)}</span>`;
  const mail = contactEmail
    ? `<a href="mailto:${esc(contactEmail)}" class="wj-under mt-[5vw] inline-block text-[3vw] max-md:mt-[10vw] max-md:text-[5vw]" style="${dFont()}">${esc(contactEmail)}</a>`
    : "";
  return `<footer id="wj-end">
    <div class="px-[35px] py-[10vw] max-md:px-[15px] max-md:py-[20vw] max-[560px]:pb-[10vw]">
      <div class="w-full text-right">
        <h2 class="text-[9vw] font-normal leading-none tracking-[-0.4vw] max-md:text-[15vw] max-[560px]:text-[20vw]" style="${dFont()}">${esc(text(contact.content, "heading", "Reach"))}</h2>
        <h2 class="text-[9vw] font-normal leading-none tracking-[-0.4vw] max-md:text-[15vw] max-[560px]:text-[20vw]" style="${dFont()}">${esc(text(contact.content, "subheading", "Out"))}</h2>
      </div>
      <p class="mt-[10vw] whitespace-pre-line text-[16px] tracking-[-0.3px]">${esc(text(footer.content, "tagline", "Currently available for freelance projects"))}</p>
      <div class="flex gap-[6vw] py-[10vw] max-md:flex-col max-md:gap-[10vw] max-md:py-[20vw]">
        <p class="w-1/4 whitespace-pre-line text-[16px] tracking-[-0.3px] max-md:w-full">${esc(location.replace(/^(Based in)\s+/i, "$1\n"))}</p>
        <div class="w-3/4 max-w-[750px] max-md:w-full">
          <p class="text-[3vw] font-normal leading-[0.95] tracking-[-0.09vw] max-md:text-[5vw] max-[560px]:text-[8vw]" style="${dFont()}">${esc(text(contact.content, "body", text(footer.content, "body")))}</p>
          ${mail}
        </div>
      </div>
      <div class="flex gap-[6vw] max-md:flex-col-reverse max-md:gap-[4vw]">
        <p class="w-[27%] text-[16px] tracking-[-0.3px] max-md:w-full">© ${esc(businessName)}. All rights reserved.</p>
        <div class="flex w-3/4 flex-wrap items-center gap-5 max-md:w-full">${links.map((l) => `<span class="wj-under text-[20px] max-md:text-[18px]">${esc(l)}</span>`).join("")}</div>
      </div>
    </div>
    <div class="relative z-10 flex h-screen flex-col justify-between" style="background-color:${WJ.inverse};color:${WJ.inverseFg}">
      <div class="flex h-full items-center justify-center">
        <svg viewBox="0 0 1000 1000" width="1000" height="1000" class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <g><circle cx="400" cy="500" r="100" stroke="#181818" stroke-width="2" fill="#e9e9e9" /><circle cx="480" cy="500" r="20" fill="#181818" /></g>
          <g><circle cx="600" cy="500" r="100" stroke="#181818" stroke-width="2" fill="#e9e9e9" /><circle cx="680" cy="500" r="20" fill="#181818" /></g>
        </svg>
        <div class="flex w-full flex-col items-center justify-between">
          <div class="flex gap-[5vw] max-md:flex-col max-md:items-center max-md:gap-[10vw]">${row1.map(social).join("")}</div>
          <div class="flex gap-[5vw] max-md:flex-col max-md:items-center max-md:gap-[10vw]">${row2.map(social).join("")}</div>
          <div class="flex gap-[5vw] max-md:flex-col max-md:items-center max-md:gap-[10vw]">${row3.map(social).join("")}</div>
        </div>
      </div>
    </div>
  </footer>`;
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

export function renderWilljacksPage(site: AssembledSite, pageSlug?: string): string {
  const pages = pageSlugsOf(null, site);
  const active =
    (pageSlug && pages.find((p) => p.slug === pageSlug)?.slug) ||
    pages.find((p) => p.slug === "home")?.slug ||
    pages[0]?.slug ||
    "home";
  const slots = toSlots(null, site, active);
  const footer = slotAt(slots, "footer");
  const businessName = text(footer.content, "businessName") || site.businessName || "Will Jacks";
  const customLogo = site.theme?.logoUrl?.trim() || "";
  const contactEmail = site.contact?.email?.trim() || "";
  const location = text(footer.content, "location", "Based in London, UK");
  const body = active === "about" ? aboutBody(slots) : homeBody(slots);

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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --wj-sans: 'Inter', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#181818")} ${themeFontCss(site.theme, ["--wj-sans"])} }
    html { scroll-behavior: smooth; overflow-x: hidden; }
    body {
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      color: ${WJ.ink};
      background: ${WJ.bg};
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    ${themeFontBodyCss(site.theme)}
    ${WJ_CSS}
  </style>
</head>
<body>
${nav(pages, active, businessName, customLogo, location)}
<main>${body}</main>
${footerBlock(slots, businessName, contactEmail, location)}
</body>
</html>`;
}
