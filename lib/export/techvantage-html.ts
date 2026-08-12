import { TV } from "@/components/templates/techvantage/tokens";
import { list, slotAt, text, toSlots } from "@/components/templates/content";
import type { AssembledSite } from "@/lib/blueprint/types";

// Static HTML twin of components/templates/techvantage/techvantage-site.tsx.
// Exported and deployed sites must look like the design the customer chose, so
// the Techvantage layout is mirrored here rather than falling back to the
// generic section renderer. Both read the same locked slots via the same helpers.

function esc(input: unknown): string {
  const s = typeof input === "string" ? input : String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const NAV = [
  { label: "About Us", href: "#tv-about" },
  { label: "Our Services", href: "#tv-services" },
  { label: "Case Studies", href: "#tv-work" },
  { label: "Blogs", href: "#tv-articles" },
  { label: "Contact Us", href: "#tv-contact" },
];

const A = {
  logo: "/templates/techvantage/logo.svg",
  hero: "/templates/techvantage/hero.jpg",
  aboutA: "/templates/techvantage/about-1.jpg",
  aboutB: "/templates/techvantage/about-2.jpg",
  approach: "/templates/techvantage/approach.jpg",
  cases: [
    "/templates/techvantage/case-1.jpg",
    "/templates/techvantage/case-2.jpg",
    "/templates/techvantage/case-3.jpg",
    "/templates/techvantage/case-4.jpg",
  ],
  articles: [
    "/templates/techvantage/article-1.jpg",
    "/templates/techvantage/article-2.jpg",
    "/templates/techvantage/article-3.jpg",
  ],
  avatar: "/templates/techvantage/avatar.png",
  ctaBg: "/templates/techvantage/cta-bg.jpg",
  check: "/templates/techvantage/check.svg",
  arrow: "/templates/techvantage/arrow-up-right.svg",
  phone: "/templates/techvantage/phone-glyph.svg",
  contactPhone: "/templates/techvantage/contact-phone-glyph.svg",
  contactEmail: "/templates/techvantage/contact-email.svg",
  contactLocation: "/templates/techvantage/contact-location.svg",
  serviceIcons: [
    "/templates/techvantage/icon-consulting.svg",
    "/templates/techvantage/icon-software.svg",
    "/templates/techvantage/icon-cloud.svg",
  ],
  valueIcons: [
    "/templates/techvantage/icon-tailored.svg",
    "/templates/techvantage/icon-technology.svg",
    "/templates/techvantage/icon-secure.svg",
    "/templates/techvantage/icon-record.svg",
  ],
  social: [
    "/templates/techvantage/social-1.svg",
    "/templates/techvantage/social-2.svg",
    "/templates/techvantage/social-3.svg",
    "/templates/techvantage/social-4.svg",
    "/templates/techvantage/social-5.svg",
  ],
};

const PANEL = `linear-gradient(180deg, ${TV.panelTop} 0%, ${TV.panelBottom} 100%)`;
const SHELL = "mx-auto w-full max-w-[1620px] px-5 sm:px-8 lg:px-[60px]";

const eyebrow = (label: string, opts: { center?: boolean; onDark?: boolean } = {}) =>
  label
    ? `<p class="mb-4 text-[16px] font-medium uppercase leading-[26px]${
        opts.center ? " text-center" : ""
      }" style="font-family:var(--tv-display);color:${opts.onDark ? "#7FA6FF" : TV.blue}">${esc(
        label
      )}</p>`
    : "";

const heading = (content: string, opts: { center?: boolean; onDark?: boolean } = {}) =>
  `<h2 class="text-[32px] font-medium leading-[1.18] sm:text-[40px] lg:text-[48px] lg:leading-[58px]${
    opts.center ? " mx-auto" : ""
  }" style="font-family:var(--tv-display);color:${opts.onDark ? "#ffffff" : TV.ink}">${esc(
    content
  )}</h2>`;

const pill = (
  href: string,
  label: string,
  tone: "blue" | "deep" | "onBlue" | "outline" = "blue"
) => {
  const style =
    tone === "outline"
      ? `border:1px solid ${TV.wash};color:${TV.wash}`
      : tone === "deep"
        ? `background:${TV.blueDeep};color:${TV.wash}`
        : tone === "onBlue"
          ? `background:${TV.wash};color:${TV.blueDeep}`
          : `background:${TV.blue};color:${TV.wash}`;
  return `<a href="${esc(href)}" class="inline-flex h-[52px] shrink-0 items-center justify-center rounded-full px-7 text-[17px] font-semibold lg:text-[18px]" style="${style};font-family:var(--tv-display)">${esc(
    label
  )}</a>`;
};

const arrow = () => `<img src="${A.arrow}" alt="" width="12" height="12" class="size-3 shrink-0" />`;

const readMore = () =>
  `<span class="mt-5 inline-flex items-center gap-1.5 text-[17px] font-semibold" style="font-family:var(--tv-display);color:${TV.blueDeep}">Read More ${arrow()}</span>`;

const iconDisc = (src: string) =>
  `<span class="flex size-10 shrink-0 items-center justify-center rounded-full" style="background:rgba(255,255,255,0.07)"><img src="${src}" alt="" width="22" height="22" style="width:22px;height:22px" /></span>`;

/** "500+" and "98%" render their trailing symbol in the accent blue. */
function splitStat(value: string): { number: string; suffix: string } {
  const match = value.trim().match(/^(.*?)([+%]?)$/);
  return { number: match?.[1] ?? value, suffix: match?.[2] ?? "" };
}

export function renderTechvantagePage(site: AssembledSite): string {
  const slots = toSlots(null, site);

  const hero = slotAt(slots, "hero");
  const services = slotAt(slots, "services");
  const about = slotAt(slots, "about");
  const stats = slotAt(slots, "features", 0);
  const why = slotAt(slots, "features", 1);
  const approach = slotAt(slots, "features", 2);
  const testimonials = slotAt(slots, "testimonials");
  const work = slotAt(slots, "portfolio");
  const articles = slotAt(slots, "features", 3);
  const faq = slotAt(slots, "faq");
  const cta = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");

  const businessName =
    text(footer.content, "businessName") || site.businessName || "Techvantage";

  const contactEmail = site.contact?.email?.trim() || "";
  const contactPhone = site.contact?.phone?.trim() || "";
  const contactAddress = site.contact?.address?.trim() || "";
  const contactHref = contactEmail ? `mailto:${contactEmail}` : "#tv-contact";
  const telHref = `tel:${contactPhone.replace(/[^\d+]/g, "")}`;

  const heroImage = hero.image || A.hero;
  const aboutImageA = about.image || A.aboutA;
  const aboutImageB = about.itemImages[0] || A.aboutB;
  const approachImage = approach.image || A.approach;

  const serviceTitles = list(services.content, "itemTitles", [
    "IT Consulting & Strategy",
    "Software Development",
    "Cloud Services & Migration",
  ]);
  const serviceBodies = list(services.content, "itemBodies");

  const statValues = list(stats.content, "itemTitles", ["500+", "15+", "300+", "98%"]);
  const statLabels = list(stats.content, "itemBodies", [
    "Successful Projects Completed",
    "Years of Industry Experience",
    "Clients Served Globally",
    "Client Satisfaction Rate",
  ]);

  const whyTitles = list(why.content, "itemTitles", [
    "Tailored Solutions",
    "Cutting-Edge Technology",
    "Reliable, Scalable & Secure",
    "Proven Track Record",
  ]);
  const whyBodies = list(why.content, "itemBodies");
  const approachBullets = list(approach.content, "itemBodies");

  const quotes = list(testimonials.content, "quotes");
  const authors = list(testimonials.content, "authors");
  const roles = list(testimonials.content, "roles");

  const workTitles = list(work.content, "itemTitles");
  const workBodies = list(work.content, "itemBodies");

  const articleTitles = list(articles.content, "itemTitles");
  const articleBodies = list(articles.content, "itemBodies");

  const questions = list(faq.content, "questions");
  const answers = list(faq.content, "answers");

  const footerLinks = list(
    footer.content,
    "linkLabels",
    NAV.map((n) => n.label)
  );

  const contactRow = (icon: string, label: string, value: string, href?: string) => {
    const inner = href
      ? `<a href="${esc(href)}" class="hover:underline">${esc(value)}</a>`
      : esc(value);
    const disc = icon === A.contactPhone ? iconDisc(icon) : `<img src="${icon}" alt="" width="40" height="40" class="size-10 shrink-0" />`;
    return `<div class="flex items-start gap-3">${disc}
        <span class="leading-snug">
          <span class="block" style="color:${TV.onDarkMuted}">${esc(label)}</span>
          <span class="font-medium text-white" style="font-family:var(--tv-display)">${inner}</span>
        </span>
      </div>`;
  };

  const body = `
<div style="background:${PANEL}">
  <div class="${SHELL} flex flex-wrap items-center gap-x-8 gap-y-4 py-6 lg:py-8">
    <a href="#tv-top" class="flex shrink-0 items-center gap-2">
      <img src="${A.logo}" alt="" width="50" height="39" class="h-8 w-auto lg:h-[39px]" />
      <span class="text-2xl font-bold text-white lg:text-[33px]" style="font-family:var(--tv-display)">${esc(
        businessName
      )}</span>
    </a>
    <nav class="order-last flex w-full flex-wrap items-center gap-x-6 gap-y-2 text-[15px] text-white/90 lg:order-none lg:w-auto lg:gap-x-[50px] lg:text-base">
      ${NAV.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join("\n      ")}
    </nav>
    <div class="ml-auto flex items-center gap-5">
      ${
        contactPhone
          ? `<div class="hidden items-center gap-2.5 xl:flex">${iconDisc(A.phone)}
        <span class="leading-tight text-white">
          <span class="block text-sm text-white/70">Get in Touch</span>
          <a href="${esc(telHref)}" class="block text-[18px] font-bold" style="font-family:var(--tv-display)">${esc(
            contactPhone
          )}</a>
        </span>
      </div>`
          : ""
      }
      ${pill(contactHref, "Contact Us")}
    </div>
  </div>

  <div class="${SHELL} grid items-center gap-10 pb-16 pt-6 lg:grid-cols-[minmax(0,785px)_minmax(0,679px)] lg:gap-12 lg:pb-[110px] lg:pt-4">
    <div>
      <h1 class="text-[40px] font-medium leading-[1.12] text-white sm:text-[56px] lg:text-[72px] lg:leading-[84px]" style="font-family:var(--tv-display)">${esc(
        text(hero.content, "headline", "Empowering Businesses with Cutting-Edge Technology")
      )}</h1>
      <p class="mt-6 max-w-[640px] text-[17px] leading-[28px] lg:text-[18px]" style="color:${TV.wash}">${esc(
        text(hero.content, "subheadline")
      )}</p>
      <div class="mt-9 flex flex-wrap items-center gap-4">
        ${pill("#tv-services", text(hero.content, "ctaPrimary", "Our Services"))}
        ${pill("#tv-about", text(hero.content, "ctaSecondary", "Learn More"), "outline")}
      </div>
    </div>
    <img src="${esc(heroImage)}" alt="" class="aspect-[679/681] w-full rounded-[24px] object-cover" />
  </div>
</div>

<section id="tv-services" class="bg-white py-16 lg:py-[110px]">
  <div class="${SHELL}">
    ${eyebrow(text(services.content, "eyebrow", "Our services"))}
    <div class="flex flex-wrap items-end justify-between gap-6">
      <div class="max-w-[785px]">${heading(
        text(services.content, "heading", "Expert Services to Drive Digital Transformation")
      )}</div>
      ${pill("#tv-contact", "View All Services", "deep")}
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      ${serviceTitles
        .slice(0, 3)
        .map(
          (title, i) => `<article class="rounded-[24px] border p-8" style="border-color:${TV.line}">
        <img src="${A.serviceIcons[i % A.serviceIcons.length]}" alt="" width="64" height="64" class="size-16" />
        <h3 class="mt-7 text-[24px] font-medium leading-[30px]" style="font-family:var(--tv-display);color:${TV.ink}">${esc(
          title
        )}</h3>
        <p class="mt-3 text-[16px] leading-[26px]" style="color:${TV.body}">${esc(serviceBodies[i] ?? "")}</p>
        <span class="mt-6 inline-flex items-center gap-1.5 text-[18px] font-semibold" style="font-family:var(--tv-display);color:${TV.blueDeep}">Learn More ${arrow()}</span>
      </article>`
        )
        .join("\n      ")}
    </div>
    <div class="mt-12 h-1 w-full overflow-hidden rounded-full" style="background:${TV.surface}">
      <div class="h-full w-1/3 rounded-full" style="background:${TV.blueSoft}"></div>
    </div>
  </div>
</section>

<section id="tv-about" class="py-16 lg:py-[110px]" style="background:${TV.surface}">
  <div class="${SHELL}">
    <div class="grid items-center gap-12 lg:grid-cols-[minmax(0,649px)_minmax(0,1fr)]">
      <div>
        ${eyebrow(text(about.content, "eyebrow", "Who we are"))}
        ${heading(text(about.content, "heading", "Our Journey From Vision to Reality"))}
        <p class="mt-7 whitespace-pre-line text-[18px] leading-[28px]" style="color:${TV.body}">${esc(
          text(about.content, "body")
        )}</p>
        <div class="mt-9">${pill("#tv-contact", "Learn More About Us")}</div>
      </div>
      <div class="flex items-end justify-center gap-4 sm:gap-6">
        <img src="${esc(
          aboutImageA
        )}" alt="" class="aspect-[377/449] w-1/2 max-w-[377px] rounded-[24px] object-cover" />
        <img src="${esc(
          aboutImageB
        )}" alt="" class="aspect-[375/516] w-1/2 max-w-[375px] rounded-[20px] object-cover" />
      </div>
    </div>
    <div class="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 lg:mt-[110px] lg:grid-cols-4 lg:gap-x-[120px]">
      ${statValues
        .slice(0, 4)
        .map((value, i) => {
          const { number, suffix } = splitStat(value);
          return `<div>
        <div class="text-[44px] font-medium leading-tight lg:text-[72px] lg:leading-[84px]" style="font-family:var(--tv-display);color:${TV.inkDeep}">${esc(
            number
          )}<span style="color:${TV.blue}">${esc(suffix)}</span></div>
        <p class="mt-1 text-[17px] leading-[28px] lg:text-[18px]" style="color:${TV.ink}">${esc(
            statLabels[i] ?? ""
          )}</p>
      </div>`;
        })
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="bg-white py-16 lg:py-[110px]">
  <div class="${SHELL}">
    <div class="mx-auto max-w-[720px] text-center">
      ${eyebrow(text(why.content, "eyebrow", "Why choose us"), { center: true })}
      ${heading(text(why.content, "heading", "Expertise That Delivers Results"), { center: true })}
      <p class="mt-6 text-[18px] leading-[28px]" style="color:${TV.body}">${esc(
        text(why.content, "subheading")
      )}</p>
    </div>
    <div class="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
      ${whyTitles
        .slice(0, 4)
        .map(
          (title, i) => `<div>
        <img src="${A.valueIcons[i % A.valueIcons.length]}" alt="" width="70" height="70" class="size-[70px]" />
        <h3 class="mt-6 text-[24px] font-medium leading-[30px]" style="font-family:var(--tv-display);color:${TV.ink}">${esc(
            title
          )}</h3>
        <p class="mt-3 text-[16px] leading-[26px]" style="color:${TV.body}">${esc(whyBodies[i] ?? "")}</p>
      </div>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="bg-white pb-16 lg:pb-[110px]">
  <div class="${SHELL}">
    <div class="h-px w-full" style="background:${TV.line}"></div>
    <div class="mt-16 grid items-center gap-12 lg:mt-[100px] lg:grid-cols-2 lg:gap-16">
      <img src="${esc(
        approachImage
      )}" alt="" class="aspect-[755/513] w-full rounded-[24px] object-cover" />
      <div>
        ${eyebrow(text(approach.content, "eyebrow", "Our approach"))}
        ${heading(text(approach.content, "heading", "Providing More Than Just Solutions"))}
        <p class="mt-6 text-[18px] leading-[28px]" style="color:${TV.body}">${esc(
          text(approach.content, "subheading")
        )}</p>
        <ul class="mt-8 space-y-5">
          ${approachBullets
            .slice(0, 3)
            .map(
              (bullet) => `<li class="flex items-start gap-3.5">
            <img src="${A.check}" alt="" width="24" height="24" class="mt-1 size-6 shrink-0" />
            <span class="text-[18px] leading-[28px]" style="color:${TV.body}">${esc(bullet)}</span>
          </li>`
            )
            .join("\n          ")}
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="py-16 lg:py-[110px]" style="background:${PANEL}">
  <div class="${SHELL} text-center">
    ${eyebrow(text(testimonials.content, "eyebrow", "Testimonials"), { center: true, onDark: true })}
    ${heading(text(testimonials.content, "heading", "Hear from Our Satisfied Customers"), {
      center: true,
      onDark: true,
    })}
    <blockquote class="mx-auto mt-12 max-w-[1050px] text-[19px] leading-[34px] lg:text-[22px] lg:leading-[38px]" style="color:${TV.wash}">${esc(
      quotes[0] ?? ""
    )}</blockquote>
    <div class="mt-10 flex flex-col items-center gap-3">
      <img src="${A.avatar}" alt="" width="64" height="64" class="size-16 rounded-full object-cover" />
      <div>
        <div class="text-[20px] font-semibold text-white" style="font-family:var(--tv-display)">${esc(
          authors[0] ?? ""
        )}</div>
        <div class="text-[16px]" style="color:${TV.onDarkMuted}">${esc(roles[0] ?? "")}</div>
      </div>
    </div>
    <div class="mt-10 flex items-center justify-center gap-2">
      <span class="h-[5px] w-3 rounded-full" style="background:${TV.dot}"></span>
      <span class="h-[5px] w-[50px] rounded-full bg-white"></span>
      <span class="h-[5px] w-3 rounded-full" style="background:${TV.dot}"></span>
    </div>
  </div>
