import { Inter, Urbanist } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { TV } from "@/components/templates/techvantage/tokens";
import { list, slotAt, text, toSlots } from "@/components/templates/content";

const display = Urbanist({
  subsets: ["latin"],
  variable: "--tv-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--tv-body",
  weight: ["400", "500"],
  display: "swap",
});

const ASSETS = {
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
  social: [
    "/templates/techvantage/social-1.svg",
    "/templates/techvantage/social-2.svg",
    "/templates/techvantage/social-3.svg",
    "/templates/techvantage/social-4.svg",
    "/templates/techvantage/social-5.svg",
  ],
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
} as const;

const NAV = [
  { label: "About Us", href: "#tv-about" },
  { label: "Our Services", href: "#tv-services" },
  { label: "Case Studies", href: "#tv-work" },
  { label: "Blogs", href: "#tv-articles" },
  { label: "Contact Us", href: "#tv-contact" },
];

/** Vertical navy gradient the design reuses for the hero, quotes and footer. */
const PANEL = `linear-gradient(180deg, ${TV.panelTop} 0%, ${TV.panelBottom} 100%)`;

/**
 * The complete Techvantage design. The layout is locked — content is injected
 * from the blueprint's fixed slots, so AI copy and editor changes can never
 * alter the structure of the page.
 */
