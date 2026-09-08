import type { AssembledSite } from "@/lib/blueprint/types";
import { FL } from "./tokens";
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

const ASSETS = {
  heroPattern: "/templates/forgelime/hero-pattern.png",
  heroArrow: "/templates/forgelime/hero-arrow.svg",
  heroAvatars: [
    "/templates/forgelime/hero-avatar-1.png",
    "/templates/forgelime/hero-avatar-2.png",
    "/templates/forgelime/hero-avatar-3.png",
  ],
  logoHeader: "/templates/forgelime/logo-header.svg",
  logoFooter: "/templates/forgelime/logo.svg",
  aboutMain: "/templates/forgelime/about-main.png",
  aboutCard1: "/templates/forgelime/about-card-1.png",
  aboutCard2: "/templates/forgelime/about-card-2.png",
  aboutRocket: "/templates/forgelime/about-rocket.svg",
  solutionIcons: [
    "/templates/forgelime/solution-rocket.png",
    "/templates/forgelime/solution-trophy.png",
    "/templates/forgelime/solution-gears.png",
  ],
  processMorph: "/templates/forgelime/process-morph.png",
  statsCard: "/templates/forgelime/stats-card.png",
  statsMedal: "/templates/forgelime/stats-medal.png",
  iconChat: "/templates/forgelime/icon-chat.svg",
  iconArrow: "/templates/forgelime/icon-arrow.svg",
  advantageBanner1: "/templates/forgelime/advantage-banner-1.png",
  advantageBanner2: "/templates/forgelime/advantage-banner-2.png",
  faqAdd: "/templates/forgelime/faq-add.svg",
  faqDismiss: "/templates/forgelime/faq-dismiss.svg",
  contactImage: "/templates/forgelime/contact-image.png",
  socialFacebook: "/templates/forgelime/social-facebook.svg",
  socialLinkedin: "/templates/forgelime/social-linkedin.svg",
  socialTwitter: "/templates/forgelime/social-twitter.svg",
  avatars: [
    "/templates/forgelime/testimonial-avatar-1.png",
    "/templates/forgelime/testimonial-avatar-2.png",
    "/templates/forgelime/testimonial-avatar-3.png",
    "/templates/forgelime/testimonial-avatar-4.png",
    "/templates/forgelime/testimonial-avatar-5.png",
    "/templates/forgelime/testimonial-avatar-6.png",
    "/templates/forgelime/testimonial-avatar-7.png",
    "/templates/forgelime/testimonial-avatar-8.png",
    "/templates/forgelime/testimonial-avatar-9.png",
    "/templates/forgelime/testimonial-avatar-10.png",
    "/templates/forgelime/testimonial-avatar-11.png",
    "/templates/forgelime/testimonial-avatar-12.png",
  ],
} as const;

const NAV = [
  { label: "About Us", href: "#fl-about" },
  { label: "Services", href: "#fl-solutions" },
  { label: "How We Work", href: "#fl-process" },
  { label: "Testimonials", href: "#fl-testimonials" },
  { label: "FAQ", href: "#fl-faq" },
];

function accentWords(value: string, words: number): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const lead = parts.slice(0, words).join(" ");
  const rest = parts.slice(words).join(" ");
  return `<span style="color:${FL.brand}">${esc(lead)}</span>${rest ? ` ${esc(rest)}` : ""}`;
}

