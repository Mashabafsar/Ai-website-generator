"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { a, itemImages, s, type SectionProps } from "../helpers";

export function FeaturesGrid(p: SectionProps) {
  const titles = a(p.itemTitles);
  const bodies = a(p.itemBodies);
  const images = itemImages(p);
  const [active, setActive] = useState(0);
  const activeImage = images[active];

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 sm:gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-5xl">{s(p.heading)}</h2>
          {s(p.subheading) && <p className="mt-4 max-w-xl text-base opacity-70 sm:text-lg">{s(p.subheading)}</p>}
          <ul className="mt-8 space-y-2 sm:mt-10 sm:space-y-3">
            {titles.map((title, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="block w-full origin-bottom overflow-hidden text-left text-xl font-semibold tracking-tight transition-opacity sm:text-2xl md:text-4xl"
                  style={{ opacity: active === i ? 1 : 0.25 }}
                >
                  {title}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div
          className="relative min-h-[280px] overflow-hidden rounded-2xl border sm:min-h-[320px] md:min-h-[420px]"
          style={{ background: "var(--secondary)" }}
        >
          {activeImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage.url}
              alt={activeImage.altText || titles[active] || ""}
              className="absolute inset-0 size-full object-cover transition-opacity duration-500"
            />
          ) : (
            <div
              className="absolute inset-0 opacity-40"
              style={{ background: "linear-gradient(145deg, var(--primary), var(--accent))" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-end p-6 text-white sm:min-h-[320px] sm:p-8 md:min-h-[420px]">
            <Badge className="mb-4 w-fit bg-white/15 text-white">Feature {String(active + 1).padStart(2, "0")}</Badge>
            <h3 className="text-xl font-semibold sm:text-2xl">{titles[active] ?? ""}</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
              {bodies[active] ?? ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
