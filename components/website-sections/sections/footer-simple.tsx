"use client";

import { s, a, type SectionProps } from "../helpers";
import { SiteSection, SiteContainer, CompanyLogoMark } from "../ui";
import type { CompanyLogo } from "@/lib/blueprint/types";

export function FooterSimple(p: SectionProps) {
  const links = a(p.linkLabels);
  const name = s(p.businessName) || "Website";
  const logo = p.logo as CompanyLogo | undefined;

  return (
    <SiteSection className="relative mt-10 overflow-hidden border-t bg-[var(--background)] !py-12 sm:!py-16">
      <SiteContainer className="relative flex min-h-[18rem] flex-col justify-between sm:min-h-[24rem]">
        <div className="flex w-full flex-col items-center text-center">
          <CompanyLogoMark logo={logo} name={name} size="lg" className="mb-4" />
          <span className="text-xl font-bold sm:text-3xl">{name}</span>
          {s(p.tagline) && (
            <p className="mt-2 max-w-sm px-4 text-sm font-semibold opacity-60 sm:text-base">{s(p.tagline)}</p>
          )}
          {links.length > 0 && (
            <nav className="mt-6 flex flex-wrap justify-center gap-3 px-4 text-sm font-medium opacity-70 sm:gap-4">
              {links.map((link, i) => (
                <a key={i} href="#top" className="site-btn rounded-md px-2 py-1 hover:opacity-100">
                  {link}
                </a>
              ))}
            </nav>
          )}
        </div>
        <p className="mt-10 text-center text-xs opacity-60 sm:text-sm">
          ©{new Date().getFullYear()} {name}. All rights reserved.
        </p>
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 select-none bg-gradient-to-b from-foreground/15 to-transparent bg-clip-text text-center font-extrabold leading-none tracking-tighter text-transparent sm:bottom-12"
          style={{ fontSize: "clamp(2rem, 11vw, 9rem)", maxWidth: "95vw" }}
        >
          {name.toUpperCase()}
        </div>
      </SiteContainer>
    </SiteSection>
  );
}
