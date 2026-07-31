"use client";

import { ArrowRight } from "lucide-react";
import { s, image, type SectionProps } from "../helpers";
import { SiteButton } from "../ui";

export function HeroBackgroundImage(p: SectionProps) {
  const img = image(p);
  return (
    <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#020202] text-white selection:bg-white selection:text-black">
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.url} alt={img.altText} className="absolute inset-0 size-full object-cover opacity-40" />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, color-mix(in oklab, var(--primary) 35%, #020202), #020202 60%)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="relative z-10 flex min-h-screen w-full flex-col justify-between gap-8 p-6 sm:p-10 md:flex-row md:p-14 lg:p-20">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-10 pb-4 md:pb-8">
          <div className="flex items-center gap-3">
            <div className="relative size-2.5 rounded-full bg-white">
              <div className="absolute inset-0 animate-ping rounded-full bg-white opacity-30" />
            </div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
              {s(p.eyebrow) || "STUDIO"}
            </span>
          </div>
          <div className="max-w-4xl pr-2 lg:-translate-y-8">
            <h1 className="text-[clamp(2.5rem,9vw,9rem)] font-black uppercase leading-[0.9] tracking-tighter">
              {s(p.headline)}
            </h1>
            <p className="mt-6 max-w-sm font-mono text-[11px] uppercase leading-relaxed tracking-[0.35em] text-white/40 sm:mt-8">
              {s(p.subheadline)}
            </p>
          </div>
          {s(p.ctaPrimary) && (
            <SiteButton href="#contact" variant="white" className="w-fit">
              <span className="flex size-12 items-center justify-center rounded-full border border-white/15 sm:size-14">
                <ArrowRight className="size-4 -rotate-45" />
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">{s(p.ctaPrimary)}</span>
            </SiteButton>
          )}
        </div>
      </div>
    </section>
  );
}
