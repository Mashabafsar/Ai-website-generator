import { SL, SL_FEATURE_COLORS, SL_ICON_PATHS } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandCss } from "../shared/brand";
import { themeFontBodyCss, themeFontCss, themeFontHref } from "../shared/fonts";
import { iconSvg } from "@/lib/icons/registry";
import type { AssembledSite } from "@/lib/blueprint/types";

// Static HTML twin of templates/saasldg/site.tsx. Exported and deployed sites
// must look like the design the customer chose, so the Stratus layout is
// mirrored here rather than falling back to the generic section renderer. Both
// read the same locked slots through the same helpers.

function esc(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const HERO_FALLBACK = "/templates/saasldg/hero.jpg";
const AVATARS = [
  "/templates/saasldg/avatar-1.png",
  "/templates/saasldg/avatar-2.png",
  "/templates/saasldg/avatar-3.png",
];

const NAV = [
  { label: "Features", href: "#sl-features" },
  { label: "Pricing", href: "#sl-pricing" },
  { label: "FAQ", href: "#sl-faq" },
  { label: "Reviews", href: "#sl-reviews" },
];

const CLIENTS = ["Northwind", "Lumina", "Vertex", "Cascade", "Monarch", "Aerolab"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function eyebrow(label: string): string {
  return `<span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]" style="background:${SL.brandSoft};color:${SL.brandDeep};font-family:var(--sl-display)">${esc(label)}</span>`;
}

function featureIcon(index: number, icon?: string): string {
  const color = SL_FEATURE_COLORS[index % SL_FEATURE_COLORS.length];
  const path = SL_ICON_PATHS[index % SL_ICON_PATHS.length];
  const glyph =
    iconSvg(icon, { size: 28, color: SL.ink, strokeWidth: 1.7, className: "relative z-[1] h-7 w-7" }) ||
    `<svg class="relative z-[1] h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="${SL.ink}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"></path></svg>`;
  return `<span class="relative grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-white shadow-[0_0.25rem_0.5rem_0_rgba(0,0,0,0.08)]">
    <span class="absolute inset-0 rounded-full" style="background:${color};opacity:0.25"></span>
    ${glyph}
  </span>`;
}

function check(popular: boolean): string {
  return `<svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="${popular ? "#FFFFFF" : SL.brand}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"></path></svg>`;
}

export function renderSaasLandingPage(site: AssembledSite): string {
  const slots = toSlots(null, site);

  const hero = slotAt(slots, "hero");
  const features = slotAt(slots, "features");
  const pricing = slotAt(slots, "pricing");
  const faq = slotAt(slots, "faq");
  const testimonials = slotAt(slots, "testimonials");
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");

  const businessName = text(footer.content, "businessName") || site.businessName || "Stratus";
  const monogram = initials(businessName);
  const customLogo = site.theme.logoUrl?.trim() || "";
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" class="h-9 w-9 rounded-xl object-contain" />`
    : `<span class="grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-white" style="background:${SL.brand};font-family:var(--sl-display)">${esc(monogram)}</span>`;

  const heroImage = hero.image || HERO_FALLBACK;

  const featureTitles = list(features.content, "itemTitles", [
    "Scalable infrastructure",
    "Real-time analytics",
    "Advanced security",
    "Intuitive interface",
    "24/7 support",
    "Automated workflows",
  ]);
  const featureBodies = list(features.content, "itemBodies");

  const planNames = list(pricing.content, "planNames", ["Personal", "Pro", "Enterprise"]);
  const planPrices = list(pricing.content, "planPrices", ["$19", "$39", "$79"]);
  const planFeatures = list(pricing.content, "planFeatures");
  const popularIndex = planNames.length > 2 ? 1 : planNames.length - 1;

  const questions = list(faq.content, "questions");
  const answers = list(faq.content, "answers");

  const quotes = list(testimonials.content, "quotes");
  const authors = list(testimonials.content, "authors");
  const roles = list(testimonials.content, "roles");

  const footerLinks = list(footer.content, "linkLabels", NAV.map((n) => n.label));
  const contactEmail = site.contact?.email?.trim() || "";

  const body = `
<div class="px-4 py-2.5 text-center text-[13px] font-medium leading-snug text-white sm:text-sm" style="background:${SL.dark}">
  <span class="font-semibold" style="font-family:var(--sl-display)">New —</span> ${esc(businessName)} automations now launch in minutes, not weeks.
</div>

<header class="sticky top-0 z-20 border-b bg-white/90 backdrop-blur" style="border-color:${SL.line}">
  <div class="mx-auto flex max-w-[80rem] items-center gap-4 px-6 py-4">
    <a href="#sl-top" class="mr-auto flex items-center gap-2.5">
      ${mark}
      <span class="text-lg font-bold tracking-tight" style="font-family:var(--sl-display)">${esc(businessName)}</span>
    </a>
    <nav class="hidden items-center gap-1 md:flex">
      ${NAV.map(
        (item) =>
          `<a href="${item.href}" class="sl-nav rounded-full px-4 py-2 text-sm font-medium" style="color:${SL.body}">${esc(item.label)}</a>`
      ).join("\n      ")}
    </nav>
    <a href="#sl-pricing" class="rounded-full px-5 py-2.5 text-sm font-semibold text-white" style="background:${SL.brand};font-family:var(--sl-display)">Get started free</a>
  </div>
</header>

<section class="mx-4 mt-6 rounded-[2rem] border px-5 pt-16 sm:mx-6 md:pt-20" style="background:${SL.surface};border-color:${SL.line}">
  <div class="mx-auto mb-10 max-w-3xl text-center">
    ${eyebrow(text(hero.content, "eyebrow", "Cloud workspace"))}
    <h1 class="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl" style="font-family:var(--sl-display)">${esc(
      text(hero.content, "headline", "Unleash and transform your business potential")
    )}</h1>
    <p class="mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg" style="color:${SL.body}">${esc(
      text(
        hero.content,
        "subheadline",
        "Empower your team, streamline workflows, and scale your operations effortlessly with our intuitive cloud-based platform."
      )
    )}</p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <a href="#sl-pricing" class="rounded-full px-7 py-3.5 text-sm font-semibold text-white" style="background:${SL.brand};font-family:var(--sl-display)">${esc(
        text(hero.content, "ctaPrimary", "Start free trial")
      )}</a>
      <a href="#sl-features" class="rounded-full border px-7 py-3.5 text-sm font-semibold" style="border-color:${SL.line};color:${SL.ink};font-family:var(--sl-display)">${esc(
        text(hero.content, "ctaSecondary", "Book a demo")
      )}</a>
    </div>
    <p class="mt-4 text-sm" style="color:${SL.muted}">No credit card required</p>
  </div>
  <div class="mx-auto max-w-5xl overflow-hidden rounded-t-2xl">
    <img src="${esc(heroImage)}" alt="" data-parallax="0.08" class="w-full translate-y-2 rounded-t-2xl border border-b-0 object-cover" style="border-color:${SL.line}" />
  </div>
</section>

<section class="px-6 py-16 md:py-20">
  <p class="text-center text-base font-medium" style="color:${SL.body}">Trusted by fast-growing teams</p>
  <div class="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-5">
    ${CLIENTS.map(
      (name) =>
        `<span class="text-xl font-bold tracking-tight" style="font-family:var(--sl-display);color:${SL.muted}">${esc(name)}</span>`
    ).join("\n    ")}
  </div>
</section>

<section id="sl-features" class="px-6 py-8 md:py-12">
  <div class="mx-auto max-w-2xl text-center">
    ${eyebrow("Features")}
    <h2 class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl" style="font-family:var(--sl-display)">${esc(
      text(features.content, "heading", "Everything you need to run faster")
    )}</h2>
    <p class="mt-4 text-base leading-relaxed" style="color:${SL.body}">${esc(
      text(features.content, "subheading", "Empowering your business with cutting-edge tools and functionalities.")
    )}</p>
  </div>
  <div class="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
    ${featureTitles
      .map(
        (title, i) => `<article class="rounded-3xl border p-8" style="background:${SL.surface};border-color:${SL.line}">
      ${featureIcon(i, features.icons[i])}
      <h3 class="mt-8 text-xl font-bold" style="font-family:var(--sl-display)">${esc(title)}</h3>
      <p class="mt-3 leading-relaxed" style="color:${SL.body}">${esc(
        featureBodies[i] || "A powerful, thoughtfully designed capability built to help your team move faster."
      )}</p>
    </article>`
      )
      .join("\n    ")}
  </div>
</section>

<section id="sl-pricing" class="px-4 py-16 sm:px-6 md:py-24">
  <div class="mx-auto max-w-6xl rounded-[2rem] border px-6 py-16 md:px-10" style="background:${SL.surface};border-color:${SL.line}">
    <div class="mx-auto max-w-2xl text-center">
      ${eyebrow("Pricing")}
      <h2 class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl" style="font-family:var(--sl-display)">${esc(
        text(pricing.content, "heading", "Simple, transparent pricing")
      )}</h2>
      <p class="mt-4 text-base leading-relaxed" style="color:${SL.body}">${esc(
        text(pricing.content, "subheading", "Transparent and flexible options tailored to suit your needs.")
      )}</p>
      <div class="mt-7 flex items-center justify-center gap-3 text-sm font-medium">
        <span style="color:${SL.ink}">Monthly</span>
        <span class="relative inline-flex h-6 w-11 items-center rounded-full" style="background:${SL.brand}"><span class="ml-0.5 h-5 w-5 rounded-full bg-white"></span></span>
        <span style="color:${SL.body}">Yearly</span>
        <span class="rounded px-1.5 py-1 text-xs font-semibold uppercase leading-none" style="background:#B5E4CA;color:${SL.dark}">Save 20%</span>
      </div>
    </div>
    <div class="mt-12 grid gap-5 lg:grid-cols-3">
      ${planNames
        .map((name, i) => {
          const popular = i === popularIndex;
          const featureLines = (planFeatures[i] || "")
            .split("\n")
            .map((f) => f.trim())
            .filter(Boolean);
          const badge = popular
            ? `<span class="rounded px-1.5 py-1 text-xs font-semibold uppercase leading-none" style="background:#FFBC99;color:${SL.dark}">Most popular</span>`
            : "";
          const cardBtn = popular
            ? `<a href="#sl-top" class="mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold text-white" style="background:${SL.brand};font-family:var(--sl-display)">Get started</a>`
            : `<a href="#sl-top" class="mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold" style="border:1px solid ${SL.line};color:${SL.ink};font-family:var(--sl-display)">Get started</a>`;
          const items = featureLines
            .map(
              (line) => `<li class="flex items-start gap-3 border-b pb-3 text-sm last:border-b-0" style="border-color:${
                popular ? "rgba(255,255,255,0.12)" : SL.line
              }">${check(popular)}<span style="color:${popular ? "rgba(255,255,255,0.85)" : SL.body}">${esc(line)}</span></li>`
            )
            .join("\n          ");
          return `<div class="flex flex-col rounded-3xl p-8 shadow-[0_0.25rem_1.25rem_0_rgba(0,0,0,0.06)]" style="background:${
            popular ? SL.dark : SL.white
          };color:${popular ? SL.white : SL.ink}">
        <div class="flex items-start justify-between">
          <div class="text-lg font-semibold" style="font-family:var(--sl-display)">${esc(name)}</div>
          ${badge}
        </div>
        <div class="mt-3 text-5xl font-extrabold tracking-tight" style="font-family:var(--sl-display)">${esc(
          planPrices[i] || "$0"
        )}<span class="align-baseline text-base font-medium" style="color:${
          popular ? "rgba(255,255,255,0.6)" : SL.muted
        }"> /mo</span></div>
        <ul class="mt-8 flex-1 space-y-3">
          ${items}
        </ul>
        ${cardBtn}
      </div>`;
        })
        .join("\n      ")}
    </div>
  </div>
