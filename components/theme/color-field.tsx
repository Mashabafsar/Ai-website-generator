"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseUserColor, toColorInputValue } from "@/lib/theme/parse-color";
import { cn } from "@/lib/utils";

/**
 * Swatch + typed hex (or CSS name). Typing a valid color updates the swatch;
 * picking a swatch fills the hex. Invalid text never saves.
 */
export function ColorField({
  label,
  value,
  onChange,
  allowEmpty,
  id,
  className,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  allowEmpty?: boolean;
  id?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(value || "");

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  function commit(raw: string): boolean {
    const next = raw.trim();
    if (allowEmpty && next === "") {
      onChange("");
      return true;
    }
    const parsed = parseUserColor(next, "commit");
    if (!parsed) return false;
    setDraft(parsed);
    onChange(parsed);
    return true;
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-[10px] capitalize" htmlFor={id}>
        {label}
      </Label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={toColorInputValue(value)}
          onChange={(e) => {
            setDraft(e.target.value);
            onChange(e.target.value);
          }}
          className="h-8 w-8 shrink-0 cursor-pointer rounded border bg-transparent p-0.5"
          aria-label={`${label} color`}
        />
        <Input
          id={id}
          value={draft}
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            const parsed = parseUserColor(next, "live");
            if (parsed) onChange(parsed);
          }}
          onBlur={() => {
            if (!commit(draft)) setDraft(value || "");
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (!commit(draft)) setDraft(value || "");
          }}
          placeholder="Color code or name"
          className="h-8 font-mono text-xs"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
