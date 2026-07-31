"use client";

import { ChevronRight } from "lucide-react";
import { s, type SectionProps } from "../helpers";
import { SiteSection, SiteContainer, SiteButton, CompanyLogoMark } from "../ui";
import type { CompanyLogo } from "@/lib/blueprint/types";

function RetroGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50 [perspective:200px]">
      <div className="absolute inset-0 [transform:rotateX(65deg)]">
        <div className="site-retro-grid animate-retro-grid absolute inset-0 h-[250%] w-[250%] max-w-none origin-[100%_0] -translate-x-[35%]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
    </div>
  );
}

export function HeroCentered(p: SectionProps) {
  const headline = s(p.headline);
  const words = headline.split(" ");
  const mid = Math.max(1, Math.ceil(words.length / 2));
  const regular = words.slice(0, mid).join(" ");
  const gradient = words.slice(mid).join(" ");
  const logo = p.logo as CompanyLogo | undefined;

  return (
    <SiteSection className="relative overflow-hidden !py-14 sm:!py-20 md:!py-28">
      <div
        className="absolute inset-x-0 top-0 h-[min(100vh,720px)]"
        style={{
          background:
            "radial-gradient(ellipse 20% 80% at 50% -20%, color-mix(in oklab, var(--primary) 22%, transparent), transparent)",
        }}
      />
      <SiteContainer className="relative">
        <RetroGrid />
        <div className="relative z-10 mx-auto max-w-3xl space-y-4 px-2 text-center sm:space-y-5">
          {logo && (
            <div className="mb-2 flex justify-center">
              <CompanyLogoMark logo={logo} name={s(p.businessName) || headline} size="md" />
            </div>
          )}
          {s(p.eyebrow) && (
            <p className="mx-auto inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-black/5 px-4 py-1.5 text-xs opacity-70 sm:text-sm">
              {s(p.eyebrow)}
              <ChevronRight className="size-3.5 shrink-0" />
            </p>
          )}
          <h1 className="text-3xl font-semibold tracking-tighter sm:text-5xl md:text-6xl">
            <span className="bg-clip-text text-transparent">{regular} </span>
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, var(--primary), var(--accent))" }}
            >
              {gradient}
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base opacity-70 sm:text-lg">{s(p.subheadline)}</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            {s(p.ctaPrimary) && (
              <SiteButton href="#contact" variant="primary" className="w-full sm:w-auto">
                {s(p.ctaPrimary)}
                <ChevronRight className="size-4" />
              </SiteButton>
            )}
            {s(p.ctaSecondary) && (
              <SiteButton href="#about" variant="outline" className="w-full sm:w-auto">
                {s(p.ctaSecondary)}
              </SiteButton>
            )}
          </div>
        </div>
      </SiteContainer>
    </SiteSection>
  );
}
