import type { AssembledSite } from "@/lib/blueprint/types";
import { AP } from "./tokens";
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

const HERO = "/templates/atelierpf/hero.jpg";

export function renderAtelierpfPage(site: AssembledSite): string {
  const slots = toSlots(null, site);
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const work = slotAt(slots, "portfolio");
  const testimonials = slotAt(slots, "testimonials");
  const contact = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");
  const businessName = text(footer.content, "businessName") || site.businessName || "Atelier";
  const customLogo = site.theme.logoUrl?.trim() || "";
  const contactEmail = site.contact?.email?.trim() || "";
  const heroImage = hero.image || HERO;
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" class="h-9 w-9 object-contain" />`
    : `<span class="grid h-9 w-9 place-items-center text-xs font-bold" style="background:${AP.brand};color:${AP.inverseFg};font-family:var(--ap-display)">${esc(businessName.slice(0, 2).toUpperCase())}</span>`;

  const body = `<header class="sticky top-0 z-20 border-b backdrop-blur" style="border-color:${AP.line};background:${AP.bg}">
  <div class="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
    <a href="#ap-top" class="mr-auto flex items-center gap-2">${mark}<span class="text-base font-semibold" style="font-family:var(--ap-display)">${esc(businessName)}</span></a>
    <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#ap-end"}" class="px-4 py-2 text-sm font-semibold" style="background:${AP.brand};color:${AP.inverseFg};border-radius:12px">${esc(text(hero.content, "ctaPrimary", "Open cases"))}</a>
  </div>
</header>\n<section class="px-6 py-20" style="${sectionBandCss(hero.theme)}">
  <div class="mx-auto max-w-6xl">
    <p class="text-xs uppercase tracking-[0.2em]" style="color:${AP.brand}">${esc(text(hero.content, "eyebrow", "Atelier"))}</p>
    <h1 class="mt-4 max-w-4xl text-5xl leading-[1.05]" style="font-family:var(--ap-display)">${esc(text(hero.content, "headline", "The work is the introduction"))}</h1>
    <p class="mt-5 max-w-xl text-lg" style="color:${AP.body}">${esc(text(hero.content, "subheadline", "Case studies, process, and a quiet about — nothing extra."))}</p>
    <img src="${esc(heroImage)}" alt="" class="mt-10 h-[28rem] w-full object-cover" style="border-radius:12px" />
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto max-w-3xl">
    <h2 class="text-3xl" style="font-family:var(--ap-display)">${esc(text(about.content, "heading", "About"))}</h2>
    <p class="mt-4" style="color:${AP.body}">${esc(text(about.content, "body", text(about.content, "subheadline", "A portfolio system for designers who lead with the work.")))}</p>
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(services.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(services.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${AP.surface};border-radius:12px"><h3 class="text-xl" style="font-family:var(--ap-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${AP.body}">${esc(list(services.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(work.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(work.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${AP.surface};border-radius:12px"><h3 class="text-xl" style="font-family:var(--ap-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${AP.body}">${esc(list(work.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(testimonials.content, "quotes").map((quote, i) => `<blockquote class="p-6" style="background:${AP.surface};border-radius:12px">${esc(quote)}<footer class="mt-3 text-sm" style="color:${AP.body}">${esc(list(testimonials.content, "authors")[i] || "")}</footer></blockquote>`).join("")}
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto max-w-6xl">
    <h2 class="text-2xl" style="font-family:var(--ap-display)">${esc(text(contact.content, "heading", "Contact"))}</h2>
    <p class="mt-3" style="color:${AP.body}">${esc(text(contact.content, "subheading", ""))}</p>
    ${contactFormHtml({ contactEmail })}
  </div>
</section>\n<footer id="ap-end" class="border-t px-6 py-12" style="border-color:${AP.line};background:${AP.inverse};color:${AP.inverseFg};${sectionBandCss(footer.theme)}">
  <div class="mx-auto max-w-6xl">
    <div class="text-lg font-semibold" style="font-family:var(--ap-display)">${esc(businessName)}</div>
    <p class="mt-2 text-sm opacity-70">${esc(text(footer.content, "tagline", "UI-kit portfolio: graphite type on cool gray, work-first grid."))}</p>
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
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&family=Inter:wght@400;500;600&display=block" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --ap-display: 'Manrope', ui-sans-serif, system-ui, sans-serif; --ap-body: 'Inter', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#222420")} ${themeFontCss(site.theme, ["--ap-display","--ap-body"])} }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      color: ${AP.ink};
      background: ${AP.bg};
      -webkit-font-smoothing: antialiased;
    }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body id="ap-top">
${body}
${contactFormScript()}
</body>
</html>`;
}
