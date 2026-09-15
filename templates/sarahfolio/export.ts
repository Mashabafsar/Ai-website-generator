import { SF } from "./tokens";
import { list, slotAt, text, toSlots, pageSlugsOf, type TemplateSlot } from "../shared/content";
import { brandCss, sectionBandCss } from "../shared/brand";
import { themeFontBodyCss, themeFontCss, themeFontHref } from "../shared/fonts";
import type { AssembledSite } from "@/lib/blueprint/types";

// Static HTML twin of templates/sarahfolio/site.tsx. Exported and deployed sites
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

const A = "/templates/sarahfolio";

const FALLBACK = {
  hero: `${A}/hero.png`,
  intro: `${A}/intro.png`,
  about: `${A}/about-portrait.png`,
  avatars: [`${A}/avatar-1.png`, `${A}/avatar-2.png`, `${A}/avatar-3.png`],
  services: [
    `${A}/icon-strategy.svg`,
    `${A}/icon-browsers.svg`,
    `${A}/icon-pencil.svg`,
    `${A}/icon-file.svg`,
  ],
  blog: [
    `${A}/blog-1.png`,
    `${A}/blog-2.png`,
    `${A}/blog-3.png`,
    `${A}/blog-4.png`,
    `${A}/blog-5.png`,
    `${A}/blog-6.png`,
    `${A}/blog-7.png`,
    `${A}/blog-8.png`,
  ],
  steps: [`${A}/offer-2.png`, `${A}/offer-3.png`, `${A}/offer-4.png`, `${A}/offer-6.png`, `${A}/offer-7.png`],
} as const;

function pageHref(slug: string): string {
  return slug === "home" ? "/" : `/${slug}/`;
}

function dFont(): string {
  return "font-family:var(--sf-display),Anton,ui-sans-serif,sans-serif";
}

function cta(href: string, label: string, small = false): string {
  const pad = small
    ? "px-4 py-2 text-[14px] leading-[22px] drop-shadow-[0px_4px_0px_#0f0f0f]"
    : "gap-3 px-8 py-4 text-[18px] leading-[26px] drop-shadow-[0px_6px_0px_#0f0f0f]";
  return `<a href="${esc(href)}" class="sf-cta inline-flex items-center justify-center rounded-[32px] border-2 border-[#0f0f0f] font-semibold text-[#0f0f0f] ${pad}" style="background-color:${SF.brand}">${esc(label)}</a>`;
}

function logo(businessName: string, customLogo: string, ink: string = SF.limeInk): string {
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" width="32" height="32" class="size-8 object-contain" />`
    : `<img src="${A}/logo.svg" alt="" width="32" height="32" class="size-8" />`;
  return `<a href="${pageHref("home")}" class="inline-flex items-center gap-2 pr-4">
    <span class="flex size-14 shrink-0 items-center justify-center rounded-full bg-white p-3">${mark}</span>
    <span class="text-[24px] font-bold leading-[1.4] tracking-[-0.48px]" style="color:${ink}">${esc(businessName)}</span>
  </a>`;
}

function header(
  pages: { slug: string; title: string }[],
  active: string,
  businessName: string,
  customLogo: string,
  ink: string = SF.limeInk
): string {
  const links = pages
    .map(
      (p) =>
        `<a href="${pageHref(p.slug)}" class="block rounded-[16px] px-3 py-2 text-[16px] font-medium" style="color:${p.slug === active ? SF.limeInk : SF.ink}">${esc(p.title)}</a>`
    )
    .join("");
  return `<div class="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-7 pt-8 sm:px-8">
    <div class="pointer-events-auto">${logo(businessName, customLogo, ink)}</div>
    <details class="sf-menu pointer-events-auto relative">
      <summary class="flex size-16 cursor-pointer items-center justify-center rounded-full bg-white p-4">
        <img src="${A}/menu.svg" alt="Open menu" width="32" height="32" class="size-8" />
      </summary>
      <nav class="absolute right-0 mt-3 w-52 rounded-[24px] border border-[#e5e5e5] bg-white p-3 shadow-[0_12px_32px_rgba(15,15,15,0.12)]">${links}</nav>
    </details>
  </div>`;
}

function sunburstOpen(tall: boolean, extra = ""): string {
  const min = tall
    ? "min-h-[720px] pb-0 pt-20 sm:min-h-[992px] sm:pt-20"
    : "min-h-[520px] py-40 sm:min-h-[640px]";
  return `<div class="relative overflow-hidden px-4 pt-4 sm:px-5" ${extra}>
    <div class="relative overflow-hidden rounded-[40px] px-6 pb-16 pt-28 text-center sm:rounded-[56px] sm:px-10 ${min}" style="background-color:${SF.lime}">
      <img src="${A}/sunburst.svg" alt="" width="1408" height="992" class="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90 object-cover opacity-80" />`;
}

