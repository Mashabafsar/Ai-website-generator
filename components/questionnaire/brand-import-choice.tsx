"use client";

import { Check, Info, Loader2, Trash2 } from "lucide-react";
import { FONT_CATALOG_HREF, THEME_FONTS } from "@/templates/shared/fonts";
import {
  ASSET_CONSENT_STATEMENT,
  hasImportedAssets,
  type ImportedBrand,
} from "@/lib/branding/imported-brand";
import { cn } from "@/lib/utils";

/**
 * Shown straight after a website import: what we detected, the one design
 * decision only the customer can make — keep their existing look, or pick a
 * different palette and typeface — and the licence confirmation their own logo
 * and photographs need before we republish them.
 */
export function BrandImportChoice({
  brand,
  value,
  onChange,
  assetConsent,
  onAssetConsentChange,
  onRemoveAssets,
  removingAssets,
}: {
  brand: ImportedBrand;
  value: "imported" | "custom";
  onChange: (value: "imported" | "custom") => void;
  assetConsent: boolean;
  onAssetConsentChange: (value: boolean) => void;
  onRemoveAssets: () => void;
  removingAssets: boolean;
}) {
  const font = THEME_FONTS.find((f) => f.id === brand.fontFamily) ?? null;
  const colors = brand.colors;
  const photoCount = brand.images.length;
  const assets = hasImportedAssets(brand);
  const swatches = colors
    ? [colors.primary, colors.accent, colors.secondary, colors.background, colors.foreground]
    : [];

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

      {photoCount > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {brand.images.slice(0, 6).map((img) => (
            <div
              key={img.url}
              className="h-16 w-20 shrink-0 overflow-hidden rounded-md border bg-secondary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.altText || ""} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <ChoiceCard
          active={value === "imported"}
          onClick={() => onChange("imported")}
          title="Use this look"
          desc="Keep the colours and typeface from your existing site."
        >
          <div className="mt-3 space-y-2">
            {swatches.length ? (
              <div className="flex items-center gap-2">
                {swatches.map((color, index) => (
                  <span
                    key={`${color}-${index}`}
                    title={color}
                    aria-label={color}
                    className="h-6 w-6 rounded-full border"
                    style={{ background: color }}
                  />
                ))}
                <span className="font-mono text-[11px] uppercase text-muted-foreground">
                  {colors?.primary}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No colours detected — the design keeps its own.
              </p>
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
              <p className="text-xs text-muted-foreground">
                No typeface detected — the design keeps its own.
              </p>
            )}
          </div>
        </ChoiceCard>

        <ChoiceCard
          active={value === "custom"}
          onClick={() => onChange("custom")}
          title="Choose a different look"
          desc="Pick a palette and typeface in the Style step, or leave it for the generator."
        >
          <div className="mt-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-indigo-500" />
            <span className="h-6 w-6 rounded-full bg-emerald-500" />
            <span className="h-6 w-6 rounded-full bg-orange-500" />
            <span className="text-xs text-muted-foreground">You choose next — or we will</span>
          </div>
        </ChoiceCard>
      </div>

      {assets && (
        <div className="rounded-xl border border-input bg-background p-4">
          <div className="flex items-start gap-3">
            <input
              id="imported-asset-consent"
              name="importedAssetConsent"
              type="checkbox"
              checked={assetConsent}
              onChange={(event) => onAssetConsentChange(event.target.checked)}
              aria-describedby="imported-asset-consent-note"
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
            <div className="min-w-0 space-y-1.5">
              <label
                htmlFor="imported-asset-consent"
                className="block cursor-pointer text-sm font-semibold"
              >
                {ASSET_CONSENT_STATEMENT}
              </label>
              <p id="imported-asset-consent-note" className="text-xs text-muted-foreground">
                {assetConsent
                  ? `We'll reuse ${assetList(brand.logoUrl, photoCount)} on your new site under either option above — your theme choice only changes the colours and typeface.`
                  : `Until you confirm this, we'll leave ${assetList(brand.logoUrl, photoCount)} out and use stock photography instead. Everything else the import filled in stays either way.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemoveAssets}
            disabled={removingAssets}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground disabled:opacity-50"
          >
            {removingAssets ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete the files we downloaded
          </button>
        </div>
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

function assetList(logoUrl: string | undefined, photoCount: number): string {
  const parts = [
    logoUrl ? "your logo" : null,
    photoCount ? `${photoCount} photo${photoCount === 1 ? "" : "s"}` : null,
  ].filter(Boolean);
  return parts.join(" and ") || "your images";
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
