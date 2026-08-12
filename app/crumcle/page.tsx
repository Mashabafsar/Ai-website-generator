"use client";

/**
 * Crumcle — dark, premium artisan bakery landing page.
 *
 * Self-contained: this single file renders the entire marketing site.
 * Only dependency is `lucide-react` (already installed). To reuse elsewhere,
 * copy this file and the icon import, or swap icons for inline SVGs.
 */

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Croissant,
  Clock,
  Instagram,
  Leaf,
  Menu,
  Minus,
  Plus,
  Send,
  Sparkles,
  Star,
  Wheat,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

const NAV = [
  { href: "#story", label: "Story" },
  { href: "#menu", label: "Menu" },
  { href: "#craft", label: "Craft" },
  { href: "#reviews", label: "Reviews" },
  { href: "#visit", label: "Visit" },
];

const MENU = [
  {
    name: "Midnight Chocolate Crumble",
    price: "$8",
    desc: "72% single-origin ganache, burnt-butter streusel, sea salt.",
    img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
    tag: "Signature",
  },
  {
    name: "Golden Butter Croissant",
    price: "$5",
    desc: "36-hour laminated dough, cultured French butter, 81 layers.",
    img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80",
    tag: "Classic",
  },
  {
    name: "Pistachio Rose Tart",
    price: "$9",
    desc: "Sicilian pistachio cream, rosewater glaze, edible petals.",
    img: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=80",
    tag: "Seasonal",
  },
  {
    name: "Sourdough Country Loaf",
    price: "$7",
    desc: "5-year-old starter, stone-milled flour, 24-hour cold proof.",
    img: "https://images.unsplash.com/photo-1585478259715-4d3a5f4b1b30?auto=format&fit=crop&w=900&q=80",
    tag: "Daily",
  },
  {
    name: "Vanilla Bean Canelé",
    price: "$4",
    desc: "Bordeaux tradition, caramel crust, custard heart, Tahitian vanilla.",
    img: "https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=900&q=80",
    tag: "Petite",
  },
  {
    name: "Honey Fig Galette",
    price: "$8",
    desc: "Black mission figs, wildflower honey, almond frangipane.",
    img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
    tag: "Limited",
  },
];

const CRAFT = [
  {
    icon: Wheat,
    title: "Stone-milled grain",
    body: "We mill heritage wheat in-house each morning for flour that's alive with flavour.",
  },
  {
    icon: Clock,
    title: "Slow fermentation",
    body: "Every dough rests up to 36 hours, developing depth you can taste in a single bite.",
  },
  {
    icon: Leaf,
    title: "Seasonal & local",
    body: "Fruit, honey and dairy sourced within 50 miles, changing with what's at its peak.",
  },
  {
    icon: Sparkles,
    title: "Hand-finished",
    body: "No two pastries are identical — each is shaped, scored and glazed by hand.",
  },
];

const STEPS = [
  { n: "01", title: "Mill", body: "Heritage grains milled at dawn for maximum aroma and nutrition." },
  { n: "02", title: "Ferment", body: "Wild starters and long cold proofs coax out complex flavour." },
  { n: "03", title: "Shape", body: "Laminated, folded and formed entirely by the hands of our bakers." },
  { n: "04", title: "Bake", body: "Stone-deck ovens deliver a shattering crust and tender crumb." },
];

const REVIEWS = [
  {
    quote:
      "The Midnight Crumble ruined every other dessert for me. Impossibly rich, perfectly balanced. I dream about it.",
    name: "Amara Whitfield",
    role: "Food writer, The Loft",
  },
  {
    quote: "You can taste the patience. Crumcle's croissants are the closest thing I've had to Paris in this city.",
    name: "Daniel Osei",
    role: "Regular since day one",
  },
  {
    quote: "A bakery that treats bread like art. The sourdough has a soul. Worth every early-morning queue.",
    name: "Sofia Marchetti",
    role: "Chef, Osteria Nove",
  },
];

const GALLERY = [
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1600617953089-e478724c8f5e?auto=format&fit=crop&w=600&q=80",
];

