import { MR, MR_GRADIENTS, MR_BRAND_GRADIENT, MR_ICON_PATHS } from "./tokens";
import { list, slotAt, text, toSlots, pageSlugsOf, type TemplateSlot } from "../shared/content";
import { brandCss } from "../shared/brand";
import type { AssembledSite } from "@/lib/blueprint/types";

// Static HTML twin of templates/mainfile/site.tsx. Exported and deployed sites
// must look like the design the customer chose, so the Mraval layout is mirrored
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

const FALLBACK = {
  hero: "/templates/mainfile/hero.jpg",
  content: "/templates/mainfile/content.jpg",
  value: "/templates/mainfile/value.jpg",
  about: "/templates/mainfile/about.jpg",
  team: [
    "/templates/mainfile/team-1.png",
    "/templates/mainfile/team-2.png",
    "/templates/mainfile/team-3.png",
    "/templates/mainfile/team-4.png",
  ],
  services: [
    "/templates/mainfile/service-1.jpg",
    "/templates/mainfile/service-2.jpg",
    "/templates/mainfile/service-3.jpg",
  ],
  portfolio: [
    "/templates/mainfile/portfolio-1.jpg",
    "/templates/mainfile/portfolio-2.jpg",
    "/templates/mainfile/portfolio-3.jpg",
    "/templates/mainfile/portfolio-4.jpg",
    "/templates/mainfile/portfolio-5.jpg",
    "/templates/mainfile/portfolio-6.jpg",
  ],
  blog: ["/templates/mainfile/blog-1.jpg", "/templates/mainfile/blog-2.jpg", "/templates/mainfile/blog-3.jpg"],
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Static inter-page links: home is the root, other pages live under /<slug>/. */
function pageHref(slug: string): string {
  return slug === "home" ? "/" : `/${slug}/`;
}

function eyebrow(label: string): string {
  return `<span class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em]" style="background:${MR.brandSoft};color:${MR.brandStrong};font-family:var(--mr-display)">${esc(label)}</span>`;
}

function iconTile(index: number): string {
  return `<span class="grid h-16 w-16 place-items-center rounded-2xl text-white" style="background-image:${MR_GRADIENTS[index % MR_GRADIENTS.length]};box-shadow:0 14px 30px -12px rgba(52,49,75,0.35)">
    <svg viewBox="0 0 24 24" class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${MR_ICON_PATHS[index % MR_ICON_PATHS.length]}"></path></svg>
  </span>`;
}

function sectionHeading(eyebrowLabel: string, heading: string, subheading = "", center = true): string {
  return `<div class="${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}">
    ${eyebrowLabel ? eyebrow(eyebrowLabel) : ""}
    <h2 class="mt-4 text-3xl font-bold tracking-tight lg:text-5xl" style="font-family:var(--mr-display);color:${MR.ink}">${esc(heading)}</h2>
    ${subheading ? `<p class="mt-4 text-lg leading-relaxed" style="color:${MR.body}">${esc(subheading)}</p>` : ""}
  </div>`;
}

function primaryButton(href: string, label: string): string {
  return `<a href="${href}" class="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white" style="background-image:${MR_BRAND_GRADIENT};font-family:var(--mr-display);box-shadow:0 14px 26px -10px rgba(125,188,255,0.7)">${esc(label)}</a>`;
}

/* ------------------------------ chrome ---------------------------------- */

function logo(businessName: string, customLogo: string, light = false): string {
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" class="h-9 w-9 rounded-2xl object-contain" />`
    : `<span class="grid h-9 w-9 place-items-center rounded-2xl text-sm font-bold text-white" style="background-image:${MR_BRAND_GRADIENT};font-family:var(--mr-display)">${esc(initials(businessName))}</span>`;
  return `<a href="/" class="flex items-center gap-2.5">
      ${mark}
      <span class="text-2xl font-bold tracking-tight" style="font-family:var(--mr-display);color:${light ? MR.white : MR.ink}">${esc(businessName)}</span>
    </a>`;
}

function header(pages: { slug: string; title: string }[], active: string, businessName: string, customLogo: string): string {
  const links = pages
    .map(
      (p) =>
        `<a href="${pageHref(p.slug)}" class="transition-colors" style="color:${p.slug === active ? MR.brandStrong : MR.ink}">${esc(p.title)}</a>`
    )
    .join("\n          ");
  return `<header class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md" style="border-color:${MR.line}">
  <div class="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
    ${logo(businessName, customLogo)}
    <nav class="hidden items-center gap-8 text-sm font-semibold lg:flex" style="font-family:var(--mr-display)">
          ${links}
    </nav>
    <a href="${pageHref("contact")}" class="hidden rounded-full px-6 py-2.5 text-sm font-semibold text-white sm:inline-flex" style="background-image:${MR_BRAND_GRADIENT};font-family:var(--mr-display);box-shadow:0 10px 20px -8px rgba(125,188,255,0.6)">Get started</a>
  </div>
</header>`;
}

function footer(
  pages: { slug: string; title: string }[],
  businessName: string,
  customLogo: string,
  tagline: string,
  contactEmail: string,
  contactPhone: string
): string {
  const links = pages
    .map((p) => `<li><a href="${pageHref(p.slug)}" class="transition-colors hover:text-white">${esc(p.title)}</a></li>`)
    .join("\n            ");
  const contact =
    contactEmail || contactPhone
      ? `<div class="mt-5 space-y-1.5 text-sm text-white/70">
          ${contactEmail ? `<a href="mailto:${esc(contactEmail)}" class="block transition-colors hover:text-white">${esc(contactEmail)}</a>` : ""}
          ${contactPhone ? `<a href="tel:${esc(contactPhone)}" class="block transition-colors hover:text-white">${esc(contactPhone)}</a>` : ""}
        </div>`
      : "";
  return `<footer class="relative overflow-hidden pt-20 text-white" style="background-color:${MR.ink}">
  <div class="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-40" style="background-image:${MR_BRAND_GRADIENT};filter:blur(90px)"></div>
  <div class="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full opacity-30" style="background:${MR.violet};filter:blur(90px)"></div>
  <div class="relative mx-auto max-w-[1200px] px-5 pb-10 lg:px-8">
    <div class="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
      <div class="max-w-sm">
        ${logo(businessName, customLogo, true)}
        <p class="mt-4 text-sm leading-relaxed text-white/60">${esc(tagline)}</p>
        ${contact}
      </div>
      <div>
        <h3 class="text-sm font-bold uppercase tracking-wider text-white/50" style="font-family:var(--mr-display)">Pages</h3>
        <ul class="mt-4 space-y-2.5 text-sm text-white/75">
            ${links}
        </ul>
      </div>
      <div>
        <h3 class="text-sm font-bold uppercase tracking-wider text-white/50" style="font-family:var(--mr-display)">Sign up for our newsletter</h3>
        <p class="mt-4 text-sm text-white/70">Subscribe to always stay in touch and get the latest news.</p>
        <form class="mt-4 flex gap-2" data-motion-skip>
          <input type="email" placeholder="Enter your email" class="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none" />
          <button type="button" class="rounded-full px-5 py-2.5 text-sm font-semibold text-white" style="background-image:${MR_BRAND_GRADIENT};font-family:var(--mr-display)">Subscribe</button>
        </form>
      </div>
    </div>
    <div class="mt-12 border-t border-white/10 pt-6 text-sm text-white/45">© ${new Date().getFullYear()} ${esc(businessName)}. All rights reserved.</div>
  </div>
</footer>`;
}

/* --------------------------- section blocks ----------------------------- */

function pageHeader(slot: TemplateSlot, fallbackTitle: string): string {
  return `<section class="relative overflow-hidden" style="background-color:${MR.heroBg}">
  <div class="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-50" style="background-image:${MR_BRAND_GRADIENT};filter:blur(70px)" data-parallax="0.1"></div>
  <div class="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full opacity-40" style="background:${MR.violet};filter:blur(80px)"></div>
  <div class="relative mx-auto max-w-[1200px] px-5 py-20 text-center lg:px-8 lg:py-28">
    ${eyebrow(text(slot.content, "eyebrow", fallbackTitle))}
    <h1 class="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight lg:text-6xl" style="font-family:var(--mr-display);color:${MR.ink}">${esc(text(slot.content, "headline", fallbackTitle))}</h1>
    <p class="mx-auto mt-5 max-w-2xl text-lg leading-relaxed" style="color:${MR.body}">${esc(text(slot.content, "subheadline", ""))}</p>
  </div>
</section>`;
}

function homeHero(slot: TemplateSlot): string {
  const secondary = text(slot.content, "ctaSecondary");
  return `<section class="relative overflow-hidden" style="background-color:${MR.heroBg}">
  <div class="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full opacity-50" style="background-image:${MR_BRAND_GRADIENT};filter:blur(70px)"></div>
  <div class="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full opacity-40" style="background:${MR.violet};filter:blur(90px)"></div>
  <div class="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
    <div>
      ${eyebrow(text(slot.content, "eyebrow", "Creative studio"))}
      <h1 class="mt-5 text-4xl font-bold leading-[1.08] tracking-tight lg:text-6xl" style="font-family:var(--mr-display);color:${MR.ink}">${esc(text(slot.content, "headline", "Creative app & landing page studio"))}</h1>
      <p class="mt-5 max-w-lg text-lg leading-relaxed" style="color:${MR.body}">${esc(text(slot.content, "subheadline", "We design colorful brands, apps, and landing pages that help creators do more of what they love."))}</p>
      <div class="mt-8 flex flex-wrap items-center gap-4">
        ${primaryButton(pageHref("contact"), text(slot.content, "ctaPrimary", "Learn more"))}
        ${
          secondary
            ? `<a href="${pageHref("services")}" class="inline-flex items-center gap-2 text-sm font-semibold" style="color:${MR.ink};font-family:var(--mr-display)"><span class="grid h-9 w-9 place-items-center rounded-full text-white" style="background-image:${MR_GRADIENTS[2]}" aria-hidden="true">▶</span>${esc(secondary)}</a>`
            : ""
        }
      </div>
    </div>
    <div class="relative">
      <div class="pointer-events-none absolute -left-8 top-8 h-24 w-24 rounded-3xl opacity-80" style="background-image:${MR_GRADIENTS[4]}" data-parallax="0.14"></div>
      <div class="relative overflow-hidden rounded-[36px] border bg-white shadow-[0_40px_100px_-40px_rgba(125,188,255,0.6)]" style="border-color:${MR.line}">
        <img src="${esc(slot.image || FALLBACK.hero)}" alt="${esc(text(slot.content, "headline", ""))}" class="h-full w-full object-cover" data-parallax="0.05" />
      </div>
    </div>
  </div>
</section>`;
}

function featureCards(slot: TemplateSlot, startIndex = 0): string {
  const titles = list(slot.content, "itemTitles", ["Responsive design", "Well documented", "Easy to change"]);
  const bodies = list(slot.content, "itemBodies");
  const heading = text(slot.content, "heading", "");
  const subheading = text(slot.content, "subheading", "");
  const cards = titles
    .map(
      (title, i) => `<article class="rounded-[28px] border bg-white p-8 text-center" style="border-color:${MR.line};box-shadow:0 24px 60px -34px rgba(52,49,75,0.28)">
      <div class="mx-auto w-16">${iconTile(startIndex + i)}</div>
      <h3 class="mt-6 text-xl font-bold" style="font-family:var(--mr-display);color:${MR.ink}">${esc(title)}</h3>
      <p class="mt-3 text-sm leading-relaxed" style="color:${MR.body}">${esc(bodies[i] || "Beautifully crafted blocks you can restyle and reorder without touching code.")}</p>
    </article>`
    )
    .join("\n      ");
  return section(`${heading ? sectionHeading("", heading, subheading) : ""}
    <div class="grid gap-6 md:grid-cols-3 ${heading ? "mt-14" : ""}">
      ${cards}
    </div>`);
}

function storySection(slot: TemplateSlot, image: string): string {
  const media = `<div>
      <div class="relative">
        <div class="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-3xl opacity-80" style="background-image:${MR_GRADIENTS[1]}" data-parallax="0.08"></div>
        <div class="relative overflow-hidden rounded-[32px] border bg-white shadow-[0_30px_80px_-40px_rgba(52,49,75,0.4)]" style="border-color:${MR.line}">
          <img src="${esc(slot.image || image)}" alt="${esc(text(slot.content, "heading", ""))}" class="h-full w-full object-cover" data-parallax="0.06" />
        </div>
      </div>
    </div>`;
  const copy = `<div>
      ${eyebrow(text(slot.content, "eyebrow", "Elements design"))}
      <h2 class="mt-4 text-3xl font-bold tracking-tight lg:text-5xl" style="font-family:var(--mr-display);color:${MR.ink}">${esc(text(slot.content, "heading", "Impressive elements for every idea"))}</h2>
      <p class="mt-5 text-lg leading-relaxed" style="color:${MR.body}">${esc(text(slot.content, "body", "Build something impressive in an afternoon, not a month."))}</p>
      <div class="mt-8">${primaryButton(pageHref("services"), "Learn more")}</div>
    </div>`;
  return section(
    `<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      ${media}
      ${copy}
    </div>`,
    true
  );
}

function valueList(slot: TemplateSlot): string {
  const titles = list(slot.content, "itemTitles", ["Responsive web", "High quality design", "Cool animations"]);
  const bodies = list(slot.content, "itemBodies");
  const items = titles
    .map(
      (title, i) => `<li class="flex gap-5">
        <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white" style="background-image:${MR_GRADIENTS[i % MR_GRADIENTS.length]};font-family:var(--mr-display)">${i + 1}</span>
        <div>
          <h3 class="text-lg font-bold" style="font-family:var(--mr-display);color:${MR.ink}">${esc(title)}</h3>
          <p class="mt-1.5 text-sm leading-relaxed" style="color:${MR.body}">${esc(bodies[i] || "Tasteful detail that brings your story to life.")}</p>
        </div>
      </li>`
    )
    .join("\n        ");
  return section(`<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div class="relative">
        <div class="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full opacity-70" style="background-image:${MR_GRADIENTS[3]}" data-parallax="0.1"></div>
        <div class="relative overflow-hidden rounded-[32px] border bg-white shadow-[0_30px_80px_-40px_rgba(52,49,75,0.4)]" style="border-color:${MR.line}">
          <img src="${esc(slot.image || FALLBACK.value)}" alt="" class="h-full w-full object-cover" data-parallax="0.05" />
        </div>
      </div>
      <div>
        ${sectionHeading("Why choose me", text(slot.content, "heading", "Design helps creators do more"), text(slot.content, "subheading", ""), false)}
        <ul class="mt-8 space-y-6">
        ${items}
        </ul>
      </div>
    </div>`);
}

function testimonials(slot: TemplateSlot): string {
  const quotes = list(slot.content, "quotes");
  const authors = list(slot.content, "authors");
  const roles = list(slot.content, "roles");
  const cards = quotes
    .map(
      (quote, i) => `<figure class="rounded-[28px] border bg-white p-8 shadow-[0_20px_60px_-40px_rgba(52,49,75,0.35)]" style="border-color:${MR.line}">
      <div class="flex items-center gap-1 text-lg" style="color:#FFC187" aria-hidden="true">★★★★★</div>
      <blockquote class="mt-4 text-base leading-relaxed" style="color:${MR.ink}">“${esc(quote)}”</blockquote>
      <figcaption class="mt-6 flex items-center gap-3">
        <img src="${esc(FALLBACK.team[i % FALLBACK.team.length])}" alt="" class="h-11 w-11 rounded-full object-cover" />
        <span>
          <span class="block text-sm font-bold" style="font-family:var(--mr-display);color:${MR.ink}">${esc(authors[i] || "Happy client")}</span>
          <span class="block text-xs" style="color:${MR.muted}">${esc(roles[i] || "Verified client")}</span>
        </span>
      </figcaption>
    </figure>`
    )
    .join("\n      ");
  return section(
    `${sectionHeading("Testimonials", text(slot.content, "heading", "What our clients say"))}
    <div class="mt-14 grid gap-6 md:grid-cols-3">
      ${cards}
    </div>`,
    true
  );
}

function servicesCards(slot: TemplateSlot): string {
  const titles = list(slot.content, "itemTitles", ["Brand & identity", "UI / UX design", "Web & app build"]);
  const bodies = list(slot.content, "itemBodies");
  const cards = titles
    .map(
      (title, i) => `<article class="group overflow-hidden rounded-[28px] border bg-white shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style="border-color:${MR.line}">
      <div class="h-44 overflow-hidden"><img src="${esc(slot.itemImages[i] || FALLBACK.services[i % FALLBACK.services.length])}" alt="${esc(title)}" class="h-full w-full object-cover" /></div>
      <div class="p-7">
        <h3 class="text-lg font-bold" style="font-family:var(--mr-display);color:${MR.ink}">${esc(title)}</h3>
        <p class="mt-3 text-sm leading-relaxed" style="color:${MR.body}">${esc(bodies[i] || "Professional delivery from a team that cares about your outcome.")}</p>
        <span class="mt-5 inline-flex text-sm font-semibold" style="color:${MR.brandStrong};font-family:var(--mr-display)">Learn more →</span>
      </div>
    </article>`
    )
    .join("\n      ");
  return section(`${sectionHeading("Our services", text(slot.content, "heading", "Everything you need to grow"), text(slot.content, "subheading", ""))}
    <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      ${cards}
    </div>`);
}

function processSteps(slot: TemplateSlot): string {
  const titles = list(slot.content, "stepTitles", ["Discover", "Design", "Build", "Launch"]);
  const bodies = list(slot.content, "stepBodies");
  const cards = titles
    .map(
      (title, i) => `<div class="rounded-[28px] border bg-white p-7 shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style="border-color:${MR.line}">
      <span class="inline-block bg-clip-text text-4xl font-bold text-transparent" style="background-image:${MR_GRADIENTS[i % MR_GRADIENTS.length]};-webkit-background-clip:text;font-family:var(--mr-display)">${String(i + 1).padStart(2, "0")}</span>
      <h3 class="mt-4 text-lg font-bold" style="font-family:var(--mr-display);color:${MR.ink}">${esc(title)}</h3>
      <p class="mt-2 text-sm leading-relaxed" style="color:${MR.body}">${esc(bodies[i] || "A clear step in a process built around your goals.")}</p>
    </div>`
    )
    .join("\n      ");
  return section(
    `${sectionHeading("How it works", text(slot.content, "heading", "A simple, proven process"))}
    <div class="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      ${cards}
    </div>`,
    true
  );
}

function pricing(slot: TemplateSlot): string {
  const names = list(slot.content, "planNames", ["Starter", "Professional", "Business"]);
  const prices = list(slot.content, "planPrices", ["$29", "$99", "$499"]);
  const features = list(slot.content, "planFeatures");
  const tiers = names
    .map((name, i) => {
      const popular = i === 1 || names.length === 1;
      const feats = (features[i] || "")
        .split("\n")
        .filter(Boolean)
        .map(
          (f) =>
            `<li class="flex items-start gap-2.5"><span class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] text-white" style="background-image:${MR_BRAND_GRADIENT}">✓</span>${esc(f)}</li>`
        )
        .join("\n          ");
      const buy = popular
        ? `<a href="${pageHref("contact")}" class="mt-8 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold text-white" style="background-image:${MR_BRAND_GRADIENT};font-family:var(--mr-display)">Buy now</a>`
        : `<a href="${pageHref("contact")}" class="mt-8 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold text-white" style="background:${MR.ink};font-family:var(--mr-display)">Buy now</a>`;
      return `<div class="relative flex flex-col overflow-hidden rounded-[28px] border bg-white p-8 shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style="border-color:${popular ? "transparent" : MR.line};border-width:${popular ? 0 : 1}px">
        ${popular ? `<span class="pointer-events-none absolute inset-x-0 top-0 h-1.5" style="background-image:${MR_BRAND_GRADIENT}"></span>` : ""}
        ${popular ? `<span class="absolute right-6 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white" style="background-image:${MR_GRADIENTS[3]};font-family:var(--mr-display)">Popular</span>` : ""}
        <p class="text-sm font-semibold uppercase tracking-wider" style="color:${MR.muted}">${esc(name)}</p>
        <div class="mt-3 text-5xl font-bold tracking-tight" style="font-family:var(--mr-display);color:${MR.ink}">${esc(prices[i] || "")}</div>
        <ul class="mt-6 space-y-3 text-sm" style="color:${MR.body}">
          ${feats}
        </ul>
        ${buy}
      </div>`;
    })
    .join("\n      ");
  return section(`${sectionHeading("Pricing", text(slot.content, "heading", "Simple, transparent pricing"), text(slot.content, "subheading", ""))}
    <div class="mt-14 grid gap-6 md:grid-cols-3">
      ${tiers}
    </div>`);
}

function faqBlock(slot: TemplateSlot): string {
  const questions = list(slot.content, "questions");
  const answers = list(slot.content, "answers");
  const rows = questions
    .map(
      (question, i) => `<details ${i === 0 ? "open" : ""} class="group border-b px-7 py-5 last:border-b-0" style="border-color:${MR.line}">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold" style="font-family:var(--mr-display);color:${MR.ink}">${esc(question)}<span class="shrink-0 text-2xl leading-none transition-transform group-open:rotate-45" style="color:${MR.brandStrong}" aria-hidden="true">+</span></summary>
      <p class="mt-3 text-sm leading-relaxed" style="color:${MR.body}">${esc(answers[i] || "")}</p>
    </details>`
    )
    .join("\n      ");
  return section(`${sectionHeading("FAQ", text(slot.content, "heading", "Frequently asked questions"))}
    <div class="mx-auto mt-12 max-w-3xl overflow-hidden rounded-[28px] border bg-white shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style="border-color:${MR.line}">
      ${rows}
    </div>`);
}

function contactBlock(slot: TemplateSlot, contactEmail: string, contactPhone: string): string {
  const email = text(slot.content, "email", contactEmail);
  const phone = text(slot.content, "phone", contactPhone);
  const address = text(slot.content, "address", "");
  const row = (label: string, value: string) =>
    `<div class="rounded-2xl border bg-white px-5 py-4" style="border-color:${MR.line}"><div class="text-xs font-semibold uppercase tracking-wider" style="color:${MR.muted}">${esc(label)}</div><div class="mt-1 font-medium" style="color:${MR.ink}">${esc(value)}</div></div>`;
  return section(`<div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        ${sectionHeading("Contact", text(slot.content, "heading", "Get in touch"), text(slot.content, "subheading", ""), false)}
        <div class="mt-8 space-y-4">
          ${email ? row("Email", email) : ""}
          ${phone ? row("Phone", phone) : ""}
          ${address ? row("Office", address) : ""}
        </div>
      </div>
      <form class="rounded-[28px] border bg-white p-8 shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style="border-color:${MR.line}" data-motion-skip>
        <div class="grid gap-4 sm:grid-cols-2">
          <input class="rounded-2xl border px-4 py-3 text-sm" style="border-color:${MR.line}" placeholder="Your name" />
          <input class="rounded-2xl border px-4 py-3 text-sm" style="border-color:${MR.line}" placeholder="Email" />
        </div>
        <textarea rows="4" class="mt-4 w-full rounded-2xl border px-4 py-3 text-sm" style="border-color:${MR.line}" placeholder="How can we help?"></textarea>
        <button type="button" class="mt-4 w-full rounded-full py-3 text-sm font-semibold text-white" style="background-image:${MR_BRAND_GRADIENT};font-family:var(--mr-display)">${esc(text(slot.content, "ctaLabel", "Send message"))}</button>
      </form>
    </div>`);
}

function portfolioBlock(slot: TemplateSlot): string {
  const titles = list(slot.content, "itemTitles");
  const bodies = list(slot.content, "itemBodies");
  const roles = list(slot.content, "roles");
  const cards = titles
    .map(
      (title, i) => `<article class="group overflow-hidden rounded-[28px] border bg-white shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style="border-color:${MR.line}">
      <div class="h-52 overflow-hidden"><img src="${esc(slot.itemImages[i] || FALLBACK.portfolio[i % FALLBACK.portfolio.length])}" alt="${esc(title)}" class="h-full w-full object-cover" /></div>
      <div class="p-7">
        ${roles[i] ? `<span class="text-xs font-semibold uppercase tracking-wider" style="color:${MR.brandStrong}">${esc(roles[i])}</span>` : ""}
        <h3 class="mt-2 text-lg font-bold" style="font-family:var(--mr-display);color:${MR.ink}">${esc(title)}</h3>
        <p class="mt-2 text-sm leading-relaxed" style="color:${MR.body}">${esc(bodies[i] || "")}</p>
      </div>
    </article>`
    )
    .join("\n      ");
  return section(`${sectionHeading("Portfolio", text(slot.content, "heading", "Our recent projects"), text(slot.content, "subheading", ""))}
    <div class="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      ${cards}
    </div>`);
}

function blogGrid(slot: TemplateSlot): string {
  const titles = list(slot.content, "itemTitles");
  const bodies = list(slot.content, "itemBodies");
  const cards = titles
    .map(
      (title, i) => `<article class="group overflow-hidden rounded-[28px] border bg-white shadow-[0_20px_60px_-40px_rgba(52,49,75,0.3)]" style="border-color:${MR.line}">
      <div class="h-48 overflow-hidden"><img src="${esc(slot.itemImages[i] || FALLBACK.blog[i % FALLBACK.blog.length])}" alt="${esc(title)}" class="h-full w-full object-cover" /></div>
      <div class="p-7">
        <h3 class="text-lg font-bold leading-snug" style="font-family:var(--mr-display);color:${MR.ink}">${esc(title)}</h3>
        <p class="mt-3 text-sm leading-relaxed" style="color:${MR.body}">${esc(bodies[i] || "")}</p>
        <span class="mt-5 inline-flex text-sm font-semibold" style="color:${MR.brandStrong};font-family:var(--mr-display)">Read more →</span>
      </div>
    </article>`
    )
    .join("\n      ");
  return section(`${sectionHeading("Blog", text(slot.content, "heading", "Latest articles"), text(slot.content, "subheading", ""))}
    <div class="mt-14 grid gap-6 md:grid-cols-3">
      ${cards}
    </div>`);
}

function ctaBanner(slot: TemplateSlot): string {
  return `<section class="px-5 py-20 lg:px-8">
  <div class="relative mx-auto max-w-[1200px] overflow-hidden rounded-[36px] px-8 py-16 text-center text-white lg:px-16 lg:py-20" style="background-image:${MR_BRAND_GRADIENT}">
    <div class="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15" data-parallax="0.12"></div>
    <div class="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/10" data-parallax="0.08"></div>
    <h2 class="relative text-3xl font-bold tracking-tight lg:text-5xl" style="font-family:var(--mr-display)">${esc(text(slot.content, "headline", "Let's discover the multipurpose Mraval"))}</h2>
    <p class="relative mx-auto mt-4 max-w-xl text-lg text-white/90">${esc(text(slot.content, "subheadline", "All that you need to create your creative website. Start enjoying your creativity today."))}</p>
    <a href="${pageHref("contact")}" class="relative mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold" style="color:${MR.brandStrong};font-family:var(--mr-display)">${esc(text(slot.content, "ctaPrimary", "Purchase now"))}</a>
  </div>
</section>`;
}

function section(inner: string, tint = false): string {
  return `<section class="px-5 py-20 lg:px-8 lg:py-24"${tint ? ` style="background:${MR.surface}"` : ""}>
  <div class="mx-auto max-w-[1200px]">
    ${inner}
  </div>
</section>`;
}

/* ------------------------------ page body ------------------------------- */

function pageBody(active: string, slots: TemplateSlot[], contactEmail: string, contactPhone: string): string {
  switch (active) {
    case "home":
      return [
        homeHero(slotAt(slots, "hero")),
        featureCards(slotAt(slots, "features", 0), 0),
        storySection(slotAt(slots, "about"), FALLBACK.content),
        valueList(slotAt(slots, "features", 1)),
        testimonials(slotAt(slots, "testimonials")),
        ctaBanner(slotAt(slots, "cta")),
      ].join("\n");
    case "about":
      return [
        pageHeader(slotAt(slots, "hero"), "About Us"),
        storySection(slotAt(slots, "about"), FALLBACK.about),
        featureCards(slotAt(slots, "features", 0), 0),
        testimonials(slotAt(slots, "testimonials")),
        ctaBanner(slotAt(slots, "cta")),
      ].join("\n");
    case "services":
      return [
        pageHeader(slotAt(slots, "hero"), "Services"),
        servicesCards(slotAt(slots, "services")),
        processSteps(slotAt(slots, "process")),
        ctaBanner(slotAt(slots, "cta")),
      ].join("\n");
    case "pricing":
      return [
        pageHeader(slotAt(slots, "hero"), "Pricing"),
        pricing(slotAt(slots, "pricing")),
        faqBlock(slotAt(slots, "faq")),
        ctaBanner(slotAt(slots, "cta")),
      ].join("\n");
    case "contact":
      return [pageHeader(slotAt(slots, "hero"), "Contact"), contactBlock(slotAt(slots, "contact"), contactEmail, contactPhone)].join("\n");
    case "faq":
      return [pageHeader(slotAt(slots, "hero"), "FAQ"), faqBlock(slotAt(slots, "faq")), ctaBanner(slotAt(slots, "cta"))].join("\n");
    case "blog":
      return [pageHeader(slotAt(slots, "hero"), "Blog"), blogGrid(slotAt(slots, "features", 0)), ctaBanner(slotAt(slots, "cta"))].join("\n");
    case "portfolio":
      return [pageHeader(slotAt(slots, "hero"), "Portfolio"), portfolioBlock(slotAt(slots, "portfolio")), ctaBanner(slotAt(slots, "cta"))].join("\n");
    default:
      return "";
  }
}

/** Renders one Mraval page to a complete static HTML document. */
export function renderMainfilePage(site: AssembledSite, pageSlug?: string): string {
  const pages = pageSlugsOf(null, site);
  const active =
    (pageSlug && pages.find((p) => p.slug === pageSlug)?.slug) ||
    pages.find((p) => p.slug === "home")?.slug ||
    pages[0]?.slug ||
    "home";
  const slots = toSlots(null, site, active);

  const footerSlot = slotAt(slots, "footer");
  const businessName = text(footerSlot.content, "businessName") || site.businessName || "Mraval";
  const customLogo = site.theme?.logoUrl?.trim() || "";
  const tagline = text(footerSlot.content, "tagline", "A creative studio crafting colorful brands, apps, and landing pages.");
  const contactEmail = site.contact?.email?.trim() || "";
  const contactPhone = site.contact?.phone?.trim() || "";

  const activeTitle = pages.find((p) => p.slug === active)?.title || "Home";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(activeTitle)} — ${esc(site.seo.title)}</title>
  <meta name="description" content="${esc(site.seo.description)}" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    :root { --mr-display: 'Hind', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme?.colors, "#7DBCFF")} }
    html { scroll-behavior: smooth; }
    body { font-family: 'Open Sans', ui-sans-serif, system-ui, sans-serif; color: ${MR.body}; background: ${MR.white}; -webkit-font-smoothing: antialiased; }
  </style>
</head>
<body>
${header(pages, active, businessName, customLogo)}
<main>
${pageBody(active, slots, contactEmail, contactPhone)}
</main>
${footer(pages, businessName, customLogo, tagline, contactEmail, contactPhone)}
</body>
</html>`;

  return html;
}