</section>

<section id="sl-faq" class="px-6 py-8 md:py-12">
  <div class="mx-auto max-w-2xl text-center">
    ${eyebrow("FAQ")}
    <h2 class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl" style="font-family:var(--sl-display)">${esc(
      text(faq.content, "heading", "Got questions? We have answers")
    )}</h2>
  </div>
  <div class="mx-auto mt-10 max-w-3xl">
    ${questions
      .map(
        (question, i) => `<details ${i === 0 ? "open" : ""} class="group mb-4 rounded-2xl border px-6" style="background:${SL.surface};border-color:${SL.line}">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold sm:text-lg" style="font-family:var(--sl-display)">${esc(
        question
      )}<span class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-lg leading-none text-white transition-transform group-open:rotate-45" style="background:${SL.brand}">+</span></summary>
      <p class="pb-5 leading-relaxed" style="color:${SL.body}">${esc(
        answers[i] || "Reach out any time — our team is glad to walk you through the details."
      )}</p>
    </details>`
      )
      .join("\n    ")}
  </div>
</section>

<section id="sl-reviews" class="px-6 py-8 md:py-12">
  <div class="mx-auto max-w-2xl text-center">
    ${eyebrow("Wall of Love")}
    <h2 class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl" style="font-family:var(--sl-display)">${esc(
      text(testimonials.content, "heading", "Discover what our happy users have to say.")
    )}</h2>
  </div>
  <div class="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
    ${quotes
      .map(
        (quote, i) => `<figure class="flex flex-col rounded-3xl border p-7" style="background:${SL.surface};border-color:${SL.line}">
      <div class="mb-5 flex items-center gap-3">
        <img src="${esc(AVATARS[i % AVATARS.length])}" alt="" class="h-12 w-12 rounded-full object-cover" />
        <figcaption>
          <div class="text-sm font-semibold" style="font-family:var(--sl-display)">${esc(authors[i] || "Happy customer")}</div>
          ${roles[i] ? `<div class="text-xs" style="color:${SL.muted}">${esc(roles[i])}</div>` : ""}
        </figcaption>
      </div>
      <blockquote class="flex-1 text-sm leading-6" style="color:${SL.body}">${esc(quote)}</blockquote>
    </figure>`
      )
      .join("\n    ")}
  </div>