function sunburstClose(): string {
  return `</div></div>`;
}

function testimonials(slot: TemplateSlot): string {
  const quotes = list(slot.content, "quotes", []);
  const authors = list(slot.content, "authors", []);
  const roles = list(slot.content, "roles", []);
  const brands = list(slot.content, "itemTitles", ["FitLife", "Wellness Journey", "Opulence Interiors"]);
  if (!quotes.length && !text(slot.content, "heading")) return "";
  const cards = quotes
    .slice(0, 3)
    .map((quote, i) => {
      const avatar = slot.itemImages[i] || FALLBACK.avatars[i] || FALLBACK.avatars[0];
      return `<article class="flex gap-4 rounded-[32px] border border-[#e5e5e5] bg-white p-6">
        <img src="${A}/icon-quote.svg" alt="" width="24" height="24" class="size-6 shrink-0" />
        <div class="flex flex-col gap-8">
          <div>
            <p class="text-[20px] font-medium leading-[1.4]">${esc(brands[i] || "Client")}</p>
            <p class="mt-4 text-[18px] leading-[26px] opacity-80">${esc(quote)}</p>
          </div>
          <div class="flex items-center gap-5">
            <img src="${esc(avatar)}" alt="" width="56" height="56" class="size-14 rounded-full object-cover" />
            <div>
              <p class="text-[18px] font-medium leading-[26px]">${esc(authors[i] || "")}</p>
              <p class="text-[12px] leading-[18px] opacity-60">${esc(roles[i] || "")}</p>
            </div>
          </div>
        </div>
      </article>`;
    })
    .join("");
  return `<section class="px-5 py-10">
    <div class="relative overflow-hidden rounded-[48px] px-6 py-16 sm:px-20" style="background-color:${SF.amber};${sectionBandCss(slot.theme)}">
      <img src="${A}/sunburst.svg" alt="" width="1408" height="741" class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08]" />
      <div class="relative z-[1] mx-auto max-w-[615px] text-center">
        <h2 class="text-[40px] leading-[1.2] tracking-[1.28px] sm:text-[64px]" style="${dFont()};color:#262626">${esc(text(slot.content, "heading", "What Clients Are Saying"))}</h2>
        <p class="mt-6 text-[18px] leading-[26px]" style="color:#404040">${esc(text(slot.content, "subheading", "Don't just take my word for it. Hear from clients who have experienced the impact of my words firsthand."))}</p>
      </div>
      <div class="relative z-[1] mt-14 grid gap-3 lg:grid-cols-3">${cards}</div>
      <div class="relative z-[1] mt-10 flex justify-center gap-6">
        <span class="flex size-12 items-center justify-center rounded-full border border-[#eaecf0] bg-white p-3"><img src="${A}/icon-arrow-back.svg" alt="" width="24" height="24" class="size-6" /></span>
        <span class="flex size-12 items-center justify-center rounded-full border border-[#eaecf0] bg-white p-3"><img src="${A}/icon-arrow-fwd.svg" alt="" width="24" height="24" class="size-6" /></span>
      </div>
    </div>
  </section>`;
}

function ctaBand(slot: TemplateSlot): string {
  if (!text(slot.content, "headline") && !text(slot.content, "ctaPrimary")) return "";
  return `<section class="px-5 py-10">
    <div class="relative overflow-hidden rounded-[48px] px-6 py-24 text-center sm:px-20" style="background-color:${SF.pink};${sectionBandCss(slot.theme)}">
      <img src="${A}/sunburst.svg" alt="" width="1408" height="911" class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30" />
      <div class="relative z-[1] mx-auto flex max-w-[710px] flex-col items-center gap-6">
        <h2 class="text-[40px] uppercase leading-[1.2] tracking-[-0.36px] sm:text-[72px]" style="${dFont()};color:${SF.pinkInk}">${esc(text(slot.content, "headline", "LET'S CREATE SOMETHING AMAZING TOGETHER"))}</h2>
        <p class="text-[18px] leading-[26px]" style="color:${SF.pinkMuted}">${esc(text(slot.content, "subheadline", "Whether you have a project in mind or just want to say hello, I'm always open to new opportunities and collaborations."))}</p>
        ${cta(pageHref("contact"), text(slot.content, "ctaPrimary", "Let's Connect!"))}
      </div>
    </div>
  </section>`;
}

