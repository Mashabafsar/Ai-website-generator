import { RB } from "./tokens";
import { list, slotAt, text, toSlots, pageSlugsOf, type TemplateSlot } from "../shared/content";
import { brandCss, sectionBandCss } from "../shared/brand";
import { themeFontBodyCss, themeFontCss, themeFontHref } from "../shared/fonts";
import type { AssembledSite } from "@/lib/blueprint/types";

// Static HTML twin of templates/rebo/site.tsx. Exported and deployed sites
// must look like the design the customer chose, so the Rebo layout is mirrored
// here. Multi-page: the caller (html-renderer) invokes this once per page; the
// header/footer links point at the sibling static files (home -> "/", others ->
// "/<slug>/") so navigation works between the emitted files. Motion is injected
// centrally by withMotion, so no motion markup lives here.

function esc(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const A = "/templates/rebo";

const FALLBACK = {
  hero: `${A}/hero.png`,
  aboutVideo: `${A}/about-video.png`,
  aboutHero: `${A}/about-hero.png`,
  servicesHero: `${A}/services-hero.png`,
  faqHero: `${A}/faq-hero.png`,
  avatars: [`${A}/avatar-1.png`, `${A}/avatar-2.png`, `${A}/avatar-3.png`, `${A}/avatar-4.png`],
  serviceIcons: [`${A}/service-ux.png`, `${A}/service-graphic.png`, `${A}/service-web.png`, `${A}/service-motion.png`],
  work: [`${A}/work-1.png`, `${A}/work-2.png`, `${A}/work-3.png`, `${A}/work-4.png`],
  team: [`${A}/team-1.png`, `${A}/team-2.png`, `${A}/team-3.png`],
  aboutTeam: [`${A}/about-team-1.png`, `${A}/about-team-2.png`, `${A}/about-team-3.png`, `${A}/about-team-4.png`],
  blog: [`${A}/blog-1.png`, `${A}/blog-2.png`, `${A}/blog-3.png`, `${A}/blog-4.png`, `${A}/blog-5.png`, `${A}/blog-6.png`, `${A}/blog-7.png`],
  cases: [`${A}/case-1.png`, `${A}/case-2.png`, `${A}/case-3.png`, `${A}/case-4.png`],
  approach: [`${A}/approach-1.svg`, `${A}/approach-2.svg`, `${A}/approach-3.svg`, `${A}/approach-4.svg`],
} as const;

function pageHref(slug: string): string {
  return slug === "home" ? "/" : `/${slug}/`;
}

function dFont(clash = false): string {
  return clash
    ? "font-family:var(--rb-clash),'Clash Display',var(--rb-display),ui-sans-serif,sans-serif"
    : "font-family:var(--rb-display),ui-sans-serif,sans-serif";
}

function asterisk(className = ""): string {
  return `<img src="${A}/asterisk.svg" alt="" width="52" height="52" class="inline-block shrink-0 ${className}" />`;
}

function logo(businessName: string, customLogo: string, light?: boolean): string {
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" width="31" height="31" class="col-start-1 row-start-1 size-[31px] object-contain" />`
    : `<img src="${light ? `${A}/logo-light.svg` : `${A}/logo.svg`}" alt="" width="31" height="31" class="col-start-1 row-start-1 size-[31px]" />`;
  return `<a href="${pageHref("home")}" class="inline-grid grid-cols-[max-content] grid-rows-[max-content] items-start leading-none">
    ${mark}
    <span class="col-start-1 row-start-1 ml-[38px] mt-1 text-[15px] font-bold leading-[22px]" style="color:${light ? RB.white : RB.ink}">${esc(businessName)}</span>
  </a>`;
}

function pillButton(href: string, label: string, extra = ""): string {
  return `<a href="${href}" class="inline-flex h-[58px] w-[269px] items-center justify-center gap-1.5 rounded-[33px] border-2 border-black px-[18px] text-[15px] font-semibold leading-[22px] text-white" style="background-color:${RB.brand};box-shadow:-5px 5px 0 0 #fff">${esc(label)}${extra}</a>`;
}

function header(
  pages: { slug: string; title: string }[],
  active: string,
  businessName: string,
  customLogo: string,
  dark: boolean
): string {
  const fg = dark ? RB.white : RB.ink;
  const links = pages
    .map(
      (p) =>
        `<a href="${pageHref(p.slug)}" class="text-[15px] font-semibold leading-[22px]" style="color:${p.slug === active ? RB.brand : fg}">${esc(p.title)}</a>`
    )
    .join("\n            ");
  const ctaLabel = dark ? "Log In" : "Get In Touch";
  const ctaIcon = dark
    ? ""
    : `<img src="${A}/arrow-up-right.svg" alt="" width="20" height="20" class="size-5" />`;
  const ctaShadow = dark ? "-5px 5px 0 0 #fff" : "none";
  return `<header class="relative z-50" style="background-color:${dark ? RB.header : "transparent"}">
  <div class="mx-auto flex h-[86px] max-w-[1200px] items-center justify-between gap-6 px-8">
    <div class="flex items-center gap-16">
      ${logo(businessName, customLogo, dark)}
      <nav class="hidden items-center gap-8 lg:flex">
            ${links}
      </nav>
    </div>
    <div class="flex items-center gap-6">
      <a href="${pageHref("contact")}" class="hidden text-[15px] font-semibold leading-[22px] sm:inline" style="color:${fg}">Sign Up</a>
      <a href="${pageHref("contact")}" class="inline-flex h-[46px] items-center justify-center gap-1.5 rounded-[33px] px-[18px] text-[15px] font-semibold leading-[22px] text-white" style="background-color:${RB.brand};box-shadow:${ctaShadow}">${esc(ctaLabel)}${ctaIcon}</a>
    </div>
  </div>
</header>`;
}

function homeBody(slots: TemplateSlot[]): string {
  const hero = slotAt(slots, "hero");
  const services = slotAt(slots, "services");
  const about = slotAt(slots, "about");
  const work = slotAt(slots, "portfolio");
  const process = slotAt(slots, "process");
  const quotes = slotAt(slots, "testimonials");
  const cta = slotAt(slots, "cta");
  const team = slotAt(slots, "features");
  const serviceTitles = list(services.content, "itemTitles", ["UI/UX Design", "Graphic Design", "Web Development", "Motion Graphics"]);
  const serviceBodies = list(services.content, "itemBodies");
  const workTitles = list(work.content, "itemTitles", ["Box mockup", "Editorial", "Tape kit", "Cup brand"]);
  const stepTitles = list(process.content, "stepTitles", ["01/ Project idea", "02/ Brainstorming", "03/ Launch"]);
  const stepBodies = list(process.content, "stepBodies");
  const quotesList = list(quotes.content, "quotes");
  const authors = list(quotes.content, "authors", ["Dave Jones"]);
  const roles = list(quotes.content, "roles", ["UI/UX"]);
  const teamNames = list(team.content, "itemTitles", ["Faris Miqdad", "Ghifari Syafi", "Fawwas Hamzah"]);
  const teamRoles = list(team.content, "itemBodies", ["Software Developer", "Team Leader", "UI/UX Designer"]);
  const stats = list(about.content, "itemTitles", ["15+", "120k", "100%"]);
  const statLabels = list(about.content, "itemBodies", ["Years of experience", "Successful projects", "Client satisfaction rate"]);
  const marquee = text(cta.content, "headline", "LET'S CREATE NEW EXPERIENCES");
  const headline = text(hero.content, "headline", "A creative design studio").replace("design studio", "\ndesign studio");

  const avatars = FALLBACK.avatars
    .map(
      (src, i) =>
        `<img src="${src}" alt="" width="63" height="63" class="absolute top-0 size-[63px] rounded-full border-2 border-white object-cover" style="left:${i * 31}px" />`
    )
    .join("");

  const serviceCards = serviceTitles
    .map((title, i) => {
      const style =
        i === 0
          ? `background-color:${RB.brand};box-shadow:4px 7px 0 0 #000`
          : `background-color:${RB.card}`;
      return `<article class="flex flex-col items-start gap-10 rounded-[20px] border-2 border-black p-5" style="${style}">
        <img src="${esc(services.itemImages[i] || FALLBACK.serviceIcons[i] || FALLBACK.serviceIcons[0])}" alt="" width="64" height="64" class="size-16 object-contain" />
        <h3 class="text-[26px] font-bold" style="${dFont()}">${esc(title)}</h3>
        <p class="text-[18px] leading-normal">${esc(serviceBodies[i] || "")}</p>
        <img src="${A}/service-arrow.png" alt="" width="34" height="28" class="h-7 w-[34px] object-contain" />
      </article>`;
    })
    .join("\n");

  const statBlocks = stats
    .map((value, i) => {
      const rule = i > 0 ? `<div class="mb-[27px] h-px w-[271px] bg-white/20"></div>` : "";
      return `<div>
        ${rule}
        <p class="text-[52px] font-bold leading-none" style="${dFont()};color:${RB.brand}">${esc(value)}</p>
        <p class="mt-1 text-[18px]" style="color:${RB.inverseFg}">${esc(statLabels[i] || "")}</p>
      </div>`;
    })
    .join("");

  const workCards = workTitles
    .slice(0, 4)
    .map((title, i) => {
      const shadow = i === 0 ? ` style="box-shadow:4px 7px 0 0 #fff"` : "";
      return `<div class="relative h-[560px] overflow-hidden rounded-[10px] border-[5px] border-white"${shadow}>
        <img src="${esc(work.itemImages[i] || FALLBACK.work[i])}" alt="${esc(title)}" class="absolute inset-0 size-full object-cover" />
      </div>`;
    })
    .join("\n");

  const stepCards = stepTitles
    .map((title, i) => {
      const style =
        i === 0
          ? `background-color:${RB.brand};box-shadow:4px 7px 0 0 #000`
          : `background-color:${RB.card};border:1px solid #000`;
      const body = i === 0 ? `<p class="mt-[19px] text-[18px] leading-normal">${esc(stepBodies[i] || "")}</p>` : "";
      return `<article class="flex items-start justify-between gap-4 rounded-[20px] p-5" style="${style}">
        <div class="max-w-[322px]">
          <h3 class="text-[32px] font-medium" style="${dFont()}">${esc(title)}</h3>
          ${body}
        </div>
        <img src="${i === 0 ? `${A}/plus.svg` : `${A}/minus.svg`}" alt="" width="24" height="24" class="size-6 shrink-0" />
      </article>`;
    })
    .join("\n");

  const quoteCards = quotesList
    .slice(0, 6)
    .map((quote, i) => {
      const stars = [0, 1, 2, 3]
        .map(() => `<img src="${A}/star.svg" alt="" width="24" height="24" class="size-6" />`)
        .join("");
      return `<article class="flex flex-col gap-6 overflow-hidden rounded-[20px] border-2 border-black p-[30px]">
        <div class="flex">${stars}<img src="${A}/star-empty.svg" alt="" width="24" height="24" class="size-6" /></div>
        <p class="text-[16px] font-medium leading-6 tracking-[-0.1px]">${esc(quote)}</p>
        <div class="flex items-center gap-2.5">
          <img src="${esc(quotes.itemImages[i] || `${A}/quote-avatar.png`)}" alt="" width="40" height="40" class="size-10 rounded-full object-cover" />
          <div>
            <p class="text-[15px] font-medium leading-[22px]">${esc(authors[i] || "Dave Jones")}</p>
            <p class="text-[14px] font-medium leading-5" style="color:#5F6D7E">${esc(roles[i] || "UI/UX")}</p>
          </div>
        </div>
      </article>`;
    })
    .join("\n");

  const socials = [`${A}/social-fb.svg`, `${A}/social-x.svg`, `${A}/social-in.svg`, `${A}/social-ig.svg`]
    .map((src) => `<span class="grid size-[38px] place-items-center rounded-full bg-white"><img src="${src}" alt="" width="24" height="24" class="size-6" /></span>`)
    .join("");

  const teamCards = teamNames
    .slice(0, 3)
    .map((name, i) => {
      const overlay =
        i === 0 ? `<div class="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-[11px]">${socials}</div>` : "";
      return `<article class="flex flex-col items-center gap-3.5">
        <div class="relative h-[441px] w-full overflow-hidden rounded-[10px] border-[5px] border-black">
          <img src="${esc(team.itemImages[i] || FALLBACK.team[i])}" alt="${esc(name)}" class="absolute inset-0 size-full object-cover grayscale" />
          ${overlay}
        </div>
        <h3 class="text-[32px] font-medium" style="${dFont()}">${esc(name)}</h3>
        <p class="text-[18px]">${esc(teamRoles[i] || "")}</p>
      </article>`;
    })
    .join("\n");

  const marqueeCopy = [0, 1]
    .map(
      () => `<div class="flex items-center gap-[18px]">
        <img src="${A}/service-arrow.png" alt="" width="36" height="34" class="h-[34px] w-9 object-contain" />
        <p class="whitespace-nowrap text-[32px] font-medium" style="${dFont()};color:${RB.brand}">${esc(marquee)}</p>
        ${asterisk()}
      </div>`
    )
    .join("");

  return `
<section class="px-8 pb-16 pt-10" style="${sectionBandCss(hero.theme)}">
  <div class="mx-auto flex max-w-[1135px] flex-col items-start gap-[45px] lg:flex-row">
    <div class="flex max-w-[601px] flex-col items-start gap-[38px]">
      <div class="relative">
        <h1 class="whitespace-pre-line text-[clamp(3rem,7vw,86px)] font-bold leading-none" style="${dFont()};color:${RB.ink}">${esc(headline)}</h1>
        <span class="absolute right-0 top-2 hidden md:block">${asterisk()}</span>
      </div>
      <p class="max-w-[600px] text-[18px] leading-normal">${esc(text(hero.content, "subheadline"))}</p>
      <div class="flex items-center gap-6">
        <div class="relative h-[63px] w-[156px]">${avatars}</div>
        <p class="text-[18px]">${esc(text(hero.content, "ctaSecondary", "Believed by more than a thousand people"))}</p>
      </div>
      <div class="relative">
        ${pillButton(pageHref("contact"), text(hero.content, "ctaPrimary", "Book a free consultant"), `<img src="${A}/phone-circle.svg" alt="" width="24" height="24" class="size-6" />`)}
        <img src="${A}/scribble.svg" alt="" width="177" height="178" class="pointer-events-none absolute -bottom-16 left-[85%] hidden w-[176px] lg:block" />
      </div>
    </div>
    <div class="relative h-[544px] w-full max-w-[489px] shrink-0 overflow-hidden rounded-[11px] border-[9px] border-white">
      <img src="${esc(hero.image || FALLBACK.hero)}" alt="" class="absolute inset-0 size-full object-cover" />
    </div>
  </div>
</section>

<section class="px-8 py-20" style="${sectionBandCss(services.theme)}">
  <div class="mx-auto flex max-w-[1138px] flex-col items-center gap-[52px]">
    <h2 class="max-w-[780px] text-center text-[52px] font-bold leading-none" style="${dFont()}">${esc(text(services.content, "heading", "We provide effective design solutions"))}</h2>
    <div class="grid w-full gap-5 md:grid-cols-2">${serviceCards}</div>
  </div>
</section>

<section class="px-8 py-20" style="${sectionBandCss(about.theme)}">
  <div class="mx-auto flex max-w-[1134px] flex-col gap-[52px]">
    <div class="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-[94px]">
      <div class="relative max-w-[521px]">
        <h2 class="text-[52px] font-bold leading-none" style="${dFont()}">${esc(text(about.content, "heading", "We make your business stand out"))}</h2>
        <span class="absolute right-6 top-2 hidden md:block">${asterisk()}</span>
      </div>
      <p class="max-w-[519px] text-[18px] leading-normal">${esc(text(about.content, "body"))}</p>
    </div>
    <div class="flex flex-col gap-[22px] lg:flex-row">
      <div class="relative h-[450px] w-full overflow-hidden rounded-[20px] border-[5px] border-black lg:w-[751px]">
        <img src="${esc(about.image || FALLBACK.aboutVideo)}" alt="" class="absolute inset-0 size-full object-cover" />
        <div class="absolute inset-0 bg-black/20"></div>
        <span class="absolute left-1/2 top-1/2 inline-flex h-[58px] w-[133px] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1.5 rounded-[33px] border-2 border-black text-[15px] font-semibold text-white" style="background-color:${RB.brand};box-shadow:-5px 5px 0 0 #fff">PLAY<img src="${A}/play-circle.svg" alt="" width="24" height="24" class="size-6" /></span>
      </div>
      <div class="flex w-full items-center justify-center rounded-[20px] px-[45px] py-[60px] lg:w-[361px]" style="background-color:${RB.inverse}">
        <div class="flex w-[271px] flex-col items-center gap-[27px] text-center">${statBlocks}</div>
      </div>
    </div>
  </div>
</section>

<section class="px-8 py-20" style="background-color:${RB.inverse};${sectionBandCss(work.theme)}">
  <div class="mx-auto flex max-w-[1137px] flex-col items-center gap-[52px]">
    <div class="relative max-w-[633px] text-center">
      <h2 class="text-[52px] font-bold leading-none text-white" style="${dFont()}">${esc(text(work.content, "heading", "Have a wide range of creative project"))}</h2>
      <span class="absolute -right-2 bottom-0 hidden md:block">${asterisk()}</span>
    </div>
    <div class="grid w-full gap-5 md:grid-cols-2">${workCards}</div>
  </div>
</section>

<section class="px-8 py-20" style="${sectionBandCss(process.theme)}">
  <div class="mx-auto flex max-w-[1136px] flex-col gap-10 lg:flex-row lg:justify-between">
    <div class="flex max-w-[557px] flex-col gap-[30px]">
      <div class="relative">
        <h2 class="text-[52px] font-bold leading-none" style="${dFont()}">${esc(text(process.content, "heading", "Our high quality working processes"))}</h2>
        <span class="absolute right-16 top-2 hidden md:block">${asterisk()}</span>
      </div>
      <p class="text-[18px] leading-normal">${esc(text(process.content, "subheading"))}</p>
      <p class="text-[18px] leading-normal">${esc(text(process.content, "body"))}</p>
    </div>
    <div class="flex w-full max-w-[462px] flex-col gap-[26px]">${stepCards}</div>
  </div>
</section>

<section class="px-8 py-20" style="${sectionBandCss(quotes.theme)}">
  <div class="mx-auto flex max-w-[1138px] flex-col items-center gap-[52px]">
    <div class="relative max-w-[718px] text-center">
      <h2 class="text-[52px] font-bold leading-none" style="${dFont()}">${esc(text(quotes.content, "heading", "Clients are always satisfied with us"))}</h2>
      <span class="absolute right-16 top-1 hidden md:block">${asterisk()}</span>
    </div>
    <div class="grid w-full gap-[9px] md:grid-cols-3">${quoteCards}</div>
  </div>
</section>

<div class="overflow-hidden py-2.5" style="background-color:${RB.inverse}">
  <div class="rb-marquee flex w-max items-center gap-[18px] px-5">${marqueeCopy}</div>
</div>

<section class="px-8 py-20" style="${sectionBandCss(team.theme)}">
  <div class="mx-auto flex max-w-[1137px] flex-col items-center gap-[52px]">
    <div class="relative max-w-[718px] text-center">
      <h2 class="text-[52px] font-bold leading-none" style="${dFont()}">${esc(text(team.content, "heading", "We have a team of creative people"))}</h2>
      <span class="absolute -right-2 bottom-0 hidden md:block">${asterisk()}</span>
    </div>
    <div class="grid w-full gap-[21px] md:grid-cols-3">${teamCards}</div>
  </div>
</section>`;
}

function homeContact(
  slots: TemplateSlot[],
  contactEmail: string,
  contactPhone: string,
  businessName: string,
  customLogo: string
): string {
  const contact = slotAt(slots, "contact");
  const footerSlot = slotAt(slots, "footer");
  const lights = [`${A}/social-fb-light.svg`, `${A}/social-x-light.svg`, `${A}/social-ig-light.svg`, `${A}/social-in-light.svg`]
    .map((src) => `<img src="${src}" alt="" width="24" height="24" class="size-6" />`)
    .join("");
  const year = new Date().getFullYear();
  return `<footer class="px-8 py-20" style="background-color:${RB.inverse};color:${RB.inverseFg};${sectionBandCss(contact.theme)}">
  <div class="mx-auto flex max-w-[1133px] flex-col gap-[45px] lg:flex-row lg:items-start">
    <div class="flex w-full max-w-[555px] flex-col gap-[49px]">
      <div class="relative">
        <h2 class="max-w-[521px] text-[52px] font-bold leading-none text-white" style="${dFont()}">${esc(text(contact.content, "heading", "Let's start a project together"))}</h2>
        <span class="absolute left-[303px] top-1 hidden md:block">${asterisk()}</span>
      </div>
      <p class="text-[18px] leading-normal text-white">${esc(text(contact.content, "subheading"))}</p>
      <div>
        <p class="text-[18px]" style="color:${RB.brand}">Give us a call:</p>
        <p class="mt-3.5 text-[18px] text-white">${esc(contactPhone || "(123)456-780")}</p>
      </div>
      <div>
        <p class="text-[18px]" style="color:${RB.brand}">Send us an email:</p>
        <p class="mt-3.5 text-[18px] text-white">${esc(contactEmail || "info@rebo.com")}</p>
      </div>
      <div class="flex gap-[21px]">${lights}</div>
    </div>
    <form class="flex w-full max-w-[558px] flex-col gap-6 rounded-lg p-8">
      <h3 class="text-[32px] font-medium text-white" style="${dFont()}">Send us a message</h3>
      <input class="h-[46px] rounded-md border border-white bg-transparent px-4 text-[15px] text-white placeholder:text-[#A5ACBA]" placeholder="Name" />
      <input class="h-[46px] rounded-md border border-white bg-transparent px-4 text-[15px] text-white placeholder:text-[#A5ACBA]" placeholder="Email" type="email" />
      <textarea class="min-h-[157px] rounded-md border border-white bg-transparent px-4 py-3 text-[15px] text-white placeholder:text-[#A5ACBA]" placeholder="Message"></textarea>
      <label class="flex items-start gap-3 text-[16px] font-medium text-white">
        <span class="mt-0.5 size-5 shrink-0 rounded-[5px] border-2 border-[#DAE0E6] bg-white"></span>
        ${esc(text(contact.content, "body", "I agree with Lookscout Privacy Policy"))}
      </label>
      ${pillButton(pageHref("contact"), text(contact.content, "ctaPrimary", "Book a free consultant"), `<img src="${A}/phone-circle.svg" alt="" width="24" height="24" class="size-6" />`)}
    </form>
  </div>
  <div class="mx-auto mt-[45px] flex max-w-[1133px] items-center justify-between border-t pt-6" style="border-color:#2E3545">
    <p class="text-[16px]" style="color:${RB.graySoft}">© Copyright ${year}, All Rights Reserved by ${esc(text(footerSlot.content, "businessName", businessName))}</p>
    ${logo(businessName, customLogo, true)}
  </div>
</footer>`;
}

function innerFooter(
  businessName: string,
  customLogo: string,
  tagline: string,
  contactEmail: string,
  contactPhone: string
): string {
  const year = new Date().getFullYear();
  const pills = ["twitter", "linkedin", "instagram"]
    .map(
      (label) =>
        `<span class="inline-flex w-[105px] items-center justify-center rounded-[33px] border border-[#FFFFF5] p-[5px] text-[18px] text-[#FFFFF5]">${label}</span>`
    )
    .join("");
  return `<footer class="relative overflow-hidden px-8 py-20" style="background-color:${RB.inverse};color:${RB.inverseFg}">
  <div class="pointer-events-none absolute inset-x-0 top-24 flex justify-center gap-[118px] text-[400px] font-bold leading-[220px] tracking-[2px] text-white/10" style="${dFont(true)}"><span>REBO</span><span>REBO</span></div>
  <div class="relative mx-auto flex max-w-[1149px] flex-col gap-10">
    <div class="flex items-start gap-[23px]">
      ${logo(businessName, customLogo, true)}
      <p class="max-w-[262px] text-[18px] font-semibold uppercase leading-normal text-[#FFFFF5]">${esc(tagline)}</p>
    </div>
    <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-[96px] font-semibold uppercase leading-none text-white" style="${dFont(true)}">get in <span style="color:${RB.brand}">touch</span></p>
        <div class="mt-[27px] flex gap-[102px] text-[24px] font-bold text-[#8E8E8E]">
          <p>${esc(contactPhone || "(+23)456-780")}</p>
          <p>${esc(contactEmail || "info@rebo.com")}</p>
        </div>
      </div>
      <div class="flex gap-2.5">${pills}</div>
    </div>
    <div class="flex items-center justify-between border-t pt-6" style="border-color:#2E3545">
      <p class="text-[16px]" style="color:${RB.graySoft}">© Copyright ${year}, All Rights Reserved by ${esc(businessName)}</p>
      ${logo(businessName, customLogo, true)}
    </div>
  </div>
</footer>`;
}

function pageTitle(heading: string, image?: string): string {
  const img = image
    ? `<div class="relative h-[436px] w-full overflow-hidden"><img src="${esc(image)}" alt="" class="absolute inset-0 size-full object-cover grayscale" /></div>`
    : "";
  return `<section class="px-8 pb-6 pt-12">
  <div class="mx-auto flex max-w-[1135px] flex-col items-center gap-[26px]">
    <h1 class="text-[52px] font-bold uppercase leading-none" style="${dFont(true)}">${esc(heading)}</h1>
    ${img}
  </div>
</section>`;
}

function wordMarquee(): string {
  return `<div class="overflow-hidden py-6">
  <div class="flex flex-wrap justify-center gap-8 text-[96px] font-semibold uppercase leading-none" style="${dFont(true)}">
    <span>business</span>
    <span style="color:${RB.brand}">financial</span>
    <span>marketing</span>
    <span style="color:${RB.brand}">software</span>
  </div>
</div>`;
}

function faqList(heading: string, questions: string[], answers: string[]): string {
  const items = questions
    .map((q, i) => {
      const open = i === 0 ? " open" : "";
      const answer = answers[i]
        ? `<p class="mt-[19px] max-w-[431px] text-[18px]" style="color:${RB.gray}">${esc(answers[i])}</p>`
        : "";
      return `<details class="group border-y border-black/20 px-[5px] py-5"${open}>
        <summary class="flex cursor-pointer list-none items-start justify-between gap-4 text-[22px] font-semibold uppercase">${esc(q)}<img src="${A}/arrow-down-right.svg" alt="" width="24" height="24" class="size-6 shrink-0" /></summary>
        ${answer}
      </details>`;
    })
    .join("\n");
  return `<section class="px-8 py-16">
  <div class="mx-auto flex max-w-[1135px] flex-col gap-[22px] lg:flex-row lg:items-start">
    <div class="w-full max-w-[345px] uppercase">
      <p class="text-[18px] font-semibold">(FREQUENTLY ASKED QUESTIONS)</p>
      <h2 class="text-[52px] font-bold leading-none" style="${dFont(true)}">${esc(heading)}</h2>
    </div>
    <div class="flex-1">${items}</div>
  </div>
</section>`;
}

function aboutBody(slots: TemplateSlot[]): string {
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const stats = slotAt(slots, "features", 0);
  const team = slotAt(slots, "features", 1);
  const values = list(stats.content, "itemTitles", ["25+", "84k", "20k", "85%"]);
  const labels = list(stats.content, "itemBodies");
  const names = list(team.content, "itemTitles");
  const roles = list(team.content, "itemBodies");
  const statGrid = values
    .map(
      (value, i) =>
        `<div><p class="text-[64px] font-bold leading-none" style="${dFont(true)}">${esc(value)}</p><p class="mt-4 text-[18px]">${esc(labels[i] || "")}</p></div>`
    )
    .join("");
  const teamGrid = names
    .map(
      (name, i) =>
        `<article>
          <div class="relative h-[345px] w-full overflow-hidden">
            <img src="${esc(team.itemImages[i] || FALLBACK.aboutTeam[i])}" alt="${esc(name)}" class="absolute inset-0 size-full object-cover grayscale" />
          </div>
          <p class="mt-[18px] text-[14px]" style="color:#5A5A5A">${esc(roles[i] || "")}</p>
          <h3 class="mt-2.5 text-[32px] font-medium" style="${dFont(true)}">${esc(name)}</h3>
        </article>`
    )
    .join("");
  return `${pageTitle(text(hero.content, "headline", "ABOUT US"), hero.image || FALLBACK.aboutHero)}
<section class="px-8 py-16" style="${sectionBandCss(about.theme)}">
  <div class="mx-auto flex max-w-[1136px] flex-col items-center gap-[30px]">
    <span class="rounded-[33px] border border-black px-2.5 py-2.5 text-[18px] font-semibold uppercase">${esc(text(about.content, "eyebrow", "Our mission & vision"))}</span>
    <p class="text-center text-[52px] font-bold leading-none" style="${dFont(true)}">${esc(text(about.content, "heading"))}</p>
  </div>
</section>
<section class="px-8 pb-16">
  <div class="mx-auto grid max-w-[1135px] gap-8 sm:grid-cols-2 lg:grid-cols-4">${statGrid}</div>
</section>
<section class="px-8 pb-20" style="${sectionBandCss(team.theme)}">
  <div class="mx-auto flex max-w-[1136px] flex-col items-center gap-[30px]">
    <span class="rounded-[33px] border border-black px-2.5 py-2.5 text-[18px] font-semibold uppercase">${esc(text(team.content, "heading", "Our team profesional"))}</span>
    <div class="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-4">${teamGrid}</div>
  </div>
</section>`;
}

function servicesBody(slots: TemplateSlot[]): string {
  const hero = slotAt(slots, "hero");
  const services = slotAt(slots, "services");
  const approach = slotAt(slots, "process");
  const titles = list(services.content, "itemTitles", ["business", "financial", "marketing", "software"]);
  const bodies = list(services.content, "itemBodies");
  const steps = list(approach.content, "stepTitles");
  const stepBodies = list(approach.content, "stepBodies");
  const rows = titles
    .map((title, i) => {
      const style = i === 1 ? ` style="background-color:${RB.brand};border-color:transparent"` : "";
      const color = i === 1 ? RB.ink : RB.white;
      const extra =
        i === 1
          ? `<div class="hidden max-w-[295px] items-center gap-4 lg:flex"><p class="text-[18px] leading-normal">${esc(bodies[i] || "")}</p><img src="${A}/mark-arrow.svg" alt="" width="56" height="55" class="h-[55px] w-[56px] -rotate-90" /></div>`
          : "";
      return `<div class="flex items-center justify-between border-y border-[#8F8F8F] p-2.5"${style}>
        <p class="text-[clamp(2.5rem,8vw,96px)] font-semibold uppercase leading-none" style="${dFont(true)};color:${color}">${esc(title)}</p>
        ${extra}
      </div>`;
    })
    .join("");
  const approachCards = steps
    .map(
      (title, i) =>
        `<article class="flex flex-col gap-11 border-black px-[17px] py-4 md:border-r md:last:border-r-0">
          <img src="${FALLBACK.approach[i] || FALLBACK.approach[0]}" alt="" width="55" height="56" class="h-[56px] w-[55px] object-contain" />
          <div>
            <h3 class="text-[18px] font-medium" style="${dFont(true)}">${esc(title)}</h3>
            <p class="mt-2.5 text-[14px]" style="color:#5A5A5A">${esc(stepBodies[i] || "")}</p>
          </div>
          <img src="${A}/arrow-right.svg" alt="" width="24" height="24" class="size-6" />
        </article>`
    )
    .join("");
  return `<section class="px-8 pb-6 pt-12">
  <div class="mx-auto flex max-w-[1136px] flex-col items-center gap-[26px]">
    <h1 class="text-[52px] font-bold uppercase leading-none" style="${dFont(true)}">${esc(text(hero.content, "headline", "SERVICES"))}</h1>
    <div class="relative w-full overflow-hidden">
      <img src="${esc(hero.image || FALLBACK.servicesHero)}" alt="" class="h-[764px] w-full object-cover grayscale" />
      <div class="absolute inset-0 flex flex-col justify-center px-8">${rows}</div>
    </div>
  </div>
</section>
<section class="px-8 py-16" style="${sectionBandCss(approach.theme)}">
  <div class="mx-auto max-w-[1136px]">
    <div class="mb-12 inline-flex items-center gap-[11px] rounded-[33px] border border-black px-5 py-2.5">
      <span class="size-5 rounded-full" style="background-color:${RB.ink}"></span>
      <h2 class="text-[32px] font-medium uppercase" style="${dFont(true)}">${esc(text(approach.content, "heading", "Our Approach"))}</h2>
    </div>
    <div class="grid gap-2 md:grid-cols-4">${approachCards}</div>
  </div>
</section>
${wordMarquee()}`;
}

function pricingBody(slots: TemplateSlot[]): string {
  const hero = slotAt(slots, "hero");
  const pricing = slotAt(slots, "pricing");
  const faq = slotAt(slots, "faq");
  const names = list(pricing.content, "planNames", ["Starter", "Beginner", "Best Value"]);
  const features = list(pricing.content, "planFeatures");
  const blurb = list(pricing.content, "itemBodies");
  const cards = names
    .map((name, i) => {
      const lines = (features[i] || features[0] || "")
        .split("\n")
        .map((line) => `<li class="flex items-center gap-2"><img src="${A}/check.svg" alt="" width="16" height="16" class="size-4" />${esc(line)}</li>`)
        .join("");
      return `<article class="rounded-[20px] p-8 text-white" style="background-color:${RB.inverse}">
        <span class="inline-flex rounded px-4 py-1 text-[14px] font-semibold" style="background-color:${i === 1 ? RB.brand : "#2A2A2A"}">${esc(name)}</span>
        <p class="mt-3 text-[16px] leading-normal text-white/80">${esc(blurb[i] || "")}</p>
        <ul class="mt-6 space-y-2 border-t border-white/20 pt-6 text-[16px]">${lines}</ul>
        <a href="${pageHref("contact")}" class="mt-8 flex h-12 items-center justify-center rounded-md bg-[#2A2A2A] text-[14px] font-semibold uppercase">Contact our sales</a>
      </article>`;
    })
    .join("");
  return `${pageTitle(text(hero.content, "headline", "PRICING PLANS"))}
<section class="px-8 pb-16" style="${sectionBandCss(pricing.theme)}">
  <div class="mx-auto grid max-w-[1136px] gap-5 md:grid-cols-3">${cards}</div>
</section>
${faqList(text(faq.content, "heading", "Popular Questions"), list(faq.content, "questions"), list(faq.content, "answers"))}
${wordMarquee()}`;
}

function faqBody(slots: TemplateSlot[]): string {
  const hero = slotAt(slots, "hero");
  const faq = slotAt(slots, "faq");
  return `${pageTitle(text(hero.content, "headline", "FAQ"), hero.image || FALLBACK.faqHero)}
${faqList(text(faq.content, "heading", "Popular Questions"), list(faq.content, "questions"), list(faq.content, "answers"))}
${wordMarquee()}`;
}

function contactBody(slots: TemplateSlot[], contactEmail: string, contactPhone: string): string {
  const hero = slotAt(slots, "hero");
  const contact = slotAt(slots, "contact");
  const pills = ["twitter", "linkedin", "instagram"]
    .map(
      (label) =>
        `<span class="inline-flex w-[105px] items-center justify-center rounded-[33px] border border-black p-[5px] text-[18px] font-normal normal-case">${label}</span>`
    )
    .join("");
  return `${pageTitle(text(hero.content, "headline", "CONTACTS"))}
<section class="px-8 py-16" style="${sectionBandCss(contact.theme)}">
  <div class="mx-auto flex max-w-[1136px] flex-col gap-[78px]">
    <div class="flex flex-col gap-10 lg:flex-row lg:justify-between">
      <div class="max-w-[458px] uppercase">
        <p class="text-[18px] font-semibold">${esc(text(hero.content, "eyebrow", "(OUR CONTACTS)"))}</p>
        <h2 class="text-[52px] font-bold leading-none" style="${dFont(true)}">${esc(text(contact.content, "heading", "Get in Touch with Us"))}</h2>
      </div>
      <div class="flex flex-col gap-5 text-[18px] font-semibold uppercase">
        <div class="flex gap-8">
          <p style="color:#818181">Location</p>
          <p class="whitespace-pre-line">${esc(text(contact.content, "body", "27 Division St, NY 10002\nindonesia / jakarta"))}</p>
        </div>
        <div class="flex gap-8">
          <p style="color:#818181">give us a call</p>
          <p>${esc(contactPhone || "+1 800 345 67 98")}</p>
        </div>
        <div class="flex gap-2.5">${pills}</div>
      </div>
    </div>
    <div class="h-px w-full bg-black"></div>
    <div class="mx-auto flex w-full max-w-[750px] flex-col items-center gap-[30px]">
      <h3 class="text-center text-[52px] font-bold uppercase leading-none" style="${dFont(true)}">${esc(text(contact.content, "subheading", "Lets Bring Your Vision Into Reality"))}</h3>
      <form class="flex w-full flex-col items-center gap-[53px]">
        <div class="grid w-full gap-5 md:grid-cols-2">
          <label class="flex flex-col gap-3 text-[18px]" style="color:#7E7E7E">Your Name<span class="h-px w-full bg-black"></span></label>
          <label class="flex flex-col gap-3 text-[18px]" style="color:#7E7E7E">Email<span class="h-px w-full bg-black"></span></label>
        </div>
        <label class="flex h-40 w-full flex-col justify-between text-[18px]" style="color:#7E7E7E">Message<span class="h-px w-full bg-black"></span></label>
        <a href="mailto:${esc(contactEmail || "info@rebo.com")}" class="inline-flex items-center gap-1.5 px-[18px] py-3 text-[15px] font-semibold text-white" style="background-color:${RB.brand}">${esc(text(contact.content, "ctaPrimary", "Send Message"))}<img src="${A}/arrow-up-right.svg" alt="" width="20" height="20" class="size-5" /></a>
      </form>
    </div>
  </div>
</section>`;
}

function blogBody(slots: TemplateSlot[]): string {
  const hero = slotAt(slots, "hero");
  const posts = slotAt(slots, "features");
  const titles = list(posts.content, "itemTitles");
  const dates = list(posts.content, "itemBodies");
  const main = titles.slice(0, 3);
  const related = titles.slice(3, 7);
  const mainPosts = main
    .map(
      (title, i) =>
        `<article class="relative flex flex-col gap-[21px]">
          <div class="relative h-[570px] w-full overflow-hidden">
            <img src="${esc(posts.itemImages[i] || FALLBACK.blog[i])}" alt="${esc(title)}" class="absolute inset-0 size-full object-cover" />
            <span class="absolute left-[22px] top-[22px] rounded-[33px] border border-black px-2.5 py-2.5 text-[14px] uppercase">Branding</span>
          </div>
          <div class="flex items-end justify-between">
            <div>
              <p class="text-[16px] font-medium capitalize" style="color:#5F5C5C">${esc(dates[i] || "")}</p>
              <h2 class="mt-[21px] text-[22px] font-medium">${esc(title)}</h2>
            </div>
            <span class="inline-flex items-center gap-1.5 text-[15px] font-semibold" style="color:${RB.brand}">Read More<img src="${A}/arrow-down-right.svg" alt="" width="20" height="20" class="size-5" /></span>
          </div>
        </article>`
    )
    .join("");
  const relatedPosts = related
    .map(
      (title, i) =>
        `<article class="flex gap-[11px]">
          <img src="${esc(posts.itemImages[i + 3] || FALLBACK.blog[i + 3])}" alt="" width="109" height="97" class="h-[97px] w-[109px] object-cover" />
          <div>
            <p class="text-[16px] font-medium capitalize" style="color:#5F5C5C">${esc(dates[i + 3] || "")}</p>
            <p class="mt-[11px] text-[18px]">${esc(title)}</p>
          </div>
        </article>`
    )
    .join("");
  const cats = ["Branding (4)", "Design (4)", "Digital (4)", "Ideas (4)", "Technology (4)"]
    .map((c) => `<li>${c}</li>`)
    .join("");
  return `${pageTitle(text(hero.content, "headline", "BLOG LISTING"))}
<section class="px-8 pb-20" style="${sectionBandCss(posts.theme)}">
  <div class="mx-auto flex max-w-[1136px] flex-col gap-[18px] lg:flex-row lg:items-start">
    <div class="flex w-full max-w-[753px] flex-col gap-[37px]">${mainPosts}</div>
    <aside class="flex w-full max-w-[365px] flex-col gap-[46px]">
      <div>
        <div class="flex items-center gap-[17px] text-[18px]" style="color:#7E7E7E"><img src="${A}/search.svg" alt="" width="24" height="24" class="size-6" />Search</div>
        <div class="mt-3 h-px w-full bg-black"></div>
      </div>
      <div>
        <p class="text-[22px] font-medium">Categori</p>
        <ul class="mt-5 space-y-[7px] text-[18px]" style="color:${RB.gray}">${cats}</ul>
      </div>
      <div>
        <p class="text-[22px] font-medium">Related Posts</p>
        <div class="mt-5 flex flex-col gap-[15px]">${relatedPosts}</div>
      </div>
    </aside>
  </div>
</section>`;
}

function portfolioBody(slots: TemplateSlot[]): string {
  const hero = slotAt(slots, "hero");
  const work = slotAt(slots, "portfolio");
  const titles = list(work.content, "itemTitles", ["QUBUS", "NYOLA", "TAPESHO", "URAGO"]);
  const bodies = list(work.content, "itemBodies", ["brand strategy", "digital marketing", "seo page", "brand strategy"]);
  const cases = titles
    .map(
      (title, i) =>
        `<article class="flex flex-col gap-[15px]">
          <div class="relative h-[813px] w-full overflow-hidden">
            <img src="${esc(work.itemImages[i] || FALLBACK.cases[i])}" alt="${esc(title)}" class="absolute inset-0 size-full object-cover" />
          </div>
          <h3 class="text-[52px] uppercase leading-none" style="${dFont(true)}">${esc(title)}</h3>
          <ul class="list-disc pl-[27px] text-[18px]"><li>${esc(bodies[i] || "")}</li></ul>
        </article>`
    )
    .join("");
  return `${pageTitle(text(hero.content, "headline", "PORTFOLIO 2 COL"))}
<section class="px-8 pb-20" style="${sectionBandCss(work.theme)}">
  <div class="mx-auto flex max-w-[1136px] flex-col gap-[30px]">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
      <h2 class="max-w-[462px] text-[52px] font-bold uppercase leading-none" style="${dFont(true)}">${esc(text(work.content, "heading", "Our Cases"))}</h2>
      <p class="max-w-[558px] text-right text-[18px] uppercase leading-normal">${esc(text(work.content, "subheading", text(hero.content, "subheadline")))}</p>
    </div>
    <div class="grid gap-[52px]">
      <div class="grid gap-5 md:grid-cols-2">${cases}</div>
    </div>
  </div>
</section>`;
}

function pageBody(active: string, slots: TemplateSlot[], contactEmail: string, contactPhone: string): string {
  switch (active) {
    case "about":
      return aboutBody(slots);
    case "services":
      return servicesBody(slots);
    case "pricing":
      return pricingBody(slots);
    case "contact":
      return contactBody(slots, contactEmail, contactPhone);
    case "faq":
      return faqBody(slots);
    case "blog":
      return blogBody(slots);
    case "portfolio":
      return portfolioBody(slots);
    default:
      return homeBody(slots);
  }
}

/** Renders one Rebo page to a complete static HTML document. */
export function renderReboPage(site: AssembledSite, pageSlug?: string): string {
  const pages = pageSlugsOf(null, site);
  const active =
    (pageSlug && pages.find((p) => p.slug === pageSlug)?.slug) ||
    pages.find((p) => p.slug === "home")?.slug ||
    pages[0]?.slug ||
    "home";
  const slots = toSlots(null, site, active);
  const footerSlot = slotAt(slots, "footer");
  const businessName = text(footerSlot.content, "businessName") || site.businessName || "REBO";
  const customLogo = site.theme?.logoUrl?.trim() || "";
  const tagline = text(footerSlot.content, "tagline", "WE ARE PRIORITIZE COLLABORATION WITH OUR CLIENTS");
  const contactEmail = site.contact?.email?.trim() || "";
  const contactPhone = site.contact?.phone?.trim() || "";
  const isHome = active === "home";
  const activeTitle = pages.find((p) => p.slug === active)?.title || "Home";
  const bg = isHome ? RB.bg : RB.innerBg;
  const foot = isHome
    ? homeContact(slots, contactEmail, contactPhone, businessName, customLogo)
    : innerFooter(businessName, customLogo, tagline, contactEmail, contactPhone);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(activeTitle)} — ${esc(site.seo.title)}</title>
  <meta name="description" content="${esc(site.seo.description)}" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=block" rel="stylesheet" />
  <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=block" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --rb-display: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; --rb-body: Inter, ui-sans-serif, system-ui, sans-serif; --rb-clash: 'Clash Display', var(--rb-display), ui-sans-serif, sans-serif; ${brandCss(site.theme, "#E44F39")} ${themeFontCss(site.theme, ["--rb-display","--rb-body","--rb-clash"])} }
    html { scroll-behavior: smooth; }
    body { font-family: var(--rb-body), ui-sans-serif, system-ui, sans-serif; color: ${RB.ink}; background: ${bg}; -webkit-font-smoothing: antialiased; }
    @keyframes rb-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    .rb-marquee { animation: rb-marquee 18s linear infinite; }
    @media (prefers-reduced-motion: reduce) { .rb-marquee { animation: none; } }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body>
${header(pages, active, businessName, customLogo, isHome)}
<main>
${pageBody(active, slots, contactEmail, contactPhone)}
</main>
${foot}
</body>
</html>`;
}
