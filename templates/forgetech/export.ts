import { FT } from "./tokens";
import { iconSvg } from "@/lib/icons/registry";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandCss } from "../shared/brand";
import { themeFontBodyCss, themeFontCss, themeFontHref } from "../shared/fonts";
import type { AssembledSite } from "@/lib/blueprint/types";

// Static HTML twin of templates/forgetech/site.tsx. Exported
// and deployed sites must look like the design the customer chose, so the
// ForgeTech layout is mirrored here rather than falling back to the generic
// section renderer. Both read the same locked slots through the same helpers.

function esc(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const NAV = [
  { label: "Home", href: "#ft-top" },
  { label: "About Us", href: "#ft-about" },
  { label: "Our Services", href: "#ft-services" },
  { label: "Projects", href: "#ft-projects" },
  { label: "Insights", href: "#ft-articles" },
  { label: "Contact Us", href: "#ft-contact" },
];

const METRICS = [
  { value: "25+", label: "Years of industry experience" },
  { value: "100K+", label: "Units manufactured annually" },
  { value: "15+", label: "Key industries served worldwide" },
  { value: "90%", label: "On-time delivery rate" },
];

const FALLBACK = {
  hero: "/templates/forgetech/hero.jpg",
  about: "/templates/forgetech/about.jpg",
  project: "/templates/forgetech/project.jpg",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function eyebrow(label: string, onDark = false): string {
  const color = onDark ? "#FFB877" : FT.trinidad;
  return `<span class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]" style="color:${color};font-family:var(--ft-display)">
  <span class="h-px w-6" style="background:currentColor"></span>${esc(label)}
</span>`;
}

export function renderForgeTechPage(site: AssembledSite): string {
  const slots = toSlots(null, site);

  const hero = slotAt(slots, "hero");
  const capabilities = slotAt(slots, "features", 0);
  const about = slotAt(slots, "about");
  const services = slotAt(slots, "services");
  const value = slotAt(slots, "features", 1);
  const testimonials = slotAt(slots, "testimonials");
  const showcase = slotAt(slots, "portfolio");
  const faq = slotAt(slots, "faq");
  const articles = slotAt(slots, "features", 2);
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");

  const businessName =
    text(footer.content, "businessName") || site.businessName || "ForgeTech";
  const monogram = initials(businessName);
  // Only a logo the user actually uploaded replaces the template mark; the
  // auto-generated `site.logo` wordmark is never used here.
  const customLogo = site.theme.logoUrl?.trim() || "";
  const mark = customLogo
    ? `<img src="${esc(customLogo)}" alt="" class="h-10 w-10 object-contain" />`
    : `<span class="grid h-10 w-10 place-items-center text-sm font-bold text-white" style="background:${FT.trinidad};font-family:var(--ft-display)">${esc(monogram)}</span>`;

  const heroImage = hero.image || FALLBACK.hero;
  const aboutImage = about.image || FALLBACK.about;
  const showcaseImage = showcase.image || showcase.itemImages[0] || FALLBACK.project;

  const capabilityTitles = list(capabilities.content, "itemTitles", [
    "Buildings",
    "Civil infrastructure",
    "Multipurpose",
  ]);
  const capabilityBodies = list(capabilities.content, "itemBodies");

  const serviceTitles = list(services.content, "itemTitles", [
    "Custom fabrication",
    "Welding & assembly",
    "Installation",
    "Maintenance",
  ]);
  const serviceBodies = list(services.content, "itemBodies");

  const valueTitles = list(value.content, "itemTitles", [
    "Industry expertise",
    "Uncompromising quality",
    "Modern facilities",
  ]);
  const valueBodies = list(value.content, "itemBodies");

  const quotes = list(testimonials.content, "quotes");
  const authors = list(testimonials.content, "authors");
  const roles = list(testimonials.content, "roles");

  const showcaseTitles = list(showcase.content, "itemTitles");
  const showcaseBodies = list(showcase.content, "itemBodies");

  const questions = list(faq.content, "questions");
  const answers = list(faq.content, "answers");

  const articleTitles = list(articles.content, "itemTitles");
  const articleBodies = list(articles.content, "itemBodies");

  const footerLinks = list(
    footer.content,
    "linkLabels",
    NAV.map((n) => n.label)
  );
  const contactEmail = site.contact?.email?.trim() || "";
  const contactPhone = site.contact?.phone?.trim() || "";

  const contactMeta = (label: string, value: string) => `<div>
      <div class="text-xs uppercase tracking-wider" style="color:${FT.muted}">${esc(label)}</div>
      <div class="font-semibold">${esc(value)}</div>
    </div>`;

  const body = `
<div class="px-4 py-2.5 text-center text-[13px] leading-snug text-white sm:text-sm" style="background:${FT.trinidadInk}">
  <strong class="font-semibold" style="font-family:var(--ft-display)">Now booking next quarter.</strong>
  Talk to ${esc(businessName)} about your project schedule today.
</div>

<div class="border-b px-4 py-3.5 md:px-8" style="border-color:${FT.line}">
  <div class="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-8 gap-y-3">
    <a href="#ft-top" class="flex items-center gap-3">
      ${mark}
      <span class="text-lg font-bold tracking-tight sm:text-xl" style="font-family:var(--ft-display)">${esc(businessName)}</span>
    </a>
    <div class="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
      ${contactEmail ? contactMeta("Email us", contactEmail) : ""}
      ${contactPhone ? contactMeta("Call us", contactPhone) : ""}
      ${contactMeta("Working hours", "Mon – Fri · 8am – 7pm")}
    </div>
  </div>
</div>

<div class="border-b px-4 md:px-8" style="border-color:${FT.line}">
  <div class="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 py-3">
    <nav class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
      ${NAV.map(
        (item) =>
          `<a href="${item.href}" class="ft-nav" style="color:${FT.body}">${esc(item.label)}</a>`
      ).join("\n      ")}
    </nav>
    <a href="#ft-contact" class="shrink-0 px-5 py-3 text-sm font-semibold text-white" style="background:${FT.trinidad};font-family:var(--ft-display)">Get a quote</a>
  </div>
</div>

<section class="relative flex min-h-[520px] items-center bg-cover bg-center px-4 py-24 md:min-h-[640px] md:px-8" style="background-color:${FT.woodsmoke};background-image:linear-gradient(90deg,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.55) 45%,rgba(0,0,0,0.15) 100%),url('${esc(heroImage)}')">
  <div class="mx-auto w-full max-w-[1400px]">
    <div class="max-w-2xl text-white">
      ${eyebrow(text(hero.content, "eyebrow", "Industrial fabrication"), true)}
      <h1 class="mt-4 text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[4rem]" style="font-family:var(--ft-display)">${esc(
        text(hero.content, "headline", "Mastering the art of industrial fabrication")
      )}</h1>
      <p class="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">${esc(
        text(
          hero.content,
          "subheadline",
          "Precision engineering and on-time delivery for demanding projects."
        )
      )}</p>
      <div class="mt-9 flex flex-wrap gap-3">
        <a href="#ft-services" class="px-7 py-3.5 text-sm font-semibold text-white" style="background:${FT.trinidad};font-family:var(--ft-display)">${esc(
          text(hero.content, "ctaPrimary", "Explore services")
        )}</a>
        <a href="#ft-projects" class="border border-white/70 px-7 py-3.5 text-sm font-semibold text-white" style="font-family:var(--ft-display)">See our work</a>
      </div>
    </div>
  </div>
</section>

<section class="px-4 py-20 md:px-8 md:py-28">
  <div class="mx-auto max-w-[1400px]">
    <div class="max-w-3xl">
      ${eyebrow("What we build")}
      <h2 class="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]" style="font-family:var(--ft-display)">${esc(
        text(capabilities.content, "heading", "Core industries we serve")
      )}</h2>
    </div>
    <div class="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      ${capabilityTitles
        .map(
          (title, i) => `<div>
        <span class="grid h-14 w-14 place-items-center border-2 text-lg font-bold" style="border-color:${FT.trinidad};color:${FT.trinidad};font-family:var(--ft-display)">${
          iconSvg(capabilities.icons[i], {
            size: 28,
            color: FT.trinidad,
            strokeWidth: 1.8,
            className: "h-7 w-7",
          }) || String(i + 1).padStart(2, "0")
        }</span>
        <h3 class="mt-5 text-xl font-semibold" style="font-family:var(--ft-display)">${esc(title)}</h3>
        <p class="mt-3 leading-relaxed" style="color:${FT.body}">${esc(
          capabilityBodies[i] || "Purpose-built fabrication for demanding environments."
        )}</p>
      </div>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section id="ft-about" class="px-4 py-20 md:px-8 md:py-28" style="background:${FT.surface}">
  <div class="mx-auto max-w-[1400px]">
    <div class="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        ${eyebrow("About us")}
        <h2 class="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]" style="font-family:var(--ft-display)">${esc(
          text(
            about.content,
            "heading",
            "Transforming vision into reality through innovation and expertise"
          )
        )}</h2>
      </div>
      <div class="flex flex-col justify-center">
        <p class="text-base leading-relaxed md:text-lg" style="color:${FT.body}">${esc(
          text(about.content, "body", "We deliver industrial fabrication with precision.")
        )}</p>
        <a href="#ft-services" class="mt-8 inline-flex w-fit px-7 py-3.5 text-sm font-semibold text-white" style="background:${FT.trinidad};font-family:var(--ft-display)">What we do</a>
      </div>
    </div>
    <img src="${esc(aboutImage)}" alt="" class="mt-14 h-[260px] w-full object-cover sm:h-[380px] lg:h-[520px]" />
    <div class="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      ${METRICS.map(
        (metric) => `<div class="border-t-2 pt-5" style="border-color:${FT.trinidad}">
        <div class="text-4xl font-bold lg:text-5xl" style="font-family:var(--ft-display)">${esc(metric.value)}</div>
        <div class="mt-2 text-sm" style="color:${FT.body}">${esc(metric.label)}</div>
      </div>`
      ).join("\n      ")}
    </div>
  </div>
</section>

<section id="ft-services" class="px-4 py-20 md:px-8 md:py-28">
  <div class="mx-auto max-w-[1400px]">
    <div class="mx-auto max-w-3xl text-center">
      ${eyebrow("Our services")}
      <h2 class="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]" style="font-family:var(--ft-display)">${esc(
        text(services.content, "heading", "Crafting solutions to meet your unique challenges")
      )}</h2>
      <p class="mt-5 text-base leading-relaxed" style="color:${FT.body}">${esc(
        text(services.content, "subheading", "End-to-end delivery, built around your schedule.")
      )}</p>
    </div>
    <div class="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      ${serviceTitles
        .map((title, i) => {
          const image = services.itemImages[i];
          const art = image
            ? `background-image:url('${esc(image)}')`
            : `background-image:linear-gradient(140deg,${FT.trinidadWash} 0%,${FT.trinidadDeep} 100%)`;
          return `<article class="flex flex-col border bg-white" style="border-color:${FT.line}">
        <div class="h-44 bg-cover bg-center" style="background-color:${FT.trinidadWash};${art}"></div>
        <div class="flex flex-1 flex-col p-6">
          <h3 class="text-lg font-semibold" style="font-family:var(--ft-display)">${esc(title)}</h3>
          <p class="mt-3 flex-1 text-sm leading-relaxed" style="color:${FT.body}">${esc(
            serviceBodies[i] || "Professional delivery from shop drawing to final install."
          )}</p>
          <span class="mt-6 text-sm font-semibold" style="color:${FT.trinidad};font-family:var(--ft-display)">Learn more →</span>
        </div>
      </article>`;
        })
        .join("\n      ")}
    </div>
  </div>
