"use client";

import { s, type SectionProps } from "../helpers";

export function ContactSimple(p: SectionProps) {
  return (
    <section id="contact" className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{s(p.heading)}</h2>
      {s(p.subheading) && <p className="mt-4 text-base opacity-70 sm:text-lg">{s(p.subheading)}</p>}
      <div className="mt-8 space-y-1 text-base font-medium sm:text-lg">
        {s(p.email) && <p className="break-all">{s(p.email)}</p>}
        {s(p.phone) && <p>{s(p.phone)}</p>}
      </div>
    </section>
  );
}
