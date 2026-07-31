"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { s, image, type SectionProps } from "../helpers";

export function CtaBanner(p: SectionProps) {
  const img = image(p);
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-xl border shadow">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.url} alt={img.altText} className="absolute inset-0 size-full object-cover" aria-hidden />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, var(--primary), color-mix(in oklab, var(--accent) 70%, var(--primary)))",
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 grid h-full grid-cols-1 items-center gap-8 p-6 text-white sm:p-8 md:grid-cols-2 md:p-12 lg:p-16">
          <div className="flex flex-col items-start text-left">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              {s(p.headline)}
            </h2>
            {s(p.subheadline) && (
              <p className="mt-4 max-w-xl text-base text-neutral-200 sm:text-lg">{s(p.subheadline)}</p>
            )}
          </div>
          <div className="flex w-full max-w-md flex-col">
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder="Email address"
                className="h-12 flex-grow border-neutral-700 bg-neutral-800/50 text-white placeholder:text-neutral-400"
              />
              <Button type="button" size="lg" className="h-12 w-full bg-white text-black hover:bg-neutral-200 sm:w-auto">
                {s(p.ctaPrimary) || "Join"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
