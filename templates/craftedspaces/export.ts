import type { AssembledSite } from "@/lib/blueprint/types";
import { list, slotAt, text, toSlots } from "../shared/content";
import { CS } from "./tokens";

function esc(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Type recovered from the outlined "CraftedSpaces" wordmark assets so the
 * business name renders identically to the original artwork. Sizes come from the
 * assets' cap height at their rendered heights: 22px / 26.4px in the header
 * (h-5 / lg:h-6) and 30.8px in the footer (h-7).
 */
const WORDMARK = "font-weight:400;letter-spacing:-0.02em;line-height:1";

const A = {
  logoIcon: "/templates/craftedspaces/logo73.svg",
  logoIconFooter: "/templates/craftedspaces/logo74.svg",
  hero: "/templates/craftedspaces/rectangle5.jpg",
  heroAlt: "/templates/craftedspaces/rectangle6.jpg",
  about: "/templates/craftedspaces/rectangle8.jpg",
  projects: [
    "/templates/craftedspaces/rectangle11.jpg",
    "/templates/craftedspaces/rectangle13.jpg",
    "/templates/craftedspaces/rectangle14.jpg",
    "/templates/craftedspaces/rectangle15.jpg",
  ],
  serviceImages: [
    "/templates/craftedspaces/rectangle20.jpg",
    "/templates/craftedspaces/rectangle21.jpg",
    "/templates/craftedspaces/rectangle29.jpg",
    "/templates/craftedspaces/rectangle35.jpg",
  ],
  gallery: [
    "/templates/craftedspaces/rectangle23.jpg",
    "/templates/craftedspaces/rectangle25.jpg",
    "/templates/craftedspaces/rectangle27.jpg",
    "/templates/craftedspaces/rectangle28.jpg",
  ],
  blogs: [
    "/templates/craftedspaces/rectangle31.jpg",
    "/templates/craftedspaces/rectangle32.jpg",
    "/templates/craftedspaces/rectangle33.jpg",
    "/templates/craftedspaces/rectangle34.jpg",
  ],
  icons: [
    "/templates/craftedspaces/group34419.svg",
    "/templates/craftedspaces/group34420.svg",
    "/templates/craftedspaces/group34421.svg",
  ],
  social: [
    "/templates/craftedspaces/group34414.svg",
    "/templates/craftedspaces/group34415.svg",
    "/templates/craftedspaces/group34417.svg",
    "/templates/craftedspaces/group34413.svg",
    "/templates/craftedspaces/group34416.svg",
  ],
  arrowDark: "/templates/craftedspaces/group7.svg",
  arrowLight: "/templates/craftedspaces/group4.svg",
  faqPlus: "/templates/craftedspaces/frame.svg",
  quote: "/templates/craftedspaces/group34405.svg",
} as const;

const NAV = [
  { label: "About Us", href: "#cs-about" },
  { label: "Services", href: "#cs-services" },
  { label: "Portfolio", href: "#cs-work" },
  { label: "Resources", href: "#cs-blogs" },
  { label: "Contact", href: "#cs-contact" },
];

const shell = "mx-auto w-full max-w-[1660px] px-4 sm:px-6 lg:px-10";

function pill(
  href: string,
  label: string,
  opts: { dark?: boolean; light?: boolean } = {}
): string {
  const bg = opts.dark ? CS.ink : CS.cream;
  const color = opts.dark ? CS.white : CS.ink;
  const arrow = opts.dark ? A.arrowLight : A.arrowDark;
  return `<a href="${esc(
    href
  )}" class="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-medium lg:h-[52px] lg:px-7 lg:text-base" style="background:${bg};color:${color}">
    <span>${esc(label)}</span>
    <span class="flex size-7 items-center justify-center rounded-full bg-black/5">
      <img src="${arrow}" alt="" width="20" height="20" class="size-4" />
    </span>
  </a>`;
}

/** Gallery tile: clips its image so the hover zoom stays inside the rounded frame. */
function galleryTile(src: string, sizeClass: string): string {
  return `<div class="group overflow-hidden rounded-xl"><img src="${esc(
    src
  )}" alt="" class="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:transform-none motion-reduce:transition-none ${sizeClass}" /></div>`;
}

/** Static HTML twin of templates/craftedspaces/site.tsx. */
export function renderCraftedSpacesPage(site: AssembledSite): string {
  const slots = toSlots(null, site);

  const hero = slotAt(slots, "hero");
  const projects = slotAt(slots, "portfolio", 0);
  const about = slotAt(slots, "about");
  const capabilities = slotAt(slots, "features", 0);
  const services = slotAt(slots, "services");
  const testimonials = slotAt(slots, "testimonials");
  const gallery = slotAt(slots, "portfolio", 1);
  const blogs = slotAt(slots, "features", 1);
  const faq = slotAt(slots, "faq");
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");

  const businessName = text(footer.content, "businessName") || site.businessName || "CraftedSpaces";
  // Only a logo the user actually uploaded replaces the template mark; the
  // auto-generated `site.logo` wordmark is never used here.
  const customLogo = site.theme.logoUrl?.trim() || "";
  const contactEmail = site.contact?.email?.trim() || "";
  const contactPhone = site.contact?.phone?.trim() || "";
  const contactAddress = site.contact?.address?.trim() || "";

  const projectTitles = list(projects.content, "itemTitles");
  const projectBodies = list(projects.content, "itemBodies");
  const projectTags = list(projects.content, "authors");
  const serviceTitles = list(services.content, "itemTitles", [
    "Architectural Design",
    "Home Renovation",
    "Interior Design",
    "Decor & Accessories",
  ]);
  const serviceBodies = list(services.content, "itemBodies");
  const capabilityTitles = list(capabilities.content, "itemTitles", [
    "Space Planning",
    "Concept Development",
    "Renovation and Remodeling",
  ]);
  const capabilityBodies = list(capabilities.content, "itemBodies");
  const quote = list(testimonials.content, "quotes")[0] || "";
  const author = list(testimonials.content, "authors")[0] || "";
  const role = list(testimonials.content, "roles")[0] || "";
  const blogTitles = list(blogs.content, "itemTitles");
  const blogBodies = list(blogs.content, "itemBodies");
  const blogTags = list(blogs.content, "authors");
  const questions = list(faq.content, "questions");
  const answers = list(faq.content, "answers");
  const footerLinks = list(footer.content, "linkLabels", [
    "Home",
    "About Us",
    "Portfolio",
    "Gallery",
    "Blogs",
    "FAQs",
  ]);

  const heroImage = hero.image || A.hero;
  const heroDetailImage = about.image || A.about;
  const testimonialBg =
    testimonials.image || hero.image || about.image || gallery.itemImages[0] || A.heroAlt;

  const body = `
<header class="px-4 pb-6 pt-5 sm:px-6 lg:px-[30px] lg:pb-8 lg:pt-[30px]">
  <div class="${shell} flex flex-wrap items-center gap-5">
    <a href="#cs-top" class="flex items-center gap-3">
      <img src="${esc(customLogo || A.logoIcon)}" alt="" width="58" height="39" class="h-8 w-auto object-contain lg:h-[39px]" />
      <span class="max-w-[min(58vw,320px)] truncate text-[22px] lg:max-w-[420px] lg:text-[26.4px]" style="${WORDMARK};color:#000000">${esc(
        businessName
      )}</span>
    </a>
    <nav class="order-last flex w-full flex-wrap items-center gap-x-6 gap-y-2 text-sm lg:order-none lg:mx-auto lg:w-auto lg:gap-x-[60px] lg:text-base">
      ${NAV.map((item) => `<a href="${item.href}" class="hover:opacity-65">${esc(item.label)}</a>`).join("\n      ")}
    </nav>
    ${pill("#cs-contact", "Let's Talk", { light: true })}
  </div>
</header>

<section class="px-4 sm:px-6 lg:px-[30px]">
  <div class="relative overflow-hidden rounded-2xl">
    <img src="${esc(heroImage)}" alt="" data-parallax="0.1" class="h-[480px] w-full object-cover sm:h-[620px] lg:h-[780px]" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"></div>
    <div class="${shell} absolute inset-x-0 bottom-10 lg:bottom-[70px]">
      <p class="text-xs uppercase tracking-[0.22em] text-white/80 sm:text-sm">${esc(
        text(hero.content, "eyebrow", "INTERIOR & ARCHITECTURAL DESIGN")
      )}</p>
      <h1 class="mt-4 max-w-4xl text-4xl leading-[1.1] text-white sm:text-5xl lg:text-[80px] lg:leading-[100px]">${esc(
        text(hero.content, "headline", "Transforming Spaces with Elegance & Precision")
      )}</h1>
      <p class="mt-4 max-w-xl text-sm leading-7 text-white/85 lg:text-base">${esc(
        text(hero.content, "subheadline")
      )}</p>
      <div class="mt-7 flex flex-wrap gap-4">
        ${pill("#cs-work", text(hero.content, "ctaPrimary", "View Projects"))}
        ${pill("#cs-contact", text(hero.content, "ctaSecondary", "Let's Connect"), { dark: true })}
      </div>
    </div>
  </div>
</section>

<section id="cs-work" class="pt-20 lg:pt-[110px]">
  <div class="${shell}">
    <div class="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-[#7A6E62]">Our Work</p>
        <h2 class="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[56px]">${esc(
          text(projects.content, "heading", "Our Recent Interior Design Projects")
        )}</h2>
      </div>
      <p class="max-w-xl text-sm leading-7 text-[${CS.body}]">${esc(
        text(projects.content, "subheading")
      )}</p>
    </div>
    <div class="mt-12 grid gap-8 lg:grid-cols-2">
      ${Array.from({ length: 4 })
        .map((_, i) => {
          const tags = (projectTags[i] || "Interior Design|Architecture")
            .split("|")
            .map((t) => `<span class="rounded-full border border-[#C2BDAF] px-3 py-1 text-[#4C433A]">${esc(t.trim())}</span>`)
            .join("");
          return `<article class="space-y-5">
            ${galleryTile(
              projects.itemImages[i] || A.projects[i],
              i % 2 === 0 ? "h-[430px]" : "h-[320px] lg:h-[460px]"
            )}
            <div class="flex flex-wrap gap-2 text-xs">${tags}</div>
            <h3 class="text-2xl">${esc(projectTitles[i] || "Signature Project")}</h3>
            <p class="text-sm leading-7 text-[${CS.body}]">${esc(projectBodies[i] || "")}</p>
          </article>`;
        })
        .join("\n      ")}
    </div>
  </div>
</section>

<section id="cs-about" class="mt-20 bg-[#1A1A1A] py-20 text-white lg:mt-[110px] lg:py-[120px]">
  <div class="${shell} grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,780px)]">
    <div>
      <p class="text-xs uppercase tracking-[0.2em] text-[#D5CCBF]">What We Do</p>
      <h2 class="mt-4 max-w-xl text-4xl leading-tight lg:text-[56px]">${esc(
        text(about.content, "heading", "35 Years Combined Experience of Crafting Spaces")
      )}</h2>
      <p class="mt-7 max-w-xl text-sm leading-7 text-[#B0B0B0] lg:text-base">${esc(
        text(about.content, "body")
      )}</p>
      <div class="mt-8">${pill("#cs-services", text(about.content, "ctaPrimary", "Learn More About Us"))}</div>
    </div>
    <div class="space-y-10">
      <img src="${esc(
        heroDetailImage
      )}" alt="" class="h-[340px] w-full rounded-xl object-cover lg:h-[551px]" />
      <div class="grid gap-10 md:grid-cols-3">
        ${capabilityTitles
          .slice(0, 3)
          .map(
            (title, i) => `<div>
          <img src="${A.icons[i % A.icons.length]}" alt="" width="70" height="70" class="size-[70px]" />
          <h3 class="mt-4 text-2xl">${esc(title)}</h3>
          <p class="mt-3 text-sm leading-7 text-[#B0B0B0]">${esc(capabilityBodies[i] || "")}</p>
        </div>`
          )
          .join("\n        ")}
      </div>
    </div>
  </div>
</section>

<section id="cs-services" class="py-20 lg:py-[120px]">
  <div class="${shell}">
    <div class="text-center">
      <p class="text-xs uppercase tracking-[0.2em] text-[#7A6E62]">${esc(
        text(services.content, "eyebrow", "OUR SERVICES")
      )}</p>
      <h2 class="mx-auto mt-4 max-w-4xl text-3xl leading-tight sm:text-4xl lg:text-[56px]">${esc(
        text(services.content, "heading", "Our Expertise for Every Space")
      )}</h2>
      <p class="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[${CS.body}]">${esc(
        text(services.content, "subheading")
      )}</p>
    </div>
    <div class="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
      ${serviceTitles
        .slice(0, 4)
        .map(
          (title, i) => `<article class="space-y-6">
        ${galleryTile(services.itemImages[i] || A.serviceImages[i], "h-[270px]")}
        <h3 class="text-[26px] leading-[1.15]">${esc(title)}</h3>
        <p class="text-sm leading-7 text-[${CS.body}]">${esc(serviceBodies[i] || "")}</p>
        <a href="#cs-contact" class="group/link inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline">
          Learn More
          <img src="${A.arrowDark}" alt="" class="size-4 transition-transform duration-300 ease-out group-hover/link:translate-x-1 motion-reduce:transform-none" />
        </a>
      </article>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="pb-20 lg:pb-[110px]">
  <div class="${shell}">
    <div class="relative overflow-hidden rounded-2xl">
      <img src="${esc(testimonialBg)}" alt="" data-parallax="0.1" class="h-[420px] w-full object-cover lg:h-[520px]" />
      <div class="absolute inset-0 bg-black/70"></div>
      <div class="absolute inset-0 p-7 text-white sm:p-10 lg:p-[70px]">
        <p class="text-xs uppercase tracking-[0.2em] text-white/70">${esc(
          text(testimonials.content, "eyebrow", "TESTIMONIALS")
        )}</p>
        <h2 class="mt-4 text-3xl lg:text-[56px]">${esc(
          text(testimonials.content, "heading", "What Our Clients Say")
        )}</h2>
        <div class="mt-10 flex gap-6">
          <img src="${A.quote}" alt="" class="size-[42px] shrink-0" />
          <p class="max-w-4xl text-base leading-8 lg:text-xl lg:leading-[38px]">${esc(quote)}</p>
        </div>
        <div class="mt-10 border-t border-white/20 pt-6">
          <p class="text-lg">${esc(author)}</p>
          <p class="mt-1 text-sm text-white/70">${esc(role)}</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="pb-20 lg:pb-[110px]">
  <div class="${shell} grid gap-4 lg:grid-cols-3">
    ${galleryTile(gallery.itemImages[0] || A.gallery[0], "h-[320px] sm:h-[460px] lg:h-[520px]")}
    <div class="grid gap-4">
      ${galleryTile(gallery.itemImages[2] || A.gallery[2], "h-[200px] sm:h-[252px]")}
      ${galleryTile(gallery.itemImages[3] || A.gallery[3], "h-[200px] sm:h-[252px]")}
    </div>
    ${galleryTile(gallery.itemImages[1] || A.gallery[1], "h-[320px] sm:h-[460px] lg:h-[520px]")}
  </div>
</section>

<section id="cs-blogs" class="pb-20 lg:pb-[110px]">
  <div class="${shell}">
    <div class="text-center">
      <p class="text-xs uppercase tracking-[0.2em] text-[#7A6E62]">INSIGHTS</p>
      <h2 class="mx-auto mt-4 max-w-4xl text-3xl sm:text-4xl lg:text-[56px]">${esc(
        text(blogs.content, "heading", "Our Latest Blogs")
      )}</h2>
      <p class="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[${CS.body}]">${esc(
        text(blogs.content, "subheading")
      )}</p>
    </div>
    <div class="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
      ${Array.from({ length: 4 })
        .map(
          (_, i) => `<article class="space-y-5">
        ${galleryTile(blogs.itemImages[i] || A.blogs[i], "h-[320px]")}
        <span class="inline-flex rounded-full border border-[#C2BDAF] px-3 py-1 text-xs text-[#4C433A]">${esc(
          blogTags[i] || "Interior Design"
        )}</span>
        <h3 class="text-2xl leading-[1.35]">${esc(blogTitles[i] || "Design Story")}</h3>
        <p class="text-sm leading-7 text-[${CS.body}]">${esc(blogBodies[i] || "")}</p>
      </article>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="pb-20 lg:pb-[110px]">
  <div class="${shell}">
    <div class="mx-auto max-w-4xl text-center">
      <p class="text-xs uppercase tracking-[0.2em] text-[#7A6E62]">FAQS</p>
      <h2 class="mt-4 text-3xl sm:text-4xl lg:text-[56px]">${esc(
        text(faq.content, "heading", "Frequently Asked Questions")
      )}</h2>
      <p class="mt-5 text-sm leading-7 text-[${CS.body}]">${esc(text(faq.content, "subheading"))}</p>
    </div>
    <div class="mx-auto mt-12 max-w-5xl space-y-4">
      ${questions
        .slice(0, 5)
        .map(
          (q, i) => `<details ${
            i === 1 ? "open" : ""
          } class="rounded-xl border px-5 py-4 ${
            i === 1 ? "border-[#1A1A1A] bg-[#FFFBEB]" : "border-[#DAD7CE] bg-white"
          }">
        <summary class="flex cursor-pointer list-none items-start justify-between gap-6 text-left text-base leading-7 lg:text-[20px]">
          <span>${esc(q)}</span>
          <img src="${A.faqPlus}" alt="" class="mt-1 size-[28px] shrink-0" />
        </summary>
        <p class="pt-4 text-sm leading-7 text-[${CS.body}]">${esc(answers[i] || "")}</p>
      </details>`
        )
        .join("\n      ")}
    </div>
    <div class="mt-12 text-center">${pill("#cs-contact", "View All FAQs", { dark: true })}</div>
  </div>
</section>

<section id="cs-contact" class="bg-[#1A1A1A] pt-16 text-white lg:pt-[100px]">
  <div class="${shell} grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,650px)]">
    <div>
      <h2 class="text-4xl leading-tight lg:text-[56px]">${esc(
        text(cta.content, "headline", "Ready to Transform Your Space? Let's Talk!")
      )}</h2>
      <div class="mt-8">${pill(contactEmail ? `mailto:${contactEmail}` : "#cs-top", text(cta.content, "ctaPrimary", "Let's Talk"))}</div>
    </div>
    <p class="text-sm leading-7 text-[#B0B0B0] lg:text-base">${esc(text(cta.content, "subheadline"))}</p>
  </div>

  <div class="${shell} mt-14 border-t border-white/15 pt-10">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
      <div>
        <div class="flex items-center gap-3">
          <img src="${esc(customLogo || A.logoIconFooter)}" alt="" width="78" height="52" class="h-10 w-auto object-contain" />
          <span class="max-w-[min(62vw,340px)] truncate text-[30.8px]" style="${WORDMARK};color:${CS.canvas}">${esc(
            businessName
          )}</span>
        </div>
        <p class="mt-4 max-w-sm text-sm leading-7 text-[#B0B0B0]">${esc(
          text(footer.content, "tagline")
        )}</p>
        <div class="mt-6 flex items-center gap-3">
          ${A.social.map((src) => `<img src="${src}" alt="" width="56" height="56" class="size-10 lg:size-14" />`).join("\n          ")}
        </div>
      </div>
      <div>
        <p class="mb-4 text-sm uppercase tracking-[0.18em] text-[#B0B0B0]">Navigation</p>
        <div class="flex flex-col gap-3 text-sm leading-7">${footerLinks
          .slice(0, 4)
          .map((label) => `<a href="#cs-top" class="hover:opacity-70">${esc(label)}</a>`)
          .join("\n          ")}</div>
      </div>
      <div>
        <p class="mb-4 text-sm uppercase tracking-[0.18em] text-[#B0B0B0]">Services</p>
        <div class="flex flex-col gap-3 text-sm leading-7">${serviceTitles
          .slice(0, 4)
          .map((label) => `<a href="#cs-services" class="hover:opacity-70">${esc(label)}</a>`)
          .join("\n          ")}</div>
      </div>
      <div>
        <p class="mb-4 text-sm uppercase tracking-[0.18em] text-[#B0B0B0]">Contact</p>
        <div class="flex flex-col gap-3 text-sm leading-7">
          ${contactAddress ? `<p>${esc(contactAddress)}</p>` : ""}
          ${
            contactEmail
              ? `<a href="mailto:${esc(contactEmail)}" class="underline underline-offset-4">${esc(contactEmail)}</a>`
              : ""
          }
          ${
            contactPhone
              ? `<a href="tel:${esc(
                  contactPhone.replace(/[^\d+]/g, "")
                )}" class="underline underline-offset-4">${esc(contactPhone)}</a>`
              : ""
          }
        </div>
      </div>
    </div>
    <div class="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 py-6 text-sm text-[#B0B0B0]">
      <span>&copy; ${new Date().getFullYear()} ${esc(businessName)}. All rights reserved.</span>
      <span class="flex gap-6"><span>Terms of Use</span><span>Privacy Policy</span></span>
    </div>
  </div>
</section>`;

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
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Sora', ui-sans-serif, system-ui, sans-serif;
      color: ${CS.ink};
      background: ${CS.canvas};
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    summary::-webkit-details-marker { display: none; }
  </style>
</head>
<body id="cs-top">
${body}
</body>
</html>`;
}
