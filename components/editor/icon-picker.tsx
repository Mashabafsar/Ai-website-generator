"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { IconGlyph } from "@/lib/icons/glyph";
import { ICON_GROUPS, iconLabel } from "@/lib/icons/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Replaces one item's icon with another from the allowlist. Only names in the
 * catalog can be chosen, so an edit can never break a renderer; clearing hands
 * the slot back to the design's own glyph.
 */
export function IconPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string | null;
  onChange: (name: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_GROUPS;
    return ICON_GROUPS.map((group) => ({
      ...group,
      entries: group.entries.filter(
        (e) => e.name.includes(q) || e.label.toLowerCase().includes(q)
      ),
    })).filter((group) => group.entries.length > 0);
  }, [query]);

  return (
    <div className="rounded-lg border p-2">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border bg-muted/40">
          {value ? (
            <IconGlyph name={value} size={18} />
          ) : (
            <span className="text-[10px] text-muted-foreground">—</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium">{label}</div>
          <div className="truncate text-[11px] text-muted-foreground">
            {value ? iconLabel(value) : "This design's icon"}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0 text-xs"
          aria-label={`Change icon for ${label}`}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Change"}
        </Button>
        {value ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onChange(null)}
            title="Use this design's icon"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>

      {open && (
        <div className="mt-2 space-y-2 border-t pt-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 pl-7 text-xs"
              placeholder="Search icons"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {groups.map((group) => (
              <div key={group.group}>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.group}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {group.entries.map((entry) => (
                    <button
                      key={entry.name}
                      type="button"
                      title={entry.label}
                      aria-label={entry.label}
                      onClick={() => {
                        onChange(entry.name);
                        setOpen(false);
                      }}
                      className={cn(
                        "grid aspect-square place-items-center rounded-md border transition-colors hover:bg-accent",
                        value === entry.name && "border-primary bg-primary/10"
                      )}
                    >
                      <IconGlyph name={entry.name} size={16} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!groups.length && (
              <p className="py-4 text-center text-xs text-muted-foreground">No icons match.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Section-level block: one picker per item that renders an icon. */
export function IconPickerList({
  items,
  values,
  onChange,
  title = "Icons",
  note = "Pick the symbol for each item. Some designs draw their own pictures here instead.",
}: {
  items: string[];
  values: (string | null)[];
  onChange: (index: number, name: string | null) => void;
  title?: string;
  note?: string;
}) {
  return (
    <div className="space-y-2 border-t pt-3" role="group" aria-label={title}>
      <Label className="text-xs font-semibold">{title}</Label>
      <p className="text-[11px] opacity-60">{note}</p>
      {items.map((item, index) => (
        <IconPicker
          key={index}
          label={item?.trim() || `Item ${index + 1}`}
          value={values[index] ?? null}
          onChange={(name) => onChange(index, name)}
        />
      ))}
    </div>
  );
}
