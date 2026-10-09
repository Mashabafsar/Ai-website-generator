import type { AssembledSite } from "@/lib/blueprint/types";
import { LU } from "./tokens";
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

const HERO = "/templates/lukasz/hero.jpg";

export function renderLukaszPage(site: AssembledSite): string {
  const slots = toSlots(null, site);
  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const work = slotAt(slots, "portfolio");
  const testimonials = slotAt(slots, "testimonials");
  const contact = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");
  const businessName = text(footer.content, "businessName") || site.businessName || "Lukasz";
  const customLogo = site.theme.logoUrl?.trim() || "";
  const contactEmail = site.contact?.email?.trim() || "";
  const heroImage = hero.image || HERO;
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" class="h-9 w-9 object-contain" />`
    : `<span class="grid h-9 w-9 place-items-center text-xs font-bold" style="background:${LU.brand};color:${LU.inverseFg};font-family:var(--lu-display)">${esc(businessName.slice(0, 2).toUpperCase())}</span>`;

  const body = `<header class="sticky top-0 z-20 border-b backdrop-blur" style="border-color:${LU.line};background:${LU.bg}">
  <div class="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
    <a href="#lu-top" class="mr-auto flex items-center gap-2">${mark}<span class="text-base font-semibold" style="font-family:var(--lu-display)">${esc(businessName)}</span></a>
    <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#lu-end"}" class="px-4 py-2 text-sm font-semibold" style="background:${LU.brand};color:${LU.inverseFg};border-radius:12px">${esc(text(hero.content, "ctaPrimary", "Get in touch"))}</a>
  </div>
</header>\n<section class="px-6 py-20" style="${sectionBandCss(hero.theme)}">
  <div class="mx-auto max-w-6xl">
    <p class="text-xs uppercase tracking-[0.2em]" style="color:${LU.brand}">${esc(text(hero.content, "eyebrow", "Lukasz"))}</p>
    <h1 class="mt-4 max-w-4xl text-5xl leading-[1.05]" style="font-family:var(--lu-display)">${esc(text(hero.content, "headline", "Pictures, then the words around them"))}</h1>
    <p class="mt-5 max-w-xl text-lg" style="color:${LU.body}">${esc(text(hero.content, "subheadline", "Direction, stills, and sites for people who already know their taste."))}</p>
    <img src="${esc(heroImage)}" alt="" class="mt-10 h-[28rem] w-full object-cover" style="border-radius:12px" />
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto max-w-3xl">
    <h2 class="text-3xl" style="font-family:var(--lu-display)">${esc(text(about.content, "heading", "About"))}</h2>
    <p class="mt-4" style="color:${LU.body}">${esc(text(about.content, "body", text(about.content, "subheadline", "A focused practice for image-led brands and editorial work.")))}</p>
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(services.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(services.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${LU.surface};border-radius:12px"><h3 class="text-xl" style="font-family:var(--lu-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${LU.body}">${esc(list(services.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(work.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(work.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${LU.surface};border-radius:12px"><h3 class="text-xl" style="font-family:var(--lu-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${LU.body}">${esc(list(work.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(testimonials.content, "quotes").map((quote, i) => `<blockquote class="p-6" style="background:${LU.surface};border-radius:12px">${esc(quote)}<footer class="mt-3 text-sm" style="color:${LU.body}">${esc(list(testimonials.content, "authors")[i] || "")}</footer></blockquote>`).join("")}
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto max-w-6xl">
    <h2 class="text-2xl" style="font-family:var(--lu-display)">${esc(text(contact.content, "heading", "Contact"))}</h2>
    <p class="mt-3" style="color:${LU.body}">${esc(text(contact.content, "subheading", ""))}</p>
    ${contactFormHtml({ contactEmail })}
  </div>
</section>\n<footer id="lu-end" class="border-t px-6 py-12" style="border-color:${LU.line};background:${LU.inverse};color:${LU.inverseFg};${sectionBandCss(footer.theme)}">
  <div class="mx-auto max-w-6xl">
    <div class="text-lg font-semibold" style="font-family:var(--lu-display)">${esc(businessName)}</div>
    <p class="mt-2 text-sm opacity-70">${esc(text(footer.content, "tagline", "Quiet personal studio: generous whitespace, project grid, conversational about."))}</p>
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
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600&display=block" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --lu-display: 'Instrument Serif', ui-sans-serif, system-ui, sans-serif; --lu-body: 'Inter', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#1A1A1A")} ${themeFontCss(site.theme, ["--lu-display","--lu-body"])} }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      color: ${LU.ink};
      background: ${LU.bg};
      -webkit-font-smoothing: antialiased;
    }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body id="lu-top">
${body}
${contactFormScript()}
</body>
</html>`;
}
