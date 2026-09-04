"use client";

import { Check, Info, Sparkles } from "lucide-react";
import { FONT_CATALOG_HREF, THEME_FONTS } from "@/templates/shared/fonts";
import type { ImportedBrand } from "@/lib/branding/imported-brand";
import { cn } from "@/lib/utils";

/**
 * Shown straight after a website import: what we detected, and the one decision
 * only the customer can make — keep their existing look, or let the generator
 * art-direct a new one.
 */
export function BrandImportChoice({
  brand,
  value,
  onChange,
}: {
  brand: ImportedBrand;
  value: "ai" | "imported";
  onChange: (value: "ai" | "imported") => void;
}) {
  const font = THEME_FONTS.find((f) => f.id === brand.fontFamily) ?? null;
  const colors = brand.colors;
  const photoCount = brand.images.length;

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      {/* Loads every catalog family so the detected font previews in its own type. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={FONT_CATALOG_HREF} />

      <div className="flex items-start gap-3">
        {brand.logoUrl ? (
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md border bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logoUrl} alt="Your logo" className="h-full w-full object-contain p-1" />
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="font-semibold">We read your current website</p>
          <p className="text-sm text-muted-foreground">
            {[
              brand.logoUrl ? "logo" : null,
              photoCount ? `${photoCount} photo${photoCount === 1 ? "" : "s"}` : null,
              colors ? "brand colours" : null,
              font ? "typeface" : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Text details only"}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ChoiceCard
          active={value === "imported"}
          onClick={() => onChange("imported")}
          title="Keep my current look"
          desc="Use the colours and typeface from your existing site."
        >
          <div className="mt-3 space-y-2">
            {colors ? (
              <div className="flex items-center gap-2">
                <Swatch color={colors.primary} label="Primary" />
                <Swatch color={colors.accent} label="Accent" />
                <Swatch color={colors.background} label="Background" />
                <span className="font-mono text-[11px] uppercase text-muted-foreground">
                  {colors.primary}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No colours detected — the design keeps its own.</p>
            )}
            {font ? (
              <p className="text-lg leading-tight" style={{ fontFamily: font.stack }}>
                {font.name}
                {brand.fontMatch !== "exact" && (
                  <span className="ml-2 align-middle font-sans text-[11px] text-muted-foreground">
                    closest match to {brand.fontDetected}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No typeface detected — the design keeps its own.</p>
            )}
          </div>
        </ChoiceCard>

        <ChoiceCard
          active={value === "ai"}
          onClick={() => onChange("ai")}
          title="Let our AI choose"
          desc="A palette and typeface picked to suit your industry."
        >
          <div className="mt-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400" />
            <span className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-300" />
            <span className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 to-rose-400" />
            <span className="text-xs text-muted-foreground">Decided during generation</span>
          </div>
        </ChoiceCard>
      </div>

      {(brand.logoUrl || photoCount > 0) && (
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Your logo and photos are used either way — only the colours and typeface change.
        </p>
      )}

      {brand.notes.length > 0 && (
        <ul className="space-y-1">
          {brand.notes.map((note) => (
            <li key={note} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {note}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChoiceCard({
  active,
  onClick,
  title,
  desc,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-xl border p-4 text-left transition-colors",
        active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "hover:bg-secondary"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
            active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
          )}
        >
          {active && <Check className="h-2.5 w-2.5" />}
        </span>
        <span className="font-semibold">{title}</span>
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
      {children}
    </button>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span
      title={`${label} ${color}`}
      aria-label={`${label} ${color}`}
      className="h-6 w-6 rounded-full border shadow-sm"
      style={{ background: color }}
    />
  );
}
