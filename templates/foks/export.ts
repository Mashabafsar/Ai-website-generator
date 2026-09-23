import type { AssembledSite } from "@/lib/blueprint/types";
import { FK } from "./tokens";
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

const HERO = "/templates/foks/hero.jpg";

export function renderFoksPage(site: AssembledSite): string {
  const slots = toSlots(null, site);
  const hero = slotAt(slots, "hero");
  const features = slotAt(slots, "features");
  const about = slotAt(slots, "about");
  const testimonials = slotAt(slots, "testimonials");
  const faq = slotAt(slots, "faq");
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");
  const businessName = text(footer.content, "businessName") || site.businessName || "Foks";
  const customLogo = site.theme.logoUrl?.trim() || "";
  const contactEmail = site.contact?.email?.trim() || "";
  const heroImage = hero.image || HERO;
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" class="h-9 w-9 object-contain" />`
    : `<span class="grid h-9 w-9 place-items-center text-xs font-bold" style="background:${FK.brand};color:${FK.inverseFg};font-family:var(--fk-display)">${esc(businessName.slice(0, 2).toUpperCase())}</span>`;

  const body = `<header class="sticky top-0 z-20 border-b backdrop-blur" style="border-color:${FK.line};background:${FK.bg}">
  <div class="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
    <a href="#fk-top" class="mr-auto flex items-center gap-2">${mark}<span class="text-base font-semibold" style="font-family:var(--fk-display)">${esc(businessName)}</span></a>
    <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#fk-end"}" class="px-4 py-2 text-sm font-semibold" style="background:${FK.brand};color:${FK.inverseFg};border-radius:12px">${esc(text(hero.content, "ctaPrimary", "Read the issue"))}</a>
  </div>
</header>\n<section class="px-6 py-20" style="${sectionBandCss(hero.theme)}">
  <div class="mx-auto max-w-6xl">
    <p class="text-xs uppercase tracking-[0.2em]" style="color:${FK.brand}">${esc(text(hero.content, "eyebrow", "Foks"))}</p>
    <h1 class="mt-4 max-w-4xl text-5xl leading-[1.05]" style="font-family:var(--fk-display)">${esc(text(hero.content, "headline", "Stories worth lingering over"))}</h1>
    <p class="mt-5 max-w-xl text-lg" style="color:${FK.body}">${esc(text(hero.content, "subheadline", "Essays, interviews, and visual features from independent culture."))}</p>
    <img src="${esc(heroImage)}" alt="" class="mt-10 h-[28rem] w-full object-cover" style="border-radius:12px" />
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(features.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(features.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${FK.surface};border-radius:12px"><h3 class="text-xl" style="font-family:var(--fk-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${FK.body}">${esc(list(features.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto max-w-3xl">
    <h2 class="text-3xl" style="font-family:var(--fk-display)">${esc(text(about.content, "heading", "About"))}</h2>
    <p class="mt-4" style="color:${FK.body}">${esc(text(about.content, "body", text(about.content, "subheadline", "A creative magazine for culture, craft, and the people making it.")))}</p>
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(testimonials.content, "quotes").map((quote, i) => `<blockquote class="p-6" style="background:${FK.surface};border-radius:12px">${esc(quote)}<footer class="mt-3 text-sm" style="color:${FK.body}">${esc(list(testimonials.content, "authors")[i] || "")}</footer></blockquote>`).join("")}
  </div>
</section>\n<section class="px-6 py-12"><div class="mx-auto max-w-3xl">${list(faq.content, "questions").map((q, i) => `<details class="border-b py-4" style="border-color:${FK.line}"><summary>${esc(q)}</summary><p class="mt-2 text-sm" style="color:${FK.body}">${esc(list(faq.content, "answers")[i] || "")}</p></details>`).join("")}</div></section>\n<section class="px-6 py-20 text-center">
  <h2 class="text-4xl" style="font-family:var(--fk-display)">${esc(text(cta.content, "headline", "Ready"))}</h2>
  <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#fk-end"}" class="mt-8 inline-flex px-8 py-3 font-semibold" style="background:${FK.brand};color:${FK.inverseFg};border-radius:12px">${esc(text(cta.content, "ctaPrimary", "Read the issue"))}</a>
</section>\n<footer id="fk-end" class="border-t px-6 py-12" style="border-color:${FK.line};background:${FK.inverse};color:${FK.inverseFg};${sectionBandCss(footer.theme)}">
  <div class="mx-auto max-w-6xl">
    <div class="text-lg font-semibold" style="font-family:var(--fk-display)">${esc(businessName)}</div>
    <p class="mt-2 text-sm opacity-70">${esc(text(footer.content, "tagline", "Creative magazine masthead: Bricolage headlines, DM Sans body, editorial columns."))}</p>
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
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=DM+Sans:wght@400;500;700&display=block" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --fk-display: 'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif; --fk-body: 'DM Sans', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#171717")} ${themeFontCss(site.theme, ["--fk-display","--fk-body"])} }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
      color: ${FK.ink};
      background: ${FK.bg};
      -webkit-font-smoothing: antialiased;
    }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body id="fk-top">
${body}
</body>
</html>`;
}
