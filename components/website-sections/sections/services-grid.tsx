"use client";

import { a, itemImages, s, type SectionProps } from "../helpers";
import { SiteSection, SiteContainer } from "../ui";

export function ServicesGrid(p: SectionProps) {
  const titles = a(p.itemTitles);
  const bodies = a(p.itemBodies);
  const images = itemImages(p);
  return (
    <SiteSection>
      <SiteContainer>
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl md:text-5xl">{s(p.heading)}</h2>
          {s(p.subheading) && (
            <p className="mt-2 text-sm font-light opacity-60 sm:mt-3 sm:text-base md:text-lg">{s(p.subheading)}</p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
          {titles.map((title, index) => {
            const img = images[index];
            return (
              <div
                key={index}
                className="group flex min-h-[280px] flex-col rounded-3xl p-6 transition-all duration-300 sm:h-[320px] sm:min-h-0"
                style={{ background: "var(--secondary)" }}
              >
                <div className="relative mb-4 flex flex-grow items-center justify-center">
                  {img?.url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.altText || title}
                        className="absolute size-36 -rotate-6 rounded-lg object-cover shadow-md transition-all duration-300 group-hover:scale-105 group-hover:-rotate-[10deg] sm:size-44"
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt=""
                        aria-hidden
                        className="absolute size-36 rotate-3 rounded-lg object-cover opacity-80 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-[5deg] sm:size-44"
                      />
                    </>
                  ) : (
                    <>
                      <div
                        className="absolute size-36 -rotate-6 rounded-lg shadow-md transition-all duration-300 group-hover:scale-105 group-hover:-rotate-[10deg] sm:size-44"
                        style={{
                          background: `linear-gradient(135deg, color-mix(in oklab, var(--primary) ${30 + index * 8}%, white), color-mix(in oklab, var(--accent) 40%, white))`,
                        }}
                      />
                      <div
                        className="absolute size-36 rotate-3 rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-[5deg] sm:size-44"
                        style={{
                          background: `linear-gradient(160deg, color-mix(in oklab, var(--accent) 50%, white), color-mix(in oklab, var(--primary) 20%, white))`,
                        }}
                      />
                    </>
                  )}
                </div>
                <h3 className="mt-auto text-left text-base font-medium sm:text-lg">{title}</h3>
                {bodies[index] && <p className="mt-1 text-left text-sm opacity-60">{bodies[index]}</p>}
              </div>
            );
          })}
        </div>
      </SiteContainer>
    </SiteSection>
  );
}