</section>

<section class="px-4 py-16 sm:px-6 md:py-20">
  <div class="mx-auto max-w-6xl rounded-[2rem] px-6 py-20 text-center text-white md:px-10" style="background:${SL.dark}">
    <h2 class="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl" style="font-family:var(--sl-display)">${esc(
      text(cta.content, "headline", "Ready to start?")
    )}</h2>
    <p class="mx-auto mt-4 max-w-lg text-base" style="color:rgba(255,255,255,0.65)">${esc(
      text(cta.content, "subheadline", "Get the easiest access and launch your workspace today.")
    )}</p>
    <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#sl-top"}" class="mt-9 inline-flex rounded-full px-8 py-4 text-sm font-semibold text-white" style="background:${SL.brand};font-family:var(--sl-display)">${esc(
      text(cta.content, "ctaPrimary", "Download now")
    )}</a>
  </div>
</section>

<section class="px-4 pb-16 sm:px-6">
  <div class="mx-auto max-w-6xl rounded-[2rem] border px-6 py-16 text-center md:px-10" style="background:${SL.white};border-color:${SL.line}">
    <h2 class="text-2xl font-extrabold tracking-tight sm:text-3xl" style="font-family:var(--sl-display)">Join our newsletter</h2>
    <p class="mt-3 text-base" style="color:${SL.body}">And stay in touch with us!</p>
    <div class="mx-auto mt-8 flex w-full max-w-md gap-3">
      <label class="sr-only" for="sl-newsletter">Email address</label>
      <input id="sl-newsletter" type="email" placeholder="Enter your email" class="min-w-0 flex-1 rounded-full border px-5 py-3.5 text-sm outline-none" style="background:${SL.surface};border-color:${SL.line}" />
      <button type="button" class="shrink-0 rounded-full px-6 py-3.5 text-sm font-semibold text-white" style="background:${SL.brand};font-family:var(--sl-display)">Subscribe</button>
    </div>
  </div>