</section>

<div class="border-y px-4 py-8 md:px-8" style="border-color:${FT.line};background:${FT.surface}">
  <div class="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-12 gap-y-4">
    <span class="text-xs font-semibold uppercase tracking-[0.2em]" style="color:${FT.muted}">Capabilities</span>
    ${serviceTitles
      .slice(0, 5)
      .map(
        (title) =>
          `<span class="text-base font-bold uppercase tracking-tight sm:text-lg" style="font-family:var(--ft-display);color:${FT.shark}66">${esc(title)}</span>`
      )
      .join("\n    ")}
  </div>
</div>

<section class="px-4 py-20 text-white md:px-8 md:py-28" style="background:${FT.woodsmoke}">
  <div class="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2 lg:gap-16">
    <div>
      ${eyebrow("Why choose us", true)}
      <h2 class="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]" style="font-family:var(--ft-display)">${esc(
        text(value.content, "heading", "Experience the difference in quality and service")
      )}</h2>
      <p class="mt-6 max-w-md leading-relaxed text-white/70">${esc(
        text(
          value.content,
          "subheading",
          "Every project is delivered by people who take the work personally."
        )
      )}</p>
      <a href="#ft-contact" class="mt-9 inline-flex border border-white/70 px-7 py-3.5 text-sm font-semibold" style="font-family:var(--ft-display)">Start a conversation</a>
    </div>
    <div class="space-y-4">
      ${valueTitles
        .map(
          (title, i) => `<div class="flex gap-5 border border-white/10 bg-white/[0.04] p-6">
        <span class="grid h-12 w-12 shrink-0 place-items-center text-sm font-bold text-white" style="background:${FT.trinidad};font-family:var(--ft-display)">${
          iconSvg(value.icons[i], {
            size: 24,
            color: "#ffffff",
            strokeWidth: 1.8,
            className: "h-6 w-6",
          }) || String(i + 1).padStart(2, "0")
        }</span>
        <div>
          <h3 class="text-lg font-semibold" style="font-family:var(--ft-display)">${esc(title)}</h3>
          <p class="mt-2 text-sm leading-relaxed text-white/70">${esc(
            valueBodies[i] || "Built for industrial excellence, start to finish."
          )}</p>
        </div>
      </div>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="px-4 py-20 md:px-8 md:py-28">
  <div class="mx-auto max-w-[1400px]">
    <div class="max-w-3xl">
      ${eyebrow("Testimonials")}
      <h2 class="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]" style="font-family:var(--ft-display)">${esc(
        text(testimonials.content, "heading", "What our clients say")
      )}</h2>
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-3">
      ${quotes
        .map(
          (quote, i) => `<blockquote class="flex flex-col border p-7" style="border-color:${FT.line};background:${FT.surface}">
        <span class="text-5xl leading-none" style="color:${FT.trinidad};font-family:var(--ft-display)" aria-hidden="true">&ldquo;</span>
        <p class="mt-3 flex-1 leading-relaxed" style="color:${FT.body}">${esc(quote)}</p>
        <footer class="mt-7 border-t pt-4" style="border-color:${FT.line}">
          <div class="font-semibold" style="font-family:var(--ft-display)">${esc(authors[i] || "Client")}</div>
          ${roles[i] ? `<div class="text-sm" style="color:${FT.muted}">${esc(roles[i])}</div>` : ""}
        </footer>
      </blockquote>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section id="ft-projects" class="relative bg-cover bg-center px-4 py-20 md:px-8 md:py-28" style="background-color:${FT.shark};background-image:linear-gradient(rgba(0,0,0,0.62),rgba(0,0,0,0.62)),url('${esc(showcaseImage)}')">
  <div class="mx-auto max-w-[1400px] text-white">
    ${eyebrow("Our projects", true)}
    <h2 class="mt-4 max-w-2xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]" style="font-family:var(--ft-display)">${esc(
      text(showcase.content, "heading", "Examples of our work across industries")
    )}</h2>
    <div class="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      ${showcaseTitles
        .map(
          (title, i) => `<article class="bg-black/45 p-7 backdrop-blur-sm">
        <span class="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white" style="background:${FT.trinidad}">${esc(
          roles[i] || "Case study"
        )}</span>
        <h3 class="mt-5 text-xl font-semibold" style="font-family:var(--ft-display)">${esc(title)}</h3>
        <p class="mt-3 text-sm leading-relaxed text-white/75">${esc(
          showcaseBodies[i] || "Delivered on schedule and to specification."
        )}</p>
      </article>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="px-4 py-20 md:px-8 md:py-28">
  <div class="mx-auto max-w-[1400px]">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
      <div>
        ${eyebrow("FAQs")}
        <h2 class="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3rem]" style="font-family:var(--ft-display)">${esc(
          text(faq.content, "heading", "Have questions? We have answers")
        )}</h2>
      </div>
      <div class="border-t" style="border-color:${FT.line}">
        ${questions
          .map(
            (question, i) => `<details ${i === 0 ? "open" : ""} class="group border-b" style="border-color:${FT.line}">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold sm:text-lg" style="font-family:var(--ft-display)">${esc(
            question
          )}<span class="shrink-0 text-2xl leading-none transition-transform group-open:rotate-45" style="color:${FT.trinidad}" aria-hidden="true">+</span></summary>
          <p class="pb-5 pr-10 leading-relaxed" style="color:${FT.body}">${esc(
            answers[i] || "Get in touch and we will walk you through the details."
          )}</p>
        </details>`
          )
          .join("\n        ")}
      </div>
    </div>
  </div>
</section>

${
  articleTitles.length > 0
    ? `<section id="ft-articles" class="px-4 py-20 md:px-8 md:py-28" style="background:${FT.surface}">
  <div class="mx-auto max-w-[1400px]">
    <div class="max-w-3xl">
      ${eyebrow("Insights")}
      <h2 class="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]" style="font-family:var(--ft-display)">${esc(
        text(articles.content, "heading", "Latest from the workshop")
      )}</h2>
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-3">
      ${articleTitles
        .slice(0, 3)
        .map((title, i) => {
          const image =
            articles.itemImages[i] || [FALLBACK.hero, FALLBACK.about, FALLBACK.project][i % 3];
          return `<article class="flex flex-col bg-white">
        <div class="h-48 bg-cover bg-center" style="background-image:url('${esc(image)}')"></div>
        <div class="flex flex-1 flex-col border border-t-0 p-6" style="border-color:${FT.line}">
          <h3 class="text-lg font-semibold leading-snug" style="font-family:var(--ft-display)">${esc(title)}</h3>
          <p class="mt-3 flex-1 text-sm leading-relaxed" style="color:${FT.body}">${esc(
            articleBodies[i] || ""
          )}</p>
          <span class="mt-6 text-sm font-semibold" style="color:${FT.trinidad};font-family:var(--ft-display)">Read article →</span>
        </div>
      </article>`;
        })
        .join("\n      ")}
    </div>
  </div>
</section>`
    : ""
}

<section id="ft-contact" class="px-4 py-20 text-center text-white md:px-8" style="background:${FT.trinidad}">
  <div class="mx-auto max-w-3xl">
    <h2 class="text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[3.25rem]" style="font-family:var(--ft-display)">${esc(
      text(cta.content, "headline", "Have a project in mind?")
    )}</h2>
    <p class="mx-auto mt-5 max-w-xl text-white/90">${esc(
      text(cta.content, "subheadline", "Tell us about the scope, schedule, and location.")
    )}</p>
    <a href="${contactEmail ? `mailto:${esc(contactEmail)}` : "#ft-top"}" class="mt-9 inline-flex bg-white px-8 py-4 text-sm font-semibold" style="color:${FT.trinidadInk};font-family:var(--ft-display)">${esc(
      text(cta.content, "ctaPrimary", "Contact us")
    )}</a>
    ${
      contactEmail || contactPhone
        ? `<p class="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-white/90">
      ${contactEmail ? `<a href="mailto:${esc(contactEmail)}" class="underline-offset-4 hover:underline">${esc(contactEmail)}</a>` : ""}
      ${contactPhone ? `<a href="tel:${esc(contactPhone)}" class="underline-offset-4 hover:underline">${esc(contactPhone)}</a>` : ""}
    </p>`
        : ""
    }
  </div>
</section>

<section class="px-4 py-16 md:px-8" style="background:${FT.shark}">
  <div class="mx-auto flex max-w-[1400px] flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
    <div class="max-w-lg text-white">
      <h3 class="text-2xl font-bold tracking-tight" style="font-family:var(--ft-display)">Stay in the loop</h3>
      <p class="mt-2 text-sm leading-relaxed text-white/65">Project updates, capability news, and practical guidance from the ${esc(
        businessName
      )} team. No noise.</p>
    </div>
    <div class="flex w-full max-w-md gap-3">
      <label class="sr-only" for="ft-newsletter">Email address</label>
      <input id="ft-newsletter" type="email" placeholder="you@company.com" class="min-w-0 flex-1 border border-white/20 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none" />
      <button type="button" class="shrink-0 px-6 py-3.5 text-sm font-semibold text-white" style="background:${FT.trinidad};font-family:var(--ft-display)">Subscribe</button>
    </div>
  </div>
</section>

<footer class="px-4 py-14 text-white md:px-8" style="background:${FT.woodsmoke}">
  <div class="mx-auto max-w-[1400px]">
    <div class="flex flex-wrap items-start justify-between gap-8">
      <div class="max-w-sm">
        <div class="flex items-center gap-3">
          ${mark}
          <span class="text-lg font-bold" style="font-family:var(--ft-display)">${esc(businessName)}</span>
        </div>
        <p class="mt-4 text-sm leading-relaxed text-white/60">${esc(
          text(footer.content, "tagline", "Industrial fabrication you can rely on.")
        )}</p>
      </div>
      <nav class="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
        ${footerLinks.map((label) => `<span>${esc(label)}</span>`).join("\n        ")}
      </nav>
    </div>
    <div class="mt-10 border-t border-white/10 pt-6 text-sm text-white/45">© ${new Date().getFullYear()} ${esc(
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
  <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root { --ft-display: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; ${brandCss(site.theme, "#FF750B")} ${themeFontCss(site.theme, ["--ft-display","--ft-body"])} }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Nunito Sans', ui-sans-serif, system-ui, sans-serif;
      color: ${FT.ink};
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
    .ft-nav { transition: color .2s ease; }
    .ft-nav:hover { color: ${FT.trinidad}; }
  ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body id="ft-top">
${body}
</body>
</html>`;
}
