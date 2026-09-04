"use client";

import { Pin } from "lucide-react";
import { IconGlyph } from "@/lib/icons/glyph";
import { a, icons, s, type SectionProps } from "../helpers";

const themes = [
  { bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-100" },
  { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
];
const rotates = ["md:rotate-8", "md:-rotate-8", "md:rotate-8", "md:-rotate-8", "md:rotate-8"];

export function ProcessSteps(p: SectionProps) {
  const titles = a(p.stepTitles);
  const bodies = a(p.stepBodies);
  const glyphs = icons(p);

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
          backgroundSize: "100% 32px",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight sm:mb-14 sm:text-4xl">{s(p.heading)}</h2>
        <div className="flex flex-col items-center gap-8 md:flex-row md:flex-wrap md:justify-center md:gap-10">
          {titles.map((title, index) => {
            const theme = themes[index % themes.length];
            return (
              <div
                key={index}
                className={`relative w-full max-w-sm transition-transform duration-300 hover:z-30 hover:scale-105 md:w-[280px] md:max-w-none ${rotates[index % rotates.length]}`}
              >
                <div className="rounded-[25px] border border-neutral-100 bg-white p-2 shadow-[0px_10px_20px_0px_#D3D3D3]">
                  {glyphs[index] ? (
                    <IconGlyph name={glyphs[index]} className={`mx-auto mb-6 size-8 ${theme.text}`} />
                  ) : (
                    <Pin className={`mx-auto mb-6 size-8 ${theme.text}`} />
                  )}
                  <div className={`${theme.bg} ${theme.border} relative flex h-full flex-col overflow-hidden rounded-[15px] border p-[15px]`}>
                    <span className={`${theme.text} mb-5 text-4xl`} style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mb-2.5 text-2xl font-semibold leading-none text-neutral-800">{title}</h3>
                    <p className="text-sm tracking-tight text-neutral-500">{bodies[index] ?? ""}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