</section>

<footer class="border-t px-6 py-14" style="border-color:${SL.line}">
  <div class="mx-auto max-w-[80rem]">
    <div class="flex flex-wrap items-start justify-between gap-8">
      <div class="max-w-sm">
        <div class="flex items-center gap-2.5">
          ${mark}
          <span class="text-lg font-bold" style="font-family:var(--sl-display)">${esc(businessName)}</span>
        </div>
        <p class="mt-4 text-sm leading-relaxed" style="color:${SL.body}">${esc(
          text(footer.content, "tagline", "The intuitive cloud workspace for fast-growing teams.")
        )}</p>
      </div>
      <nav class="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium" style="color:${SL.body}">
        ${footerLinks.map((label) => `<span>${esc(label)}</span>`).join("\n        ")}
      </nav>
    </div>
    <div class="mt-10 border-t pt-6 text-sm" style="border-color:${SL.line};color:${SL.muted}">© ${new Date().getFullYear()} ${esc(
      businessName
    )}. All rights reserved.</div>
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --sl-display: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#2A85FF")} ${themeFontCss(site.theme, ["--sl-display","--sl-body"])} }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      color: ${SL.ink};
      background: ${SL.white};
      -webkit-font-smoothing: antialiased;
    }
    .sl-nav { transition: color .2s ease; }
    .sl-nav:hover { color: ${SL.brand}; }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body id="sl-top">
${body}
</body>
</html>`;
}
