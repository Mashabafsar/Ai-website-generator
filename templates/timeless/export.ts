import type { AssembledSite } from "@/lib/blueprint/types";
import { TI } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandCss, sectionBandCss } from "../shared/brand";
import { themeFontBodyCss, themeFontCss, themeFontHref } from "../shared/fonts";
import { contactFormHtml, contactFormScript } from "../shared/contact-form-html";

function esc(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const HERO = "/templates/timeless/hero.jpg";

export function renderTimelessPage(site: AssembledSite): string {
  const slots = toSlots(null, site);
  const hero = slotAt(slots, "hero");
  const features = slotAt(slots, "features");
  const work = slotAt(slots, "portfolio");
  const process = slotAt(slots, "process");
  const testimonials = slotAt(slots, "testimonials");
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");
  const businessName = text(footer.content, "businessName") || site.businessName || "Timeless";
  const customLogo = site.theme.logoUrl?.trim() || "";
  const contactEmail = site.contact?.email?.trim() || "";
  const heroImage = hero.image || HERO;
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" class="h-9 w-9 object-contain" />`
    : `<span class="grid h-9 w-9 place-items-center text-xs font-bold" style="background:${TI.brand};color:${TI.inverseFg};font-family:var(--ti-display)">${esc(businessName.slice(0, 2).toUpperCase())}</span>`;

  const body = `<header class="sticky top-0 z-20 border-b backdrop-blur" style="border-color:${TI.line};background:${TI.bg}">
  <div class="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
    <a href="#ti-top" class="mr-auto flex items-center gap-2">${mark}<span class="text-base font-semibold" style="font-family:var(--ti-display)">${esc(businessName)}</span></a>
    <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#ti-end"}" class="px-4 py-2 text-sm font-semibold" style="background:${TI.brand};color:${TI.inverseFg};border-radius:12px">${esc(text(hero.content, "ctaPrimary", "See cases"))}</a>
  </div>
</header>\n<section class="px-6 py-20" style="${sectionBandCss(hero.theme)}">
  <div class="mx-auto max-w-6xl">
    <p class="text-xs uppercase tracking-[0.2em]" style="color:${TI.brand}">${esc(text(hero.content, "eyebrow", "Timeless"))}</p>
    <h1 class="mt-4 max-w-4xl text-5xl leading-[1.05]" style="font-family:var(--ti-display)">${esc(text(hero.content, "headline", "Work that still looks right in ten years"))}</h1>
    <p class="mt-5 max-w-xl text-lg" style="color:${TI.body}">${esc(text(hero.content, "subheadline", "Brand, film, and digital for houses that refuse seasonal thinking."))}</p>
    <img src="${esc(heroImage)}" alt="" class="mt-10 h-[28rem] w-full object-cover" style="border-radius:12px" />
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(features.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(features.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${TI.surface};border-radius:12px"><h3 class="text-xl" style="font-family:var(--ti-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${TI.body}">${esc(list(features.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(work.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(work.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${TI.surface};border-radius:12px"><h3 class="text-xl" style="font-family:var(--ti-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${TI.body}">${esc(list(work.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(process.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(process.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${TI.surface};border-radius:12px"><h3 class="text-xl" style="font-family:var(--ti-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${TI.body}">${esc(list(process.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(testimonials.content, "quotes").map((quote, i) => `<blockquote class="p-6" style="background:${TI.surface};border-radius:12px">${esc(quote)}<footer class="mt-3 text-sm" style="color:${TI.body}">${esc(list(testimonials.content, "authors")[i] || "")}</footer></blockquote>`).join("")}
  </div>
</section>\n<section class="px-6 py-20 text-center">
  <h2 class="text-4xl" style="font-family:var(--ti-display)">${esc(text(cta.content, "headline", "Ready"))}</h2>
  <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#ti-end"}" class="mt-8 inline-flex px-8 py-3 font-semibold" style="background:${TI.brand};color:${TI.inverseFg};border-radius:12px">${esc(text(cta.content, "ctaPrimary", "See cases"))}</a>
</section>\n<section class="px-6 py-16" data-template-contact-section="1">
  <div class="mx-auto max-w-6xl">
    <h2 class="text-2xl font-semibold">Contact</h2>
    ${contactFormHtml({ contactEmail })}
  </div>
</section>\n<footer id="ti-end" class="border-t px-6 py-12" style="border-color:${TI.line};background:${TI.inverse};color:${TI.inverseFg};${sectionBandCss(footer.theme)}">
  <div class="mx-auto max-w-6xl">
    <div class="text-lg font-semibold" style="font-family:var(--ti-display)">${esc(businessName)}</div>
    <p class="mt-2 text-sm opacity-70">${esc(text(footer.content, "tagline", "Creative-agency home with cool mist surfaces and a long-form case grid."))}</p>
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
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=block" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --ti-display: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif; --ti-body: 'Inter', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#0885FF")} ${themeFontCss(site.theme, ["--ti-display","--ti-body"])} }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      color: ${TI.ink};
      background: ${TI.bg};
      -webkit-font-smoothing: antialiased;
    }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body id="ti-top">
${body}
${contactFormScript()}
</body>
</html>`;
}
