import type { AssembledSite } from "@/lib/blueprint/types";
import { AS } from "./tokens";
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

const HERO = "/templates/astra/hero.jpg";

export function renderAstraPage(site: AssembledSite): string {
  const slots = toSlots(null, site);
  const hero = slotAt(slots, "hero");
  const services = slotAt(slots, "services");
  const about = slotAt(slots, "about");
  const stats = slotAt(slots, "features");
  const testimonials = slotAt(slots, "testimonials");
  const faq = slotAt(slots, "faq");
  const cta = slotAt(slots, "cta");
  const contact = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");
  const businessName = text(footer.content, "businessName") || site.businessName || "Astra Dental";
  const customLogo = site.theme.logoUrl?.trim() || "";
  const contactEmail = site.contact?.email?.trim() || "";
  const heroImage = hero.image || HERO;
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" class="h-9 w-9 object-contain" />`
    : `<span class="grid h-9 w-9 place-items-center text-xs font-bold" style="background:${AS.brand};color:${AS.inverseFg};font-family:var(--as-display)">${esc(businessName.slice(0, 2).toUpperCase())}</span>`;

  const body = `<header class="sticky top-0 z-20 border-b backdrop-blur" style="border-color:${AS.line};background:${AS.bg}">
  <div class="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
    <a href="#as-top" class="mr-auto flex items-center gap-2">${mark}<span class="text-base font-semibold" style="font-family:var(--as-display)">${esc(businessName)}</span></a>
    <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#as-end"}" class="px-4 py-2 text-sm font-semibold" style="background:${AS.brand};color:${AS.inverseFg};border-radius:999px">${esc(text(hero.content, "ctaPrimary", "Book a visit"))}</a>
  </div>
</header>\n<section class="px-6 py-20" style="${sectionBandCss(hero.theme)}">
  <div class="mx-auto max-w-6xl">
    <p class="text-xs uppercase tracking-[0.2em]" style="color:${AS.brand}">${esc(text(hero.content, "eyebrow", "Astra Dental"))}</p>
    <h1 class="mt-4 max-w-4xl text-5xl leading-[1.05]" style="font-family:var(--as-display)">${esc(text(hero.content, "headline", "Confident smiles, thoughtfully cared for"))}</h1>
    <p class="mt-5 max-w-xl text-lg" style="color:${AS.body}">${esc(text(hero.content, "subheadline", "Preventive, cosmetic, and restorative dentistry in a studio that feels unhurried."))}</p>
    <img src="${esc(heroImage)}" alt="" class="mt-10 h-[28rem] w-full object-cover" style="border-radius:999px" />
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(services.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(services.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${AS.surface};border-radius:999px"><h3 class="text-xl" style="font-family:var(--as-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${AS.body}">${esc(list(services.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto max-w-3xl">
    <h2 class="text-3xl" style="font-family:var(--as-display)">${esc(text(about.content, "heading", "About"))}</h2>
    <p class="mt-4" style="color:${AS.body}">${esc(text(about.content, "body", text(about.content, "subheadline", "Family and cosmetic dentistry with a calm, contemporary chairside manner.")))}</p>
  </div>
</section>\n<section class="px-6 py-16" style="${sectionBandCss(stats.theme)}">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(stats.content, "itemTitles", ["One","Two","Three"]).map((title, i) => `<article class="p-6" style="background:${AS.surface};border-radius:999px"><h3 class="text-xl" style="font-family:var(--as-display)">${esc(title)}</h3><p class="mt-2 text-sm" style="color:${AS.body}">${esc(list(stats.content, "itemBodies")[i] || "")}</p></article>`).join("")}
  </div>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
    ${list(testimonials.content, "quotes").map((quote, i) => `<blockquote class="p-6" style="background:${AS.surface};border-radius:999px">${esc(quote)}<footer class="mt-3 text-sm" style="color:${AS.body}">${esc(list(testimonials.content, "authors")[i] || "")}</footer></blockquote>`).join("")}
  </div>
</section>\n<section class="px-6 py-12"><div class="mx-auto max-w-3xl">${list(faq.content, "questions").map((q, i) => `<details class="border-b py-4" style="border-color:${AS.line}"><summary>${esc(q)}</summary><p class="mt-2 text-sm" style="color:${AS.body}">${esc(list(faq.content, "answers")[i] || "")}</p></details>`).join("")}</div></section>\n<section class="px-6 py-20 text-center">
  <h2 class="text-4xl" style="font-family:var(--as-display)">${esc(text(cta.content, "headline", "Ready"))}</h2>
  <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#as-end"}" class="mt-8 inline-flex px-8 py-3 font-semibold" style="background:${AS.brand};color:${AS.inverseFg};border-radius:999px">${esc(text(cta.content, "ctaPrimary", "Book a visit"))}</a>
</section>\n<section class="px-6 py-16">
  <div class="mx-auto max-w-6xl">
    <h2 class="text-2xl" style="font-family:var(--as-display)">${esc(text(contact.content, "heading", "Contact"))}</h2>
    <p class="mt-3" style="color:${AS.body}">${esc(text(contact.content, "subheading", ""))}</p>
    ${contactFormHtml({ contactEmail })}
  </div>
</section>\n<footer id="as-end" class="border-t px-6 py-12" style="border-color:${AS.line};background:${AS.inverse};color:${AS.inverseFg};${sectionBandCss(footer.theme)}">
  <div class="mx-auto max-w-6xl">
    <div class="text-lg font-semibold" style="font-family:var(--as-display)">${esc(businessName)}</div>
    <p class="mt-2 text-sm opacity-70">${esc(text(footer.content, "tagline", "Calm clinical blue, serif headlines, built for modern dental practices."))}</p>
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
  <link href="https://fonts.googleapis.com/css2?family=Ovo&family=Inter:wght@400;500;600;700&display=block" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --as-display: 'Ovo', ui-sans-serif, system-ui, sans-serif; --as-body: 'Inter', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#3B6BFF")} ${themeFontCss(site.theme, ["--as-display","--as-body"])} }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      color: ${AS.ink};
      background: ${AS.bg};
      -webkit-font-smoothing: antialiased;
    }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body id="as-top">
${body}
${contactFormScript()}
</body>
</html>`;
}
