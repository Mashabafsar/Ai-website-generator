"use client";

import { Check, Star } from "lucide-react";
import { a, s, type SectionProps } from "../helpers";
import { SiteButton } from "../ui";
import { QUOTE_CTA_LABEL, previewContactHref } from "@/lib/pricing/contact-cta";

export function PricingTiers(p: SectionProps) {
  const names = a(p.planNames);
  const features = a(p.planFeatures);
  const contactHref = previewContactHref();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-10 space-y-4 text-center sm:mb-12">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">{s(p.heading)}</h2>
        {s(p.subheading) && (
          <p className="whitespace-pre-line text-base opacity-70 sm:text-lg">{s(p.subheading)}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {names.map((name, index) => {
          const isPopular = index === 1 || names.length === 1;
          return (
            <div
              key={index}
              className={[
                "relative flex flex-col rounded-2xl border bg-[var(--background)] p-6 text-center",
                isPopular ? "border-2 shadow-xl md:-translate-y-5" : "md:mt-5",
              ].join(" ")}
              style={isPopular ? { borderColor: "var(--primary)" } : undefined}
            >
              {isPopular && (
                <div
                  className="absolute right-0 top-0 flex items-center rounded-bl-xl rounded-tr-xl px-2 py-0.5"
                  style={{ background: "var(--primary)" }}
                >
                  <Star className="size-4 fill-current text-white" />
                  <span className="ml-1 text-sm font-semibold text-white">Popular</span>
                </div>
              )}
              <p className="text-base font-semibold opacity-60">{name}</p>
              <ul className="mt-5 flex flex-col gap-2">
                {(features[index] ?? "")
                  .split("\n")
                  .filter(Boolean)
                  .map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-left text-sm">
                      <Check className="mt-1 size-4 shrink-0" style={{ color: "var(--primary)" }} />
                      <span>{feature}</span>
                    </li>
                  ))}
              </ul>
              <hr className="my-4 w-full" />
              <SiteButton href={contactHref} variant="primary" className="mt-8 w-full">
                {QUOTE_CTA_LABEL}
              </SiteButton>
            </div>
          );
        })}
      </div>
    </section>
  );
}
