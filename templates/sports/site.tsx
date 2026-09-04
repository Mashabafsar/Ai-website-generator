import { Bebas_Neue } from "next/font/google";
import type { AssembledSite, SiteContact, WebsiteBlueprint } from "@/lib/blueprint/types";
import { IconGlyph } from "@/lib/icons/glyph";
import { isIconName } from "@/lib/icons/registry";
import { SP } from "./tokens";
import { list, slotAt, text, toSlots } from "../shared/content";
import { brandStyle } from "../shared/brand";
import { themeFontHref, themeFontStyle } from "../shared/fonts";

// The design's display/body face is Clash Grotesk (Fontshare — not on Google
// Fonts), so we load it via a stylesheet and expose it through --sp-display.
const DISPLAY_STACK = "'Clash Grotesk', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif";

const wordmark = Bebas_Neue({
  subsets: ["latin"],
  variable: "--sp-wordmark",
  weight: ["400"],
  display: "swap",
});

const HERO_FALLBACK = "/templates/sports/hero.jpg";
const ABOUT_FALLBACK = "/templates/sports/about.jpg";
const EVENT_FALLBACK = "/templates/sports/event.jpg";
const PRICING_BG = "/templates/sports/pricing-bg.jpg";
const FOOTER_CARD = "/templates/sports/footer-card.jpg";
const LOGO = "/templates/sports/logo.svg";

const FEATURE_FALLBACKS = [
  "/templates/sports/feature-1.jpg",
  "/templates/sports/session.jpg",
  "/templates/sports/shirt-bg.jpg",
];
const CATEGORY_FALLBACKS = [
  "/templates/sports/category-1.jpg",
  "/templates/sports/category-2.jpg",
  "/templates/sports/category-3.jpg",
  "/templates/sports/category-4.jpg",
];
const AVATARS = [
  "/templates/sports/avatar-1.jpg",
  "/templates/sports/avatar-2.jpg",
  "/templates/sports/avatar-3.jpg",
  "/templates/sports/avatar-4.jpg",
  "/templates/sports/avatar-5.jpg",
  "/templates/sports/avatar-6.jpg",
  "/templates/sports/avatar-7.jpg",
  "/templates/sports/avatar-8.jpg",
];
const PARTNERS = [
  "/templates/sports/partner-1.svg",
  "/templates/sports/partner-2.svg",
  "/templates/sports/partner-3.svg",
  "/templates/sports/partner-4.svg",
  "/templates/sports/partner-5.svg",
  "/templates/sports/partner-6.svg",
  "/templates/sports/partner-7.svg",
  "/templates/sports/partner-8.svg",
  "/templates/sports/partner-9.svg",
];
const ABOUT_ICONS = [
  "/templates/sports/about-icon-1.svg",
  "/templates/sports/about-icon-2.svg",
  "/templates/sports/about-icon-3.svg",
];
// The design draws no symbol on the feature cards themselves, so the feature
// items' icons are what these About rows show. Stroke weight and box match the
// baked SVGs above (1.94 on a 27.75 grid ≈ 1.7 on lucide's 24 grid).
const ABOUT_ICON_STROKE = 1.7;
// Baked design chrome — generic training benefits shown beside the About copy.
const ABOUT_BENEFITS = [
  { title: "Goal-based program", desc: "Pick a clear objective — strength, endurance, weight loss — and we build a plan around it." },
  { title: "Adaptive progression", desc: "Your program evolves as you do. We adjust volume, intensity, and drills to your performance." },
  { title: "Performance tracking", desc: "Track your sessions, streaks, and improvements over time so you always know where you stand." },
];

const NAV = [
  { label: "About us", href: "#sp-about" },
  { label: "Features", href: "#sp-features" },
  { label: "Categories", href: "#sp-categories" },
  { label: "Pricing", href: "#sp-pricing" },
  { label: "Testimonials", href: "#sp-testimonials" },
];

/**
 * The complete Athlo design — a bold, energetic sports-club landing built from
 * full-bleed action photography, an amber accent, uppercase grotesque display
 * type and a huge Bebas Neue wordmark. Single-page: every band reads its copy
 * from the locked blueprint slots, so AI copy and editor changes can never
 * alter the structure of the page.
 */
