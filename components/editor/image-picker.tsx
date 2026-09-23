"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { StockImageReference } from "@/lib/blueprint/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ProviderTab = "pexels" | "shutterstock" | "all";

export function ImagePicker({
  projectId,
  label,
  value,
  defaultQuery,
  orientation = "landscape",
  onChange,
}: {
  projectId: string;
  label: string;
  value?: StockImageReference | null;
  defaultQuery?: string;
  orientation?: "landscape" | "portrait" | "square";
  onChange: (image: StockImageReference | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"upload" | "search">("search");
  const [provider, setProvider] = useState<ProviderTab>("all");
  const [query, setQuery] = useState(defaultQuery || "");
  const [results, setResults] = useState<StockImageReference[]>([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function runSearch() {
    if (!query.trim()) {
      toast.error("Enter a search term");
      return;
    }
    setSearching(true);
    try {
      const res = await fetch("/api/images/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          provider,
          orientation,
          perPage: 18,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "We couldn't search photos");
      setResults(data.results || []);
      if (!(data.results || []).length) {
        toast.message("No photos found — try another search, or upload your own.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We couldn't search photos");
    } finally {
      setSearching(false);
    }
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("altText", label);
      const res = await fetch(`/api/projects/${projectId}/images/upload`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.image);
      setOpen(false);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium">{label}</Label>
        <div className="flex gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onChange(null)}
            >
              Clear
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setOpen((o) => !o)}
          >
            <ImageIcon className="mr-1 size-3.5" />
            {value ? "Change" : "Add image"}
          </Button>
        </div>
      </div>

      {value?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value.url}
          alt={value.altText}
          className="h-28 w-full rounded-md border object-cover"
        />
      ) : (
        <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-xs opacity-60">
          No image yet
        </div>
      )}

      {value?.provider && (
        <p className="text-[10px] uppercase tracking-wide opacity-50">
          Source: {value.provider}
          {value.photographer ? ` · ${value.photographer}` : ""}
        </p>
      )}

      {open && (
        <div className="space-y-3 rounded-md border bg-background p-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant={tab === "search" ? "default" : "ghost"}
                className="h-7 text-xs"
                onClick={() => setTab("search")}
              >
                <Search className="mr-1 size-3.5" />
                Stock search
              </Button>
              <Button
                type="button"
                size="sm"
                variant={tab === "upload" ? "default" : "ghost"}
                className="h-7 text-xs"
                onClick={() => setTab("upload")}
              >
                <Upload className="mr-1 size-3.5" />
                Upload yours
              </Button>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="size-3.5" />
            </Button>
          </div>

          {tab === "upload" ? (
            <div className="space-y-2">
              <p className="text-xs opacity-70">
                Upload a JPEG, PNG, WebP, or GIF (max 2MB) for this product or service.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="block w-full text-xs"
                disabled={uploading}
                onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
              />
              {uploading && (
                <p className="flex items-center gap-1 text-xs opacity-70">
                  <Loader2 className="size-3 animate-spin" /> Uploading…
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ["all", "All"],
                    ["pexels", "Pexels"],
                    ["shutterstock", "Shutterstock"],
                  ] as const
                ).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setProvider(id)}
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[11px]",
                      provider === id ? "border-primary bg-primary/10 text-primary" : "opacity-70"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. dental cleaning, coffee product"
                  className="h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void runSearch();
                    }
                  }}
                />
                <Button type="button" size="sm" className="h-8" onClick={() => void runSearch()} disabled={searching}>
                  {searching ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
                </Button>
              </div>
              {results.length > 0 && (
                <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto">
                  {results.map((img) => (
                    <button
                      key={`${img.provider}-${img.providerImageId || img.url}`}
                      type="button"
                      className="group relative overflow-hidden rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
                      onClick={() => {
                        onChange(img);
                        setOpen(false);
                        toast.success("Image selected");
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.altText} className="aspect-square w-full object-cover" />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/55 px-1 py-0.5 text-[9px] uppercase text-white opacity-0 transition group-hover:opacity-100">
                        {img.provider}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
