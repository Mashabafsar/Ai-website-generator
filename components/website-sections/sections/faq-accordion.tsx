"use client";

import { useState } from "react";
import { a, s, type SectionProps } from "../helpers";

export function FaqAccordion(p: SectionProps) {
  const questions = a(p.questions);
  const answers = a(p.answers);
  const [open, setOpen] = useState(0);

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24" style={{ background: "var(--secondary)" }}>
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-semibold sm:text-4xl">{s(p.heading)}</h2>
        <p className="mt-4 max-w-2xl text-base opacity-70 sm:text-lg">
          Discover quick answers to common questions about our services and process.
        </p>
        <div className="mt-10 w-full rounded-2xl border bg-[var(--background)] px-4 py-3 shadow-sm sm:mt-12 sm:px-8">
          {questions.map((q, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-dotted last:border-b-0">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-medium"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  {q}
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-lg transition-transform ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`overflow-hidden text-sm transition-[max-height] duration-300 sm:text-base ${isOpen ? "max-h-48 pb-5" : "max-h-0"}`}
                >
                  <p className="opacity-70">{answers[i] ?? ""}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