</section>

<section id="tv-work" class="bg-white py-16 lg:py-[110px]">
  <div class="${SHELL}">
    ${eyebrow(text(work.content, "eyebrow", "Our work"))}
    <div class="flex flex-wrap items-end justify-between gap-6">
      <div class="max-w-[785px]">${heading(
        text(work.content, "heading", "See How We've Made a Difference")
      )}</div>
      ${pill("#tv-contact", "View All Case Studies", "deep")}
    </div>
    <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      ${workTitles
        .slice(0, 4)
        .map(
          (title, i) => `<article>
        <img src="${esc(
          work.itemImages[i] || A.cases[i % A.cases.length]
        )}" alt="" class="aspect-[4/3] w-full rounded-[18px] object-cover" />
        <h3 class="mt-5 text-[20px] font-semibold leading-[28px]" style="font-family:var(--tv-display);color:${TV.ink}">${esc(
            title
          )}</h3>
        <p class="mt-2 text-[16px] leading-[26px]" style="color:${TV.body}">${esc(workBodies[i] ?? "")}</p>
      </article>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="py-14 lg:py-[70px]" style="background:${TV.surface}">
  <div class="${SHELL} text-center">
    ${eyebrow("Our clients", { center: true })}
    <h2 class="text-[28px] font-medium leading-tight lg:text-[36px]" style="font-family:var(--tv-display);color:${TV.ink}">Trusted by teams that ship</h2>
    <p class="mt-3 text-[16px]" style="color:${TV.body}">Companies trust our services to be the best.</p>
    <div class="mt-9 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
      ${["Northwind", "Vertexa", "Lumina", "Cobalt", "Arcadia"]
        .map(
          (client) =>
            `<span class="text-[20px] font-bold tracking-tight" style="font-family:var(--tv-display);color:${TV.ink}">${client}</span>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section id="tv-articles" class="bg-white py-16 lg:py-[110px]">
  <div class="${SHELL}">
    ${eyebrow(text(articles.content, "eyebrow", "Blogs"))}
    <div class="flex flex-wrap items-end justify-between gap-6">
      <div class="max-w-[785px]">${heading(
        text(articles.content, "heading", "Discover the Latest Articles")
      )}</div>
      ${pill("#tv-contact", "View All Blogs", "deep")}
    </div>
    <div class="mt-12 grid gap-8 lg:grid-cols-2">
      ${
        articleTitles[0]
          ? `<article class="rounded-[24px] p-[30px]" style="background:${TV.surface}">
        <img src="${esc(
          articles.itemImages[0] || A.articles[0]
        )}" alt="" class="aspect-[725/290] w-full rounded-[14px] object-cover" />
        <h3 class="mt-8 text-[22px] font-semibold leading-[32px] lg:text-[26px] lg:leading-[36px]" style="font-family:var(--tv-display);color:${TV.ink}">${esc(
              articleTitles[0]
            )}</h3>
        <p class="mt-3 text-[16px] leading-[26px]" style="color:${TV.body}">${esc(
              articleBodies[0] ?? ""
            )}</p>
        ${readMore()}
      </article>`
          : ""
      }
      <div class="grid content-start gap-6">
        ${articleTitles
          .slice(1, 3)
          .map(
            (title, i) => `<article class="grid gap-5 overflow-hidden rounded-[14px] border sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)]" style="border-color:${TV.line}">
          <img src="${esc(
            articles.itemImages[i + 1] || A.articles[(i + 1) % A.articles.length]
          )}" alt="" class="aspect-[377/253] w-full object-cover sm:h-full" />
          <div class="p-5 sm:py-8 sm:pl-0 sm:pr-6">
            <h3 class="text-[19px] font-semibold leading-[28px]" style="font-family:var(--tv-display);color:${TV.ink}">${esc(
              title
            )}</h3>
            <p class="mt-2 text-[15px] leading-[24px]" style="color:${TV.body}">${esc(
              articleBodies[i + 1] ?? ""
            )}</p>
            ${readMore()}
          </div>
        </article>`
          )
          .join("\n        ")}
      </div>
    </div>
  </div>
</section>

<section class="py-16 lg:py-[110px]" style="background:${TV.surface}">
  <div class="${SHELL}">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-20">
      <div>
        ${eyebrow("FAQs")}
        ${heading(text(faq.content, "heading", "Have any questions? We&rsquo;ve got answers"))}
        <p class="mt-5 text-[18px] leading-[28px]" style="color:${TV.body}">Can&rsquo;t find what you&rsquo;re looking for? Don&rsquo;t hesitate to reach out.</p>
        <div class="mt-7">${pill(contactHref, "Contact Us")}</div>
      </div>
      <div>
        ${questions
          .slice(0, 5)
          .map(
            (question, i) => `<details${i === 0 ? " open" : ""} class="border-b py-6" style="border-color:${TV.line}">
          <summary class="flex cursor-pointer list-none items-start justify-between gap-6 text-[19px] font-semibold leading-[30px] lg:text-[20px]" style="font-family:var(--tv-display);color:${
            i === 0 ? TV.blueDeep : TV.bodyMuted
          }">${esc(question)}<span class="mt-1 shrink-0">${arrow()}</span></summary>
          <p class="mt-4 text-[17px] leading-[28px] lg:text-[18px]" style="color:${TV.body}">${esc(
              answers[i] ?? ""
            )}</p>
        </details>`
          )
          .join("\n        ")}
      </div>
    </div>
  </div>
</section>

<div id="tv-contact" style="background:${PANEL}">
  <div style="background-image:linear-gradient(to bottom, ${TV.surface} 45%, transparent 45%)">
    <div class="${SHELL}">
      <div class="overflow-hidden rounded-[24px] px-7 py-9 lg:px-14 lg:py-11" style="background-color:${TV.blue};background-image:url(${A.ctaBg});background-size:cover;background-position:center">
        <div class="flex flex-wrap items-center gap-x-8 gap-y-6">
          ${iconDisc(A.phone)}
          <div class="min-w-[260px] flex-1">
            <h2 class="text-[28px] font-medium leading-tight text-white lg:text-[48px] lg:leading-[58px]" style="font-family:var(--tv-display)">${esc(
              text(cta.content, "headline", "Have a project in mind?")
            )}</h2>
            <p class="mt-2 text-[17px] leading-[28px] lg:text-[18px]" style="color:${TV.surface}">${esc(
              text(cta.content, "subheadline")
            )}</p>
          </div>
          ${pill(contactHref, text(cta.content, "ctaPrimary", "Contact Us"), "onBlue")}
        </div>
      </div>
    </div>
  </div>

  <footer class="${SHELL} pb-10 pt-14 lg:pt-[80px]">
    <div class="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
      <div>
        <div class="flex items-center gap-2">
          <img src="${A.logo}" alt="" width="50" height="39" class="h-8 w-auto" />
          <span class="text-[26px] font-bold text-white" style="font-family:var(--tv-display)">${esc(
            businessName
          )}</span>
        </div>
        <div class="mt-8">
          <div class="text-[18px] font-semibold text-white" style="font-family:var(--tv-display)">Subscribe to Our Newsletter</div>
          <p class="mt-3 max-w-[340px] text-[16px] leading-[26px]" style="color:${TV.onDarkMuted}">${esc(
            text(footer.content, "tagline", "Technology partners for teams that need results.")
          )}</p>
          <div class="mt-5 flex max-w-[377px] items-center gap-4 rounded-full border px-6 py-2.5" style="border-color:${TV.lineDark}">
            <label class="sr-only" for="tv-newsletter">Email address</label>
            <input id="tv-newsletter" type="email" placeholder="Email Address" class="min-w-0 flex-1 bg-transparent text-[17px] text-white placeholder:text-[${TV.onDarkMuted}] focus:outline-none" />
            <span class="flex size-9 shrink-0 items-center justify-center rounded-full" style="background:${TV.wash}">${arrow()}</span>
          </div>
        </div>
      </div>

      <div>
        <div class="text-[18px] font-semibold text-white" style="font-family:var(--tv-display)">Services</div>
        <div class="mt-5 flex flex-col gap-3 text-[16px]" style="color:${TV.onDarkMuted}">
          ${serviceTitles
            .slice(0, 4)
            .map((label) => `<a href="#tv-services">${esc(label)}</a>`)
            .join("\n          ")}
        </div>
      </div>

      <div>
        <div class="text-[18px] font-semibold text-white" style="font-family:var(--tv-display)">Quick Links</div>
        <div class="mt-5 flex flex-col gap-3 text-[16px]" style="color:${TV.onDarkMuted}">
          ${footerLinks
            .slice(0, 5)
            .map(
              (label, i) => `<a href="${NAV[i]?.href ?? "#tv-top"}">${esc(label)}</a>`
            )
            .join("\n          ")}
        </div>
      </div>

      <div>
        <div class="text-[18px] font-semibold text-white" style="font-family:var(--tv-display)">Contact Information</div>
        <div class="mt-5 flex flex-col gap-3 text-[16px]" style="color:${TV.onDarkMuted}">
          ${[
            contactPhone ? contactRow(A.contactPhone, "Phone:", contactPhone, telHref) : "",
            contactEmail
              ? contactRow(A.contactEmail, "Email:", contactEmail, `mailto:${contactEmail}`)
              : "",
            contactAddress ? contactRow(A.contactLocation, "Location:", contactAddress) : "",
          ]
            .filter(Boolean)
            .join("\n          ")}
        </div>
      </div>
    </div>

    <div class="mt-14 flex items-center gap-5">
      <span class="hidden h-px flex-1 sm:block" style="background:rgba(255,255,255,0.12)"></span>
      <span class="mx-auto flex items-center gap-3 sm:mx-0">
        ${A.social
          .map((src) => `<img src="${src}" alt="" width="37" height="37" class="size-[37px]" />`)
          .join("\n        ")}
      </span>
      <span class="hidden h-px flex-1 sm:block" style="background:rgba(255,255,255,0.12)"></span>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 pt-8 text-[15px]" style="color:${TV.onDarkMuted}">
      <span>&copy; ${new Date().getFullYear()} ${esc(businessName)}. All rights reserved.</span>
      <span class="flex gap-6"><span>Terms and Conditions</span><span>Privacy Policy</span></span>
    </div>
  </footer>
</div>`;

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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Urbanist:wght@500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root { --tv-display: 'Urbanist', ui-sans-serif, system-ui, sans-serif; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      color: ${TV.ink};
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    summary::-webkit-details-marker { display: none; }
  </style>
</head>
<body id="tv-top">
${body}
</body>
</html>`;
}
