import type { AssembledSite } from "@/lib/blueprint/types";
import { EL } from "./tokens";
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

const HERO = "/templates/elektra/hero.jpg";

export function renderElektraPage(site: AssembledSite): string {
  const slots = toSlots(null, site);
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const work = slotAt(slots, "portfolio");
  const testimonials = slotAt(slots, "testimonials");
  const faq = slotAt(slots, "faq");
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");
  const businessName = text(footer.content, "businessName") || site.businessName || "Elektra";
  const customLogo = site.theme.logoUrl?.trim() || "";
  const contactEmail = site.contact?.email?.trim() || "";
  const heroImage = hero.image || HERO;
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" class="h-9 w-9 object-contain" />`
    : `<span class="grid h-9 w-9 place-items-center text-xs font-bold" style="background:${EL.brand};color:${EL.inverseFg};font-family:var(--el-display)">${esc(businessName.slice(0, 2).toUpperCase())}</span>`;

  const body = `<header class="sticky top-0 z-20 border-b backdrop-blur" style="border-color:${EL.line};background:${EL.bg}">
  <div class="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
    <a href="#el-top" class="mr-auto flex items-center gap-2">${mark}<span class="text-base font-semibold" style="font-family:var(--el-display)">${esc(businessName)}</span></a>
    <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#el-end"}" class="px-4 py-2 text-sm font-semibold" style="background:${EL.brand};color:${EL.inverseFg};border-radius:12px">${esc(text(hero.content, "ctaPrimary", "Reserve yours"))}</a>
  </div>
</header>\n<section class="px-6 py-20" style="${sectionBandCss(hero.theme)}">
  <div class="mx-auto max-w-6xl">
    <p class="text-xs uppercase tracking-[0.2em]" style="color:${EL.brand}">${esc(text(hero.content, "eyebrow", "Elektra"))}</p>
    <h1 class="mt-4 max-w-4xl text-5xl leading-[1.05]" style="font-family:var(--el-display)">${esc(text(hero.content, "headline", "The quiet power of going further"))}</h1>
    <p class="mt-5 max-w-xl text-lg" style="color:${EL.body}">${esc(text(hero.content, "subheadline", "Precision-built electric vehicles with range, charge speed, and cabin calm as the brief."))}</p>
    <img src="${esc(heroImage)}" alt="" class="mt-10 h-[28rem] w-full object-cover" style="border-radius:12px" />
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto max-w-3xl">
    <h2 class="text-3xl" style="font-family:var(--el-display)">${esc(text(about.content, "heading", "About"))}</h2>
    <p class="mt-4" style="color:${EL.body}">${esc(text(about.content, "body", text(about.content, "subheadline", "Electric vehicles engineered for the long road ahead.")))}</p>
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(services.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(services.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${EL.surface};border-radius:12px"><h3 class="text-xl" style="font-family:var(--el-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${EL.body}">${esc(list(services.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(work.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(work.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${EL.surface};border-radius:12px"><h3 class="text-xl" style="font-family:var(--el-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${EL.body}">${esc(list(work.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(testimonials.content, "quotes").map((quote, i) => `<blockquote class="p-6" style="background:${EL.surface};border-radius:12px">${esc(quote)}<footer class="mt-3 text-sm" style="color:${EL.body}">${esc(list(testimonials.content, "authors")[i] || "")}</footer></blockquote>`).join("")}
  </div>
</section>\n<section class="px-6 py-12"><div class="mx-auto max-w-3xl">${list(faq.content, "questions").map((q, i) => `<details class="border-b py-4" style="border-color:${EL.line}"><summary>${esc(q)}</summary><p class="mt-2 text-sm" style="color:${EL.body}">${esc(list(faq.content, "answers")[i] || "")}</p></details>`).join("")}</div></section>\n<section class="px-6 py-20 text-center">
  <h2 class="text-4xl" style="font-family:var(--el-display)">${esc(text(cta.content, "headline", "Ready"))}</h2>
  <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#el-end"}" class="mt-8 inline-flex px-8 py-3 font-semibold" style="background:${EL.brand};color:${EL.inverseFg};border-radius:12px">${esc(text(cta.content, "ctaPrimary", "Reserve yours"))}</a>
</section>\n<footer id="el-end" class="border-t px-6 py-12" style="border-color:${EL.line};background:${EL.inverse};color:${EL.inverseFg};${sectionBandCss(footer.theme)}">
  <div class="mx-auto max-w-6xl">
    <div class="text-lg font-semibold" style="font-family:var(--el-display)">${esc(businessName)}</div>
    <p class="mt-2 text-sm opacity-70">${esc(text(footer.content, "tagline", "Midnight EV showroom: charcoal canvas, electric blue, precision type."))}</p>
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
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --el-display: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; --el-body: 'Inter', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#3B82F6")} ${themeFontCss(site.theme, ["--el-display","--el-body"])} }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      color: ${EL.ink};
      background: ${EL.bg};
      -webkit-font-smoothing: antialiased;
    }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body id="el-top">
${body}
</body>
</html>`;
}
