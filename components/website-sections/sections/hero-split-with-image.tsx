"use client";

import { useEffect, useMemo, useState } from "react";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { s, image, type SectionProps } from "../helpers";
import { SiteSection, SiteContainer } from "../ui";

export function HeroSplitWithImage(p: SectionProps) {
  const img = image(p);
  const titles = useMemo(() => {
    const base = s(p.headline)
      .split(/[-–|,]/)
      .map((t) => t.trim())
      .filter(Boolean);
    return base.length >= 2 ? base.slice(0, 5) : [s(p.headline) || "amazing", "trusted", "modern", "reliable"];
  }, [p.headline]);
  const [titleNumber, setTitleNumber] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setTitleNumber((n) => (n === titles.length - 1 ? 0 : n + 1));
    }, 2000);
    return () => clearTimeout(id);
  }, [titleNumber, titles.length]);

  return (
    <SiteSection>
      <SiteContainer className="flex flex-col items-center justify-center gap-6 text-center sm:gap-8">
        {s(p.eyebrow) && (
          <Button variant="secondary" size="sm" className="gap-2 rounded-full" asChild>
            <span>
              {s(p.eyebrow)} <MoveRight className="size-4" />
            </span>
          </Button>
        )}
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl md:text-7xl">
            <span className="block opacity-90">This is something</span>
            <span className="relative mt-2 flex h-[1.15em] w-full justify-center overflow-hidden md:pb-2">
              {titles.map((title, index) => (
                <span
                  key={`${title}-${index}`}
                  className="absolute font-semibold transition-all duration-500"
                  style={{
                    opacity: titleNumber === index ? 1 : 0,
                    transform:
                      titleNumber === index
                        ? "translateY(0)"
                        : titleNumber > index
                          ? "translateY(-150%)"
                          : "translateY(150%)",
                    color: "var(--primary)",
                  }}
                >
                  {title}
                </span>
              ))}
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed tracking-tight opacity-70 sm:text-lg md:text-xl">
            {s(p.subheadline)}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
          {s(p.ctaSecondary) && (
            <Button size="lg" variant="outline" className="w-full gap-2 rounded-full sm:w-auto" asChild>
              <span>
                {s(p.ctaSecondary)} <PhoneCall className="size-4" />
              </span>
            </Button>
          )}
          {s(p.ctaPrimary) && (
            <Button size="lg" className="w-full gap-2 rounded-full text-white sm:w-auto" style={{ background: "var(--primary)" }} asChild>
              <span>
                {s(p.ctaPrimary)} <MoveRight className="size-4" />
              </span>
            </Button>
          )}
        </div>
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.altText}
            className="mt-4 w-full max-w-4xl rounded-xl border object-cover shadow-lg sm:mt-10"
          />
        )}
      </SiteContainer>
    </SiteSection>
  );
}
