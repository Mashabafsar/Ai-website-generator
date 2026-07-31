"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { a, s, type SectionProps } from "../helpers";

export function TestimonialsGrid(p: SectionProps) {
  const quotes = a(p.quotes);
  const authors = a(p.authors);
  const roles = a(p.roles);

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-32">
      <div className="mx-auto max-w-6xl space-y-8 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-3xl font-medium sm:text-4xl lg:text-5xl">{s(p.heading)}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
          {quotes.map((quote, i) => {
            const featured = i === 0;
            const wide = i === 1;
            return (
              <Card
                key={i}
                className={[
                  "grid grid-rows-[auto_1fr] gap-6",
                  featured ? "sm:col-span-2 sm:p-6 lg:row-span-2" : "",
                  wide ? "md:col-span-2" : "",
                ].join(" ")}
              >
                {featured && (
                  <CardHeader>
                    <Badge variant="secondary">Featured</Badge>
                  </CardHeader>
                )}
                <CardContent className={featured ? "" : "h-full pt-6"}>
                  <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                    <p className={featured || wide ? "text-base font-medium sm:text-xl" : "text-sm sm:text-base"}>{quote}</p>
                    <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                      <Avatar className="size-10 sm:size-12">
                        <AvatarFallback style={{ background: "var(--primary)", color: "white" }}>
                          {(authors[i] ?? "?").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <cite className="text-sm font-medium not-italic">{authors[i] ?? ""}</cite>
                        <span className="block text-xs opacity-60 sm:text-sm">{roles[i] ?? ""}</span>
                      </div>
                    </div>
                  </blockquote>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
