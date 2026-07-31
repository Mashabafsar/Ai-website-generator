"use client";

import { Check } from "lucide-react";
import { s, a, type SectionProps } from "../helpers";

export function AboutSimple(p: SectionProps) {
  const titles = a(p.itemTitles);
  const bodies = a(p.itemBodies);
  const items =
    titles.length > 0
      ? titles.map((t, i) => ({ title: t, body: bodies[i] || s(p.body) }))
      : [
          { title: "Lightning-fast performance", body: "Minimal load times and optimized delivery." },
          { title: "Beautifully designed", body: "Modern, pixel-perfect sections ready for your brand." },
          { title: "Plug-and-play", body: "Simple structure that adapts to your content." },
          { title: "Clear & comprehensive", body: "Content laid out for clarity and conversion." },
          { title: "Fully customizable", body: "Easily adapt styles and layout to your brand." },
          { title: "Accessibility first", body: "Built with inclusive experiences in mind." },
        ];

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-0 size-[min(520px,90vw)] -translate-x-1/2 -translate-y-1/3 rounded-full blur-[220px]"
        style={{ background: "color-mix(in oklab, var(--accent) 40%, white)" }}
      />
      <h2 className="relative mx-auto text-center text-2xl font-semibold sm:text-3xl">{s(p.heading)}</h2>
      <p className="relative mx-auto mt-2 max-w-lg text-center text-sm opacity-60">{s(p.body)}</p>
      <div className="relative mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-10 sm:mt-16 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title}>
            <div
              className="size-10 rounded border p-2"
              style={{
                background: "color-mix(in oklab, var(--primary) 8%, white)",
                borderColor: "color-mix(in oklab, var(--primary) 25%, white)",
              }}
            >
              <Check className="size-full" style={{ color: "var(--primary)" }} />
            </div>
            <div className="mt-5 space-y-2">
              <h3 className="text-base font-medium">{item.title}</h3>
              <p className="text-sm opacity-60">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
