import type {
  AssembledSite,
  AssembledSection,
  AssembledPage,
  StockImageReference,
} from "@/lib/blueprint/types";
import { renderBespokeSite, hasBespokeExport } from "@/templates/export-registry";
import { brandCss, sectionBandCss } from "@/templates/shared/brand";
import { resolveThemeFont, themeFontHref } from "@/templates/shared/fonts";
import { iconSvg } from "@/lib/icons/registry";
import { relativizeHtml } from "@/lib/export/relativize";

// Renders an AssembledSite to a set of static, hostable HTML files. Tailwind is
// loaded via the Play CDN and theme tokens are injected as CSS variables, so the
// output is a genuine, viewable website with no build step required.

function esc(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function arr(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

function img(p: Record<string, unknown>): StockImageReference | null {
  const image = p.image as StockImageReference | null | undefined;
  return image && typeof image.url === "string" ? image : null;
}

function iconNames(p: Record<string, unknown>): (string | null)[] {
  const list = p.icons;
  if (!Array.isArray(list)) return [];
  return list.map((name) => (typeof name === "string" ? name : null));
}

function itemImgs(p: Record<string, unknown>): (StockImageReference | null)[] {
  const list = p.itemImages;
  if (!Array.isArray(list)) return [];
  return list.map((entry) => {
    if (!entry || typeof entry !== "object") return null;
    const ref = entry as StockImageReference;
    return typeof ref.url === "string" ? ref : null;
  });
}

type P = Record<string, unknown>;

const NAV_TYPES: Array<{ type: string; label: string }> = [
  { type: "about", label: "About" },
  { type: "services", label: "Services" },
  { type: "products", label: "Products" },
  { type: "features", label: "Features" },
  { type: "portfolio", label: "Work" },
  { type: "pricing", label: "Pricing" },
  { type: "faq", label: "FAQ" },
  { type: "contact", label: "Contact" },
];

function renderSection(section: AssembledSection, site: AssembledSite): string {
  const p = section.props as P;
  switch (section.componentName) {
    case "HeroSplitWithImage": {
      const image = img(p);
      return `<section class="relative overflow-hidden px-6 py-24">
  <div class="pointer-events-none absolute inset-0 opacity-40" style="background:radial-gradient(ellipse 40% 60% at 80% 20%,color-mix(in oklab,var(--primary) 28%,transparent),transparent)"></div>
  <div class="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
    <div>
      ${p.eyebrow ? `<p class="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] opacity-70">${esc(p.eyebrow)}</p>` : ""}
      <h1 class="text-4xl font-bold tracking-tight md:text-6xl">${esc(p.headline)}</h1>
      <p class="mt-5 max-w-xl text-lg site-muted">${esc(p.subheadline)}</p>
      <div class="mt-8 flex flex-wrap gap-4">
        ${p.ctaPrimary ? `<a href="#contact" class="inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-white" style="background:var(--primary)">${esc(p.ctaPrimary)}</a>` : ""}
        ${p.ctaSecondary ? `<a href="#about" class="rounded-full border px-7 py-3.5 text-sm font-semibold">${esc(p.ctaSecondary)}</a>` : ""}
      </div>
    </div>
    ${image ? `<img src="${esc(image.url)}" alt="${esc(image.altText)}" class="h-[420px] w-full rounded-3xl object-cover shadow-2xl" />` : ""}
  </div>
</section>`;
    }
    case "HeroCentered":
      return `<section class="relative overflow-hidden px-6 py-28 text-center">
  <div class="pointer-events-none absolute inset-x-0 top-0 h-[70vh]" style="background:radial-gradient(ellipse 35% 70% at 50% -10%,color-mix(in oklab,var(--primary) 35%,transparent),transparent)"></div>
  <div class="relative mx-auto max-w-3xl">
    ${p.eyebrow ? `<p class="mx-auto mb-6 inline-flex rounded-full border site-card/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em]">${esc(p.eyebrow)}</p>` : ""}
    <h1 class="text-5xl font-bold tracking-tight md:text-7xl">${esc(p.headline)}</h1>
    <p class="mx-auto mt-6 max-w-2xl text-lg site-muted">${esc(p.subheadline)}</p>
    <div class="mt-10 flex justify-center gap-4">
      ${p.ctaPrimary ? `<a href="#contact" class="rounded-full px-8 py-3.5 text-sm font-semibold text-white" style="background:var(--primary)">${esc(p.ctaPrimary)}</a>` : ""}
      ${p.ctaSecondary ? `<a href="#about" class="rounded-full border px-8 py-3.5 text-sm font-semibold">${esc(p.ctaSecondary)}</a>` : ""}
    </div>
  </div>
</section>`;
    case "HeroBackgroundImage": {
      const image = img(p);
      return `<section class="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-6 text-center text-white">
  ${image ? `<img src="${esc(image.url)}" alt="${esc(image.altText)}" class="absolute inset-0 h-full w-full object-cover" />` : ""}
  <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(5,4,30,0.35),rgba(5,4,30,0.78))"></div>
  <div class="relative max-w-3xl">
    ${p.eyebrow ? `<p class="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">${esc(p.eyebrow)}</p>` : ""}
    <h1 class="text-5xl font-bold md:text-7xl">${esc(p.headline)}</h1>
    <p class="mx-auto mt-5 max-w-xl text-lg text-white/75">${esc(p.subheadline)}</p>
    ${p.ctaPrimary ? `<a href="#contact" class="mt-9 inline-flex rounded-full px-8 py-3.5 text-sm font-semibold text-white" style="background:var(--primary)">${esc(p.ctaPrimary)}</a>` : ""}
  </div>
</section>`;
    }
    case "AboutWithImage": {
      const image = img(p);
      return `<section class="mx-auto max-w-6xl px-6 py-24">
  <div class="mb-10 grid gap-5 md:grid-cols-2 md:items-end">
    <h2 class="text-4xl font-semibold tracking-tight md:text-5xl">${esc(p.heading)}</h2>
    <p class="text-lg site-muted">${esc(p.body)}</p>
  </div>
  <div class="grid gap-6 lg:grid-cols-3">
    ${image ? `<img src="${esc(image.url)}" alt="${esc(image.altText)}" class="max-h-[520px] w-full rounded-2xl object-cover lg:col-span-2" />` : ""}
    <div class="flex flex-col justify-between rounded-2xl p-7" style="background:var(--secondary)">
      <div class="mb-8 h-12 w-12 rounded-xl" style="background:var(--primary);opacity:.2"></div>
      <div>
        <p class="mb-2 text-lg font-semibold">${esc(p.heading)}</p>
        <p class="site-muted">${esc(p.body)}</p>
      </div>
    </div>
  </div>
</section>`;
    }
    case "AboutSimple":
      return `<section class="mx-auto max-w-3xl px-6 py-24 text-center">
  <h2 class="text-3xl font-semibold md:text-4xl">${esc(p.heading)}</h2>
  <p class="mx-auto mt-3 max-w-2xl site-muted">${esc(p.body)}</p>
</section>`;
    case "ServicesGrid":
    case "ProductsGrid":
    case "FeaturesGrid": {
      const titles = arr(p.itemTitles);
      const bodies = arr(p.itemBodies);
      const images = itemImgs(p);
      return `<section class="mx-auto max-w-5xl px-6 py-24">
  <div class="mb-14 text-center">
    <h2 class="text-4xl font-bold tracking-tight md:text-5xl">${esc(p.heading)}</h2>
    ${p.subheading ? `<p class="mt-3 text-lg site-muted">${esc(p.subheading)}</p>` : ""}
  </div>
  <div class="grid gap-6 sm:grid-cols-2 ${section.componentName === "FeaturesGrid" ? "lg:grid-cols-3" : ""}">
    ${titles
      .map((t, i) => {
        const image = images[i];
        return `<div class="rounded-3xl p-6" style="background:var(--secondary)">
      ${
        image
          ? `<img src="${esc(image.url)}" alt="${esc(image.altText || t)}" class="mb-4 h-40 w-full rounded-xl object-cover" />`
          : `<div class="mb-4 h-10 w-10 rounded-lg" style="background:var(--primary);opacity:.2"></div>`
      }
      <h3 class="text-lg font-medium">${esc(t)}</h3>
      <p class="mt-1 text-sm site-muted">${esc(bodies[i] ?? "")}</p>
    </div>`;
      })
      .join("\n")}
  </div>
</section>`;
    }
    case "ServicesCards": {
      const titles = arr(p.itemTitles);
      const bodies = arr(p.itemBodies);
      const images = itemImgs(p);
      const glyphs = iconNames(p);
      return `<section class="px-6 py-24">
  <div class="mx-auto max-w-6xl">
    <h2 class="max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">${esc(p.heading)}</h2>
    ${p.subheading ? `<p class="mt-4 max-w-xl text-lg site-muted">${esc(p.subheading)}</p>` : ""}
    <div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      ${titles
        .map((t, i) => {
          const image = images[i];
          const glyph = iconSvg(glyphs[i], { size: 20, color: "var(--primary)", className: "mt-1 shrink-0" });
          return `<div class="flex flex-col gap-3">
        ${image ? `<img src="${esc(image.url)}" alt="${esc(image.altText || t)}" class="h-36 w-full rounded-xl object-cover" />` : ""}
        <div class="flex gap-4">
          ${glyph || `<span class="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white" style="background:var(--primary)">✓</span>`}
          <div>
            <p class="font-medium">${esc(t)}</p>
            <p class="mt-1 text-sm site-muted">${esc(bodies[i] ?? "")}</p>
          </div>
        </div>
      </div>`;
        })
        .join("\n")}
    </div>
  </div>
</section>`;
    }
    case "PortfolioCaseStudies": {
      const titles = arr(p.itemTitles);
      const bodies = arr(p.itemBodies);
      const authors = arr(p.authors);
      const roles = arr(p.roles);
      const metrics = arr(p.metrics);
      const images = itemImgs(p);
      return `<section class="px-6 py-24">
  <div class="mx-auto max-w-6xl">
    <div class="mx-auto mb-16 max-w-2xl text-center">
      <h2 class="text-4xl font-semibold md:text-5xl">${esc(p.heading)}</h2>
      ${p.subheading ? `<p class="mt-4 site-muted">${esc(p.subheading)}</p>` : ""}
    </div>
    <div class="flex flex-col gap-20">
      ${titles
        .map((t, i) => {
          const m = (metrics[i] ?? "40%|Impact|95%|Satisfaction").split("|");
          const image = images[i];
          return `<div class="grid items-center gap-12 border-b pb-12 lg:grid-cols-3">
        <div class="lg:col-span-2 ${i % 2 === 1 ? "lg:order-2" : ""}">
          ${image ? `<img src="${esc(image.url)}" alt="${esc(image.altText || t)}" class="mb-4 max-w-xs rounded-2xl object-cover" />` : ""}
          <h3 class="text-xl font-medium">${esc(t)}</h3>
          <p class="mt-2 site-muted">${esc(bodies[i] ?? "")}</p>
          <p class="mt-6 font-medium">${esc(authors[i] ?? "")}<span class="block text-sm font-normal site-muted">${esc(roles[i] ?? "")}</span></p>
        </div>
        <div class="grid gap-8 ${i % 2 === 1 ? "lg:order-1" : ""}">
          <div><p class="text-3xl font-medium">${esc(m[0] ?? "")}</p><p>${esc(m[1] ?? "")}</p></div>
          <div><p class="text-3xl font-medium">${esc(m[2] ?? "")}</p><p>${esc(m[3] ?? "")}</p></div>
        </div>
      </div>`;
        })
        .join("\n")}
    </div>
  </div>
</section>`;
    }
    case "ProcessSteps": {
      const titles = arr(p.stepTitles);
      const bodies = arr(p.stepBodies);
      const glyphs = iconNames(p);
      return `<section class="mx-auto max-w-6xl px-6 py-24">
  <h2 class="mb-14 text-center text-4xl font-bold tracking-tight">${esc(p.heading)}</h2>
  <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
    ${titles
      .map((t, i) => {
        const glyph = iconSvg(glyphs[i], { size: 32, color: "var(--primary)", className: "mx-auto mb-4" });
        return `<div class="rounded-[25px] border site-card p-2 shadow-lg ${i % 2 === 0 ? "md:rotate-2" : "md:-rotate-2"}">
      ${glyph}
      <div class="rounded-[15px] border p-5" style="background:color-mix(in oklab,var(--primary) 10%,white);border-color:color-mix(in oklab,var(--primary) 20%,white)">
        <span class="mb-4 block text-4xl font-semibold" style="color:var(--primary)">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="text-xl font-semibold">${esc(t)}</h3>
        <p class="mt-2 text-sm site-muted">${esc(bodies[i] ?? "")}</p>
      </div>
    </div>`;
      })
      .join("\n")}
  </div>
</section>`;
    }
    case "TestimonialsGrid": {
      const quotes = arr(p.quotes);
      const authors = arr(p.authors);
      const roles = arr(p.roles);
      return `<section class="px-6 py-24">
  <div class="mx-auto max-w-6xl">
    <h2 class="mx-auto mb-14 max-w-2xl text-center text-4xl font-medium md:text-5xl">${esc(p.heading)}</h2>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      ${quotes
        .map(
          (q, i) => `<figure class="rounded-2xl border site-card p-6 shadow-sm ${i === 0 ? "sm:col-span-2" : ""}">
        <blockquote class="${i === 0 ? "text-xl font-medium" : ""} site-muted">“${esc(q)}”</blockquote>
        <figcaption class="mt-6 text-sm font-medium">${esc(authors[i] ?? "")}<span class="block font-normal site-muted">${esc(roles[i] ?? "")}</span></figcaption>
      </figure>`
        )
        .join("\n")}
    </div>
  </div>
</section>`;
    }
    case "FaqAccordion": {
      const questions = arr(p.questions);
      const answers = arr(p.answers);
      return `<section class="px-6 py-24" style="background:var(--secondary)">
  <div class="mx-auto max-w-5xl">
    <h2 class="text-4xl font-semibold tracking-tight">${esc(p.heading)}</h2>
    <div class="mt-10 overflow-hidden rounded-2xl border site-card px-8 shadow-sm">
      ${questions
        .map(
          (q, i) => `<details class="border-b border-dotted py-5 last:border-b-0">
        <summary class="cursor-pointer text-base font-medium">${esc(q)}</summary>
        <p class="mt-3 text-sm site-muted">${esc(answers[i] ?? "")}</p>
      </details>`
        )
        .join("\n")}
    </div>
  </div>
</section>`;
    }
    case "PricingTiers": {
      const names = arr(p.planNames);
      const prices = arr(p.planPrices);
      const features = arr(p.planFeatures);
      return `<section class="mx-auto max-w-6xl px-6 py-24">
  <div class="mb-12 text-center">
    <h2 class="text-4xl font-bold tracking-tight sm:text-5xl">${esc(p.heading)}</h2>
    ${p.subheading ? `<p class="mt-4 text-lg site-muted">${esc(p.subheading)}</p>` : ""}
  </div>
  <div class="grid gap-5 md:grid-cols-3">
    ${names
      .map((n, i) => {
        const popular = i === 1 || names.length === 1;
        return `<div class="relative flex flex-col rounded-2xl border site-card p-7 ${popular ? "border-2 shadow-xl md:-translate-y-3" : ""}" ${popular ? 'style="border-color:var(--primary)"' : ""}>
      ${popular ? `<span class="absolute right-0 top-0 rounded-bl-xl rounded-tr-xl px-3 py-1 text-xs font-semibold text-white" style="background:var(--primary)">Popular</span>` : ""}
      <p class="text-sm font-semibold site-muted">${esc(n)}</p>
      <div class="mt-4 text-5xl font-bold tracking-tight">${esc(prices[i] ?? "")}</div>
      <ul class="mt-6 space-y-2 text-sm">
        ${(features[i] ?? "")
          .split("\n")
          .filter(Boolean)
          .map((f) => `<li>✓ ${esc(f)}</li>`)
          .join("\n")}
      </ul>
      <a href="#contact" class="mt-8 inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold text-white" style="background:${popular ? "var(--primary)" : "#0f172a"}">Get started</a>
    </div>`;
      })
      .join("\n")}
  </div>
</section>`;
    }
    case "ContactSplit":
      return `<section id="contact" class="px-6 py-24">
  <div class="mx-auto max-w-6xl">
    <h2 class="text-4xl font-bold md:text-5xl">${esc(p.heading)}</h2>
    ${p.subheading ? `<p class="mt-3 max-w-xl text-base site-muted">${esc(p.subheading)}</p>` : ""}
    <div class="mt-12 grid border-y md:grid-cols-3">
      ${p.email ? `<div class="border-b p-5 md:border-b-0 md:border-r"><p class="mb-2 text-sm font-medium site-muted">Email</p><p class="font-mono text-sm font-medium">${esc(p.email)}</p></div>` : ""}
      ${p.phone ? `<div class="border-b p-5 md:border-b-0 md:border-r"><p class="mb-2 text-sm font-medium site-muted">Phone</p><p class="font-mono text-sm font-medium">${esc(p.phone)}</p></div>` : ""}
      ${p.address ? `<div class="p-5"><p class="mb-2 text-sm font-medium site-muted">Office</p><p class="font-mono text-sm font-medium">${esc(p.address)}</p></div>` : ""}
    </div>
    <form class="mt-10 grid gap-3 rounded-2xl border p-6 md:grid-cols-2">
      <input class="w-full rounded-lg border p-3" placeholder="Your name" />
      <input class="w-full rounded-lg border p-3" placeholder="Email" />
      <textarea class="w-full rounded-lg border p-3 md:col-span-2" rows="4" placeholder="Message"></textarea>
      <button type="button" class="rounded-lg px-6 py-3 font-medium text-white md:col-span-2" style="background:var(--primary)">${esc(p.ctaLabel || "Send message")}</button>
    </form>
  </div>
</section>`;
    case "ContactSimple":
      return `<section id="contact" class="mx-auto max-w-2xl px-6 py-24 text-center">
  <h2 class="text-4xl font-bold tracking-tight">${esc(p.heading)}</h2>
  ${p.subheading ? `<p class="mt-4 text-lg site-muted">${esc(p.subheading)}</p>` : ""}
  <div class="mt-8 space-y-1 text-lg font-medium">
    ${p.email ? `<p>${esc(p.email)}</p>` : ""}
    ${p.phone ? `<p>${esc(p.phone)}</p>` : ""}
  </div>
</section>`;
    case "CtaBanner":
      return `<section class="px-6 py-20">
  <div class="relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-8 py-14 text-center text-white md:px-16" style="background:linear-gradient(120deg,var(--primary),color-mix(in oklab,var(--accent) 70%,var(--primary)))">
    <h2 class="text-3xl font-extrabold tracking-tight md:text-5xl">${esc(p.headline)}</h2>
    ${p.subheadline ? `<p class="mx-auto mt-4 max-w-xl text-lg text-white/80">${esc(p.subheadline)}</p>` : ""}
    ${p.ctaPrimary ? `<a href="#contact" class="mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold" style="color:var(--primary)">${esc(p.ctaPrimary)}</a>` : ""}
  </div>
</section>`;
    case "FooterSimple": {
      const links = arr(p.linkLabels);
      const brand = str(p.businessName);
      const logo = (p.logo as { dataUrl?: string } | null)?.dataUrl || site.logo?.dataUrl || site.theme.logo?.dataUrl;
      const anchor = (label: string): string => {
        const key = label.toLowerCase();
        if (key.includes("home")) return "#top";
        const match = NAV_TYPES.find((n) => key.includes(n.type) || n.label.toLowerCase() === key);
        return match ? `#${match.type}` : "#top";
      };
      return `<footer class="site-section relative mt-10 overflow-hidden border-t">
  <div class="site-container relative text-center">
    ${logo ? `<img src="${esc(logo)}" alt="${esc(brand)} logo" class="mx-auto mb-4 h-12 w-auto max-w-[200px] object-contain" />` : ""}
    <div class="text-2xl font-bold">${esc(brand)}</div>
    ${p.tagline ? `<p class="mx-auto mt-2 max-w-sm text-sm opacity-60">${esc(p.tagline)}</p>` : ""}
    <nav class="mt-6 flex flex-wrap justify-center gap-3 text-sm font-medium opacity-70">
      ${links.map((l) => `<a class="site-btn" href="${anchor(l)}">${esc(l)}</a>`).join("\n")}
    </nav>
    <p class="mt-10 text-xs opacity-50">© ${new Date().getFullYear()} ${esc(brand)}. All rights reserved.</p>
  </div>
</footer>`;
    }
    default:
      return `<!-- Unsupported section: ${esc(section.componentName)} -->`;
  }
}

function renderNav(page: AssembledPage, site: AssembledSite): string {
  const presentTypes = new Set(page.sections.map((s) => s.type));
  const links = NAV_TYPES.filter((n) => presentTypes.has(n.type))
    .map(
      (n) =>
        `<a href="#${n.type}" class="site-btn rounded-md px-2 py-1 site-muted transition hover:text-[var(--primary)]">${esc(n.label)}</a>`
    )
    .join("\n");
  const brand = site.businessName || site.seo.title.split("|")[0].trim();
  const logo = site.logo?.dataUrl || site.theme.logo?.dataUrl;
  const logoHtml = logo
    ? `<img src="${esc(logo)}" alt="${esc(brand)} logo" class="h-9 w-auto max-w-[160px] object-contain" />`
    : `<span class="text-lg font-bold" style="color:var(--primary)">${esc(brand)}</span>`;
  return `<header class="sticky top-0 z-50 border-b bg-[var(--theme-bg,#ffffff)]/90 backdrop-blur-md">
  <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
    <a href="#top" class="site-btn shrink-0">${logoHtml}</a>
    <nav class="hidden items-center gap-4 text-sm font-medium md:flex lg:gap-6">${links}</nav>
    <a href="#contact" class="site-btn hidden rounded-full px-4 py-2 text-xs font-semibold text-white sm:inline-flex" style="background:var(--primary)">Contact</a>
  </div>
</header>`;
}

function renderPage(page: AssembledPage, site: AssembledSite): string {
  const t = site.theme;
  const body = page.sections
    .filter((s) => s.type !== "footer")
    .map((s) => {
      const band = sectionBandCss(s.theme);
      return `<div id="${esc(s.type)}"${band ? ` style="${band}"` : ""}>${renderSection(s, site)}</div>`;
    })
    .join("\n");
  const footer = page.sections
    .filter((s) => s.type === "footer")
    .map((s) => renderSection(s, site))
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(page.title)} — ${esc(site.seo.title)}</title>
  <meta name="description" content="${esc(site.seo.description)}" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  ${themeFontHref(t) ? `<link href="${themeFontHref(t)}" rel="stylesheet" />` : ""}
  <style>
    :root {
      --primary: ${t.colors.primary};
      --secondary: ${t.colors.secondary};
      --accent: ${t.colors.accent};
      ${brandCss(t, t.colors.primary)}
    }
    body { background: var(--theme-bg, ${t.colors.background}); color: var(--theme-fg, ${t.colors.foreground}); font-family: ${
      resolveThemeFont(t)?.stack ?? "ui-sans-serif, system-ui, sans-serif"
    }; }
    html { scroll-behavior: smooth; }
    .site-section { padding: clamp(3rem, 6vw, 5.5rem) clamp(1rem, 4vw, 2rem); }
    .site-container { width: 100%; max-width: 72rem; margin-inline: auto; }
    .site-btn { cursor: pointer; transition: transform .2s ease, box-shadow .2s ease, filter .2s ease; }
    .site-btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
    .site-btn:active { transform: scale(.98); }
    .site-muted { color: var(--theme-muted, #475569); }
    .site-card { background-color: var(--theme-card, #ffffff); }
  </style>
</head>
<body id="top">
${renderNav(page, site)}
<main>
${body}
</main>
${footer}
</body>
</html>`;
}

/** Returns a map of relative file path -> file contents for the whole site. */
export function renderSiteToFiles(site: AssembledSite): Record<string, string> {
  // Bespoke designs ship their own markup (with the shared motion runtime
  // injected) so the exported site matches the design the customer chose. A
  // multi-page bespoke design emits one file per page (home -> index.html,
  // others -> <slug>/index.html) with inter-page nav that works between them.
  if (hasBespokeExport(site)) {
    const files: Record<string, string> = {};
    const pages = site.pages.length ? site.pages : [{ slug: "home", title: "Home", sections: [] }];
    for (const page of pages) {
      const html = renderBespokeSite(site, page.slug);
      if (!html) continue;
      const path = page.slug === "home" ? "index.html" : `${page.slug}/index.html`;
      files[path] = html;
    }
    if (Object.keys(files).length) return files;
  }

  const files: Record<string, string> = {};
  for (const page of site.pages) {
    const path = page.slug === "home" ? "index.html" : `${page.slug}/index.html`;
    files[path] = renderPage(page, site);
  }
  return files;
}
