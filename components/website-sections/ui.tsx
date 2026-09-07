"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CompanyLogo } from "@/lib/blueprint/types";

export function SiteSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("site-section w-full overflow-x-hidden", className)}>
      {children}
    </section>
  );
}

export function SiteContainer({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("site-container", className)}>{children}</div>;
}

type BtnVariant = "primary" | "secondary" | "outline" | "ghost" | "white";

export function SiteButton({
  href = "#contact",
  variant = "primary",
  className,
  children,
  type = "button",
}: {
  href?: string;
  variant?: BtnVariant;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit";
}) {
  const styles = cn(
    "site-btn inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
    "active:scale-[0.98]",
    variant === "primary" &&
      "bg-[var(--primary)] text-white shadow-md hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg",
    variant === "secondary" &&
      "border border-black/10 bg-[var(--secondary)] hover:-translate-y-0.5 hover:shadow-md",
    variant === "outline" &&
      "border border-current bg-transparent hover:-translate-y-0.5 hover:bg-black/[0.03]",
    variant === "ghost" && "hover:bg-black/[0.05]",
    variant === "white" &&
      "bg-[var(--theme-card,#ffffff)] text-[var(--primary)] shadow-md hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg",
    className
  );

  if (href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={styles}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={styles}>
      {children}
    </button>
  );
}

export function CompanyLogoMark({
  logo,
  name,
  className,
  size = "md",
}: {
  logo?: CompanyLogo | null;
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const height = size === "sm" ? "h-8" : size === "lg" ? "h-12" : "h-10";
  if (logo?.dataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo.dataUrl}
        alt={`${name} logo`}
        className={cn("w-auto max-w-[180px] object-contain", height, className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-bold text-white",
        size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-12 text-base" : "size-10 text-sm",
        className
      )}
      style={{ background: "var(--primary)" }}
    >
      {(logo?.initials || name.slice(0, 2)).toUpperCase()}
    </span>
  );
}

export function SiteHeader({
  logo,
  businessName,
  nav,
}: {
  logo?: CompanyLogo | null;
  businessName: string;
  nav: Array<{ href: string; label: string }>;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--background)]/90 backdrop-blur-md">
      <SiteContainer className="flex items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4">
        <a href="#top" className="site-btn flex shrink-0 items-center gap-2 rounded-lg p-1 hover:opacity-90">
          <CompanyLogoMark logo={logo} name={businessName} size="sm" />
          <span className="hidden text-sm font-semibold sm:inline md:hidden">{businessName}</span>
        </a>
        <nav className="hidden min-w-0 items-center gap-5 overflow-x-auto text-sm font-medium md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="site-btn shrink-0 rounded-md px-2 py-1 opacity-70 transition hover:opacity-100"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <SiteButton href="#contact" variant="primary" className="shrink-0 px-4 py-2 text-xs sm:inline-flex">
          Contact
        </SiteButton>
      </SiteContainer>
    </header>
  );
}