function homeBody(slots: TemplateSlot[], meta: PageMeta): string {
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const work = slotAt(slots, "portfolio");
  const quotes = slotAt(slots, "testimonials");
  const banner = slotAt(slots, "cta");
  const titles = list(services.content, "itemTitles", ["Content Strategy", "Website Copy", "Blog Writing", "Email Marketing"]);
  const bodies = list(services.content, "itemBodies", [
    "Crafting content plans that align with your business goals.",
    "Persuasive website copy that converts visitors into customers.",
    "SEO-optimized posts that rank and resonate with readers.",
    "Campaigns that get opened, clicked, and remembered.",
  ]);
  const workTitles = list(work.content, "itemTitles", [
    "Website Revamp for E-Commerce Brand",
    "Social Media Campaign for Tech Startup",
    "Email Marketing for Subscription Service",
    "Content Strategy for Health & Wellness Blog",
  ]);
  const workBodies = list(work.content, "itemBodies", [""]);
  const workMeta = ["WEBSITE COPY", "CONTENT STRATEGY", "CONTENT STRATEGY", "CONTENT STRATEGY"];
  const heading = text(
    about.content,
    "heading",
    "Hi, I'm Sarah, a passionate copywriter with a knack for creating engaging, persuasive content that resonates with your audience."
  );
  const headingRest = heading.replace(/^Hi, I'm Sarah/i, "");
  const cards = titles
    .map((title, i) => {
      const dark = i === 0;
      return `<article class="flex h-[476px] w-[min(413px,80vw)] shrink-0 flex-col justify-between rounded-[24px] p-6 sm:p-8" style="background-color:${dark ? SF.inverse : SF.white};color:${dark ? SF.inverseFg : "#222420"}">
        <div class="flex flex-col gap-6">
          <span class="flex size-14 items-center justify-center"><img src="${FALLBACK.services[i] || FALLBACK.services[0]}" alt="" width="56" height="56" class="size-14" /></span>
          <h3 class="text-[32px] font-medium leading-[1.2] tracking-[-0.16px]">${esc(title)}</h3>
        </div>
        <div class="flex flex-col items-end gap-6">
          ${bodies[i] ? `<p class="w-full text-[20px] leading-[1.4]">${esc(bodies[i])}</p>` : ""}
          <img src="${dark ? `${A}/icon-arrow.svg` : `${A}/icon-plus.svg`}" alt="" width="32" height="32" class="size-8" />
        </div>
      </article>`;
    })
    .join("");
  const workCards = workTitles
    .map((title, i) => {
      const extra =
        i === 0 && workBodies[0]
          ? `<p class="text-[18px] leading-[26px]" style="color:#404040">${esc(workBodies[0])}</p>${cta(pageHref("services"), "View Project", true)}`
          : `<div class="flex justify-end pt-2"><img src="${A}/icon-plus.svg" alt="" width="32" height="32" class="size-8" /></div>`;
      return `<article class="flex flex-col gap-8 rounded-[24px] bg-white p-6">
        <div class="flex items-start justify-between text-[16px] leading-6" style="color:${SF.quiet}"><span>04 . 08 . 2024</span><span>${esc(workMeta[i] || "CONTENT STRATEGY")}</span></div>
        <h3 class="text-[32px] font-medium leading-[1.2] tracking-[-0.16px]">${esc(title)}</h3>
        ${extra}
      </article>`;
    })
    .join("");
  return `${sunburstOpen(true, `style="${sectionBandCss(hero.theme)}"`)}
    ${header(meta.pages, meta.active, meta.businessName, meta.customLogo)}
    <div class="relative z-[1] mx-auto flex max-w-[1068px] flex-col items-center gap-4">
      <h1 class="text-[48px] uppercase leading-[1.2] tracking-[-1px] sm:text-[80px] lg:text-[104px]" style="${dFont()};color:${SF.limeInk}">${esc(text(hero.content, "headline", "THE STORY BEHIND THE WORLD"))}</h1>
      <p class="max-w-[618px] text-[18px] leading-[26px] tracking-[-0.09px]" style="color:${SF.muted}">${esc(text(hero.content, "subheadline", "Hi, I'm Sarah, a passionate copywriter with a knack for creating engaging, persuasive content that resonates with your audience."))}</p>
      ${cta(pageHref("contact"), text(hero.content, "ctaPrimary", "Let's Connect!"))}
    </div>
    <div class="relative z-[1] mx-auto mt-8 flex w-full max-w-[570px] flex-col items-center">
      <div class="relative w-full">
        <img src="${A}/arch-1.svg" alt="" width="354" height="120" class="absolute bottom-0 left-1/2 h-[120px] w-[354px] -translate-x-1/2" />
        <img src="${A}/arch-2.svg" alt="" width="234" height="90" class="absolute bottom-0 left-1/2 h-[90px] w-[234px] -translate-x-1/2" />
        <img src="${A}/arch-3.svg" alt="" width="112" height="60" class="absolute bottom-0 left-1/2 h-[60px] w-[112px] -translate-x-1/2" />
        <img src="${esc(hero.image || FALLBACK.hero)}" alt="" width="570" height="570" class="relative z-[1] mx-auto h-[570px] w-[570px] max-w-full object-contain object-bottom drop-shadow-[16px_4px_20px_rgba(0,0,0,0.25)]" />
      </div>
    </div>
  ${sunburstClose()}
  <section class="px-6 py-[60px] sm:px-20" style="${sectionBandCss(about.theme)}">
    <p class="mb-4 inline-flex rounded-[99px] border border-[#eaecf0] bg-[#f5f5f5] px-5 py-3 text-[16px] font-medium tracking-[-0.08px]">${esc(text(about.content, "eyebrow", "ABOUT US"))}</p>
    <h2 class="max-w-[928px] text-[36px] leading-[1.2] tracking-[1.12px] sm:text-[56px]" style="${dFont()}"><span style="color:${SF.gray}">Hi, I'm Sarah</span><span style="color:#262626">${esc(headingRest)}</span></h2>
    <div class="mt-[80px] flex flex-col items-center gap-12 lg:flex-row lg:justify-between">
      <div class="relative h-[360px] w-full max-w-[443px] overflow-visible rounded-[32px] bg-[#f5f5f5]">
        <img src="${esc(about.image || FALLBACK.intro)}" alt="" width="480" height="480" class="absolute left-1/2 top-[-120px] h-[480px] w-[480px] max-w-none -translate-x-1/2 rotate-6 object-contain drop-shadow-[16px_8px_20px_rgba(0,0,0,0.2)]" />
      </div>
      <div class="flex max-w-[650px] flex-col items-start gap-14">
        <p class="whitespace-pre-line text-[18px] leading-[26px] tracking-[-0.09px] opacity-80" style="color:${SF.ink}">${esc(text(about.content, "body", "With a love for storytelling and a keen understanding of audience psychology, I specialize in creating content that not only informs but also inspires action."))}</p>
        ${cta(pageHref("about"), text(about.content, "ctaPrimary", "Read My Story"))}
      </div>
    </div>
  </section>
  <section class="overflow-hidden px-6 pb-20 pt-20 sm:px-20" style="${sectionBandCss(services.theme)}">
    <h2 class="text-[48px] leading-[1.2] tracking-[1.28px] sm:text-[64px]" style="${dFont()};color:#262626">${esc(text(services.content, "heading", "What I Offer"))}</h2>
    <p class="mt-6 max-w-[615px] text-[18px] leading-[26px]" style="color:#404040">${esc(text(services.content, "subheading", "Whether you need persuasive sales copy, engaging blog content, or an entire content strategy, I've got you covered."))}</p>
    <div class="mt-14 flex gap-3 overflow-x-auto pb-2">${cards}</div>
  </section>
  <section class="px-6 py-20 sm:px-20" style="${sectionBandCss(work.theme)}">
    <div class="mx-auto max-w-[615px] text-center">
      <h2 class="text-[48px] leading-[1.2] tracking-[1.28px] sm:text-[64px]" style="${dFont()};color:#262626">${esc(text(work.content, "heading", "Words in Action"))}</h2>
      <p class="mt-6 text-[18px] leading-[26px]" style="color:#404040">${esc(text(work.content, "subheading", "From compelling ad copy to in-depth blog articles, here's a collection of my work that showcases my versatility and creativity."))}</p>
    </div>
    <div class="mt-14 grid gap-3 md:grid-cols-2">${workCards}</div>
  </section>
  ${testimonials(quotes)}
  ${ctaBand(banner)}`;
}

function aboutBody(slots: TemplateSlot[], meta: PageMeta): string {
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const values = slotAt(slots, "features");
  const quotes = slotAt(slots, "testimonials");
  const banner = slotAt(slots, "cta");
  const titles = list(values.content, "itemTitles", ["What drives me", "My philosophy", "Outside the office"]);
  const bodies = list(values.content, "itemBodies", []);
  const heading = text(
    about.content,
    "heading",
    "From a young age, I was fascinated by how words could evoke emotions, paint vivid pictures, and persuade people to take action."
  );
  const rest = heading.replace(/^It all started with a love for storytelling\.?\s*/i, "");
  const cards = titles
    .map(
      (title, i) => `<article class="flex flex-col gap-8 rounded-[24px] bg-white p-8 ${i === 2 ? "md:col-span-2" : ""}">
        <div class="flex justify-between text-[16px]" style="color:${SF.quiet}"><span>ABOUT ME</span><span>INTRODUCTION</span></div>
        <h3 class="text-[32px] font-medium leading-[1.2]">${esc(title)}</h3>
        <p class="text-[18px] leading-[26px]" style="color:#404040">${esc(bodies[i] || "")}</p>
        ${i === 2 ? cta(pageHref("contact"), "Let's Connect!") : ""}
      </article>`
    )
    .join("");
  return `${sunburstOpen(false, `style="${sectionBandCss(hero.theme)}"`)}
    ${header(meta.pages, meta.active, meta.businessName, meta.customLogo)}
    <div class="relative z-[1] mx-auto flex max-w-[630px] flex-col items-center gap-6">
      <span class="inline-flex rounded-[99px] border border-[#eaecf0] bg-[#fafafa] px-5 py-3 text-[16px] font-medium">${esc(text(hero.content, "eyebrow", "ABOUT"))}</span>
      <h1 class="text-[48px] uppercase leading-[1.2] tracking-[-0.36px] sm:text-[72px]" style="${dFont()};color:${SF.limeInk}">${esc(text(hero.content, "headline", "CRAFTING WORDS THAT MAKE AN IMPACT"))}</h1>
      <p class="max-w-[600px] text-[18px] leading-[26px]" style="color:#404040">${esc(text(hero.content, "subheadline", "Transforming ideas into powerful messages that drive results—meet the creative mind behind the words."))}</p>
      ${cta(pageHref("contact"), text(hero.content, "ctaPrimary", "Let's Connect!"))}
    </div>
  ${sunburstClose()}
  <section class="px-6 py-[60px] sm:px-20" style="${sectionBandCss(about.theme)}">
    <p class="mb-4 inline-flex rounded-[99px] border border-[#eaecf0] bg-[#f5f5f5] px-5 py-3 text-[16px] font-medium">${esc(text(about.content, "eyebrow", "INTRODUCTION"))}</p>
    <h2 class="max-w-[1162px] text-[32px] leading-[1.2] tracking-[0.96px] sm:text-[48px]" style="${dFont()}"><span style="color:${SF.gray}">It all started with a love for storytelling. </span><span style="color:#262626">${esc(rest)}</span></h2>
    <div class="mt-[80px] flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
      <img src="${esc(about.image || FALLBACK.about)}" alt="" width="395" height="395" class="h-[395px] w-[395px] max-w-full rounded-[24px] object-cover drop-shadow-[16px_8px_20px_rgba(0,0,0,0.2)]" />
      <p class="max-w-[650px] whitespace-pre-line text-[18px] leading-[26px] opacity-80" style="color:${SF.ink}">${esc(text(about.content, "body", "Over the years, I've worked with a diverse range of clients—from startups to established brands."))}</p>
    </div>
  </section>
  <section class="px-6 py-20 sm:px-20" style="${sectionBandCss(values.theme)}"><div class="grid gap-3 md:grid-cols-2">${cards}</div></section>
  ${testimonials(quotes)}
  ${ctaBand(banner)}`;
}

function servicesBody(slots: TemplateSlot[], meta: PageMeta): string {
  const hero = slotAt(slots, "hero");
  const process = slotAt(slots, "process");
  const banner = slotAt(slots, "cta");
  const titles = list(process.content, "stepTitles", [
    "Discovery & Consultation",
    "Research & Strategy",
    "Content Creation",
    "Review & Feedback",
    "Final Delivery",
  ]);
  const bodies = list(process.content, "stepBodies", []);
  const steps = titles
    .map((title, i) => {
      const flip = i % 2 === 1;
      const src = process.itemImages[i] || FALLBACK.steps[i] || FALLBACK.steps[0];
      return `<article class="flex flex-col items-center gap-10 rounded-[32px] lg:flex-row ${flip ? "lg:flex-row-reverse" : ""}">
        <div class="relative flex size-[min(518px,100%)] items-center justify-center overflow-hidden rounded-[32px] bg-[#c9d69b]">
          <img src="${A}/sunburst.svg" alt="" width="518" height="518" class="pointer-events-none absolute inset-0 size-full rotate-90 object-cover opacity-70" />
          <img src="${esc(src)}" alt="" width="357" height="357" class="relative z-[1] size-[357px] max-w-[80%] object-contain" />
        </div>
        <div class="max-w-[594px] flex-1">
          <span class="inline-flex rounded-[99px] border border-[#eaecf0] bg-[#f5f5f5] px-5 py-3 text-[16px] font-medium">Step 0${i + 1}</span>
          <h3 class="mt-5 text-[32px] font-medium leading-[1.2] sm:text-[40px]" style="${dFont()}">${esc(title)}</h3>
          <p class="mt-5 text-[18px] leading-[26px]" style="color:#404040">${esc(bodies[i] || "")}</p>
        </div>
      </article>`;
    })
    .join("");
  return `${sunburstOpen(false, `style="${sectionBandCss(hero.theme)}"`)}
    ${header(meta.pages, meta.active, meta.businessName, meta.customLogo)}
    <div class="relative z-[1] mx-auto flex max-w-[721px] flex-col items-center gap-6">
      <span class="inline-flex rounded-[99px] border border-[#eaecf0] bg-[#fafafa] px-5 py-3 text-[16px] font-medium">${esc(text(hero.content, "eyebrow", "PROCESS"))}</span>
      <h1 class="text-[48px] uppercase leading-[1.2] sm:text-[72px]" style="${dFont()};color:${SF.limeInk}">${esc(text(hero.content, "headline", "HERE'S HOW WE CREATE WINNING CONTENT"))}</h1>
      <p class="text-[18px] leading-[26px]" style="color:#404040">${esc(text(hero.content, "subheadline", "Every successful project starts with a clear process. Here's how I turn your ideas into impactful content that drives results."))}</p>
    </div>
  ${sunburstClose()}
  <section class="px-6 py-16 sm:px-20" style="${sectionBandCss(process.theme)}">
    <p class="mb-4 inline-flex rounded-[99px] border border-[#eaecf0] bg-[#f5f5f5] px-5 py-3 text-[16px] font-medium">PROCESS</p>
    <h2 class="max-w-[964px] text-[40px] leading-[1.2] sm:text-[56px]" style="${dFont()};color:#262626">${esc(text(process.content, "heading", "A clear path from brief to publish"))}</h2>
    <div class="mt-16 flex flex-col gap-8">${steps}</div>
  </section>
  ${ctaBand(banner)}`;
}

function blogBody(slots: TemplateSlot[], meta: PageMeta): string {
  const hero = slotAt(slots, "hero");
  const posts = slotAt(slots, "features");
  const banner = slotAt(slots, "cta");
  const titles = list(posts.content, "itemTitles", []);
  const cats = list(posts.content, "itemBodies", []);
  const side = titles
    .slice(1, 4)
    .map((title, i) => {
      const src = posts.itemImages[i + 1] || FALLBACK.blog[i + 1];
      return `<a href="${pageHref("blog")}" class="flex gap-5">
        <img src="${esc(src)}" alt="" width="196" height="196" class="size-[196px] shrink-0 rounded-[24px] border-4 border-white object-cover" />
        <div class="flex flex-col gap-3">
          <p class="text-[14px]" style="color:${SF.quiet}">${esc(cats[i + 1] || "CONTENT STRATEGY")}</p>
          <h3 class="text-[20px] font-medium leading-[1.4]">${esc(title)}</h3>
          <p class="text-[16px]" style="color:${SF.quiet}">by Desirae Rosser</p>
          <span class="mt-2 inline-flex w-fit rounded-[32px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-2 text-[14px] font-medium">Read More</span>
        </div>
      </a>`;
    })
    .join("");
  const more = titles
    .slice(4)
    .map((title, i) => {
      const src = posts.itemImages[i + 4] || FALLBACK.blog[i + 4] || FALLBACK.blog[0];
      return `<article class="flex flex-col gap-5">
        <img src="${esc(src)}" alt="" width="312" height="312" class="h-[312px] w-[312px] max-w-full rounded-[24px] border-[6px] border-white object-cover" />
        <p class="text-[14px]" style="color:${SF.quiet}">${esc(cats[i + 4] || "EDUCATION")}</p>
        <h3 class="text-[20px] font-medium leading-[1.4]">${esc(title)}</h3>
        <p class="text-[16px]" style="color:${SF.quiet}">by Desirae Rosser</p>
        <span class="inline-flex w-fit rounded-[32px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-2 text-[14px] font-medium">Read More</span>
      </article>`;
    })
    .join("");
  return `${sunburstOpen(false, `style="${sectionBandCss(hero.theme)}"`)}
    ${header(meta.pages, meta.active, meta.businessName, meta.customLogo)}
    <div class="relative z-[1] mx-auto flex max-w-[944px] flex-col items-center gap-6">
      <span class="inline-flex rounded-[99px] border border-[#eaecf0] bg-[#fafafa] px-5 py-3 text-[16px] font-medium">${esc(text(hero.content, "eyebrow", "BLOG"))}</span>
      <h1 class="text-[40px] uppercase leading-[1.2] sm:text-[72px]" style="${dFont()};color:${SF.limeInk}">${esc(text(hero.content, "headline", "INSIGHTS, IDEAS, AND INSPIRATION—WELCOME TO MY BLOG"))}</h1>
      <p class="max-w-[726px] text-[18px] leading-[26px]" style="color:#404040">${esc(text(hero.content, "subheadline", "Explore the latest trends, tips, and thought-provoking content designed to inspire and empower your creative journey."))}</p>
    </div>
  ${sunburstClose()}
  <section class="px-6 py-16 sm:px-20" style="${sectionBandCss(posts.theme)}">
    <h2 class="text-[40px] leading-[1.2] sm:text-[48px]" style="${dFont()};color:#0f0f0f">${esc(text(posts.content, "heading", "Featured Posts"))}</h2>
    <div class="mt-10 grid gap-8 lg:grid-cols-2">
      <article class="flex flex-col gap-6">
        <div class="overflow-hidden rounded-[24px] border-4 border-white">
          <img src="${esc(posts.itemImages[0] || FALLBACK.blog[0])}" alt="" width="620" height="420" class="h-[420px] w-full object-cover" />
        </div>
        <p class="text-[14px] tracking-[-0.07px]" style="color:${SF.quiet}">${esc(cats[0] || "COPYWRITING")}</p>
        <h3 class="text-[32px] font-medium leading-[1.2]">${esc(titles[0] || "")}</h3>
        <p class="text-[16px]" style="color:${SF.quiet}">by Desirae Rosser</p>
      </article>
      <div class="flex flex-col gap-10">${side}</div>
    </div>
    <div class="mt-20 flex items-center justify-between">
      <h2 class="text-[40px] leading-[1.2] sm:text-[48px]" style="${dFont()};color:#0f0f0f">More Posts</h2>
      <div class="flex gap-5">
        <span class="flex size-12 items-center justify-center rounded-full bg-white p-3"><img src="${A}/arrow-left.svg" alt="" width="24" height="24" class="size-6" /></span>
        <span class="flex size-12 items-center justify-center rounded-full bg-white p-3"><img src="${A}/arrow-right.svg" alt="" width="24" height="24" class="size-6" /></span>
      </div>
    </div>
    <div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">${more}</div>
  </section>
  ${ctaBand(banner)}`;
}

function contactBody(slots: TemplateSlot[], meta: PageMeta): string {
  const hero = slotAt(slots, "hero");
  const form = slotAt(slots, "contact");
  const mail = meta.contactEmail || "hello@sarahfolio.com";
  return `${sunburstOpen(false, `style="${sectionBandCss(hero.theme)}"`)}
    ${header(meta.pages, meta.active, meta.businessName, meta.customLogo)}
    <div class="relative z-[1] mx-auto flex max-w-[720px] flex-col items-center gap-6">
      <span class="inline-flex rounded-[99px] border border-[#eaecf0] bg-[#fafafa] px-5 py-3 text-[16px] font-medium">${esc(text(hero.content, "eyebrow", "CONTACT"))}</span>
      <h1 class="text-[48px] uppercase leading-[1.2] sm:text-[72px]" style="${dFont()};color:${SF.limeInk}">${esc(text(hero.content, "headline", "GET IN TOUCH"))}</h1>
      <p class="text-[18px] leading-[26px]" style="color:#404040">${esc(text(hero.content, "subheadline", "Whether you have a project in mind or just want to say hello, I'm always open to new opportunities and collaborations."))}</p>
    </div>
  ${sunburstClose()}
  <section class="px-6 py-20 sm:px-20" style="${sectionBandCss(form.theme)}">
    <div class="mx-auto grid max-w-[1100px] gap-16 lg:grid-cols-2">
      <div>
        <h2 class="text-[48px] leading-[1.2] sm:text-[64px]" style="${dFont()};color:#262626">${esc(text(form.content, "heading", "Get in touch"))}</h2>
        <p class="mt-6 max-w-[480px] text-[18px] leading-[26px]" style="color:#404040">${esc(text(form.content, "subheading", "Tell me about the story you want to tell. I'll write back soon."))}</p>
        ${meta.contactEmail ? `<p class="mt-6 text-[18px] font-medium">${esc(meta.contactEmail)}</p>` : ""}
      </div>
      <form class="flex flex-col gap-4 rounded-[32px] bg-white p-8" action="mailto:${esc(mail)}" method="post" enctype="text/plain">
        <label class="flex flex-col gap-2 text-[14px] font-medium">First Name<input name="firstName" class="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-3 text-[14px] font-normal" placeholder="First Name" /></label>
        <label class="flex flex-col gap-2 text-[14px] font-medium">Sure Name<input name="sureName" class="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-3 text-[14px] font-normal" placeholder="Sure Name" /></label>
        <label class="flex flex-col gap-2 text-[14px] font-medium">Email<input name="email" type="email" class="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-3 text-[14px] font-normal" placeholder="Email" /></label>
        <button type="submit" class="sf-cta mt-2 inline-flex w-fit items-center rounded-[32px] border-2 border-[#0f0f0f] px-8 py-4 text-[18px] font-semibold drop-shadow-[0px_6px_0px_#0f0f0f]" style="background-color:${SF.brand}">${esc(text(form.content, "ctaPrimary", "Let's Connect!"))}</button>
      </form>
    </div>
  </section>`;
}

type PageMeta = {
  businessName: string;
  customLogo: string;
  pages: { slug: string; title: string }[];
  active: string;
  contactEmail: string;
};

function pageBody(active: string, slots: TemplateSlot[], meta: PageMeta): string {
  switch (active) {
    case "about":
      return aboutBody(slots, meta);
    case "services":
      return servicesBody(slots, meta);
    case "blog":
      return blogBody(slots, meta);
    case "contact":
      return contactBody(slots, meta);
    default:
      return homeBody(slots, meta);
  }
}

function siteFooter(meta: PageMeta, tagline: string): string {
  const services = ["Content Strategy", "Website Copy", "Blog Writing", "Email Marketing"]
    .map((s) => `<li><a href="${pageHref("services")}">${esc(s)}</a></li>`)
    .join("");
  const company = meta.pages
    .filter((p) => p.slug !== "home")
    .map((p) => `<li><a href="${pageHref(p.slug)}">${esc(p.title)}</a></li>`)
    .join("");
  const mail = meta.contactEmail || "hello@sarahfolio.com";
  return `<footer class="px-6 pb-8 pt-20 sm:px-24">
    <div class="flex flex-col gap-10 lg:flex-row lg:justify-between">
      <div class="max-w-[403px]">
        ${logo(meta.businessName, meta.customLogo, SF.ink)}
        <p class="mt-3 text-[16px] leading-6" style="color:#404040">${esc(tagline)}</p>
        <div class="mt-4 flex gap-4">
          <a href="mailto:${esc(mail)}" class="flex size-10 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] p-2" aria-label="LinkedIn"><img src="${A}/social-in.svg" alt="" width="24" height="24" class="size-6" /></a>
          <a href="mailto:${esc(mail)}" class="flex size-10 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] p-2" aria-label="Instagram"><img src="${A}/social-ig.svg" alt="" width="24" height="24" class="size-6" /></a>
          <a href="mailto:${esc(mail)}" class="flex size-10 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] p-2" aria-label="X"><img src="${A}/social-x.svg" alt="" width="24" height="24" class="size-6" /></a>
        </div>
      </div>
      <div class="flex flex-wrap gap-16">
        <div><p class="mb-4 text-[16px] font-medium">Service</p><ul class="flex flex-col gap-4 text-[16px]" style="color:${SF.quiet}">${services}</ul></div>
        <div><p class="mb-4 text-[16px] font-medium">Company</p><ul class="flex flex-col gap-4 text-[16px]" style="color:${SF.quiet}">${company}</ul></div>
        <div>
          <p class="mb-3 text-[16px]">Newsletter</p>
          <form class="flex gap-1" action="mailto:${esc(mail)}" method="post">
            <input name="email" type="email" placeholder="Email..." class="w-[240px] rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-3 text-[14px]" />
            <button type="submit" class="sf-cta rounded-[32px] border-2 border-[#0f0f0f] px-4 py-2 text-[14px] font-medium drop-shadow-[0px_4px_0px_#0f0f0f]" style="background-color:${SF.brand}">Send</button>
          </form>
        </div>
      </div>
    </div>
    <div class="mt-8 flex flex-wrap items-center justify-between gap-3 text-[14px] leading-[22px]" style="color:${SF.muted}">
      <p>Made with love😍</p>
      <div class="flex gap-3"><span>Terms of use</span><span>Privacy policy</span></div>
    </div>
  </footer>`;
}

/** Renders one Sarahfolio page to a complete static HTML document. */
export function renderSarahfolioPage(site: AssembledSite, pageSlug?: string): string {
  const pages = pageSlugsOf(null, site);
  const active =
    (pageSlug && pages.find((p) => p.slug === pageSlug)?.slug) ||
    pages.find((p) => p.slug === "home")?.slug ||
    pages[0]?.slug ||
    "home";
  const slots = toSlots(null, site, active);
  const footerSlot = slotAt(slots, "footer");
  const businessName = text(footerSlot.content, "businessName") || site.businessName || "Sarah";
  const customLogo = site.theme?.logoUrl?.trim() || "";
  const tagline = text(
    footerSlot.content,
    "tagline",
    "Passionate copywriter with a knack for creating engaging, persuasive content that resonates with your audience."
  );
  const contactEmail = site.contact?.email?.trim() || "";
  const activeTitle = pages.find((p) => p.slug === active)?.title || "Home";
  const meta: PageMeta = { businessName, customLogo, pages, active, contactEmail };

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
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --sf-display: Anton, ui-sans-serif, system-ui, sans-serif; --sf-body: Inter, ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#FFBF38")} ${themeFontCss(site.theme, ["--sf-display","--sf-body"])} }
    html { scroll-behavior: smooth; }
    body { font-family: var(--sf-body), Inter, ui-sans-serif, system-ui, sans-serif; color: ${SF.ink}; background: ${SF.bg}; -webkit-font-smoothing: antialiased; }
    .sf-menu > summary { list-style: none; }
    .sf-menu > summary::-webkit-details-marker { display: none; }
    .sf-cta:active { transform: scale(0.97); }
    @media (prefers-reduced-motion: reduce) { .sf-cta:active { transform: none; } }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body>
<main>
${pageBody(active, slots, meta)}
</main>
${siteFooter(meta, tagline)}
</body>
</html>`;
}
