"use client";

import { Button } from "@/components/ui/button";
import { s, image, type SectionProps } from "../helpers";

export function AboutWithImage(p: SectionProps) {
  const img = image(p);
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-5 text-center sm:mb-14 md:grid-cols-2 md:text-left">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">{s(p.heading)}</h2>
          <p className="text-sm opacity-70 sm:text-base">{s(p.body)}</p>
        </div>
        <div className="grid gap-6 sm:gap-7 lg:grid-cols-3">
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img.url}
              alt={img.altText}
              className="h-64 w-full rounded-xl object-cover sm:h-80 lg:h-full lg:max-h-[620px] lg:col-span-2"
            />
          )}
          <div className="flex flex-col gap-6 sm:gap-7 md:flex-row lg:flex-col">
            <div
              className="flex flex-col justify-between gap-6 rounded-xl p-6 sm:p-7 md:w-1/2 lg:w-auto"
              style={{ background: "var(--secondary)" }}
            >
              <div
                className="mr-auto h-12 w-12 rounded-lg"
                style={{ background: "var(--primary)", opacity: 0.25 }}
              />
              <div>
                <p className="mb-2 text-lg font-semibold">{s(p.heading)}</p>
                <p className="text-sm opacity-70 sm:text-base">{s(p.body)}</p>
              </div>
              <Button variant="outline" className="mr-auto rounded-full">
                Discover more
              </Button>
            </div>
            {img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.url}
                alt={img.altText}
                className="h-48 w-full grow rounded-xl object-cover sm:h-56 md:w-1/2 md:basis-0 lg:h-auto lg:min-h-0 lg:w-auto"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
