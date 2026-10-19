"use client";

import { useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorField } from "@/components/theme/color-field";
import { parseUserColor } from "@/lib/theme/parse-color";
import { FONT_CATALOG_HREF, THEME_FONTS } from "@/templates/shared/fonts";

const DESIGN_DEFAULT = "__design_default__";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function OptionalSelect<T extends string>({
  label,
  error,
  value,
  onChange,
  options,
}: {
  label: string;
  error?: string;
  value?: string;
  onChange: (value: T | "") => void;
  options: readonly T[];
}) {
  return (
    <Field label={`${label} (optional)`} error={error}>
      <Select
        value={value || DESIGN_DEFAULT}
        onValueChange={(next) => onChange(next === DESIGN_DEFAULT ? "" : (next as T))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Use this design’s look" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DESIGN_DEFAULT}>Use this design’s look</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function FontSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const selected = THEME_FONTS.find((font) => font.id === value) ?? null;
  return (
    <Field label="Font (optional)">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={FONT_CATALOG_HREF} />
      <Select
        value={value || DESIGN_DEFAULT}
        onValueChange={(next) => onChange(next === DESIGN_DEFAULT ? "" : next)}
      >
        <SelectTrigger>
          <span style={selected ? { fontFamily: selected.stack } : undefined}>
            {selected ? selected.name : "Use this design’s font"}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DESIGN_DEFAULT}>Use this design’s font</SelectItem>
          {THEME_FONTS.map((font) => (
            <SelectItem key={font.id} value={font.id}>
              <span style={{ fontFamily: font.stack }}>{font.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function CustomColorFields({
  primary,
  secondary,
  accent,
  onChange,
}: {
  primary: string;
  secondary: string;
  accent: string;
  onChange: (field: "customPrimary" | "customSecondary" | "customAccent", value: string) => void;
}) {
  const primaryInvalid = Boolean(primary) && !parseUserColor(primary);
  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
      <p className="text-sm text-muted-foreground">
        Type a color code if you have one, or pick a color above.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <ColorField
          label="Primary"
          value={primary}
          allowEmpty
          onChange={(hex) => onChange("customPrimary", hex)}
        />
        <ColorField
          label="Secondary"
          value={secondary}
          allowEmpty
          onChange={(hex) => onChange("customSecondary", hex)}
        />
        <ColorField
          label="Accent (optional)"
          value={accent}
          allowEmpty
          className="sm:col-span-2"
          onChange={(hex) => onChange("customAccent", hex)}
        />
      </div>
      {primaryInvalid ? <p className="text-sm text-destructive">Enter a valid primary color.</p> : null}
    </div>
  );
}

export function ServiceEditor({
  services,
  error,
  onChange,
}: {
  services: string[];
  error?: string;
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim();
    if (!value || services.includes(value)) return;
    onChange([...services, value]);
    setDraft("");
  }

  return (
    <Field
      label="What do you offer?"
      error={error}
      hint="Add each service or product, one at a time."
    >
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder="e.g. Teeth Whitening"
        />
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      {services.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {services.map((service) => (
            <span
              key={service}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              {service}
              <button
                type="button"
                aria-label={`Remove ${service}`}
                onClick={() => onChange(services.filter((item) => item !== service))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </Field>
  );
}
