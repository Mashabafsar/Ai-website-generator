"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { s, type SectionProps } from "../helpers";

export function ContactSplit(p: SectionProps) {
  return (
    <section id="contact" className="relative w-full px-4 py-16 sm:py-24 md:px-6">
      <div className="mx-auto max-w-6xl lg:border-x">
        <div className="px-2 pb-8 pt-4 sm:pb-10 md:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">{s(p.heading)}</h2>
          {s(p.subheading) && <p className="mb-5 mt-2 text-sm opacity-70 sm:text-base">{s(p.subheading)}</p>}
        </div>
        <div className="h-px w-full border-b" />
        <div className="grid md:grid-cols-3">
          {[
            { icon: Mail, title: "Email", description: "We respond within 24 hours.", value: s(p.email) },
            { icon: MapPin, title: "Office", description: "Drop by for a chat.", value: s(p.address) },
            { icon: Phone, title: "Phone", description: "Mon–Fri, 9am–5pm.", value: s(p.phone) },
          ].map(({ icon: Icon, title, description, value }, i) =>
            value ? (
              <div
                key={title}
                className={`flex flex-col justify-between border-b md:border-b-0 md:border-r ${i === 2 ? "md:border-r-0" : ""}`}
              >
                <div className="flex items-center gap-x-3 border-b p-4" style={{ background: "var(--secondary)" }}>
                  <Icon className="size-5 opacity-50" strokeWidth={1} />
                  <h3 className="text-lg font-medium tracking-wider">{title}</h3>
                </div>
                <div className="flex items-center gap-x-2 break-all p-4 py-8 sm:py-12">
                  <span className="font-mono text-sm font-medium tracking-wide sm:text-base">{value}</span>
                </div>
                <div className="border-t p-4">
                  <p className="text-sm opacity-60">{description}</p>
                </div>
              </div>
            ) : null
          )}
        </div>
        <div className="h-px w-full border-b" />
        <form className="grid gap-3 p-4 sm:p-6 md:grid-cols-2">
          <Input placeholder="Your name" />
          <Input type="email" placeholder="Email" />
          <textarea className="min-h-28 rounded-md border bg-transparent px-3 py-2 text-sm md:col-span-2" placeholder="Message" />
          <Button
            type="button"
            className="text-white md:col-span-2"
            style={{ background: "var(--primary)" }}
          >
            {s(p.ctaLabel) || "Send message"}
          </Button>
        </form>
      </div>
    </section>
  );
}