export function renderForgeLimePage(site: AssembledSite): string {
  const slots = toSlots(null, site);

  const hero = slotAt(slots, "hero");
  const about = slotAt(slots, "features", 0);
  const solutions = slotAt(slots, "services");
  const process = slotAt(slots, "process");
  const stats = slotAt(slots, "features", 1);
  const testimonials = slotAt(slots, "testimonials");
  const advantages = slotAt(slots, "features", 2);
  const faq = slotAt(slots, "faq");
  const contact = slotAt(slots, "contact");
  const footer = slotAt(slots, "footer");

  const businessName = text(footer.content, "businessName") || site.businessName || "Forge Lime";
  const customLogo = site.theme.logoUrl?.trim() || "";

  const aboutTitles = list(about.content, "itemTitles", [
    "Fueling Progress with a Strategic Foundation for Growth",
    "Illuminating Pathways for Business Triumphs",
    "Elevating Achievements Through Collaboration",
  ]);
  const aboutBodies = list(about.content, "itemBodies");
  const aboutMain = about.itemImages[0] || ASSETS.aboutMain;
  const aboutCard1 = about.itemImages[1] || ASSETS.aboutCard1;
  const aboutCard2 = about.itemImages[2] || ASSETS.aboutCard2;

  const solutionTitles = list(solutions.content, "itemTitles", [
    "Strategic Insight Consulting",
    "Dynamic Marketing Solutions",
    "Agile Technology Integration",
  ]);
  const solutionBodies = list(solutions.content, "itemBodies");
  const solutionIcon = (i: number) => solutions.itemImages[i] || ASSETS.solutionIcons[i % ASSETS.solutionIcons.length];

  const stepTitles = list(process.content, "stepTitles", [
    "Strategic Planning and Collaboration",
    "Iterative Development and Feedback Integration",
    "Quality Finalization and Post-Support",
    "Ongoing Improvement and Future Refinement",
  ]);
  const stepBodies = list(process.content, "stepBodies");

  const statValues = list(stats.content, "itemTitles", ["97%", "50+", "10"]);
  const statLabels = list(stats.content, "itemBodies", ["Satisfaction rate", "Delivered projects", "Years of experience"]);

  const quoteList = list(testimonials.content, "quotes");
  const authorList = list(testimonials.content, "authors");
  const roleList = list(testimonials.content, "roles");
  const testimonialCols: number[][] = [[], [], [], []];
  quoteList.forEach((_, i) => testimonialCols[i % 4].push(i));

  const advantageTitles = list(advantages.content, "itemTitles", [
    "Precision in Targeted Audience Engagement",
    "Mastering Creativity in Campaign Craftsmanship",
    "Setting Trends and Shaping Futures Through Campaign Innovation",
    "Seamlessly Connecting Across Channels",
  ]);
  const advantageBodies = list(advantages.content, "itemBodies");
  const advantageImg1 = advantages.itemImages[0] || ASSETS.advantageBanner1;
  const advantageImg2 = advantages.itemImages[1] || ASSETS.advantageBanner2;

  const questions = list(faq.content, "questions");
  const answers = list(faq.content, "answers");

  const contactEmail = site.contact?.email?.trim() || text(contact.content, "email", "hello@forgelime.example");
  const contactPhone = site.contact?.phone?.trim() || text(contact.content, "phone", "(555) 016-7740");
  const contactAddress = text(contact.content, "address", "Remote-first, worldwide");
  const contactCta = text(contact.content, "ctaLabel", "Send a Question");
  const contactHref = contactEmail ? `mailto:${contactEmail}` : "#fl-contact";

  const footerLinks = list(footer.content, "linkLabels", [...NAV.map((n) => n.label), "Contact Us"]);
  const footerNav = footerLinks
    .map((label, i) => `<a href="${i < NAV.length ? NAV[i].href : "#fl-contact"}" class="transition-colors hover:text-[#A9FF5C]">${esc(label)}</a>`)
    .join("");

  const body = `
<section class="relative overflow-hidden" style="${sectionBandCss(hero.theme)}">
  <div class="absolute inset-0 overflow-hidden">
    <img src="${ASSETS.heroPattern}" alt="" class="h-full w-full object-cover opacity-35" />
    <div class="absolute inset-0 bg-[#090D06]/85"></div>
  </div>
  <div class="relative z-10 mx-auto flex min-h-[900px] max-w-[90rem] flex-col px-4 pb-20 pt-8 lg:px-20">
    <div class="flex items-center justify-between">
      <a href="#fl-top" class="inline-flex items-center gap-3">${customLogo ? `<img src="${esc(customLogo)}" alt="" class="h-11 w-11 object-contain" />` : `<img src="${ASSETS.logoHeader}" alt="" class="h-12 w-12 object-contain" />`}</a>
      <nav class="hidden items-center gap-4 md:flex">${NAV.map((item) => `<a href="${item.href}" class="rounded-lg px-2 py-1 text-base text-[#F1FBE8] transition-colors hover:text-[#A9FF5C]">${esc(item.label)}</a>`).join("")}</nav>
      <a href="${contactHref}" class="rounded-xl border border-[#A9FF5C] px-5 py-3 text-sm font-semibold text-[#F1FBE8] transition-colors hover:bg-[#A9FF5C]/10">Get In Touch</a>
    </div>
    <div class="mx-auto mt-24 flex max-w-[52rem] flex-col items-center text-center">
      <div class="flex items-center gap-4 rounded-full border border-[#426027] bg-[#1F2B15] px-3 py-2">
        <div class="flex items-center">${ASSETS.heroAvatars.map((src, i) => `<img src="${src}" alt="" class="h-8 w-8 rounded-full border-2 border-[#1F2B15] object-cover ${i > 0 ? "-ml-2" : ""}" />`).join("")}</div>
        <div class="flex items-center gap-2 text-sm text-[#E1FFC7]"><span>${esc(text(hero.content, "eyebrow", "What Others Say About Us"))}</span><img src="${ASSETS.heroArrow}" alt="" class="h-4 w-4 object-contain" /></div>
      </div>
      <h1 class="mt-8 text-[clamp(3rem,9vw,6.5rem)] uppercase leading-[0.9] tracking-[-1.6px]" style="font-family:var(--fl-display)">${accentWords(text(hero.content, "headline", "Grow Sales With Our Strategy First Approach"), 2)}</h1>
      <p class="mt-6 max-w-[40rem] text-lg leading-relaxed text-[#979F90]">${esc(text(hero.content, "subheadline", "Forge's sales and marketing solutions are strategically assigned each month to adapt quickly and hit your goals."))}</p>
      <a href="#fl-contact" class="mt-10 rounded-xl bg-[#A9FF5C] px-8 py-5 text-base font-bold text-[#090D06]">${esc(text(hero.content, "ctaPrimary", "Book a Free Consultation"))}</a>
    </div>
  </div>
</section>

<section id="fl-about" class="mx-auto max-w-[90rem] px-4 py-20 lg:px-20" style="${sectionBandCss(about.theme)}">
  <div class="max-w-[36rem]">
    <h2 class="text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style="font-family:var(--fl-display)">${accentWords(text(about.content, "heading", "Strategic Sales Growth Catalyst"), 2)}</h2>
    <p class="mt-5 text-xl leading-relaxed text-[#979F90]">${esc(text(about.content, "subheading", "By seamlessly integrating data-driven insights, market intelligence, and a deep understanding of your business, we propel your sales to new heights."))}</p>
  </div>
  <div class="mt-14 grid gap-4">
    <article class="grid overflow-hidden rounded-[28px] lg:grid-cols-2" style="background:${FL.brandSoft}">
      <div class="p-8 lg:p-14">
        <span class="inline-grid h-20 w-20 place-items-center rounded-full bg-[#356905]"><img src="${ASSETS.aboutRocket}" alt="" class="h-10 w-10 object-contain" /></span>
        <h3 class="mt-10 text-[clamp(2rem,5vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px]" style="font-family:var(--fl-display);color:#356905">${esc(aboutTitles[0])}</h3>
        <p class="mt-4 text-lg leading-relaxed text-[#090D06]">${esc(aboutBodies[0] || "As a dynamic and forward-thinking powerhouse, we craft innovative strategies that move beyond convention.")}</p>
      </div>
      <div class="relative min-h-[320px]"><img src="${esc(aboutMain)}" alt="" class="absolute inset-0 h-full w-full object-cover" /></div>
    </article>
    <div class="grid gap-4 lg:grid-cols-2">
      <article class="overflow-hidden rounded-[28px]" style="background:${FL.orangeSoft}">
        <img src="${esc(aboutCard1)}" alt="" class="h-64 w-full object-cover" />
        <div class="p-8 lg:p-12"><h3 class="text-[clamp(2rem,4.6vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px]" style="font-family:var(--fl-display);color:${FL.orangeInk}">${esc(aboutTitles[1])}</h3><p class="mt-4 text-lg leading-relaxed text-[#090D06]">${esc(aboutBodies[1] || "We craft success through strategies integrating data-driven insight and deep understanding of your business.")}</p></div>
      </article>
      <article class="overflow-hidden rounded-[28px]" style="background:${FL.yellowSoft}">
        <img src="${esc(aboutCard2)}" alt="" class="h-64 w-full object-cover" />
        <div class="p-8 lg:p-12"><h3 class="text-[clamp(2rem,4.6vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px]" style="font-family:var(--fl-display);color:${FL.yellowInk}">${esc(aboutTitles[2])}</h3><p class="mt-4 text-lg leading-relaxed text-[#090D06]">${esc(aboutBodies[2] || "We don't just work for our clients; we work with them to deliver outcomes that last.")}</p></div>
      </article>
    </div>
  </div>
</section>

<section id="fl-solutions" class="mx-auto max-w-[90rem] px-4 py-20 lg:px-20" style="${sectionBandCss(solutions.theme)}">
  <div class="mx-auto max-w-[36rem] text-center">
    <h2 class="text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style="font-family:var(--fl-display)">${accentWords(text(solutions.content, "heading", "Innovative Solutions Hub"), 1)}</h2>
    <p class="mt-5 text-xl leading-relaxed text-[#979F90]">${esc(text(solutions.content, "subheading", "From strategic consulting to seamless execution, we are your partners in unlocking unparalleled success."))}</p>
  </div>
  <div class="mt-14 grid gap-4 lg:grid-cols-3">
    ${solutionTitles
      .map(
        (title, i) => `<article class="flex flex-col items-center rounded-[28px] px-8 pb-12 pt-8 text-center" style="background:${FL.brandSoft}">
      <div class="relative h-[264px] w-[264px]"><div class="absolute inset-[12%] rounded-full bg-[#7FD136]"></div><img src="${esc(solutionIcon(i))}" alt="" class="absolute inset-0 h-full w-full object-cover" /></div>
      <h3 class="mt-8 text-[2.5rem] uppercase leading-[0.92] tracking-[-0.8px] text-[#356905]" style="font-family:var(--fl-display)">${esc(title)}</h3>
      <p class="mt-4 text-lg leading-relaxed text-[#090D06]">${esc(solutionBodies[i] || "Our experts design practical, high-impact systems that improve consistency and growth performance.")}</p>
    </article>`
      )
      .join("")}
  </div>
</section>

<section id="fl-process" class="mx-auto max-w-[90rem] px-4 py-24 lg:px-20" style="${sectionBandCss(process.theme)}">
  <h2 class="mx-auto max-w-[36rem] text-center text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style="font-family:var(--fl-display)">${accentWords(text(process.content, "heading", "A Deep Dive into Our Collaborative Work Methodology"), 7)}</h2>
  <div class="mt-20 grid gap-10 lg:grid-cols-[1fr_692px]">
    <div class="grid grid-cols-[4px_1fr] gap-10">
      <div class="rounded-full bg-[#1F2B15]"><div class="h-28 w-[4px] rounded-full bg-[#A9FF5C]"></div></div>
      <div class="space-y-16">
        ${stepTitles
          .map(
            (title, i) => `<article><h3 class="text-[2.5rem] uppercase leading-[0.92] tracking-[-0.8px] text-[#A9FF5C]" style="font-family:var(--fl-display)">${esc(title)}</h3><p class="mt-4 text-lg leading-relaxed text-[#979F90]">${esc(stepBodies[i] || "We collaborate closely with your team, iterate with feedback, and keep progress aligned to measurable outcomes.")}</p></article>`
          )
          .join("")}
      </div>
    </div>
    <div class="relative h-[480px] overflow-hidden rounded-[28px]"><img src="${ASSETS.processMorph}" alt="" class="h-full w-full object-cover" /></div>
  </div>
</section>

<section class="mx-auto max-w-[90rem] overflow-hidden rounded-[28px] px-0" style="background:${FL.sectionGreen};${sectionBandCss(stats.theme)}">
  <div class="relative px-6 pb-14 pt-20 lg:px-20">
    <img src="${ASSETS.statsCard}" alt="" class="pointer-events-none absolute -left-40 top-24 hidden h-[420px] w-[420px] object-contain opacity-70 lg:block" />
    <img src="${ASSETS.statsMedal}" alt="" class="pointer-events-none absolute -bottom-36 -right-28 hidden h-[460px] w-[460px] object-contain opacity-70 lg:block" />
    <div class="relative z-10 flex flex-col items-center text-center">
      <div class="inline-flex items-center gap-3 rounded-full border border-[#356905] bg-[#002D00] px-5 py-2"><img src="${ASSETS.iconChat}" alt="" class="h-5 w-5 object-contain" /><span class="text-base text-[#7FD136]">Have Questions?</span><img src="${ASSETS.iconArrow}" alt="" class="h-4 w-4 object-contain" /></div>
      <h2 class="mt-6 max-w-[36rem] text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style="font-family:var(--fl-display)">${accentWords(text(stats.content, "heading", "Empowering Success in Numbers"), 1)}</h2>
      <p class="mt-5 max-w-[36rem] text-xl leading-relaxed text-[#F1FBE8]">${esc(text(stats.content, "subheading", "We redefine collaboration, innovation, and success through a practical strategy and delivery model."))}</p>
      <a href="#fl-contact" class="mt-8 rounded-xl bg-[#A9FF5C] px-8 py-5 text-base font-bold text-[#090D06]">Get In Touch</a>
    </div>
  </div>
  <div class="grid gap-8 rounded-[28px] bg-[#002D00] px-6 py-12 text-center md:grid-cols-3 md:px-16">
    ${statValues
      .slice(0, 3)
      .map(
        (value, i) => `<div><div class="text-[clamp(3.5rem,8vw,7rem)] uppercase leading-[0.92] tracking-[-2px] text-[#A9FF5C]" style="font-family:var(--fl-display)">${esc(value)}</div><p class="mt-2 text-xl text-[#F1FBE8]">${esc(statLabels[i] || "Measured growth")}</p></div>`
      )
      .join("")}
  </div>
</section>

<section id="fl-testimonials" class="mx-auto max-w-[90rem] px-4 py-24 lg:px-20" style="${sectionBandCss(testimonials.theme)}">
  <div class="max-w-[36rem]">
    <h2 class="text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style="font-family:var(--fl-display)">${accentWords(text(testimonials.content, "heading", "Success Stories from Our Clients"), 2)}</h2>
    <p class="mt-5 text-xl leading-relaxed text-[#979F90]">Explore the firsthand experiences of teams who partnered with us to unlock sustainable growth.</p>
  </div>
  <div class="relative mt-14">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      ${testimonialCols
        .map(
          (col) => `<div class="space-y-4">
        ${col
          .map(
            (i) => `<article class="rounded-[20px] bg-[#1F2B15] px-6 pb-8 pt-6"><div class="mb-4 flex items-center gap-3"><img src="${ASSETS.avatars[i % ASSETS.avatars.length]}" alt="" class="h-9 w-9 rounded-full border border-[#7FD136] object-cover" /><span class="text-base text-[#7FD136]">${esc(authorList[i] || "Client")}</span></div><p class="text-base leading-relaxed text-[#979F90]">${esc(quoteList[i])}</p>${roleList[i] ? `<p class="mt-4 text-sm text-[#E1FFC7]/70">${esc(roleList[i])}</p>` : ""}</article>`
          )
          .join("")}
      </div>`
        )
        .join("")}
    </div>
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#090D06] to-transparent"></div>
  </div>
</section>

<section id="fl-advantages" class="mx-auto max-w-[90rem] px-4 py-24 lg:px-20" style="${sectionBandCss(advantages.theme)}">
  <h2 class="mx-auto max-w-[36rem] text-center text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style="font-family:var(--fl-display)">${accentWords(text(advantages.content, "heading", "Transform Challenges into Opportunities"), 3)}</h2>
  <div class="mt-14 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
    <article class="relative min-h-[24rem] overflow-hidden rounded-[28px] p-8 lg:p-14"><img src="${esc(advantageImg1)}" alt="" class="absolute inset-0 h-full w-full object-cover" /><div class="absolute inset-0 bg-black/35"></div><div class="relative z-10 max-w-[30rem]"><h3 class="text-[clamp(2rem,4.5vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px] text-[#F1FBE8]" style="font-family:var(--fl-display)">${esc(advantageTitles[0])}</h3><p class="mt-4 text-lg leading-relaxed text-[#F1FBE8]">${esc(advantageBodies[0] || "We tailor every interaction to your audience's intent and context to create meaningful conversion lift.")}</p></div></article>
    <article class="rounded-[28px] px-8 py-10 lg:px-14 lg:py-14" style="background:${FL.yellowSoft}"><h3 class="text-[clamp(2rem,4.5vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px]" style="font-family:var(--fl-display);color:${FL.yellowInk}">${esc(advantageTitles[1])}</h3><p class="mt-4 text-lg leading-relaxed text-[#090D06]">${esc(advantageBodies[1] || "Our campaigns are crafted to stand out while staying anchored to business goals and measurable outcomes.")}</p></article>
    <article class="rounded-[28px] px-8 py-10 lg:px-14 lg:py-14" style="background:${FL.orangeSoft}"><h3 class="text-[clamp(2rem,4.5vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px]" style="font-family:var(--fl-display);color:${FL.orangeInk}">${esc(advantageTitles[2] || "Setting Trends and Shaping Futures Through Campaign Innovation")}</h3><p class="mt-4 text-lg leading-relaxed text-[#090D06]">${esc(advantageBodies[2] || "We merge trend sensing with strategic experimentation to keep your brand ahead of the market.")}</p></article>
    <article class="relative min-h-[24rem] overflow-hidden rounded-[28px] p-8 lg:p-14"><img src="${esc(advantageImg2)}" alt="" class="absolute inset-0 h-full w-full object-cover" /><div class="absolute inset-0 bg-black/35"></div><div class="relative z-10 max-w-[30rem]"><h3 class="text-[clamp(2rem,4.5vw,3rem)] uppercase leading-[0.92] tracking-[-0.8px] text-[#F1FBE8]" style="font-family:var(--fl-display)">${esc(advantageTitles[3] || "Seamlessly Connecting Across Channels")}</h3><p class="mt-4 text-lg leading-relaxed text-[#F1FBE8]">${esc(advantageBodies[3] || "We orchestrate your channel mix so every touchpoint reinforces the same strategic message.")}</p></div></article>
  </div>
</section>

<section id="fl-faq" class="mx-auto max-w-[90rem] px-4 py-24 lg:px-20" style="${sectionBandCss(faq.theme)}">
  <div class="mx-auto max-w-[36rem] text-center">
    <h2 class="text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style="font-family:var(--fl-display)">${accentWords(text(faq.content, "heading", "Frequently Asked Questions"), 2)}</h2>
    <p class="mt-5 text-xl leading-relaxed text-[#979F90]">We address common queries and provide clear guidance as you evaluate your next growth phase.</p>
  </div>
  <div class="mx-auto mt-14 max-w-[53rem] space-y-4">
    ${questions
      .map(
        (question, i) => `<details ${i === 0 ? "open" : ""} class="group overflow-hidden rounded-[20px] bg-[#1F2B15]">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[20px] bg-[#E1FFC7] px-8 py-6">
        <span class="text-2xl text-[#003800]">${esc(question)}</span>
        <span class="grid h-[76px] w-[76px] place-items-center rounded-[20px] bg-[#7FD136]"><img src="${ASSETS.faqAdd}" alt="" class="h-7 w-7 object-contain group-open:hidden" /><img src="${ASSETS.faqDismiss}" alt="" class="hidden h-7 w-7 object-contain group-open:block" /></span>
      </summary>
      <p class="px-8 pb-7 pt-6 text-xl leading-relaxed text-[#E1FFC7]">${esc(answers[i] || "Our team will tailor the solution to your goals, timeline, and team setup while keeping communication transparent.")}</p>
    </details>`
      )
      .join("")}
  </div>
</section>

<section id="fl-contact" class="mx-auto max-w-[90rem] px-4 py-24 lg:px-20" style="${sectionBandCss(contact.theme)}">
  <div class="max-w-[36rem]">
    <h2 class="text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.92] tracking-[-1.4px]" style="font-family:var(--fl-display)">${accentWords(text(contact.content, "heading", "Let's Connect and Ignite Success"), 2)}</h2>
    <p class="mt-5 text-xl leading-relaxed text-[#979F90]">${esc(text(contact.content, "subheading", "Ready to take the next step? Contact us to explore how our strategies can propel your business forward."))}</p>
  </div>
  <div class="mt-14 grid gap-4 md:grid-cols-2">
    <article class="rounded-[28px] bg-[#E1FFC7] px-8 py-12 text-center"><h3 class="text-[2.5rem] uppercase leading-[0.92] tracking-[-0.8px] text-[#356905]" style="font-family:var(--fl-display)">Drop Us a Line</h3><p class="mt-2 text-xl text-[#003800]">${esc(contactEmail)}</p></article>
    <article class="rounded-[28px] bg-[#E1FFC7] px-8 py-12 text-center"><h3 class="text-[2.5rem] uppercase leading-[0.92] tracking-[-0.8px] text-[#356905]" style="font-family:var(--fl-display)">Book a Call</h3><p class="mt-2 text-xl text-[#003800]">${esc(contactPhone)}</p></article>
  </div>
  <div class="mt-4 grid gap-4 lg:grid-cols-[524px_1fr]">
    <article class="rounded-[28px] bg-[#243317] p-10">
      <h3 class="text-[2.5rem] uppercase leading-[0.92] tracking-[-0.8px] text-[#E1FFC7]" style="font-family:var(--fl-display)">Connect with Ease</h3>
      <p class="mt-4 text-xl leading-relaxed text-[#E1FFC7]">Your inquiries, ideas, and collaboration opportunities are just a click away.</p>
      <div class="mt-8 space-y-7">
        <div><div class="mb-2 text-base text-[#F1FBE8]">Full Name</div><div class="rounded-xl border border-[#F1FBE8]/30 px-6 py-5 text-base text-[#F1FBE8]/50">${esc(businessName)}</div></div>
        <div><div class="mb-2 text-base text-[#F1FBE8]">Email</div><div class="rounded-xl border border-[#F1FBE8]/30 px-6 py-5 text-base text-[#F1FBE8]/50">${esc(contactEmail)}</div></div>
        <div><div class="mb-2 text-base text-[#F1FBE8]">Question</div><div class="rounded-xl border border-[#F1FBE8]/30 px-6 py-5 text-base text-[#F1FBE8]/50">How can we help you?</div></div>
      </div>
      <a href="${contactHref}" class="mt-8 inline-block rounded-xl bg-[#A9FF5C] px-8 py-5 text-base font-bold text-[#090D06]">${esc(contactCta)}</a>
      <p class="mt-6 text-sm text-[#F1FBE8]/65">${esc(contactAddress)}</p>
    </article>
    <div class="relative min-h-[480px] overflow-hidden rounded-[28px]"><img src="${ASSETS.contactImage}" alt="" class="absolute inset-0 h-full w-full object-cover" /></div>
  </div>
</section>

<footer class="px-4 pb-10 lg:px-20" style="${sectionBandCss(footer.theme)}">
  <div class="rounded-[28px] bg-[#131C0B] p-8 lg:p-12">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <a href="#fl-top" class="inline-flex items-center gap-3">${customLogo ? `<img src="${esc(customLogo)}" alt="" class="h-11 w-11 object-contain" />` : `<img src="${ASSETS.logoFooter}" alt="" class="h-11 w-11 object-contain" />`}<span class="text-2xl uppercase tracking-wide text-[#E1FFC7]" style="font-family:var(--fl-display)">${esc(businessName)}</span></a>
      <nav class="flex flex-wrap items-center gap-x-5 gap-y-2 text-[#E1FFC7]">${footerNav}</nav>
      <div class="flex items-center gap-2"><span class="grid h-10 w-10 place-items-center rounded-[10px] bg-[#A9FF5C]"><img src="${ASSETS.socialFacebook}" alt="" class="h-[18px] w-[18px] object-contain" /></span><span class="grid h-10 w-10 place-items-center rounded-[10px] bg-[#A9FF5C]"><img src="${ASSETS.socialLinkedin}" alt="" class="h-[18px] w-[18px] object-contain" /></span><span class="grid h-10 w-10 place-items-center rounded-[10px] bg-[#A9FF5C]"><img src="${ASSETS.socialTwitter}" alt="" class="h-[18px] w-[18px] object-contain" /></span></div>
    </div>
    <div class="mt-8 border-t border-[#1F2B15] pt-6 text-center text-sm text-[#979F90]">© ${new Date().getFullYear()} ${esc(businessName)}, All Rights Reserved</div>
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
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Onest:wght@400;500;700&display=swap" rel="stylesheet" />
  ${themeFontHref(site.theme) ? `<link href="${themeFontHref(site.theme)}" rel="stylesheet" />` : ""}
  <style>
    :root {
      --fl-display: 'Barlow Condensed', 'Oswald', ui-sans-serif, system-ui, sans-serif;
      --fl-body: 'Onest', 'Inter', ui-sans-serif, system-ui, sans-serif;
      ${brandCss(site.theme, "#A9FF5C")}
      ${themeFontCss(site.theme, ["--fl-display", "--fl-body"])}
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--fl-body);
      color: ${FL.ink};
      background: ${FL.canvas};
      -webkit-font-smoothing: antialiased;
    }
    ${themeFontBodyCss(site.theme)}
  </style>
</head>
<body id="fl-top">
${body}
</body>
</html>`;
}
