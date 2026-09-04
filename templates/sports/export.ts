import { SP } from "./tokens";
import { iconSvg } from "@/lib/icons/registry";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandCss } from "../shared/brand";
import { themeFontBodyCss, themeFontCss, themeFontHref } from "../shared/fonts";
import type { AssembledSite } from "@/lib/blueprint/types";

// Static HTML twin of templates/sports/site.tsx. Exported and deployed sites
// must look like the design the customer chose, so the Athlo layout is mirrored
// here rather than falling back to the generic section renderer. Both read the
// same locked slots through the same helpers.

function esc(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const HERO_FALLBACK = "/templates/sports/hero.jpg";
const ABOUT_FALLBACK = "/templates/sports/about.jpg";
const EVENT_FALLBACK = "/templates/sports/event.jpg";
const PRICING_BG = "/templates/sports/pricing-bg.jpg";
const FOOTER_CARD = "/templates/sports/footer-card.jpg";
const LOGO = "/templates/sports/logo.svg";

const FEATURE_FALLBACKS = [
  "/templates/sports/feature-1.jpg",
  "/templates/sports/session.jpg",
  "/templates/sports/shirt-bg.jpg",
];
const CATEGORY_FALLBACKS = [
  "/templates/sports/category-1.jpg",
  "/templates/sports/category-2.jpg",
  "/templates/sports/category-3.jpg",
  "/templates/sports/category-4.jpg",
];
const AVATARS = [
  "/templates/sports/avatar-1.jpg",
  "/templates/sports/avatar-2.jpg",
  "/templates/sports/avatar-3.jpg",
  "/templates/sports/avatar-4.jpg",
  "/templates/sports/avatar-5.jpg",
  "/templates/sports/avatar-6.jpg",
  "/templates/sports/avatar-7.jpg",
  "/templates/sports/avatar-8.jpg",
];
const PARTNERS = [
  "/templates/sports/partner-1.svg",
  "/templates/sports/partner-2.svg",
  "/templates/sports/partner-3.svg",
  "/templates/sports/partner-4.svg",
  "/templates/sports/partner-5.svg",
  "/templates/sports/partner-6.svg",
  "/templates/sports/partner-7.svg",
  "/templates/sports/partner-8.svg",
  "/templates/sports/partner-9.svg",
];
const ABOUT_ICONS = [
  "/templates/sports/about-icon-1.svg",
  "/templates/sports/about-icon-2.svg",
  "/templates/sports/about-icon-3.svg",
];
// The design draws no symbol on the feature cards themselves, so the feature
// items' icons are what these About rows show. Stroke weight and box match the
// baked SVGs above (1.94 on a 27.75 grid ≈ 1.7 on lucide's 24 grid).
const ABOUT_ICON_STROKE = 1.7;
const ABOUT_BENEFITS = [
  { title: "Goal-based program", desc: "Pick a clear objective — strength, endurance, weight loss — and we build a plan around it." },
  { title: "Adaptive progression", desc: "Your program evolves as you do. We adjust volume, intensity, and drills to your performance." },
  { title: "Performance tracking", desc: "Track your sessions, streaks, and improvements over time so you always know where you stand." },
];
const NAV = [
  { label: "About us", href: "#sp-about" },
  { label: "Features", href: "#sp-features" },
  { label: "Categories", href: "#sp-categories" },
  { label: "Pricing", href: "#sp-pricing" },
  { label: "Testimonials", href: "#sp-testimonials" },
];

function arrow(cls: string, stroke: string): string {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"></path></svg>`;
}
function plus(cls: string, stroke: string): string {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>`;
}
function check(cls: string, stroke: string): string {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"></path></svg>`;
}
function sectionHeader(label: string, light = false, index?: number): string {
  const border = light ? "rgba(255,255,255,0.9)" : SP.line;
  const ink = light ? SP.white : SP.ink;
  const line = light ? "rgba(255,255,255,0.4)" : SP.line;
  const text0 = index ? `#${index} ${label}` : label;
  return `<div class="flex w-full items-center gap-3">
    <div class="flex h-[3.5rem] shrink-0 items-center justify-center rounded-[28px] border-2 px-8" style="border-color:${border}">
      <span class="whitespace-nowrap text-[15px] font-medium" style="color:${ink}">${esc(text0)}</span>
    </div>
    <div class="flex flex-1 items-center">
      <span class="size-[6px] shrink-0" style="background:${ink}"></span>
      <span class="h-[2px] flex-1" style="background:${line}"></span>
      <span class="size-[6px] shrink-0" style="background:${ink}"></span>
    </div>
  </div>`;
}

export function renderSportsPage(site: AssembledSite): string {
  const slots = toSlots(null, site);

  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const features = slotAt(slots, "features");
  const categories = slotAt(slots, "services");
  const pricing = slotAt(slots, "pricing");
  const testimonials = slotAt(slots, "testimonials");
  const faq = slotAt(slots, "faq");
  const event = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");

  const businessName = text(footer.content, "businessName") || site.businessName || "Athlo";
  const customLogo = site.theme.logoUrl?.trim() || "";

  const heroImage = hero.image || HERO_FALLBACK;
  const aboutImage = about.image || ABOUT_FALLBACK;
  const eventImage = event.image || EVENT_FALLBACK;

  const featureTitles = list(features.content, "itemTitles", [
    "Over 10 years of coaching experience",
    "Solo & group sessions available",
    "Achieve your goals, faster",
  ]);
  const featureBodies = list(features.content, "itemBodies");
  const featureImages = features.itemImages;
  const fImg = (i: number) => featureImages[i] || FEATURE_FALLBACKS[i % FEATURE_FALLBACKS.length];

  const catTitles = list(categories.content, "itemTitles", [
    "Solo Sport — Cycling",
    "Group Sport — Basketball",
    "Duo Sport — Tennis",
    "Squad Sport — Padel",
  ]);
  const catBodies = list(categories.content, "itemBodies");
  const catImages = categories.itemImages;
  const cImg = (i: number) => catImages[i] || CATEGORY_FALLBACKS[i % CATEGORY_FALLBACKS.length];
  const catPrice = (i: number): string | null => {
    const m = (catBodies[i] || "").match(/\$\s?[\d.,]+/);
    return m ? m[0].replace(/\s+/, "") : null;
  };

  const planNames = list(pricing.content, "planNames", ["Starter Plan", "Active Balance", "Inner Mastery"]);
  const planPrices = list(pricing.content, "planPrices", ["$25", "$49", "$89"]);
  const planFeatures = list(pricing.content, "planFeatures");
  const popularIndex = planNames.length > 2 ? 1 : planNames.length - 1;

  const quotes = list(testimonials.content, "quotes");
  const authors = list(testimonials.content, "authors");
  const roles = list(testimonials.content, "roles");
  const testimonialCols: number[][] = [[], [], [], []];
  quotes.forEach((_, i) => testimonialCols[i % 4].push(i));

  const questions = list(faq.content, "questions");
  const answers = list(faq.content, "answers");

  const footerLinks = list(footer.content, "linkLabels", NAV.map((n) => n.label));

  const contactEmail = site.contact?.email?.trim() || "";
  const contactPhone = site.contact?.phone?.trim() || "";
  const contactHref = contactEmail ? `mailto:${esc(contactEmail)}` : "#sp-pricing";

  const logoMark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" class="h-9 w-9 rounded-lg object-contain" />`
    : `<img src="${LOGO}" alt="" class="h-7 w-7 -rotate-90 object-contain" />`;

  const body = `
<section class="relative w-full min-h-[92vh] overflow-hidden">
  <div class="absolute inset-0 overflow-hidden">
    <img src="${esc(heroImage)}" alt="" data-parallax="0.12" class="h-[112%] w-full object-cover object-center" />
    <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70"></div>
  </div>
  <div class="relative z-10 mx-auto flex min-h-[92vh] max-w-[90rem] flex-col justify-between px-4 py-6 lg:px-10 lg:py-8">
    <div class="flex items-center justify-between gap-4">
      <nav class="hidden items-center gap-1 lg:flex">
        ${NAV.map((item) => `<a href="${item.href}" class="rounded-xl px-3 py-2 text-sm font-medium text-white/90 backdrop-blur-[4px] transition-colors hover:bg-white/15">${esc(item.label)}</a>`).join("\n        ")}
      </nav>
      <a href="#sp-top" class="flex items-center gap-3">
        ${logoMark}
        <span class="text-[2.4rem] leading-none text-white" style="font-family:var(--sp-wordmark)">${esc(businessName)}</span>
      </a>
      <a href="${contactHref}" class="flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-medium" style="background:${SP.brand};color:${SP.ink}">Contact us ${arrow("h-3.5 w-3.5", SP.ink)}</a>
    </div>
    <div class="flex flex-col gap-6 pb-6">
      <div class="flex items-center gap-3">
        <div class="flex items-center">
          ${AVATARS.slice(0, 4).map((src, i) => `<img src="${src}" alt="" class="h-9 w-9 rounded-full border-2 border-white object-cover ${i > 0 ? "-ml-3" : ""}" />`).join("")}
        </div>
        <div>
          <div class="text-sm font-medium uppercase tracking-wide text-white">${esc(text(hero.content, "eyebrow", "12k+ memberships"))}</div>
          <div class="text-xs text-white/60">Enjoy our facilities with ${esc(businessName)}</div>
        </div>
      </div>
      <h1 class="max-w-[16ch] font-semibold uppercase leading-[0.95] tracking-[-0.5px] text-white text-[clamp(2.5rem,10vw,5.5rem)]" style="font-family:var(--sp-display)">${esc(text(hero.content, "headline", "Where athletes are made"))}</h1>
      <p class="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">${esc(text(hero.content, "subheadline", "Structured programs, expert coaches, and a community that makes it easier to stay consistent."))}</p>
      <div class="flex flex-wrap items-center gap-3">
        <a href="#sp-pricing" class="flex items-center gap-3 rounded-[14px] px-6 py-3.5 text-sm font-medium" style="background:${SP.brand};color:${SP.ink}">${esc(text(hero.content, "ctaPrimary", "Join Athlo"))} ${arrow("h-3.5 w-3.5", SP.ink)}</a>
        <a href="#sp-categories" class="rounded-[14px] border border-white bg-white/15 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/25">Explore memberships</a>
      </div>
      <div class="mt-2 flex flex-wrap items-center gap-x-10 gap-y-4">
        <div><div class="text-xl font-medium text-white">324+</div><div class="text-sm text-white/80">Partners companies</div></div>
        <div><div class="text-xl font-medium text-white">30+</div><div class="text-sm text-white/80">Certified coaches</div></div>
      </div>
    </div>
  </div>
</section>

<section class="border-y" style="border-color:${SP.line}">
  <div class="mx-auto flex max-w-[80rem] flex-wrap items-center justify-center gap-x-12 gap-y-6 px-6 py-10">
    ${PARTNERS.map((src) => `<img src="${src}" alt="" class="h-8 w-auto object-contain opacity-60 transition-opacity hover:opacity-100" />`).join("\n    ")}
  </div>
</section>

<section id="sp-about" class="mx-auto max-w-[90rem] px-4 py-16 lg:px-[3.75rem] lg:py-24">
  ${sectionHeader("About us", false, 2)}
  <div class="mt-10 flex flex-col items-start gap-12 lg:flex-row">
    <div class="flex flex-1 flex-col gap-8">
      <h2 class="font-semibold uppercase leading-[0.95] tracking-[-0.6px] text-[clamp(2rem,5vw,3.75rem)]" style="font-family:var(--sp-display)">${esc(text(about.content, "heading", "Personalized training for every athlete"))}</h2>
      <p class="text-lg leading-relaxed lg:text-xl" style="color:${SP.body}">${esc(text(about.content, "body", "We're a team of coaches and sport enthusiasts focused on one thing: helping you train better."))}</p>
      <div class="flex flex-col gap-3">
        ${ABOUT_BENEFITS.map((b, i) => `<div class="flex items-center gap-4 rounded-xl p-3" style="background:${SP.surface}">
          <span class="grid size-[4.8rem] shrink-0 place-items-center rounded-[18px] bg-white">${
            iconSvg(features.icons[i], {
              size: 32,
              color: SP.ink,
              strokeWidth: ABOUT_ICON_STROKE,
              className: "size-8",
            }) || `<img src="${ABOUT_ICONS[i % ABOUT_ICONS.length]}" alt="" class="size-8 object-contain" />`
          }</span>
          <div><div class="font-semibold uppercase" style="color:${SP.ink}">${esc(b.title)}</div><div class="text-sm leading-relaxed" style="color:${SP.body}">${esc(b.desc)}</div></div>
        </div>`).join("\n        ")}
      </div>
    </div>
    <div class="relative w-full flex-1 lg:min-h-[600px]">
      <div class="relative h-[26rem] w-full overflow-hidden rounded-[24px] lg:h-full lg:min-h-[26rem]">
        <img src="${esc(aboutImage)}" alt="" data-parallax="0.06" class="absolute inset-0 h-[112%] w-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/55"></div>
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><span class="rounded-full px-4 py-2 text-sm" style="background:${SP.brand};color:${SP.ink}">Sport Center</span></div>
        <div class="absolute inset-x-0 bottom-8 px-6 text-center"><div class="font-semibold uppercase leading-none tracking-[-0.4px] text-white text-[clamp(1.75rem,4vw,3rem)]" style="font-family:var(--sp-display)">Mind power<br />sport strength</div></div>
      </div>
    </div>
  </div>
</section>

<section id="sp-features" class="px-4 py-16 lg:px-[3.75rem] lg:py-24" style="background:${SP.surface}">
  <div class="mx-auto max-w-[90rem]">
    ${sectionHeader("Features", false, 4)}
    <div class="mt-10 flex flex-col items-start justify-between gap-6 lg:flex-row">
      <h2 class="flex-1 font-semibold uppercase leading-[0.95] tracking-[-0.6px] text-[clamp(1.75rem,4.5vw,3.75rem)]" style="font-family:var(--sp-display)">${esc(text(features.content, "heading", "Smarter training, better results"))}</h2>
      <p class="max-w-[32rem] flex-1 text-lg leading-relaxed lg:text-xl" style="color:${SP.body}">${esc(text(features.content, "subheading", "Athlo combines expert coaching with clear structure and smart tools."))}</p>
    </div>
    <div class="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
      ${featureTitles.map((title, i) => `<article class="relative h-[27rem] overflow-hidden rounded-[17px]">
        <img src="${esc(fImg(i))}" alt="" class="absolute inset-0 h-full w-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80"></div>
        <div class="absolute inset-x-0 bottom-0 p-6">
          <span class="mb-3 inline-block size-2.5 rounded-full" style="background:${SP.brand}"></span>
          <h3 class="font-semibold uppercase leading-none tracking-[-0.36px] text-white text-[1.75rem] lg:text-[2rem]" style="font-family:var(--sp-display)">${esc(title)}</h3>
          <p class="mt-2 text-sm leading-relaxed text-white/85">${esc(featureBodies[i] || "Purpose-built coaching that keeps every session moving you forward.")}</p>
        </div>
      </article>`).join("\n      ")}
    </div>
  </div>
</section>

<section id="sp-categories" class="mx-auto max-w-[90rem] px-4 py-16 lg:px-[3.75rem] lg:py-24">
  ${sectionHeader("Categories", false, 5)}
  <div class="mx-auto mt-10 max-w-3xl text-center">
    <h2 class="font-semibold uppercase leading-none tracking-[-0.6px] text-[clamp(1.75rem,5vw,3.75rem)]" style="font-family:var(--sp-display)">${esc(text(categories.content, "heading", "Everything you need, nothing you don't"))}</h2>
    <p class="mx-auto mt-4 max-w-[47rem] text-lg leading-relaxed lg:text-xl" style="color:${SP.muted}">${esc(text(categories.content, "subheading", "A supportive community where passion, movement, and discipline come together."))}</p>
  </div>
  <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    ${catTitles.map((title, i) => {
      const price = catPrice(i);
      const overlay = price
        ? `<div class="mt-2"><div class="font-semibold leading-none text-white text-[2.8rem]" style="font-family:var(--sp-display)">${esc(price)}</div><div class="mt-1 text-base text-white/85">Starting from</div></div>`
        : (catBodies[i] ? `<div class="mt-1 text-sm text-white/80">${esc(catBodies[i])}</div>` : "");
      return `<div class="relative h-[31rem] overflow-hidden rounded-[22px]">
      <img src="${esc(cImg(i))}" alt="${esc(title)}" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>
      <div class="absolute inset-x-0 bottom-7 px-6"><div class="text-base font-medium text-white">${esc(title)}</div>${overlay}</div>
    </div>`;
    }).join("\n    ")}
  </div>
</section>

<section id="sp-pricing" class="relative isolate overflow-hidden">
  <div class="absolute inset-0 overflow-hidden">
    <img src="${PRICING_BG}" alt="" class="h-full w-full object-cover opacity-60" />
    <div class="absolute inset-0" style="background:rgba(14,18,27,0.86)"></div>
  </div>
  <div class="relative z-10 mx-auto max-w-[90rem] px-4 py-16 lg:px-[3.75rem] lg:py-24">
    ${sectionHeader("Pricing", true, 6)}
    <div class="mt-12 flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
      <div class="flex-1">
        <h2 class="font-semibold uppercase leading-[1.05] tracking-[-1px] text-white text-[clamp(2.5rem,6vw,5rem)]" style="font-family:var(--sp-display)">${esc(text(pricing.content, "heading", "Flexible pricing"))}</h2>
        <p class="mt-5 max-w-[26rem] text-lg leading-relaxed text-white/85 lg:text-xl">${esc(text(pricing.content, "subheading", "Built to give every athlete access to expert coaching and structured training."))}</p>
        <div class="mt-9 flex flex-col gap-3 rounded-[24px] bg-black/50 p-3 backdrop-blur-md">
          ${planNames.map((name, i) => {
            const active = i === popularIndex;
            const first = (planFeatures[i] || "").split("\n")[0] || "Flexible membership";
            return `<div class="flex items-center justify-between gap-4 rounded-xl p-5" style="background:${active ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.14)"}">
            <div><div class="text-xl font-semibold uppercase leading-none tracking-[-0.24px]" style="font-family:var(--sp-display);color:${active ? SP.white : "#cacfd8"}">${esc(name)}</div><div class="mt-1 text-sm" style="color:${active ? SP.line : "#cacfd8"}">${esc(first)}</div></div>
            ${arrow("h-5 w-5 shrink-0", active ? SP.white : "#cacfd8")}
          </div>`;
          }).join("\n          ")}
        </div>
      </div>
      ${(() => {
        const i = popularIndex;
        const featureLines = (planFeatures[i] || "").split("\n").map((f) => f.trim()).filter(Boolean);
        const items = featureLines.map((line) => `<li class="flex items-start gap-3">${check("mt-1 h-4 w-4 shrink-0", SP.ink)}<span class="leading-snug" style="color:${SP.ink}">${esc(line)}</span></li>`).join("\n            ");
        return `<div class="w-full shrink-0 lg:w-[34rem]">
        <div class="flex flex-col rounded-[32px] bg-white p-8 lg:p-9">
          <div class="flex items-start justify-between gap-4">
            <div><div class="text-3xl font-semibold uppercase leading-none tracking-[-0.36px]" style="font-family:var(--sp-display);color:${SP.ink}">${esc(planNames[i])}</div><div class="mt-2 text-base font-medium" style="color:${SP.body}">${esc((planFeatures[i] || "").split("\n")[0] || "Our most popular plan")}</div></div>
            <span class="grid size-16 shrink-0 place-items-center rounded-[20px]" style="background:${SP.surface}">${arrow("h-6 w-6", SP.ink)}</span>
          </div>
          <div class="mt-6 flex items-end gap-2"><span class="text-[3.75rem] font-semibold leading-none tracking-[-0.6px]" style="font-family:var(--sp-display);color:${SP.ink}">${esc(planPrices[i] || "$0")}</span><span class="pb-1.5 text-lg font-medium" style="color:${SP.body}">/ month</span></div>
          <div class="my-7 flex items-center gap-2"><span class="size-2 rounded-sm" style="background:${SP.ink}"></span><span class="h-[2px] flex-1" style="background:${SP.line}"></span><span class="size-2 rounded-sm" style="background:${SP.ink}"></span></div>
          <ul class="flex flex-col gap-4">${items}</ul>
          <a href="${contactHref}" class="mt-8 flex items-center justify-center gap-3 rounded-[20px] py-4 text-base font-medium" style="background:${SP.brand};color:${SP.ink}">Get started ${arrow("h-4 w-4", SP.ink)}</a>
        </div>
      </div>`;
      })()}
    </div>
  </div>
</section>

<section id="sp-testimonials" class="mx-auto max-w-[90rem] px-4 py-16 lg:px-[3.75rem] lg:py-20">
  ${sectionHeader("Testimonials", false, 7)}
  <div class="mt-10 flex flex-col items-center gap-5 text-center">
    <div class="flex items-center -space-x-3">${AVATARS.slice(0, 5).map((src) => `<img src="${src}" alt="" class="size-12 rounded-full border-2 border-white object-cover" />`).join("")}</div>
    <h2 class="max-w-[42rem] font-semibold uppercase leading-none tracking-[-0.6px] text-[clamp(1.75rem,5vw,3.75rem)]" style="font-family:var(--sp-display)">${esc(text(testimonials.content, "heading", "Here's why athletes trust us"))}</h2>
    <p class="max-w-[47rem] text-lg leading-relaxed lg:text-xl" style="color:${SP.muted}">A supportive community where passion, movement, and discipline come together to inspire lasting change.</p>
  </div>
  <div class="relative mt-12">
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      ${testimonialCols.map((col, c) => `<div class="flex flex-col gap-5 ${c % 2 === 1 ? "lg:-mt-10" : ""}">
        ${col.map((i) => `<figure class="flex flex-col justify-between gap-6 rounded-xl p-6" style="background:${SP.surface}">
          <blockquote class="text-[0.95rem] leading-relaxed" style="color:${SP.body}">&ldquo;${esc(quotes[i])}&rdquo;</blockquote>
          <figcaption class="flex items-center gap-3"><img src="${AVATARS[i % AVATARS.length]}" alt="" class="size-10 rounded-full object-cover" /><div><div class="text-sm font-medium" style="color:${SP.ink}">${esc(authors[i] || "Athlo member")}</div>${roles[i] ? `<div class="text-[0.8rem]" style="color:${SP.muted}">${esc(roles[i])}</div>` : ""}</div></figcaption>
        </figure>`).join("\n        ")}
      </div>`).join("\n      ")}
    </div>
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent"></div>
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
  </div>
</section>

<section id="sp-faq" class="mx-auto max-w-[90rem] px-4 py-16 lg:px-[3.75rem] lg:py-20">
  ${sectionHeader("FAQ", false, 8)}
  <div class="mt-10 flex flex-col items-start gap-12 lg:flex-row">
    <div class="flex flex-col gap-5 lg:w-[38rem]">
      <h2 class="font-semibold uppercase leading-none tracking-[-0.6px] text-[clamp(1.75rem,4.5vw,3.75rem)]" style="font-family:var(--sp-display)">${esc(text(faq.content, "heading", "Your questions, answered"))}</h2>
      <p class="text-lg leading-relaxed lg:text-xl" style="color:${SP.muted}">Get quick answers to the most common questions about our programs, memberships and facilities.</p>
      <a href="${contactHref}" class="inline-flex h-14 items-center rounded-[18px] border bg-white px-5 text-base font-medium" style="border-color:${SP.line};color:${SP.body}">Contact us</a>
    </div>
    <div class="w-full flex-1 rounded-[24px] p-4" style="background:${SP.surface}">
      <div class="flex flex-col gap-3">
        ${questions.map((question, i) => `<details ${i === 0 ? "open" : ""} class="group overflow-hidden rounded-xl bg-white">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left"><span class="text-base font-semibold lg:text-lg" style="color:${SP.ink}">${esc(question)}</span><span class="grid size-6 shrink-0 place-items-center transition-transform group-open:rotate-45">${plus("h-5 w-5", SP.ink)}</span></summary>
          <p class="px-5 pb-5 text-[0.95rem] leading-relaxed" style="color:${SP.body}">${esc(answers[i] || "Reach out to our team any time — we'll give you a direct answer within 24 hours.")}</p>
        </details>`).join("\n        ")}
      </div>
    </div>
  </div>
</section>

<section id="sp-event" class="mx-auto max-w-[90rem] px-4 pb-16 lg:px-[3.75rem] lg:pb-20">
  <div class="relative overflow-hidden rounded-[24px]">
    <img src="${esc(eventImage)}" alt="" data-parallax="0.08" class="h-[38rem] w-full object-cover lg:h-[44rem]" />
    <div class="absolute inset-0 bg-black/50"></div>
    <div class="absolute inset-x-6 bottom-6 lg:inset-x-8 lg:bottom-8 lg:right-auto lg:w-[32rem]">
      <div class="flex flex-col gap-6 rounded-[20px] bg-white p-6 lg:p-8">
        <span class="w-fit rounded-full px-4 py-2 text-sm font-medium" style="background:${SP.surface};color:${SP.ink}">${esc(businessName)} Event</span>
        <div class="font-semibold uppercase leading-[1.05] tracking-[-0.4px] text-[clamp(2rem,4vw,2.8rem)]" style="font-family:var(--sp-display);color:${SP.ink}">${esc(text(event.content, "headline", "Ultimate padel adventure"))}</div>
        <div><div class="text-base lg:text-lg" style="color:${SP.ink}">March 19, 2025</div><div class="mt-1 text-base font-semibold lg:text-lg" style="color:${SP.ink}">123 Padel Player, Adventure City</div></div>
        <p class="text-base leading-relaxed lg:text-lg" style="color:${SP.body}">${esc(text(event.content, "subheadline", "Join us for an exhilarating one-day padel tournament — compete, connect, and push your limits."))}</p>
        <a href="${contactHref}" class="flex h-14 items-center justify-center gap-3 rounded-[18px] text-base font-medium" style="background:${SP.brand};color:${SP.ink}">${esc(text(event.content, "ctaPrimary", "Register now"))} ${arrow("h-4 w-4", SP.ink)}</a>
      </div>
    </div>
    <div class="absolute bottom-8 right-8 hidden items-center gap-3 lg:flex">
      <div class="flex -space-x-3">${AVATARS.slice(0, 4).map((src) => `<img src="${src}" alt="" class="size-12 rounded-full border-2 border-white object-cover" />`).join("")}</div>
      <div><div class="text-xl font-medium tracking-[-0.4px] text-white">4.9 / 5 Rated</div><div class="text-lg text-white/80">Over 9.2k members</div></div>
    </div>
  </div>
</section>

<footer class="bg-white px-4 pb-6 pt-16 lg:px-[3.75rem] lg:pt-24">
  <div class="mx-auto max-w-[82.5rem]">
    <div class="flex flex-col items-start gap-10 lg:flex-row lg:gap-24">
      <div class="flex flex-col items-start gap-8 lg:flex-row">
        <div class="relative h-[13rem] w-full overflow-hidden rounded-[24px] lg:h-[17rem] lg:w-[14rem]">
          <img src="${FOOTER_CARD}" alt="" class="absolute inset-0 h-full w-full object-cover" />
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="absolute inset-0 flex flex-col items-center justify-end p-4">
            <div class="mb-2 flex items-center gap-1.5"><span class="size-2.5 rounded-full" style="background:${SP.brand}"></span><span class="text-xs font-medium text-white">Full game</span></div>
            <div class="text-center font-semibold uppercase leading-none tracking-[-0.36px] text-white text-[2rem]" style="font-family:var(--sp-display)">Explore<br />more</div>
          </div>
        </div>
        <h2 class="max-w-[38rem] font-semibold uppercase leading-none tracking-[-0.6px] text-[clamp(1.75rem,4vw,3.75rem)]" style="font-family:var(--sp-display)"><span style="color:#cacfd8">${esc(text(footer.content, "tagline", "We're doing everything"))}</span> <span style="color:${SP.ink}">for your future health.</span></h2>
      </div>
      <div class="flex shrink-0 gap-12">
        <div class="flex flex-col gap-4"><div class="text-lg font-semibold" style="color:${SP.ink}">Menu</div>${footerLinks.map((label) => `<span class="text-base font-medium" style="color:${SP.body}">${esc(label)}</span>`).join("")}</div>
        <div class="flex flex-col gap-4"><div class="text-lg font-semibold" style="color:${SP.ink}">Social media</div>${["Instagram", "Twitter (X)", "YouTube", "Facebook"].map((label) => `<span class="text-base font-medium" style="color:${SP.body}">${esc(label)}</span>`).join("")}</div>
      </div>
    </div>
    <div class="mt-16 flex flex-col items-start justify-between gap-3 text-base font-medium lg:flex-row lg:items-center" style="color:${SP.body}">
      <div>San Francisco — California &middot; Paris — France</div>
      <div class="flex flex-col gap-2 lg:flex-row lg:gap-10">${contactEmail ? `<span>${esc(contactEmail)}</span>` : ""}${contactPhone ? `<span>${esc(contactPhone)}</span>` : ""}<span>&copy; ${new Date().getFullYear()} ${esc(businessName)}. All rights reserved.</span></div>
    </div>
    <div class="mt-8 flex items-center gap-2"><span class="size-[6px]" style="background:${SP.ink}"></span><span class="h-[2px] flex-1" style="background:${SP.line}"></span><span class="size-[6px]" style="background:${SP.ink}"></span></div>
    <div class="mt-5 flex items-center justify-between text-base font-medium" style="color:${SP.body}"><span>Privacy Policy</span><span>Terms &amp; conditions</span></div>
    <div class="relative mt-10">
      <div class="w-full leading-none text-[clamp(5rem,15vw,18.75rem)]" style="font-family:var(--sp-wordmark);color:${SP.ink}">${esc(businessName)}</div>
      <div class="absolute right-4 top-1/2 grid size-24 -translate-y-1/2 place-items-center rounded-full lg:right-[10%] lg:size-[7.5rem]" style="background:${SP.brand}"><img src="${LOGO}" alt="" class="w-9 -rotate-90 object-contain lg:w-11" /></div>
    </div>
    <div class="mt-4 flex items-center justify-between pb-4">
      <span class="rounded-full px-4 py-1.5 text-sm font-medium" style="background:${SP.surface};color:${SP.ink}">Refund Policy</span>
      <a href="#sp-top" class="flex items-center gap-2 text-base font-medium" style="color:${SP.ink}"><span class="grid size-[1.3rem] place-items-center rounded-[10px]" style="background:${SP.ink}">${arrow("h-2.5 w-2.5 -rotate-90", SP.white)}</span>Back to the top</a>
    </div>
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
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
  <link href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@300,400,500,600,700&display=swap" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --sp-display: 'Clash Grotesk', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; --sp-wordmark: 'Bebas Neue', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#ffc857")} ${themeFontCss(site.theme, ["--sp-display","--sp-wordmark"])} }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Clash Grotesk', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
      color: ${SP.ink};
      background: ${SP.white};
      -webkit-font-smoothing: antialiased;
    }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body id="sp-top">
${body}
</body>
</html>`;
}
