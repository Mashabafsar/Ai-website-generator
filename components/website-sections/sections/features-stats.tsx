"use client";

import { a, s, type SectionProps } from "../helpers";

export function FeaturesStats(p: SectionProps) {
  const values = a(p.statValues);
  const labels = a(p.statLabels);

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        {s(p.heading) && (
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">{s(p.heading)}</h2>
        )}
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 sm:mt-14 lg:grid-cols-4">
          {values.map((value, i) => (
            <div key={`${value}-${i}`}>
              <div
                className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
                style={{ color: "var(--primary)" }}
              >
                {value}
              </div>
              <p className="mt-2 text-sm opacity-70 sm:text-base">{labels[i] ?? ""}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