export function SportsSite({
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
  const about = slotAt(slots, "about");
  const features = slotAt(slots, "features");
  const categories = slotAt(slots, "services");
  const pricing = slotAt(slots, "pricing");
  const testimonials = slotAt(slots, "testimonials");
  const faq = slotAt(slots, "faq");
  const event = slotAt(slots, "cta");
  const footer = slotAt(slots, "footer");

  const businessName =
    text(footer.content, "businessName") ||
    site?.businessName ||
    blueprint?.business.name ||
    "Athlo";
  const customLogo = site?.theme.logoUrl?.trim() || "";

  const heroImage = hero.image || HERO_FALLBACK;
  const aboutImage = about.image || ABOUT_FALLBACK;
  const eventImage = event.image || EVENT_FALLBACK;

  const featureTitles = list(features.content, "itemTitles", [
    "Over 10 years of coaching experience",
    "Solo & group sessions available",
    "Achieve your goals, faster",
  ]);
  const featureBodies = list(features.content, "itemBodies");
  const featureImages = features.itemImages;
  const fImg = (i: number) => featureImages[i] || FEATURE_FALLBACKS[i % FEATURE_FALLBACKS.length];

  const catTitles = list(categories.content, "itemTitles", [
    "Solo Sport — Cycling",
    "Group Sport — Basketball",
    "Duo Sport — Tennis",
    "Squad Sport — Padel",
  ]);
  const catBodies = list(categories.content, "itemBodies");
  const catImages = categories.itemImages;
  const cImg = (i: number) => catImages[i] || CATEGORY_FALLBACKS[i % CATEGORY_FALLBACKS.length];
  // The design overlays a big "Starting from $X" price on each category card.
  // Pull it out of the body copy ("Starting from $44 — …") when present.
  const catPrice = (i: number): string | null => {
    const m = (catBodies[i] || "").match(/\$\s?[\d.,]+/);
    return m ? m[0].replace(/\s+/, "") : null;
  };

  const planNames = list(pricing.content, "planNames", ["Starter Plan", "Active Balance", "Inner Mastery"]);
  const planPrices = list(pricing.content, "planPrices", ["$25", "$49", "$89"]);
  const planFeatures = list(pricing.content, "planFeatures");
  const popularIndex = planNames.length > 2 ? 1 : planNames.length - 1;

  const quotes = list(testimonials.content, "quotes");
  const authors = list(testimonials.content, "authors");
  const roles = list(testimonials.content, "roles");
  // The design lays testimonials out as a 4-column masonry with faded edges.
  const testimonialCols: number[][] = [[], [], [], []];
  quotes.forEach((_, i) => testimonialCols[i % 4].push(i));

  const questions = list(faq.content, "questions");
  const answers = list(faq.content, "answers");

  const footerLinks = list(footer.content, "linkLabels", NAV.map((n) => n.label));

  const details = contact ?? site?.contact;
  const contactEmail = details?.email?.trim() || "";
  const contactPhone = details?.phone?.trim() || "";
  const contactHref = contactEmail ? `mailto:${contactEmail}` : "#sp-pricing";

  return (
    <div
      id="sp-top"
      className={`${wordmark.variable} scroll-smooth antialiased`}
      style={{
        ...brandStyle(site?.theme, "#ffc857"),
        ["--sp-display" as string]: DISPLAY_STACK,
        fontFamily: DISPLAY_STACK,
        color: SP.ink,
        backgroundColor: SP.white,
        // A user-picked theme font overrides the design's own type.
        ...themeFontStyle(site?.theme, ["--sp-display", "--sp-wordmark"]),
      }}
    >
      {themeFontHref(site?.theme) ? (
        <link rel="stylesheet" href={themeFontHref(site?.theme)!} />
      ) : null}
      {/* Clash Grotesk (the design's display face) via Fontshare */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@300,400,500,600,700&display=swap"
      />
      {/* Hero — full-bleed action photo with the nav overlaid on top */}
      <section className="relative w-full min-h-[92vh] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            data-parallax="0.12"
            className="h-[112%] w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-[90rem] flex-col justify-between px-4 py-6 lg:px-10 lg:py-8">
          {/* Nav */}
          <div className="flex items-center justify-between gap-4">
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-white/90 backdrop-blur-[4px] transition-colors hover:bg-white/15"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <a href="#sp-top" className="flex items-center gap-3">
              {customLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customLogo} alt="" className="h-9 w-9 rounded-lg object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={LOGO} alt="" className="h-7 w-7 -rotate-90 object-contain" />
              )}
              <span
                className="text-[2.4rem] leading-none text-white"
                style={{ fontFamily: "var(--sp-wordmark)" }}
              >
                {businessName}
              </span>
            </a>
            <a
              href={contactHref}
              className="flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-medium"
              style={{ backgroundColor: SP.brand, color: SP.ink }}
            >
              Contact us
              <Arrow className="h-3.5 w-3.5" stroke={SP.ink} />
            </a>
          </div>

          {/* Hero copy */}
          <div className="flex flex-col gap-6 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {AVATARS.slice(0, 4).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className={`h-9 w-9 rounded-full border-2 border-white object-cover ${i > 0 ? "-ml-3" : ""}`}
                  />
                ))}
              </div>
              <div>
                <div className="text-sm font-medium uppercase tracking-wide text-white">
                  {text(hero.content, "eyebrow", "12k+ memberships")}
                </div>
                <div className="text-xs text-white/60">Enjoy our facilities with {businessName}</div>
              </div>
            </div>

            <h1
              className="max-w-[16ch] font-semibold uppercase leading-[0.95] tracking-[-0.5px] text-white text-[clamp(2.5rem,10vw,5.5rem)]"
              style={{ fontFamily: "var(--sp-display)" }}
            >
              {text(hero.content, "headline", "Where athletes are made")}
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              {text(
                hero.content,
                "subheadline",
                "Structured programs, expert coaches, and a community that makes it easier to stay consistent."
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#sp-pricing"
                className="flex items-center gap-3 rounded-[14px] px-6 py-3.5 text-sm font-medium"
                style={{ backgroundColor: SP.brand, color: SP.ink }}
              >
                {text(hero.content, "ctaPrimary", "Join Athlo")}
                <Arrow className="h-3.5 w-3.5" stroke={SP.ink} />
              </a>
              <a
                href="#sp-categories"
                className="rounded-[14px] border border-white bg-white/15 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/25"
              >
                Explore memberships
              </a>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-10 gap-y-4">
              <Stat value="324+" label="Partners companies" />
              <Stat value="30+" label="Certified coaches" />
            </div>
          </div>
        </div>
      </section>

      {/* Partners strip */}
      <section className="border-y" style={{ borderColor: SP.line }}>
        <div className="mx-auto flex max-w-[80rem] flex-wrap items-center justify-center gap-x-12 gap-y-6 px-6 py-10">
          {PARTNERS.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="h-8 w-auto object-contain opacity-60 transition-opacity hover:opacity-100" />
          ))}
        </div>
      </section>

      {/* About */}
      <section id="sp-about" className="mx-auto max-w-[90rem] px-4 py-16 lg:px-[3.75rem] lg:py-24">
        <SectionHeader label="About us" index={2} />
        <div className="mt-10 flex flex-col items-start gap-12 lg:flex-row">
          <div className="flex flex-1 flex-col gap-8">
            <h2
              className="font-semibold uppercase leading-[0.95] tracking-[-0.6px] text-[clamp(2rem,5vw,3.75rem)]"
              style={{ fontFamily: "var(--sp-display)" }}
            >
              {text(about.content, "heading", "Personalized training for every athlete")}
            </h2>
            <p className="text-lg leading-relaxed lg:text-xl" style={{ color: SP.body }}>
              {text(about.content, "body", "We're a team of coaches and sport enthusiasts focused on one thing: helping you train better.")}
            </p>
            <div className="flex flex-col gap-3">
              {ABOUT_BENEFITS.map((b, i) => (
                <div
                  key={b.title}
                  className="flex items-center gap-4 rounded-xl p-3"
                  style={{ backgroundColor: SP.surface }}
                >
                  <span
                    className="grid size-[4.8rem] shrink-0 place-items-center rounded-[18px] bg-white"
                  >
                    {isIconName(features.icons[i]) ? (
                      <IconGlyph
                        name={features.icons[i]}
                        size={32}
                        color={SP.ink}
                        strokeWidth={ABOUT_ICON_STROKE}
                        className="size-8"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ABOUT_ICONS[i % ABOUT_ICONS.length]} alt="" className="size-8 object-contain" />
                    )}
                  </span>
                  <div>
                    <div className="font-semibold uppercase" style={{ color: SP.ink }}>{b.title}</div>
                    <div className="text-sm leading-relaxed" style={{ color: SP.body }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full flex-1 lg:min-h-[600px]">
            <div className="relative h-[26rem] w-full overflow-hidden rounded-[24px] lg:h-full lg:min-h-[26rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={aboutImage} alt="" data-parallax="0.06" className="absolute inset-0 h-[112%] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/55" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span
                  className="rounded-full px-4 py-2 text-sm"
                  style={{ backgroundColor: SP.brand, color: SP.ink }}
                >
                  Sport Center
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-8 px-6 text-center">
                <div
                  className="font-semibold uppercase leading-none tracking-[-0.4px] text-white text-[clamp(1.75rem,4vw,3rem)]"
                  style={{ fontFamily: "var(--sp-display)" }}
                >
                  Mind power
                  <br />
                  sport strength
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="sp-features" className="px-4 py-16 lg:px-[3.75rem] lg:py-24" style={{ backgroundColor: SP.surface }}>
        <div className="mx-auto max-w-[90rem]">
          <SectionHeader label="Features" index={4} />
          <div className="mt-10 flex flex-col items-start justify-between gap-6 lg:flex-row">
            <h2
              className="flex-1 font-semibold uppercase leading-[0.95] tracking-[-0.6px] text-[clamp(1.75rem,4.5vw,3.75rem)]"
              style={{ fontFamily: "var(--sp-display)" }}
            >
              {text(features.content, "heading", "Smarter training, better results")}
            </h2>
            <p className="max-w-[32rem] flex-1 text-lg leading-relaxed lg:text-xl" style={{ color: SP.body }}>
              {text(
                features.content,
                "subheading",
                "Athlo combines expert coaching with clear structure and smart tools, so every session moves you closer to your goals."
              )}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {featureTitles.map((title, i) => (
              <article key={`${title}-${i}`} className="relative h-[27rem] overflow-hidden rounded-[17px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fImg(i)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span
                    className="mb-3 inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: SP.brand }}
                    aria-hidden
                  />
                  <h3
                    className="font-semibold uppercase leading-none tracking-[-0.36px] text-white text-[1.75rem] lg:text-[2rem]"
                    style={{ fontFamily: "var(--sp-display)" }}
                  >
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">
                    {featureBodies[i] || "Purpose-built coaching that keeps every session moving you forward."}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="sp-categories" className="mx-auto max-w-[90rem] px-4 py-16 lg:px-[3.75rem] lg:py-24">
        <SectionHeader label="Categories" index={5} />
        <div className="mx-auto mt-10 max-w-3xl text-center">
          <h2
            className="font-semibold uppercase leading-none tracking-[-0.6px] text-[clamp(1.75rem,5vw,3.75rem)]"
            style={{ fontFamily: "var(--sp-display)" }}
          >
            {text(categories.content, "heading", "Everything you need, nothing you don't")}
          </h2>
          <p className="mx-auto mt-4 max-w-[47rem] text-lg leading-relaxed lg:text-xl" style={{ color: SP.muted }}>
            {text(
              categories.content,
              "subheading",
              "A supportive community where passion, movement, and discipline come together."
            )}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {catTitles.map((title, i) => {
            const price = catPrice(i);
            return (
              <div key={`${title}-${i}`} className="relative h-[31rem] overflow-hidden rounded-[22px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cImg(i)} alt={title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-7 px-6">
                  <div className="text-base font-medium text-white">{title}</div>
                  {price ? (
                    <div className="mt-2">
                      <div
                        className="font-semibold leading-none text-white text-[2.8rem]"
                        style={{ fontFamily: "var(--sp-display)" }}
                      >
                        {price}
                      </div>
                      <div className="mt-1 text-base text-white/85">Starting from</div>
                    </div>
                  ) : (
                    catBodies[i] && <div className="mt-1 text-sm text-white/80">{catBodies[i]}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="sp-pricing" className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PRICING_BG} alt="" className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(14,18,27,0.86)" }} />
        </div>
        <div className="relative z-10 mx-auto max-w-[90rem] px-4 py-16 lg:px-[3.75rem] lg:py-24">
          <SectionHeader label="Pricing" index={6} light />
          <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
            {/* Left — big headline + vertical plan list */}
            <div className="flex-1">
              <h2
                className="font-semibold uppercase leading-[1.05] tracking-[-1px] text-white text-[clamp(2.5rem,6vw,5rem)]"
                style={{ fontFamily: "var(--sp-display)" }}
              >
                {text(pricing.content, "heading", "Flexible pricing")}
              </h2>
              <p className="mt-5 max-w-[26rem] text-lg leading-relaxed text-white/85 lg:text-xl">
                {text(
                  pricing.content,
                  "subheading",
                  "Built to give every athlete access to expert coaching and structured training — without hidden fees or long-term lock-ins."
                )}
              </p>

              <div className="mt-9 flex flex-col gap-3 rounded-[24px] bg-black/50 p-3 backdrop-blur-md">
                {planNames.map((name, i) => {
                  const active = i === popularIndex;
                  return (
                    <div
                      key={`${name}-${i}`}
                      className="flex items-center justify-between gap-4 rounded-xl p-5 transition-colors"
                      style={{ backgroundColor: active ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.14)" }}
                    >
                      <div>
                        <div
                          className="text-xl font-semibold uppercase leading-none tracking-[-0.24px]"
                          style={{ fontFamily: "var(--sp-display)", color: active ? SP.white : "#cacfd8" }}
                        >
                          {name}
                        </div>
                        <div className="mt-1 text-sm" style={{ color: active ? SP.line : "#cacfd8" }}>
                          {(planFeatures[i] || "").split("\n")[0] || "Flexible membership"}
                        </div>
                      </div>
                      <Arrow className="h-5 w-5 shrink-0" stroke={active ? SP.white : "#cacfd8"} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — featured plan detail card */}
            {(() => {
              const i = popularIndex;
              const featureLines = (planFeatures[i] || "").split("\n").map((f) => f.trim()).filter(Boolean);
              return (
                <div className="w-full shrink-0 lg:w-[34rem]">
                  <div className="flex flex-col rounded-[32px] bg-white p-8 lg:p-9">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div
                          className="text-3xl font-semibold uppercase leading-none tracking-[-0.36px]"
                          style={{ fontFamily: "var(--sp-display)", color: SP.ink }}
                        >
                          {planNames[i]}
                        </div>
                        <div className="mt-2 text-base font-medium" style={{ color: SP.body }}>
                          {(planFeatures[i] || "").split("\n")[0] || "Our most popular plan"}
                        </div>
                      </div>
                      <span
                        className="grid size-16 shrink-0 place-items-center rounded-[20px]"
                        style={{ backgroundColor: SP.surface }}
                      >
                        <Arrow className="h-6 w-6" stroke={SP.ink} />
                      </span>
                    </div>

                    <div className="mt-6 flex items-end gap-2">
                      <span
                        className="text-[3.75rem] font-semibold leading-none tracking-[-0.6px]"
                        style={{ fontFamily: "var(--sp-display)", color: SP.ink }}
                      >
                        {planPrices[i] || "$0"}
                      </span>
                      <span className="pb-1.5 text-lg font-medium" style={{ color: SP.body }}>
                        / month
                      </span>
                    </div>

                    <div className="my-7 flex items-center gap-2">
                      <span className="size-2 rounded-sm" style={{ backgroundColor: SP.ink }} />
                      <span className="h-[2px] flex-1" style={{ backgroundColor: SP.line }} />
                      <span className="size-2 rounded-sm" style={{ backgroundColor: SP.ink }} />
                    </div>

                    <ul className="flex flex-col gap-4">
                      {featureLines.map((line, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <Check className="mt-1 h-4 w-4 shrink-0" stroke={SP.ink} />
                          <span className="leading-snug" style={{ color: SP.ink }}>{line}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={contactHref}
                      className="mt-8 flex items-center justify-center gap-3 rounded-[20px] py-4 text-base font-medium"
                      style={{ backgroundColor: SP.brand, color: SP.ink }}
                    >
                      Get started
                      <Arrow className="h-4 w-4" stroke={SP.ink} />
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="sp-testimonials" className="mx-auto max-w-[90rem] px-4 py-16 lg:px-[3.75rem] lg:py-20">
        <SectionHeader label="Testimonials" index={7} />
        <div className="mt-10 flex flex-col items-center gap-5 text-center">
          <div className="flex items-center -space-x-3">
            {AVATARS.slice(0, 5).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className="size-12 rounded-full border-2 border-white object-cover" />
            ))}
          </div>
          <h2
            className="max-w-[42rem] font-semibold uppercase leading-none tracking-[-0.6px] text-[clamp(1.75rem,5vw,3.75rem)]"
            style={{ fontFamily: "var(--sp-display)" }}
          >
            {text(testimonials.content, "heading", "Here's why athletes trust us")}
          </h2>
          <p className="max-w-[47rem] text-lg leading-relaxed lg:text-xl" style={{ color: SP.muted }}>
            A supportive community where passion, movement, and discipline come together to inspire lasting change.
          </p>
        </div>

        <div className="relative mt-12">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {testimonialCols.map((col, c) => (
              <div key={c} className={`flex flex-col gap-5 ${c % 2 === 1 ? "lg:-mt-10" : ""}`}>
                {col.map((i) => (
                  <figure
                    key={i}
                    className="flex flex-col justify-between gap-6 rounded-xl p-6"
                    style={{ backgroundColor: SP.surface }}
                  >
                    <blockquote className="text-[0.95rem] leading-relaxed" style={{ color: SP.body }}>
                      “{quotes[i]}”
                    </blockquote>
                    <figcaption className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={AVATARS[i % AVATARS.length]} alt="" className="size-10 rounded-full object-cover" />
                      <div>
                        <div className="text-sm font-medium" style={{ color: SP.ink }}>{authors[i] || "Athlo member"}</div>
                        {roles[i] && <div className="text-[0.8rem]" style={{ color: SP.muted }}>{roles[i]}</div>}
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
          {/* edge fades */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>
      </section>

      {/* FAQ */}
      <section id="sp-faq" className="mx-auto max-w-[90rem] px-4 py-16 lg:px-[3.75rem] lg:py-20">
        <SectionHeader label="FAQ" index={8} />
        <div className="mt-10 flex flex-col items-start gap-12 lg:flex-row">
          <div className="flex flex-col gap-5 lg:w-[38rem]">
            <h2
              className="font-semibold uppercase leading-none tracking-[-0.6px] text-[clamp(1.75rem,4.5vw,3.75rem)]"
              style={{ fontFamily: "var(--sp-display)" }}
            >
              {text(faq.content, "heading", "Your questions, answered")}
            </h2>
            <p className="text-lg leading-relaxed lg:text-xl" style={{ color: SP.muted }}>
              Get quick answers to the most common questions about our programs, memberships and facilities.
            </p>
            <a
              href={contactHref}
              className="inline-flex h-14 items-center rounded-[18px] border bg-white px-5 text-base font-medium"
              style={{ borderColor: SP.line, color: SP.body }}
            >
              Contact us
            </a>
          </div>

          <div className="w-full flex-1 rounded-[24px] p-4" style={{ backgroundColor: SP.surface }}>
            <div className="flex flex-col gap-3">
              {questions.map((question, i) => (
                <details
                  key={`${question}-${i}`}
                  open={i === 0}
                  className="group overflow-hidden rounded-xl bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left">
                    <span className="text-base font-semibold lg:text-lg" style={{ color: SP.ink }}>{question}</span>
                    <span
                      className="grid size-6 shrink-0 place-items-center transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      <Plus className="h-5 w-5" stroke={SP.ink} />
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-[0.95rem] leading-relaxed" style={{ color: SP.body }}>
                    {answers[i] || "Reach out to our team any time — we'll give you a direct answer within 24 hours."}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Event / closing CTA */}
      <section id="sp-event" className="mx-auto max-w-[90rem] px-4 pb-16 lg:px-[3.75rem] lg:pb-20">
        <div className="relative overflow-hidden rounded-[24px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={eventImage} alt="" data-parallax="0.08" className="h-[38rem] w-full object-cover lg:h-[44rem]" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-x-6 bottom-6 lg:inset-x-8 lg:bottom-8 lg:right-auto lg:w-[32rem]">
            <div className="flex flex-col gap-6 rounded-[20px] bg-white p-6 lg:p-8">
              <span
                className="w-fit rounded-full px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: SP.surface, color: SP.ink }}
              >
                {businessName} Event
              </span>
              <div
                className="font-semibold uppercase leading-[1.05] tracking-[-0.4px] text-[clamp(2rem,4vw,2.8rem)]"
                style={{ fontFamily: "var(--sp-display)", color: SP.ink }}
              >
                {text(event.content, "headline", "Ultimate padel adventure")}
              </div>
              <div>
                <div className="text-base lg:text-lg" style={{ color: SP.ink }}>March 19, 2025</div>
                <div className="mt-1 text-base font-semibold lg:text-lg" style={{ color: SP.ink }}>
                  123 Padel Player, Adventure City
                </div>
              </div>
              <p className="text-base leading-relaxed lg:text-lg" style={{ color: SP.body }}>
                {text(
                  event.content,
                  "subheadline",
                  "Join us for an exhilarating one-day padel tournament — compete, connect, and push your limits."
                )}
              </p>
              <a
                href={contactHref}
                className="flex h-14 items-center justify-center gap-3 rounded-[18px] text-base font-medium"
                style={{ backgroundColor: SP.brand, color: SP.ink }}
              >
                {text(event.content, "ctaPrimary", "Register now")}
                <Arrow className="h-4 w-4" stroke={SP.ink} />
              </a>
            </div>
          </div>
          <div className="absolute bottom-8 right-8 hidden items-center gap-3 lg:flex">
            <div className="flex -space-x-3">
              {AVATARS.slice(0, 4).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="size-12 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
            <div>
              <div className="text-xl font-medium tracking-[-0.4px] text-white">4.9 / 5 Rated</div>
              <div className="text-lg text-white/80">Over 9.2k members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white px-4 pb-6 pt-16 lg:px-[3.75rem] lg:pt-24">
        <div className="mx-auto max-w-[82.5rem]">
          <div className="flex flex-col items-start gap-10 lg:flex-row lg:gap-24">
            <div className="flex flex-col items-start gap-8 lg:flex-row">
              <div className="relative h-[13rem] w-full overflow-hidden rounded-[24px] lg:h-[17rem] lg:w-[14rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={FOOTER_CARD} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4">
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: SP.brand }} />
                    <span className="text-xs font-medium text-white">Full game</span>
                  </div>
                  <div
                    className="text-center font-semibold uppercase leading-none tracking-[-0.36px] text-white text-[2rem]"
                    style={{ fontFamily: "var(--sp-display)" }}
                  >
                    Explore
                    <br />
                    more
                  </div>
                </div>
              </div>
              <h2
                className="max-w-[38rem] font-semibold uppercase leading-none tracking-[-0.6px] text-[clamp(1.75rem,4vw,3.75rem)]"
                style={{ fontFamily: "var(--sp-display)" }}
              >
                <span style={{ color: "#cacfd8" }}>{text(footer.content, "tagline", "We're doing everything")}</span>{" "}
                <span style={{ color: SP.ink }}>for your future health.</span>
              </h2>
            </div>

            <div className="flex shrink-0 gap-12">
              <div className="flex flex-col gap-4">
                <div className="text-lg font-semibold" style={{ color: SP.ink }}>Menu</div>
                {footerLinks.map((label, i) => (
                  <span key={`${label}-${i}`} className="text-base font-medium" style={{ color: SP.body }}>
                    {label}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <div className="text-lg font-semibold" style={{ color: SP.ink }}>Social media</div>
                {["Instagram", "Twitter (X)", "YouTube", "Facebook"].map((label) => (
                  <span key={label} className="text-base font-medium" style={{ color: SP.body }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-start justify-between gap-3 text-base font-medium lg:flex-row lg:items-center" style={{ color: SP.body }}>
            <div>San Francisco — California · Paris — France</div>
            <div className="flex flex-col gap-2 lg:flex-row lg:gap-10">
              {contactEmail && <span>{contactEmail}</span>}
              {contactPhone && <span>{contactPhone}</span>}
              <span>© {new Date().getFullYear()} {businessName}. All rights reserved.</span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <span className="size-[6px]" style={{ backgroundColor: SP.ink }} />
            <span className="h-[2px] flex-1" style={{ backgroundColor: SP.line }} />
            <span className="size-[6px]" style={{ backgroundColor: SP.ink }} />
          </div>
          <div className="mt-5 flex items-center justify-between text-base font-medium" style={{ color: SP.body }}>
            <span>Privacy Policy</span>
            <span>Terms &amp; conditions</span>
          </div>

          <div className="relative mt-10">
            <div
              className="w-full leading-none text-[clamp(5rem,15vw,18.75rem)]"
              style={{ fontFamily: "var(--sp-wordmark)", color: SP.ink }}
            >
              {businessName}
            </div>
            <div
              className="absolute right-4 top-1/2 grid size-24 -translate-y-1/2 place-items-center rounded-full lg:right-[10%] lg:size-[7.5rem]"
              style={{ backgroundColor: SP.brand }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt="" className="w-9 -rotate-90 object-contain lg:w-11" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pb-4">
            <span className="rounded-full px-4 py-1.5 text-sm font-medium" style={{ backgroundColor: SP.surface, color: SP.ink }}>
              Refund Policy
            </span>
            <a href="#sp-top" className="flex items-center gap-2 text-base font-medium" style={{ color: SP.ink }}>
              <span className="grid size-[1.3rem] place-items-center rounded-[10px]" style={{ backgroundColor: SP.ink }}>
                <Arrow className="h-2.5 w-2.5 -rotate-90" stroke={SP.white} />
              </span>
              Back to the top
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-medium text-white">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
    </div>
  );
}

function SectionHeader({ label, index, light = false }: { label: string; index?: number; light?: boolean }) {
  const border = light ? "rgba(255,255,255,0.9)" : SP.line;
  const ink = light ? SP.white : SP.ink;
  const line = light ? "rgba(255,255,255,0.4)" : SP.line;
  return (
    <div className="flex w-full items-center gap-3">
      <div
        className="flex h-[3.5rem] shrink-0 items-center justify-center rounded-[28px] border-2 px-8"
        style={{ borderColor: border }}
      >
        <span className="whitespace-nowrap text-[15px] font-medium" style={{ color: ink }}>
          {index ? `#${index} ` : ""}{label}
        </span>
      </div>
      <div className="flex flex-1 items-center">
        <span className="size-[6px] shrink-0" style={{ backgroundColor: ink }} />
        <span className="h-[2px] flex-1" style={{ backgroundColor: line }} />
        <span className="size-[6px] shrink-0" style={{ backgroundColor: ink }} />
      </div>
    </div>
  );
}

function Arrow({ className, stroke }: { className?: string; stroke: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

function Plus({ className, stroke }: { className?: string; stroke: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function Check({ className, stroke }: { className?: string; stroke: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12 5 5L20 6" />
    </svg>
  );
}