const FAQ = [
  { q: "Do you take custom cake orders?", a: "Yes — we craft bespoke celebration cakes with 72 hours notice. Reserve through the form below or in-store." },
  { q: "Are there vegan or gluten-free options?", a: "Daily. Look for the leaf mark on our menu. Our gluten-free tarts and vegan crumbles sell fast, so arrive early." },
  { q: "What time is fresh bread ready?", a: "Loaves come out of the deck ovens at 7:30am. Pastries are replenished throughout the morning until sold out." },
  { q: "Can I book the space for events?", a: "Our loft seats 24 for tastings, workshops and private mornings. Email hello@crumcle.co to arrange." },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function CrumclePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="crumcle min-h-screen bg-[#0b0806] text-[#f3ece0] antialiased">
      <style>{styles}</style>

      {/* ------------------------------------------------------------------ */}
      {/* Nav                                                                */}
      {/* ------------------------------------------------------------------ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-white/10 bg-[#0b0806]/85 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#c8a15a] text-[#0b0806]">
              <Croissant className="size-5" />
            </span>
            <span className="font-serif text-xl font-semibold tracking-wide">Crumcle</span>
          </a>

          <nav className="hidden items-center gap-9 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm font-medium text-[#c9bda9] transition-colors hover:text-[#c8a15a]"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <a
            href="#visit"
            className="hidden items-center gap-2 rounded-full bg-[#c8a15a] px-5 py-2.5 text-sm font-semibold text-[#0b0806] transition-transform hover:-translate-y-0.5 md:inline-flex"
          >
            Order pickup <ArrowUpRight className="size-4" />
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-white/10 bg-[#0b0806]/95 px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-[#c9bda9] hover:bg-white/5 hover:text-[#c8a15a]"
                >
                  {n.label}
                </a>
              ))}
              <a
                href="#visit"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#c8a15a] px-5 py-3 text-sm font-semibold text-[#0b0806]"
              >
                Order pickup <ArrowUpRight className="size-4" />
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section id="top" className="relative flex min-h-screen items-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1920&q=80"
          alt="Freshly baked artisan pastries"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0806] via-[#0b0806]/70 to-[#0b0806]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0806]/80 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-28 pb-16 sm:px-8">
          <div className="max-w-2xl">
            <p className="crumcle-fade inline-flex items-center gap-2 rounded-full border border-[#c8a15a]/40 bg-[#c8a15a]/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-[#e0c78e]">
              <Wheat className="size-3.5" /> Artisan micro-bakery
            </p>
            <h1 className="crumcle-fade mt-6 font-serif text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl lg:text-8xl">
              Baked in the
              <span className="block italic text-[#c8a15a]">quiet hours.</span>
            </h1>
            <p className="crumcle-fade mt-6 max-w-lg text-lg leading-relaxed text-[#c9bda9]">
              Crumcle is a small-batch bakery obsessed with slow fermentation, heritage grain and
              the kind of pastry that makes a morning feel like a ritual.
            </p>
            <div className="crumcle-fade mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#menu"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c8a15a] px-7 py-4 text-sm font-semibold text-[#0b0806] shadow-lg shadow-[#c8a15a]/20 transition-transform hover:-translate-y-0.5"
              >
                Explore the menu <ArrowUpRight className="size-4" />
              </a>
              <a
                href="#story"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-[#f3ece0] transition-colors hover:bg-white/5"
              >
                Our story
              </a>
            </div>

            <div className="crumcle-fade mt-12 flex items-center gap-8">
              {[
                { k: "36h", v: "Fermentation" },
                { k: "12", v: "Daily bakes" },
                { k: "4.9", v: "Avg. rating" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-serif text-3xl font-semibold text-[#c8a15a]">{s.k}</div>
                  <div className="text-xs uppercase tracking-wider text-[#9a8f7e]">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Marquee                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="border-y border-white/10 bg-[#141010] py-5">
        <div className="crumcle-marquee flex gap-12 whitespace-nowrap">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-12">
              {["Sourdough", "Croissants", "Canelés", "Tarts", "Galettes", "Crumbles", "Loaves", "Macarons"].map(
                (word) => (
                  <span
                    key={word}
                    className="flex items-center gap-12 font-serif text-2xl italic text-[#8a7f6e]"
                  >
                    {word} <Star className="size-4 fill-[#c8a15a] text-[#c8a15a]" />
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Story                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section id="story" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=1000&q=80"
                alt="Baker shaping dough by hand"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 hidden max-w-[220px] rounded-2xl border border-white/10 bg-[#141010] p-5 shadow-xl sm:block">
              <p className="font-serif text-lg italic text-[#c8a15a]">"Bread is patience made edible."</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-[#9a8f7e]">— Elena, Head Baker</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#c8a15a]">Our story</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              A bakery that runs on time, not shortcuts.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#c9bda9]">
              Crumcle began in a tiny loft kitchen with one cast-iron oven and a stubborn belief:
              that great baking can't be rushed. Years later, we still mill our own grain, feed a
              starter older than the shop, and shape every loaf by hand.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#c9bda9]">
              We bake in small batches so nothing sits. What you taste in the morning was proofing
              while the city slept.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-5">
              {[
                { k: "Est. 2016", v: "Founded in the loft" },
                { k: "100%", v: "Hand-shaped daily" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-white/10 bg-[#141010] p-5">
                  <div className="font-serif text-2xl font-semibold text-[#c8a15a]">{s.k}</div>
                  <div className="mt-1 text-sm text-[#9a8f7e]">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Menu                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section id="menu" className="bg-[#100c0a] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-end justify-between gap-6 sm:flex-row">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#c8a15a]">The counter</p>
              <h2 className="mt-4 max-w-xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                Today's small-batch selection.
              </h2>
            </div>
            <p className="max-w-sm text-[#9a8f7e]">
              The menu shifts with the seasons and sells out most mornings. Here's what's coming out
              of the oven now.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MENU.map((item) => (
              <article
                key={item.name}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-[#141010] transition-all duration-300 hover:-translate-y-1 hover:border-[#c8a15a]/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt={item.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-[#0b0806]/80 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#e0c78e] backdrop-blur">
                    {item.tag}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-xl font-semibold">{item.name}</h3>
                    <span className="font-serif text-xl text-[#c8a15a]">{item.price}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#9a8f7e]">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Craft (why us)                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section id="craft" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#c8a15a]">The craft</p>
          <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Four obsessions behind every bite.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CRAFT.map((c) => (
            <div
              key={c.title}
              className="rounded-3xl border border-white/10 bg-[#141010] p-7 transition-colors hover:border-[#c8a15a]/40"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#c8a15a]/12 text-[#c8a15a]">
                <c.icon className="size-6" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9a8f7e]">{c.body}</p>
            </div>
          ))}
        </div>

        {/* Process steps */}
        <div className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="bg-[#100c0a] p-8">
              <div className="font-serif text-5xl font-semibold text-[#c8a15a]/30">{step.n}</div>
              <h3 className="mt-4 font-serif text-2xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9a8f7e]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Reviews                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="reviews" className="bg-[#100c0a] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-5 fill-[#c8a15a] text-[#c8a15a]" />
              ))}
            </div>
            <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Loved by early risers.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure
                key={r.name}
                className="flex flex-col rounded-3xl border border-white/10 bg-[#141010] p-8"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#c8a15a] text-[#c8a15a]" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 font-serif text-lg italic leading-relaxed text-[#e6ddcd]">
                  "{r.quote}"
                </blockquote>
                <figcaption className="mt-6 border-t border-white/10 pt-5">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-[#9a8f7e]">{r.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Gallery                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col items-end justify-between gap-4 sm:flex-row">
          <h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            From our ovens
            <span className="text-[#c8a15a]">.</span>
          </h2>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#c8a15a] hover:underline"
          >
            <Instagram className="size-4" /> @crumcle
          </a>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {GALLERY.map((src, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Crumcle bakery"
                className="aspect-square size-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#0b0806]/0 transition-colors group-hover:bg-[#0b0806]/30" />
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Visit / FAQ / CTA                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section id="visit" className="bg-[#100c0a] py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
          {/* Left: visit info + reserve */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#c8a15a]">Visit us</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Come while it's warm.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#c9bda9]">
              Reserve a box for pickup or just drop by. We open at 7am and bake until we sell out.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { k: "Address", v: "14 Loft Lane, Old Mill District" },
                { k: "Hours", v: "Tue–Sun · 7:00am – 2:00pm" },
                { k: "Contact", v: "hello@crumcle.co · (555) 240-1188" },
              ].map((row) => (
                <div key={row.k} className="flex gap-4 rounded-2xl border border-white/10 bg-[#141010] p-5">
                  <div className="w-20 shrink-0 text-xs uppercase tracking-wider text-[#9a8f7e]">{row.k}</div>
                  <div className="font-medium">{row.v}</div>
                </div>
              ))}
            </div>

            <form
              className="mt-8 rounded-3xl border border-white/10 bg-[#141010] p-6"
              onSubmit={(e) => e.preventDefault()}
            >
              <h3 className="font-serif text-xl font-semibold">Reserve a pickup box</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Your name"
                  className="rounded-xl border border-white/10 bg-[#0b0806] px-4 py-3 text-sm text-[#f3ece0] outline-none placeholder:text-[#7a7062] focus:border-[#c8a15a]"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="rounded-xl border border-white/10 bg-[#0b0806] px-4 py-3 text-sm text-[#f3ece0] outline-none placeholder:text-[#7a7062] focus:border-[#c8a15a]"
                />
                <textarea
                  placeholder="What would you like? (e.g. 4 croissants, 1 crumble)"
                  className="min-h-24 rounded-xl border border-white/10 bg-[#0b0806] px-4 py-3 text-sm text-[#f3ece0] outline-none placeholder:text-[#7a7062] focus:border-[#c8a15a] sm:col-span-2"
                />
              </div>
              <button
                type="submit"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c8a15a] px-6 py-3.5 text-sm font-semibold text-[#0b0806] transition-transform hover:-translate-y-0.5"
              >
                Send reservation <Send className="size-4" />
              </button>
            </form>
          </div>

          {/* Right: map-ish visual + FAQ */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"
                alt="Crumcle bakery storefront"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <h3 className="mt-10 font-serif text-2xl font-semibold">Good to know</h3>
            <div className="mt-4 divide-y divide-white/10 rounded-3xl border border-white/10 bg-[#141010] px-5">
              {FAQ.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                      aria-expanded={open}
                    >
                      <span className="font-medium">{f.q}</span>
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#c8a15a]">
                        {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
                      </span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5" : "max-h-0"}`}>
                      <p className="text-sm leading-relaxed text-[#9a8f7e]">{f.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="relative overflow-hidden border-t border-white/10 bg-[#0b0806] pt-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-10 pb-12 md:flex-row">
            <div className="max-w-sm">
              <a href="#top" className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#c8a15a] text-[#0b0806]">
                  <Croissant className="size-5" />
                </span>
                <span className="font-serif text-xl font-semibold tracking-wide">Crumcle</span>
              </a>
              <p className="mt-4 text-sm leading-relaxed text-[#9a8f7e]">
                A small-batch artisan bakery baking in the quiet hours. Heritage grain, slow
                fermentation, hands-on craft.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              <FooterCol title="Explore" links={["Story", "Menu", "Craft", "Reviews"]} />
              <FooterCol title="Visit" links={["Hours", "Location", "Reserve", "Events"]} />
              <FooterCol title="Social" links={["Instagram", "TikTok", "Pinterest", "Newsletter"]} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-sm text-[#7a7062] sm:flex-row">
            <p>© {new Date().getFullYear()} Crumcle Bakery. All rights reserved.</p>
            <p>Baked with patience · Old Mill District</p>
          </div>
        </div>

        {/* Giant wordmark */}
        <div
          aria-hidden
          className="pointer-events-none select-none bg-gradient-to-b from-white/[0.06] to-transparent bg-clip-text text-center font-serif font-semibold leading-[0.8] tracking-tighter text-transparent"
          style={{ fontSize: "clamp(4rem, 22vw, 20rem)" }}
        >
          Crumcle
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-medium uppercase tracking-wider text-[#c8a15a]">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm text-[#c9bda9] transition-colors hover:text-[#f3ece0]">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Self-contained animations + serif font stack. */
const styles = `
  .crumcle {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  .crumcle .font-serif {
    font-family: "Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif;
  }
  @keyframes crumcle-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .crumcle-marquee {
    animation: crumcle-marquee 28s linear infinite;
    width: max-content;
  }
  @keyframes crumcle-fade {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .crumcle-fade {
    animation: crumcle-fade 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .crumcle-fade:nth-child(2) { animation-delay: 0.08s; }
  .crumcle-fade:nth-child(3) { animation-delay: 0.16s; }
  .crumcle-fade:nth-child(4) { animation-delay: 0.24s; }
  .crumcle-fade:nth-child(5) { animation-delay: 0.32s; }
  @media (prefers-reduced-motion: reduce) {
    .crumcle-marquee, .crumcle-fade { animation: none; }
  }
`;