export function TechvantageSite({
  blueprint,
  site,
  contact,
}: {
  blueprint?: WebsiteBlueprint | null;
  site?: AssembledSite | null;
  /** Overrides the persisted details while editing, where nothing is saved yet. */
  contact?: SiteContact | null;
}) {
  const slots = toSlots(blueprint, site);

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
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "Techvantage";

  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const contactPhone = details?.phone?.trim() || "";
  const contactAddress = details?.address?.trim() || "";

  const heroImage = hero.image || ASSETS.hero;
  const aboutImageA = about.image || ASSETS.aboutA;
  const aboutImageB = about.itemImages[0] || ASSETS.aboutB;
  const approachImage = approach.image || ASSETS.approach;

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

  const contactHref = contactEmail ? `mailto:${contactEmail}` : "#tv-contact";

  return (
    <div
      id="tv-top"
      className={`${display.variable} ${body.variable} scroll-smooth antialiased`}
      style={{
        fontFamily: "var(--tv-body), ui-sans-serif, system-ui, sans-serif",
        color: TV.ink,
        backgroundColor: "#ffffff",
      }}
    >
      {/* Hero panel — the navigation sits inside the dark gradient */}
      <div style={{ background: PANEL }}>
        <Shell className="flex flex-wrap items-center gap-x-8 gap-y-4 py-6 lg:py-8">
          <a href="#tv-top" className="flex shrink-0 items-center gap-2">
            <img src={ASSETS.logo} alt="" width={50} height={39} className="h-8 w-auto lg:h-[39px]" />
            <span
              className="text-2xl font-bold text-white lg:text-[33px]"
              style={{ fontFamily: "var(--tv-display)" }}
            >
              {businessName}
            </span>
          </a>

          <nav className="order-last flex w-full flex-wrap items-center gap-x-6 gap-y-2 text-[15px] text-white/90 lg:order-none lg:w-auto lg:gap-x-[50px] lg:text-base">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition-opacity hover:opacity-70">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-5">
            {contactPhone ? (
              <div className="hidden items-center gap-2.5 xl:flex">
                <IconDisc src={ASSETS.phone} />
                <span className="leading-tight text-white">
                  <span className="block text-sm text-white/70">Get in Touch</span>
                  <a
                    href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`}
                    className="block text-[18px] font-bold"
                    style={{ fontFamily: "var(--tv-display)" }}
                  >
                    {contactPhone}
                  </a>
                </span>
              </div>
            ) : null}
            <Pill href={contactHref}>Contact Us</Pill>
          </div>
        </Shell>

        <Shell className="grid items-center gap-10 pb-16 pt-6 lg:grid-cols-[minmax(0,785px)_minmax(0,679px)] lg:gap-12 lg:pb-[110px] lg:pt-4">
          <div>
            <h1
              className="text-[40px] font-medium leading-[1.12] text-white sm:text-[56px] lg:text-[72px] lg:leading-[84px]"
              style={{ fontFamily: "var(--tv-display)" }}
            >
              {text(hero.content, "headline", "Empowering Businesses with Cutting-Edge Technology")}
            </h1>
            <p className="mt-6 max-w-[640px] text-[17px] leading-[28px] lg:text-[18px]" style={{ color: TV.wash }}>
              {text(
                hero.content,
                "subheadline",
                "Strategy, software and cloud delivery from a team that stays accountable for the outcome."
              )}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Pill href="#tv-services">{text(hero.content, "ctaPrimary", "Our Services")}</Pill>
              <Pill href="#tv-about" variant="outline">
                {text(hero.content, "ctaSecondary", "Learn More")}
              </Pill>
            </div>
          </div>
          <img
            src={heroImage}
            alt=""
            className="aspect-[679/681] w-full rounded-[24px] object-cover"
          />
        </Shell>
      </div>

      {/* Services */}
      <section id="tv-services" className="bg-white py-16 lg:py-[110px]">
        <Shell>
          <Eyebrow>{text(services.content, "eyebrow", "Our services")}</Eyebrow>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Heading className="max-w-[785px]">
              {text(services.content, "heading", "Expert Services to Drive Digital Transformation")}
            </Heading>
            <Pill href="#tv-contact" tone="deep">
              View All Services
            </Pill>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {serviceTitles.slice(0, 3).map((title, i) => (
              <article
                key={`${title}-${i}`}
                className="rounded-[24px] border p-8 transition-shadow hover:shadow-[0_18px_50px_-28px_rgba(12,61,255,0.45)]"
                style={{ borderColor: TV.line }}
              >
                <img
                  src={ASSETS.serviceIcons[i % ASSETS.serviceIcons.length]}
                  alt=""
                  width={64}
                  height={64}
                  className="size-16"
                />
                <h3
                  className="mt-7 text-[24px] font-medium leading-[30px]"
                  style={{ fontFamily: "var(--tv-display)", color: TV.ink }}
                >
                  {title}
                </h3>
                <p className="mt-3 text-[16px] leading-[26px]" style={{ color: TV.body }}>
                  {serviceBodies[i] ?? ""}
                </p>
                <span
                  className="mt-6 inline-flex items-center gap-1.5 text-[18px] font-semibold"
                  style={{ fontFamily: "var(--tv-display)", color: TV.blueDeep }}
                >
                  Learn More
                  <ArrowUpRight />
                </span>
              </article>
            ))}
          </div>

          {/* Carousel affordance from the design */}
          <div className="mt-12 h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: TV.surface }}>
            <div className="h-full w-1/3 rounded-full" style={{ backgroundColor: TV.blueSoft }} />
          </div>
        </Shell>
      </section>

      {/* Story + statistics */}
      <section id="tv-about" className="py-16 lg:py-[110px]" style={{ backgroundColor: TV.surface }}>
        <Shell>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,649px)_minmax(0,1fr)]">
            <div>
              <Eyebrow>{text(about.content, "eyebrow", "Who we are")}</Eyebrow>
              <Heading>{text(about.content, "heading", "Our Journey From Vision to Reality")}</Heading>
              <p className="mt-7 whitespace-pre-line text-[18px] leading-[28px]" style={{ color: TV.body }}>
                {text(about.content, "body")}
              </p>
              <div className="mt-9">
                <Pill href="#tv-contact">Learn More About Us</Pill>
              </div>
            </div>

            <div className="flex items-end justify-center gap-4 sm:gap-6">
              <img
                src={aboutImageA}
                alt=""
                className="aspect-[377/449] w-1/2 max-w-[377px] rounded-[24px] object-cover"
              />
              <img
                src={aboutImageB}
                alt=""
                className="aspect-[375/516] w-1/2 max-w-[375px] rounded-[20px] object-cover"
              />
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 lg:mt-[110px] lg:grid-cols-4 lg:gap-x-[120px]">
            {statValues.slice(0, 4).map((value, i) => (
              <div key={`${value}-${i}`}>
                <div
                  className="text-[44px] font-medium leading-tight lg:text-[72px] lg:leading-[84px]"
                  style={{ fontFamily: "var(--tv-display)", color: TV.inkDeep }}
                >
                  {splitStat(value).number}
                  <span style={{ color: TV.blue }}>{splitStat(value).suffix}</span>
                </div>
                <p className="mt-1 text-[17px] leading-[28px] lg:text-[18px]" style={{ color: TV.ink }}>
                  {statLabels[i] ?? ""}
                </p>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      {/* Why choose us */}
      <section className="bg-white py-16 lg:py-[110px]">
        <Shell>
          <div className="mx-auto max-w-[720px] text-center">
            <Eyebrow center>{text(why.content, "eyebrow", "Why choose us")}</Eyebrow>
            <Heading center>{text(why.content, "heading", "Expertise That Delivers Results")}</Heading>
            <p className="mt-6 text-[18px] leading-[28px]" style={{ color: TV.body }}>
              {text(why.content, "subheading")}
            </p>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {whyTitles.slice(0, 4).map((title, i) => (
              <div key={`${title}-${i}`}>
                <img
                  src={ASSETS.valueIcons[i % ASSETS.valueIcons.length]}
                  alt=""
                  width={70}
                  height={70}
                  className="size-[70px]"
                />
                <h3
                  className="mt-6 text-[24px] font-medium leading-[30px]"
                  style={{ fontFamily: "var(--tv-display)", color: TV.ink }}
                >
                  {title}
                </h3>
                <p className="mt-3 text-[16px] leading-[26px]" style={{ color: TV.body }}>
                  {whyBodies[i] ?? ""}
                </p>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      {/* Our approach */}
      <section className="bg-white pb-16 lg:pb-[110px]">
        <Shell>
          <div className="h-px w-full" style={{ backgroundColor: TV.line }} />
          <div className="mt-16 grid items-center gap-12 lg:mt-[100px] lg:grid-cols-2 lg:gap-16">
            <img
              src={approachImage}
              alt=""
              className="aspect-[755/513] w-full rounded-[24px] object-cover"
            />
            <div>
              <Eyebrow>{text(approach.content, "eyebrow", "Our approach")}</Eyebrow>
              <Heading>
                {text(approach.content, "heading", "Providing More Than Just Solutions")}
              </Heading>
              <p className="mt-6 text-[18px] leading-[28px]" style={{ color: TV.body }}>
                {text(approach.content, "subheading")}
              </p>
              <ul className="mt-8 space-y-5">
                {approachBullets.slice(0, 3).map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <img src={ASSETS.check} alt="" width={24} height={24} className="mt-1 size-6 shrink-0" />
                    <span className="text-[18px] leading-[28px]" style={{ color: TV.body }}>
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Shell>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-[110px]" style={{ background: PANEL }}>
        <Shell className="text-center">
          <Eyebrow center onDark>
            {text(testimonials.content, "eyebrow", "Testimonials")}
          </Eyebrow>
          <Heading center onDark>
            {text(testimonials.content, "heading", "Hear from Our Satisfied Customers")}
          </Heading>

          <blockquote
            className="mx-auto mt-12 max-w-[1050px] text-[19px] leading-[34px] lg:text-[22px] lg:leading-[38px]"
            style={{ color: TV.wash }}
          >
            {quotes[0] ?? ""}
          </blockquote>

          <div className="mt-10 flex flex-col items-center gap-3">
            <img src={ASSETS.avatar} alt="" width={64} height={64} className="size-16 rounded-full object-cover" />
            <div>
              <div
                className="text-[20px] font-semibold text-white"
                style={{ fontFamily: "var(--tv-display)" }}
              >
                {authors[0] ?? ""}
              </div>
              <div className="text-[16px]" style={{ color: TV.onDarkMuted }}>
                {roles[0] ?? ""}
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2" aria-hidden>
            <span className="h-[5px] w-3 rounded-full" style={{ backgroundColor: TV.dot }} />
            <span className="h-[5px] w-[50px] rounded-full bg-white" />
            <span className="h-[5px] w-3 rounded-full" style={{ backgroundColor: TV.dot }} />
          </div>
        </Shell>
      </section>

      {/* Case studies */}
      <section id="tv-work" className="bg-white py-16 lg:py-[110px]">
        <Shell>
          <Eyebrow>{text(work.content, "eyebrow", "Our work")}</Eyebrow>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Heading className="max-w-[785px]">
              {text(work.content, "heading", "See How We've Made a Difference")}
            </Heading>
            <Pill href="#tv-contact" tone="deep">
              View All Case Studies
            </Pill>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {workTitles.slice(0, 4).map((title, i) => (
              <article key={`${title}-${i}`} className="group">
                <img
                  src={work.itemImages[i] || ASSETS.cases[i % ASSETS.cases.length]}
                  alt=""
                  className="aspect-[4/3] w-full rounded-[18px] object-cover"
                />
                <h3
                  className="mt-5 text-[20px] font-semibold leading-[28px]"
                  style={{ fontFamily: "var(--tv-display)", color: TV.ink }}
                >
                  {title}
                </h3>
                <p className="mt-2 text-[16px] leading-[26px]" style={{ color: TV.body }}>
                  {workBodies[i] ?? ""}
                </p>
              </article>
            ))}
          </div>
        </Shell>
      </section>

      {/* Trusted-by strip */}
      <section className="py-14 lg:py-[70px]" style={{ backgroundColor: TV.surface }}>
        <Shell className="text-center">
          <Eyebrow center>Our clients</Eyebrow>
          <h2
            className="text-[28px] font-medium leading-tight lg:text-[36px]"
            style={{ fontFamily: "var(--tv-display)", color: TV.ink }}
          >
            Trusted by teams that ship
          </h2>
          <p className="mt-3 text-[16px]" style={{ color: TV.body }}>
            Companies trust our services to be the best.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
            {["Northwind", "Vertexa", "Lumina", "Cobalt", "Arcadia"].map((client) => (
              <span
                key={client}
                className="text-[20px] font-bold tracking-tight"
                style={{ fontFamily: "var(--tv-display)", color: TV.ink }}
              >
                {client}
              </span>
            ))}
          </div>
        </Shell>
      </section>

      {/* Articles */}
      <section id="tv-articles" className="bg-white py-16 lg:py-[110px]">
        <Shell>
          <Eyebrow>{text(articles.content, "eyebrow", "Blogs")}</Eyebrow>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Heading className="max-w-[785px]">
              {text(articles.content, "heading", "Discover the Latest Articles")}
            </Heading>
            <Pill href="#tv-contact" tone="deep">
              View All Blogs
            </Pill>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Featured article */}
            {articleTitles[0] ? (
              <article className="rounded-[24px] p-[30px]" style={{ backgroundColor: TV.surface }}>
                <img
                  src={articles.itemImages[0] || ASSETS.articles[0]}
                  alt=""
                  className="aspect-[725/290] w-full rounded-[14px] object-cover"
                />
                <h3
                  className="mt-8 text-[22px] font-semibold leading-[32px] lg:text-[26px] lg:leading-[36px]"
                  style={{ fontFamily: "var(--tv-display)", color: TV.ink }}
                >
                  {articleTitles[0]}
                </h3>
                <p className="mt-3 text-[16px] leading-[26px]" style={{ color: TV.body }}>
                  {articleBodies[0] ?? ""}
                </p>
                <ReadMore />
              </article>
            ) : null}

            {/* Secondary articles */}
            <div className="grid gap-6 content-start">
              {articleTitles.slice(1, 3).map((title, i) => (
                <article
                  key={`${title}-${i}`}
                  className="grid gap-5 overflow-hidden rounded-[14px] border sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)]"
                  style={{ borderColor: TV.line }}
                >
                  <img
                    src={articles.itemImages[i + 1] || ASSETS.articles[(i + 1) % ASSETS.articles.length]}
                    alt=""
                    className="aspect-[377/253] w-full object-cover sm:h-full"
                  />
                  <div className="p-5 sm:py-8 sm:pl-0 sm:pr-6">
                    <h3
                      className="text-[19px] font-semibold leading-[28px]"
                      style={{ fontFamily: "var(--tv-display)", color: TV.ink }}
                    >
                      {title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-[24px]" style={{ color: TV.body }}>
                      {articleBodies[i + 1] ?? ""}
                    </p>
                    <ReadMore />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Shell>
      </section>

      {/* FAQs */}
      <section className="py-16 lg:py-[110px]" style={{ backgroundColor: TV.surface }}>
        <Shell>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-20">
            <div>
              <Eyebrow>FAQs</Eyebrow>
              <Heading>{text(faq.content, "heading", "Have any questions? We've got answers")}</Heading>
              <p className="mt-5 text-[18px] leading-[28px]" style={{ color: TV.body }}>
                Can&rsquo;t find what you&rsquo;re looking for? Don&rsquo;t hesitate to reach out.
              </p>
              <div className="mt-7">
                <Pill href={contactHref}>Contact Us</Pill>
              </div>
            </div>

            <div>
              {questions.slice(0, 5).map((question, i) => (
                <details
                  key={`${question}-${i}`}
                  open={i === 0}
                  className="group border-b py-6"
                  style={{ borderColor: TV.line }}
                >
                  <summary
                    className="flex cursor-pointer list-none items-start justify-between gap-6 text-[19px] font-semibold leading-[30px] lg:text-[20px]"
                    style={{
                      fontFamily: "var(--tv-display)",
                      color: i === 0 ? TV.blueDeep : TV.bodyMuted,
                    }}
                  >
                    {question}
                    <span className="mt-1 shrink-0" style={{ color: TV.blueDeep }}>
                      <ArrowUpRight />
                    </span>
                  </summary>
                  <p className="mt-4 text-[17px] leading-[28px] lg:text-[18px]" style={{ color: TV.body }}>
                    {answers[i] ?? ""}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Shell>
      </section>

      {/* Closing call to action, straddling the light section and the footer */}
      <div style={{ background: PANEL }} id="tv-contact">
        {/* The hard-stop gradient puts the card's top half on the section above. */}
        <div
          style={{
            backgroundImage: `linear-gradient(to bottom, ${TV.surface} 45%, transparent 45%)`,
          }}
        >
          <Shell>
            <div
              className="overflow-hidden rounded-[24px] px-7 py-9 lg:px-14 lg:py-11"
              style={{
                backgroundColor: TV.blue,
                backgroundImage: `url(${ASSETS.ctaBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
                <IconDisc src={ASSETS.phone} />
                <div className="min-w-[260px] flex-1">
                  <h2
                    className="text-[28px] font-medium leading-tight text-white lg:text-[48px] lg:leading-[58px]"
                    style={{ fontFamily: "var(--tv-display)" }}
                  >
                    {text(cta.content, "headline", "Have a project in mind?")}
                  </h2>
                  <p
                    className="mt-2 text-[17px] leading-[28px] lg:text-[18px]"
                    style={{ color: TV.surface }}
                  >
                    {text(
                      cta.content,
                      "subheadline",
                      "Tell us what you're building and we'll map the next step."
                    )}
                  </p>
                </div>
                <Pill href={contactHref} tone="onBlue">
                  {text(cta.content, "ctaPrimary", "Contact Us")}
                </Pill>
              </div>
            </div>
          </Shell>
        </div>

        {/* Footer */}
        <Shell className="pb-10 pt-14 lg:pt-[80px]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
            <div>
              <div className="flex items-center gap-2">
                <img src={ASSETS.logo} alt="" width={50} height={39} className="h-8 w-auto" />
                <span
                  className="text-[26px] font-bold text-white"
                  style={{ fontFamily: "var(--tv-display)" }}
                >
                  {businessName}
                </span>
              </div>

              <div className="mt-8">
                <div
                  className="text-[18px] font-semibold text-white"
                  style={{ fontFamily: "var(--tv-display)" }}
                >
                  Subscribe to Our Newsletter
                </div>
                <p className="mt-3 max-w-[340px] text-[16px] leading-[26px]" style={{ color: TV.onDarkMuted }}>
                  {text(footer.content, "tagline", "Technology partners for teams that need results.")}
                </p>
                <div
                  className="mt-5 flex max-w-[377px] items-center gap-4 rounded-full border px-6 py-2.5"
                  style={{ borderColor: TV.lineDark }}
                >
                  <span className="flex-1 text-[17px]" style={{ color: TV.onDarkMuted }}>
                    Email Address
                  </span>
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: TV.wash }}
                  >
                    <ArrowUpRight />
                  </span>
                </div>
              </div>
            </div>

            <FooterColumn title="Services">
              {serviceTitles.slice(0, 4).map((label, i) => (
                <a key={`${label}-${i}`} href="#tv-services" className="hover:text-white">
                  {label}
                </a>
              ))}
            </FooterColumn>

            <FooterColumn title="Quick Links">
              {footerLinks.slice(0, 5).map((label, i) => (
                <a key={`${label}-${i}`} href={NAV[i]?.href ?? "#tv-top"} className="hover:text-white">
                  {label}
                </a>
              ))}
            </FooterColumn>

            <FooterColumn title="Contact Information">
              {contactPhone ? (
                <ContactRow icon={ASSETS.contactPhone} label="Phone:" composite={false}>
                  <a href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`} className="hover:underline">
                    {contactPhone}
                  </a>
                </ContactRow>
              ) : null}
              {contactEmail ? (
                <ContactRow icon={ASSETS.contactEmail} label="Email:">
                  <a href={`mailto:${contactEmail}`} className="hover:underline">
                    {contactEmail}
                  </a>
                </ContactRow>
              ) : null}
              {contactAddress ? (
                <ContactRow icon={ASSETS.contactLocation} label="Location:">
                  {contactAddress}
                </ContactRow>
              ) : null}
            </FooterColumn>
          </div>

          <div className="mt-14 flex items-center gap-5">
            <span className="hidden h-px flex-1 sm:block" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
            <span className="mx-auto flex items-center gap-3 sm:mx-0">
              {ASSETS.social.map((src) => (
                <img key={src} src={src} alt="" width={37} height={37} className="size-[37px]" />
              ))}
            </span>
            <span className="hidden h-px flex-1 sm:block" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
          </div>

          <div
            className="flex flex-wrap items-center justify-between gap-4 pt-8 text-[15px]"
            style={{ color: TV.onDarkMuted }}
          >
            <span>
              &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
            </span>
            <span className="flex gap-6">
              <span>Terms and Conditions</span>
              <span>Privacy Policy</span>
            </span>
          </div>
        </Shell>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- primitives */

function Shell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1620px] px-5 sm:px-8 lg:px-[60px] ${className}`}>
      {children}
    </div>
  );
}

function Heading({
  children,
  center,
  onDark,
  className = "",
}: {
  children: React.ReactNode;
  center?: boolean;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <h2
      className={`text-[32px] font-medium leading-[1.18] sm:text-[40px] lg:text-[48px] lg:leading-[58px] ${
        center ? "mx-auto" : ""
      } ${className}`}
      style={{ fontFamily: "var(--tv-display)", color: onDark ? "#ffffff" : TV.ink }}
    >
      {children}
    </h2>
  );
}

function Eyebrow({
  children,
  center,
  onDark,
}: {
  children: React.ReactNode;
  center?: boolean;
  onDark?: boolean;
}) {
  return (
    <p
      className={`mb-4 text-[16px] font-medium uppercase leading-[26px] ${center ? "text-center" : ""}`}
      style={{ fontFamily: "var(--tv-display)", color: onDark ? "#7FA6FF" : TV.blue }}
    >
      {children}
    </p>
  );
}

function Pill({
  href,
  children,
  variant = "solid",
  tone = "blue",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  tone?: "blue" | "deep" | "onBlue";
}) {
  const solid = {
    blue: { backgroundColor: TV.blue, color: TV.wash },
    deep: { backgroundColor: TV.blueDeep, color: TV.wash },
    onBlue: { backgroundColor: TV.wash, color: TV.blueDeep },
  }[tone];

  return (
    <a
      href={href}
      className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-full px-7 text-[17px] font-semibold transition-opacity hover:opacity-90 lg:text-[18px]"
      style={
        variant === "outline"
          ? { border: `1px solid ${TV.wash}`, color: TV.wash, fontFamily: "var(--tv-display)" }
          : { ...solid, fontFamily: "var(--tv-display)" }
      }
    >
      {children}
    </a>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[18px] font-semibold text-white" style={{ fontFamily: "var(--tv-display)" }}>
        {title}
      </div>
      <div className="mt-5 flex flex-col gap-3 text-[16px]" style={{ color: TV.onDarkMuted }}>
        {children}
      </div>
    </div>
  );
}

/**
 * A footer contact line. The email and location assets already include the
 * translucent disc; the phone glyph ships on its own and gets one applied.
 */
function ContactRow({
  icon,
  label,
  children,
  composite = true,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
  composite?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {composite ? (
        <img src={icon} alt="" width={40} height={40} className="size-10 shrink-0" />
      ) : (
        <IconDisc src={icon} />
      )}
      <span className="leading-snug">
        <span className="block" style={{ color: TV.onDarkMuted }}>
          {label}
        </span>
        <span className="font-medium text-white" style={{ fontFamily: "var(--tv-display)" }}>
          {children}
        </span>
      </span>
    </div>
  );
}

function ReadMore() {
  return (
    <span
      className="mt-5 inline-flex items-center gap-1.5 text-[17px] font-semibold"
      style={{ fontFamily: "var(--tv-display)", color: TV.blueDeep }}
    >
      Read More
      <ArrowUpRight />
    </span>
  );
}

function ArrowUpRight() {
  return <img src={ASSETS.arrow} alt="" width={12} height={12} className="size-3 shrink-0" />;
}

/** The design puts its icons on a 40px translucent white disc. */
function IconDisc({ src, size = 22 }: { src: string; size?: number }) {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
    >
      <img src={src} alt="" width={size} height={size} style={{ width: size, height: size }} />
    </span>
  );
}

/** "500+" and "98%" render their trailing symbol in the accent blue. */
function splitStat(value: string): { number: string; suffix: string } {
  const match = value.trim().match(/^(.*?)([+%]?)$/);
  return { number: match?.[1] ?? value, suffix: match?.[2] ?? "" };
}
