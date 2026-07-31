"use client";

import { a, itemImages, s, type SectionProps } from "../helpers";

export function PortfolioCaseStudies(p: SectionProps) {
  const titles = a(p.itemTitles);
  const bodies = a(p.itemBodies);
  const authors = a(p.authors);
  const roles = a(p.roles);
  const metrics = a(p.metrics);
  const images = itemImages(p);

  return (
    <section className="bg-[var(--background)] px-4 py-16 sm:px-6 sm:py-24 md:py-32" aria-labelledby="case-studies-heading">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 text-center">
          <h2 id="case-studies-heading" className="text-3xl font-semibold sm:text-4xl md:text-5xl">
            {s(p.heading)}
          </h2>
          {s(p.subheading) && <p className="text-sm opacity-70 sm:text-base">{s(p.subheading)}</p>}
        </div>
        <div className="mt-14 flex flex-col gap-14 sm:mt-20 sm:gap-20">
          {titles.map((title, idx) => {
            const reversed = idx % 2 === 1;
            const metricPair = (metrics[idx] ?? "40%|Impact|95%|Satisfaction").split("|");
            const img = images[idx];
            return (
              <div
                key={idx}
                className="grid items-center gap-10 border-b pb-10 sm:gap-12 sm:pb-12 lg:grid-cols-3 xl:gap-24"
              >
                <div
                  className={[
                    "flex flex-col gap-8 text-left sm:flex-row sm:gap-10 lg:col-span-2 lg:border-r lg:pr-12 xl:pr-16",
                    reversed ? "lg:order-2 lg:border-l lg:border-r-0 lg:pl-12 lg:pr-0 xl:pl-16" : "",
                  ].join(" ")}
                >
                  {img?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.url}
                      alt={img.altText || title}
                      className="aspect-[29/35] h-auto w-full max-w-xs rounded-2xl object-cover ring-1 ring-black/10 sm:max-w-60"
                    />
                  ) : (
                    <div
                      className="aspect-[29/35] h-auto w-full max-w-xs rounded-2xl ring-1 ring-black/10 sm:max-w-60"
                      style={{
                        background: `linear-gradient(160deg, color-mix(in oklab, var(--primary) ${25 + idx * 10}%, white), color-mix(in oklab, var(--accent) 40%, white))`,
                      }}
                    />
                  )}
                  <figure className="flex flex-col justify-between gap-8 text-left">
                    <blockquote>
                      <h3 className="text-base font-normal leading-relaxed sm:text-lg md:text-xl">
                        {title}
                        <span className="mt-2 block text-sm opacity-60 md:text-base">
                          {bodies[idx] ?? ""}
                        </span>
                      </h3>
                    </blockquote>
                    <figcaption className="flex flex-col gap-1">
                      <span className="font-medium">{authors[idx] ?? ""}</span>
                      <span className="text-sm opacity-60">{roles[idx] ?? ""}</span>
                    </figcaption>
                  </figure>
                </div>
                <div className={["grid grid-cols-2 gap-6 self-center sm:grid-cols-1 sm:gap-10", reversed ? "lg:order-1" : ""].join(" ")}>
                  <div className="flex flex-col gap-2 sm:p-6 text-left">
                    <p className="text-3xl font-medium sm:text-4xl">{metricPair[0] ?? "40%"}</p>
                    <p className="text-sm font-medium sm:text-base">{metricPair[1] ?? "Results"}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:p-6 text-left">
                    <p className="text-3xl font-medium sm:text-4xl">{metricPair[2] ?? "95%"}</p>
                    <p className="text-sm font-medium sm:text-base">{metricPair[3] ?? "Satisfaction"}</p>
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
