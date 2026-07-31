"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { a, itemImages, s, type SectionProps } from "../helpers";

export function ServicesCards(p: SectionProps) {
  const titles = a(p.itemTitles);
  const bodies = a(p.itemBodies);
  const images = itemImages(p);
  return (
    <section className="w-full px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start gap-4">
          <Badge>Services</Badge>
          <div className="flex flex-col gap-2">
            <h2 className="max-w-xl text-2xl tracking-tighter sm:text-3xl md:text-5xl">{s(p.heading)}</h2>
            {s(p.subheading) && (
              <p className="max-w-xl text-base leading-relaxed tracking-tight opacity-70 sm:text-lg">
                {s(p.subheading)}
              </p>
            )}
          </div>
          <div className="grid w-full grid-cols-1 items-start gap-8 pt-10 sm:grid-cols-2 sm:pt-12 lg:grid-cols-3">
            {titles.map((title, i) => {
              const img = images[i];
              return (
                <div key={i} className="flex w-full flex-col gap-3">
                  {img?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.url}
                      alt={img.altText || title}
                      className="h-36 w-full rounded-xl object-cover ring-1 ring-black/5"
                    />
                  ) : null}
                  <div className="flex w-full flex-row items-start gap-4">
                    <Check className="mt-2 size-4 shrink-0" style={{ color: "var(--primary)" }} />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm sm:text-base">{title}</p>
                      <p className="text-sm opacity-60">{bodies[i] ?? ""}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
