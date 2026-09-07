import { Sora } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { list, slotAt, text, toSlots } from "../shared/content";
import { CS } from "./tokens";
import { brandStyle, sectionBandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";
import { IconGlyph } from "@/lib/icons/glyph";
import { isIconName } from "@/lib/icons/registry";

const sora = Sora({
  subsets: ["latin"],
  variable: "--cs-font",
  weight: ["400", "500", "600"],
  display: "swap",
});

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

/**
 * Type recovered from the outlined "CraftedSpaces" wordmark assets so the
 * business name renders identically to the original artwork. Sizes come from the
 * assets' cap height at their rendered heights: 22px / 26.4px in the header
 * (h-5 / lg:h-6) and 30.8px in the footer (h-7).
 */
const WORDMARK = {
  fontFamily: "var(--cs-font), ui-sans-serif, system-ui, sans-serif",
  fontWeight: 400,
  letterSpacing: "-0.02em",
  lineHeight: 1,
} as const;

/**
 * Full-site CraftedSpaces design from Figma node 137:402.
 * Layout is fixed; AI/editor only change slot text and media content.
 */
export function CraftedSpacesSite({
  blueprint,
  site,
  contact,
}: {
  blueprint?: WebsiteBlueprint | null;
  site?: AssembledSite | null;
  contact?: SiteContact | null;
}) {
  const slots = toSlots(blueprint, site);

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

  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "CraftedSpaces";

  // Only a logo the user actually uploaded replaces the template mark; the
  // auto-generated `site.logo` wordmark is never used here.
  const customLogo = site?.theme.logoUrl?.trim() || "";

  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const contactPhone = details?.phone?.trim() || "";
  const contactAddress = details?.address?.trim() || "";

  const projectTitles = list(projects.content, "itemTitles");
  const projectBodies = list(projects.content, "itemBodies");
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
  const quotes = list(testimonials.content, "quotes");
  const authors = list(testimonials.content, "authors");
  const roles = list(testimonials.content, "roles");
  const blogTitles = list(blogs.content, "itemTitles");
  const blogBodies = list(blogs.content, "itemBodies");
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
  // The testimonial band sits behind a dark overlay. Prefer the section's own
  // sourced image, then any other business photo, so it matches the brand rather
  // than falling back to the design's stock interior shot.
  const testimonialBg =
    testimonials.image || hero.image || about.image || gallery.itemImages[0] || A.heroAlt;

  return (
    <div
      id="cs-top"
      className={`${sora.variable} scroll-smooth`}
      style={{
        ...brandStyle(site?.theme, "#FFF6D2"),
        fontFamily: "var(--cs-font), ui-sans-serif, system-ui, sans-serif",
        color: CS.ink,
        backgroundColor: CS.canvas,
        ...themeFontStyle(site?.theme, ["--cs-font"]),
      }}
    >
      {themeFontHref(site?.theme) ? (
        <link rel="stylesheet" href={themeFontHref(site?.theme)!} />
      ) : null}
      <header className="px-4 pb-6 pt-5 sm:px-6 lg:px-[30px] lg:pb-8 lg:pt-[30px]">
        <Shell className="flex flex-wrap items-center gap-5">
          <a href="#cs-top" className="flex items-center gap-3">
            <img
              src={customLogo || A.logoIcon}
              alt=""
              width={58}
              height={39}
              className="h-8 w-auto object-contain lg:h-[39px]"
            />
            <span
              className="max-w-[min(58vw,320px)] truncate text-[22px] lg:max-w-[420px] lg:text-[26.4px]"
              style={{ ...WORDMARK, color: "#000000" }}
            >
              {businessName}
            </span>
          </a>

          <nav className="order-last flex w-full flex-wrap items-center gap-x-6 gap-y-2 text-sm lg:order-none lg:mx-auto lg:w-auto lg:gap-x-[60px] lg:text-base">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition-opacity hover:opacity-65">
                {item.label}
              </a>
            ))}
          </nav>

          <Pill href="#cs-contact" light>
            Let&apos;s Talk
          </Pill>
        </Shell>
      </header>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-[30px]">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={heroImage}
            alt=""
            data-parallax="0.1"
            className="h-[480px] w-full object-cover sm:h-[620px] lg:h-[780px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          <Shell className="absolute inset-x-0 bottom-10 lg:bottom-[70px]">
            <p className="text-xs uppercase tracking-[0.22em] text-white/80 sm:text-sm">
              {text(hero.content, "eyebrow", "INTERIOR & ARCHITECTURAL DESIGN")}
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl leading-[1.1] text-white sm:text-5xl lg:text-[80px] lg:leading-[100px]">
              {text(hero.content, "headline", "Transforming Spaces with Elegance & Precision")}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 lg:text-base">
              {text(
                hero.content,
                "subheadline",
                "Thoughtful interiors and architecture tailored to your lifestyle, vision, and timeline."
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Pill href="#cs-work">{text(hero.content, "ctaPrimary", "View Projects")}</Pill>
              <Pill href="#cs-contact" dark>
                {text(hero.content, "ctaSecondary", "Let's Connect")}
              </Pill>
            </div>
          </Shell>
        </div>
      </section>

      {/* Recent projects */}
      <section id="cs-work" className="pt-20 lg:pt-[110px]" style={sectionBandStyle(projects.theme)}>
        <Shell>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7A6E62]">Our Work</p>
              <h2 className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[56px]">
                {text(projects.content, "heading", "Our Recent Interior Design Projects")}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[color:var(--cs-body)]" style={{ ["--cs-body" as string]: CS.body }}>
              {text(
                projects.content,
                "subheading",
                "A curated snapshot of homes, hospitality spaces, and workplaces we have reimagined."
              )}
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <article key={i} className="space-y-5">
                <GalleryImage
                  src={projects.itemImages[i] || A.projects[i]}
                  className={i % 2 === 0 ? "h-[430px]" : "h-[320px] lg:h-[460px]"}
                />
                <div className="flex flex-wrap gap-2 text-xs">
                  {(list(projects.content, "authors", ["Interior Design", "Architecture"])[i] || "Interior Design")
                    .split("|")
                    .map((tag, idx) => (
                      <span key={idx} className="rounded-full border border-[#C2BDAF] px-3 py-1 text-[#4C433A]">
                        {tag.trim()}
                      </span>
                    ))}
                </div>
                <h3 className="text-2xl">{projectTitles[i] || "Signature Project"}</h3>
                <p className="text-sm leading-7 text-[color:var(--cs-body)]" style={{ ["--cs-body" as string]: CS.body }}>
                  {projectBodies[i] || ""}
                </p>
              </article>
            ))}
          </div>
        </Shell>
      </section>

      {/* Experience band */}
      <section id="cs-about" className="mt-20 py-20 text-white lg:mt-[110px] lg:py-[120px]" style={{ backgroundColor: CS.inverse, ...sectionBandStyle(about.theme) }}>
        <Shell className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,780px)]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#D5CCBF]">What We Do</p>
            <h2 className="mt-4 max-w-xl text-4xl leading-tight lg:text-[56px]">
              {text(about.content, "heading", "35 Years Combined Experience of Crafting Spaces")}
            </h2>
            <p className="mt-7 max-w-xl text-sm leading-7 text-[color:var(--theme-muted,#B0B0B0)] lg:text-base">
              {text(
                about.content,
                "body",
                "From concept sketches to final styling, we plan every detail so spaces feel effortless to live in."
              )}
            </p>
            <div className="mt-8">
              <Pill href="#cs-services">{text(about.content, "ctaPrimary", "Learn More About Us")}</Pill>
            </div>
          </div>

          <div className="space-y-10">
            <img src={heroDetailImage} alt="" className="h-[340px] w-full rounded-xl object-cover lg:h-[551px]" />
            <div className="grid gap-10 md:grid-cols-3">
              {capabilityTitles.slice(0, 3).map((title, i) => (
                <div key={title}>
                  {isIconName(capabilities.icons[i]) ? (
                    <IconGlyph
                      name={capabilities.icons[i]}
                      size={70}
                      color="white"
                      strokeWidth={1.5}
                      className="size-[70px]"
                    />
                  ) : (
                    <img src={A.icons[i % A.icons.length]} alt="" width={70} height={70} className="size-[70px]" />
                  )}
                  <h3 className="mt-4 text-2xl">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--theme-muted,#B0B0B0)]">{capabilityBodies[i] || ""}</p>
                </div>
              ))}
            </div>
          </div>
        </Shell>
      </section>

      {/* Services cards */}
      <section id="cs-services" className="py-20 lg:py-[120px]" style={sectionBandStyle(services.theme)}>
        <Shell>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7A6E62]">
              {text(services.content, "eyebrow", "OUR SERVICES")}
            </p>
            <h2 className="mx-auto mt-4 max-w-4xl text-3xl leading-tight sm:text-4xl lg:text-[56px]">
              {text(services.content, "heading", "Our Expertise for Every Space")}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[color:var(--cs-body)]" style={{ ["--cs-body" as string]: CS.body }}>
              {text(
                services.content,
                "subheading",
                "Interior architecture, renovation and styling services that balance beauty with practical living."
              )}
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {serviceTitles.slice(0, 4).map((title, i) => (
              <article key={title} className="space-y-6">
                <GalleryImage src={services.itemImages[i] || A.serviceImages[i]} className="h-[270px]" />
                <h3 className="text-[26px] leading-[1.15]">{title}</h3>
                <p className="text-sm leading-7 text-[color:var(--cs-body)]" style={{ ["--cs-body" as string]: CS.body }}>
                  {serviceBodies[i] || ""}
                </p>
                <a
                  href="#cs-contact"
                  className="group/link inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
                >
                  Learn More
                  <img
                    src={A.arrowDark}
                    alt=""
                    className="size-4 transition-transform duration-300 ease-out group-hover/link:translate-x-1 motion-reduce:transform-none"
                  />
                </a>
              </article>
            ))}
          </div>
        </Shell>
      </section>

      {/* Testimonial */}
      <section className="pb-20 lg:pb-[110px]">
        <Shell>
          <div className="relative overflow-hidden rounded-2xl">
              <img
                src={testimonialBg}
                alt=""
                data-parallax="0.1"
                className="h-[420px] w-full object-cover lg:h-[520px]"
              />
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 p-7 text-white sm:p-10 lg:p-[70px]">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                {text(testimonials.content, "eyebrow", "TESTIMONIALS")}
              </p>
              <h2 className="mt-4 text-3xl lg:text-[56px]">
                {text(testimonials.content, "heading", "What Our Clients Say")}
              </h2>
              <div className="mt-10 flex gap-6">
                <img src={A.quote} alt="" className="size-[42px] shrink-0" />
                <p className="max-w-4xl text-base leading-8 lg:text-xl lg:leading-[38px]">
                  {quotes[0] ||
                    "Working with CraftedSpaces was an absolute delight. They understood our lifestyle and delivered a home that feels uniquely ours."}
                </p>
              </div>
              <div className="mt-10 border-t border-white/20 pt-6">
                <p className="text-lg">{authors[0] || "John Davies"}</p>
                <p className="mt-1 text-sm text-white/70">{roles[0] || "Homeowner"}</p>
              </div>
            </div>
          </div>
        </Shell>
      </section>

      {/* Gallery collage — tall image left, two stacked in the middle, tall right */}
      <section className="pb-20 lg:pb-[110px]">
        <Shell className="grid gap-4 lg:grid-cols-3">
          <GalleryImage
            src={gallery.itemImages[0] || A.gallery[0]}
            className="h-[320px] sm:h-[460px] lg:h-[520px]"
          />
          <div className="grid gap-4">
            <GalleryImage
              src={gallery.itemImages[2] || A.gallery[2]}
              className="h-[200px] sm:h-[252px]"
            />
            <GalleryImage
              src={gallery.itemImages[3] || A.gallery[3]}
              className="h-[200px] sm:h-[252px]"
            />
          </div>
          <GalleryImage
            src={gallery.itemImages[1] || A.gallery[1]}
            className="h-[320px] sm:h-[460px] lg:h-[520px]"
          />
        </Shell>
      </section>

      {/* Blogs */}
      <section id="cs-blogs" className="pb-20 lg:pb-[110px]">
        <Shell>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7A6E62]">INSIGHTS</p>
            <h2 className="mx-auto mt-4 max-w-4xl text-3xl sm:text-4xl lg:text-[56px]">
              {text(blogs.content, "heading", "Our Latest Blogs")}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[color:var(--cs-body)]" style={{ ["--cs-body" as string]: CS.body }}>
              {text(
                blogs.content,
                "subheading",
                "Practical advice on interior design, architecture and creating timeless spaces."
              )}
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <article key={i} className="space-y-5">
                <GalleryImage src={blogs.itemImages[i] || A.blogs[i]} className="h-[320px]" />
                <span className="inline-flex rounded-full border border-[#C2BDAF] px-3 py-1 text-xs text-[#4C433A]">
                  {(list(blogs.content, "authors", ["Interior Design", "Architecture", "Renovation", "Space Planning"])[i] ||
                    "Interior Design")}
                </span>
                <h3 className="text-2xl leading-[1.35]">
                  {blogTitles[i] || "Design Story"}
                </h3>
                <p className="text-sm leading-7 text-[color:var(--cs-body)]" style={{ ["--cs-body" as string]: CS.body }}>
                  {blogBodies[i] || ""}
                </p>
              </article>
            ))}
          </div>
        </Shell>
      </section>

      {/* FAQ */}
      <section className="pb-20 lg:pb-[110px]">
        <Shell>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7A6E62]">FAQS</p>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[56px]">
              {text(faq.content, "heading", "Frequently Asked Questions")}
            </h2>
            <p className="mt-5 text-sm leading-7 text-[color:var(--cs-body)]" style={{ ["--cs-body" as string]: CS.body }}>
              {text(
                faq.content,
                "subheading",
                "Answers to the questions clients ask most before we begin designing."
              )}
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl space-y-4">
            {questions.slice(0, 5).map((q, i) => (
              <details
                key={`${q}-${i}`}
                open={i === 1}
                className={`rounded-xl border px-5 py-4 ${i === 1 ? "border-[#1A1A1A]" : ""}`}
                style={
                  i === 1
                    ? { borderColor: CS.ink, backgroundColor: "var(--theme-surface, #FFFBEB)" }
                    : { borderColor: CS.line, backgroundColor: CS.card }
                }
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left text-base leading-7 lg:text-[20px]">
                  <span>{q}</span>
                  <img src={A.faqPlus} alt="" className="mt-1 size-[28px] shrink-0" />
                </summary>
                <p className="pt-4 text-sm leading-7 text-[color:var(--cs-body)]" style={{ ["--cs-body" as string]: CS.body }}>
                  {answers[i] || ""}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Pill href="#cs-contact" dark>
              View All FAQs
            </Pill>
          </div>
        </Shell>
      </section>

      {/* CTA + footer */}
      <section id="cs-contact" className="pt-16 text-white lg:pt-[100px]" style={{ backgroundColor: CS.inverse, ...sectionBandStyle(cta.theme) }}>
        <Shell className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,650px)]">
          <div>
            <h2 className="text-4xl leading-tight lg:text-[56px]">
              {text(cta.content, "headline", "Ready to Transform Your Space? Let's Talk!")}
            </h2>
            <div className="mt-8">
              <Pill href={contactEmail ? `mailto:${contactEmail}` : "#cs-top"}>
                {text(cta.content, "ctaPrimary", "Let's Talk")}
              </Pill>
            </div>
          </div>
          <p className="text-sm leading-7 text-[color:var(--theme-muted,#B0B0B0)] lg:text-base">
            {text(
              cta.content,
              "subheadline",
              "Share your goals and timeline. We will guide you from concept through execution."
            )}
          </p>
        </Shell>

        <Shell className="mt-14 border-t border-white/15 pt-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={customLogo || A.logoIconFooter}
                  alt=""
                  width={78}
                  height={52}
                  className="h-10 w-auto object-contain"
                />
                <span
                  className="max-w-[min(62vw,340px)] truncate text-[30.8px]"
                  style={{ ...WORDMARK, color: CS.canvas }}
                >
                  {businessName}
                </span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-7 text-[color:var(--theme-muted,#B0B0B0)]">
                {text(footer.content, "tagline", "Designing spaces that feel as good as they look.")}
              </p>
              <div className="mt-6 flex items-center gap-3">
                {A.social.map((src) => (
                  <img key={src} src={src} alt="" width={56} height={56} className="size-10 lg:size-14" />
                ))}
              </div>
            </div>

            <FooterCol title="Navigation">
              {footerLinks.slice(0, 4).map((label) => (
                <a key={label} href="#cs-top" className="transition-opacity hover:opacity-70">
                  {label}
                </a>
              ))}
            </FooterCol>

            <FooterCol title="Services">
              {serviceTitles.slice(0, 4).map((label) => (
                <a key={label} href="#cs-services" className="transition-opacity hover:opacity-70">
                  {label}
                </a>
              ))}
            </FooterCol>

            <FooterCol title="Contact">
              {contactAddress ? <p>{contactAddress}</p> : null}
              {contactEmail ? (
                <a href={`mailto:${contactEmail}`} className="underline underline-offset-4">
                  {contactEmail}
                </a>
              ) : null}
              {contactPhone ? (
                <a href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`} className="underline underline-offset-4">
                  {contactPhone}
                </a>
              ) : null}
            </FooterCol>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 py-6 text-sm text-[color:var(--theme-muted,#B0B0B0)]">
            <span>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</span>
            <span className="flex gap-6">
              <span>Terms of Use</span>
              <span>Privacy Policy</span>
            </span>
          </div>
        </Shell>
      </section>
    </div>
  );
}

function Shell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1660px] px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}

/** Gallery tile: clips its image so the hover zoom stays inside the rounded frame. */
function GalleryImage({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div className="group overflow-hidden rounded-xl">
      <img
        src={src}
        alt=""
        className={`w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.2] ${className}`}
      />
    </div>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 text-sm uppercase tracking-[0.18em] text-[color:var(--theme-muted,#B0B0B0)]">{title}</p>
      <div className="flex flex-col gap-3 text-sm leading-7">{children}</div>
    </div>
  );
}

function Pill({
  href,
  children,
  dark,
  light,
}: {
  href: string;
  children: React.ReactNode;
  dark?: boolean;
  light?: boolean;
}) {
  const bg = dark ? CS.ink : light ? CS.cream : CS.cream;
  const color = dark ? CS.white : CS.ink;
  const arrow = dark ? A.arrowLight : A.arrowDark;

  return (
    <a
      href={href}
      className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-medium lg:h-[52px] lg:px-7 lg:text-base"
      style={{ backgroundColor: bg, color }}
    >
      <span>{children}</span>
      <span className="flex size-7 items-center justify-center rounded-full bg-black/5">
        <img src={arrow} alt="" width={20} height={20} className="size-4" />
      </span>
    </a>
  );
}
