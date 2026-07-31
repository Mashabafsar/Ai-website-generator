"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import type {
  WebsiteBlueprint,
  ThemeTokens,
  WebsiteSection,
  StockImageReference,
} from "@/lib/blueprint/types";
import { assembleSite } from "@/lib/agents/section-assembly";
import { getVariantSpec, SECTION_REGISTRY } from "@/lib/sections/registry";
import { SitePreview } from "@/components/editor/site-preview";
import { ImagePicker } from "@/components/editor/image-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function EditorWorkspace({
  projectId,
  initialBlueprint,
  initialTheme,
}: {
  projectId: string;
  initialBlueprint: WebsiteBlueprint;
  initialTheme: ThemeTokens;
}) {
  const router = useRouter();
  const [blueprint, setBlueprint] = useState<WebsiteBlueprint>(initialBlueprint);
  const [theme, setTheme] = useState<ThemeTokens>(initialTheme);
  const [activeSlug, setActiveSlug] = useState(initialBlueprint.pages[0]?.slug ?? "home");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const site = useMemo(() => assembleSite(blueprint, theme), [blueprint, theme]);
  const activePage = blueprint.pages.find((p) => p.slug === activeSlug) ?? blueprint.pages[0];

  function mutate(fn: (bp: WebsiteBlueprint) => void) {
    setBlueprint((prev) => {
      const next = clone(prev);
      fn(next);
      return next;
    });
    setDirty(true);
  }

  function updateField(sectionId: string, key: string, value: string | string[]) {
    mutate((bp) => {
      const page = bp.pages.find((p) => p.slug === activeSlug);
      const section = page?.sections.find((s) => s.id === sectionId);
      if (!section) return;
      section.content[key] = value;
      // Keep per-item images aligned when service/product titles change.
      if (key === "itemTitles" && Array.isArray(value)) {
        const next = section.itemImages ? [...section.itemImages] : [];
        while (next.length < value.length) next.push(null);
        next.length = value.length;
        section.itemImages = next;
      }
    });
  }

  function updateSectionImage(sectionId: string, image: StockImageReference | null) {
    mutate((bp) => {
      const page = bp.pages.find((p) => p.slug === activeSlug);
      const section = page?.sections.find((s) => s.id === sectionId);
      if (section) section.selectedImage = image;
    });
  }

  function updateItemImage(sectionId: string, index: number, image: StockImageReference | null) {
    mutate((bp) => {
      const page = bp.pages.find((p) => p.slug === activeSlug);
      const section = page?.sections.find((s) => s.id === sectionId);
      if (!section) return;
      const titles = Array.isArray(section.content.itemTitles) ? section.content.itemTitles : [];
      const next = section.itemImages ? [...section.itemImages] : [];
      while (next.length < Math.max(titles.length, index + 1)) next.push(null);
      next[index] = image;
      section.itemImages = next;
    });
  }

  function moveSection(index: number, dir: -1 | 1) {
    mutate((bp) => {
      const page = bp.pages.find((p) => p.slug === activeSlug);
      if (!page) return;
      const target = index + dir;
      if (target < 0 || target >= page.sections.length) return;
      [page.sections[index], page.sections[target]] = [page.sections[target], page.sections[index]];
    });
  }

  function removeSection(sectionId: string) {
    mutate((bp) => {
      const page = bp.pages.find((p) => p.slug === activeSlug);
      if (page) page.sections = page.sections.filter((s) => s.id !== sectionId);
    });
  }

  async function addSection(variant: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}/add-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageSlug: activeSlug, variant }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add section");
      if (data.blueprint) {
        setBlueprint(data.blueprint);
        setDirty(false);
        toast.success("Section added");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add section");
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint, theme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      setDirty(false);
      toast.success("Saved & synced to GitHub");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function applyAiEdit(sectionId: string, content: Record<string, string | string[]>) {
    mutate((bp) => {
      const page = bp.pages.find((p) => p.slug === activeSlug);
      const section = page?.sections.find((s) => s.id === sectionId);
      if (section) section.content = content;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Select value={activeSlug} onValueChange={setActiveSlug}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {blueprint.pages.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="brand" size="sm" onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {dirty ? "Save changes" : "Saved"}
          </Button>
        </div>

        <ThemeEditor
          theme={theme}
          onChange={(t) => {
            setTheme(t);
            setDirty(true);
          }}
        />

        <div className="space-y-3">
          {activePage?.sections.map((section, i) => (
            <SectionEditor
              key={section.id}
              projectId={projectId}
              pageSlug={activeSlug}
              section={section}
              index={i}
              total={activePage.sections.length}
              onField={(k, v) => updateField(section.id, k, v)}
              onSectionImage={(img) => updateSectionImage(section.id, img)}
              onItemImage={(itemIndex, img) => updateItemImage(section.id, itemIndex, img)}
              onMove={(dir) => moveSection(i, dir)}
              onRemove={() => removeSection(section.id)}
              onAiEdit={(content) => applyAiEdit(section.id, content)}
            />
          ))}
        </div>

        <AddSectionMenu onAdd={addSection} />
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-24 lg:h-fit">
        <div className="overflow-hidden rounded-xl border bg-muted/40 p-3">
          <div className="max-h-[80vh] overflow-y-auto rounded-lg border bg-white">
            <SitePreview site={site} pageSlug={activeSlug} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeEditor({ theme, onChange }: { theme: ThemeTokens; onChange: (t: ThemeTokens) => void }) {
  const set = (key: keyof ThemeTokens["colors"], value: string) =>
    onChange({ ...theme, colors: { ...theme.colors, [key]: value } });

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 text-sm font-semibold">Theme</div>
      <div className="grid grid-cols-3 gap-3">
        {(["primary", "secondary", "accent"] as const).map((key) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs capitalize">{key}</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.colors[key]}
                onChange={(e) => set(key, e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionEditor({
  projectId,
  pageSlug,
  section,
  index,
  total,
  onField,
  onSectionImage,
  onItemImage,
  onMove,
  onRemove,
  onAiEdit,
}: {
  projectId: string;
  pageSlug: string;
  section: WebsiteSection;
  index: number;
  total: number;
  onField: (key: string, value: string | string[]) => void;
  onSectionImage: (image: StockImageReference | null) => void;
  onItemImage: (index: number, image: StockImageReference | null) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onAiEdit: (content: Record<string, string | string[]>) => void;
}) {
  const spec = getVariantSpec(section.variant);
  const [open, setOpen] = useState(index === 0);
  const [aiOpen, setAiOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const router = useRouter();

  async function runAiEdit() {
    if (!instruction.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/edit-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, pageSlug, sectionId: section.id, instruction }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "INSUFFICIENT_CREDITS") {
          toast.error("Not enough credits for an AI edit.");
          router.push("/app/credits");
          return;
        }
        throw new Error(data.error || "AI edit failed");
      }
      onAiEdit(data.content);
      setInstruction("");
      setAiOpen(false);
      toast.success(`Section updated · ${data.balanceAfter} credits left`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI edit failed");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <button className="flex-1 text-left text-sm font-medium" onClick={() => setOpen((o) => !o)}>
          {spec?.label ?? section.variant}
        </button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(-1)} disabled={index === 0}>
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAiOpen((o) => !o)} title="AI rewrite">
            <Wand2 className={cn("h-3.5 w-3.5", aiOpen && "text-primary")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={onRemove}
            title="Remove section"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {aiOpen && (
        <div className="space-y-2 border-b bg-primary/5 p-4">
          <Label className="flex items-center gap-1 text-xs">
            <Sparkles className="h-3 w-3 text-primary" /> AI rewrite (5 credits)
          </Label>
          <Textarea
            rows={2}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Make this more professional and shorter"
          />
          <Button variant="brand" size="sm" onClick={runAiEdit} disabled={aiLoading || !instruction.trim()}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Rewrite
          </Button>
        </div>
      )}

      {open && (
        <div className="space-y-3 p-4">
          {spec?.needsImage && (
            <ImagePicker
              projectId={projectId}
              label="Section image"
              value={section.selectedImage}
              defaultQuery={
                section.imageKeywords?.join(" ") ||
                (typeof section.content.headline === "string"
                  ? section.content.headline
                  : typeof section.content.heading === "string"
                    ? section.content.heading
                    : "")
              }
              orientation={spec.imageOrientation ?? "landscape"}
              onChange={onSectionImage}
            />
          )}

          {spec?.fields.map((field) => {
            const value = section.content[field.key];
            if (field.type === "string[]") {
              const text = Array.isArray(value) ? value.join("\n") : "";
              return (
                <div key={field.key} className="space-y-1">
                  <Label className="text-xs">{field.label} (one per line)</Label>
                  <Textarea
                    rows={Math.min(6, Math.max(2, text.split("\n").length))}
                    value={text}
                    onChange={(e) => onField(field.key, e.target.value.split("\n"))}
                  />
                </div>
              );
            }
            const strVal = typeof value === "string" ? value : "";
            return (
              <div key={field.key} className="space-y-1">
                <Label className="text-xs">{field.label}</Label>
                {field.type === "text" ? (
                  <Textarea rows={3} value={strVal} onChange={(e) => onField(field.key, e.target.value)} />
                ) : (
                  <Input value={strVal} onChange={(e) => onField(field.key, e.target.value)} />
                )}
              </div>
            );
          })}

          {spec?.needsItemImages && (
            <div className="space-y-2 border-t pt-3">
              <Label className="text-xs font-semibold">Product / service images</Label>
              <p className="text-[11px] opacity-60">
                Upload your own photo or search Pexels / Shutterstock for each item.
              </p>
              {(Array.isArray(section.content.itemTitles) ? section.content.itemTitles : []).map(
                (title, itemIndex) => (
                  <ImagePicker
                    key={`${section.id}-item-${itemIndex}`}
                    projectId={projectId}
                    label={title?.trim() || `Item ${itemIndex + 1}`}
                    value={section.itemImages?.[itemIndex] ?? null}
                    defaultQuery={title || ""}
                    orientation={spec.imageOrientation ?? "square"}
                    onChange={(img) => onItemImage(itemIndex, img)}
                  />
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddSectionMenu({ onAdd }: { onAdd: (variant: string) => void }) {
  const [variant, setVariant] = useState("");
  return (
    <div className="rounded-xl border border-dashed bg-card p-4">
      <div className="mb-2 text-sm font-semibold">Add a section</div>
      <div className="flex gap-2">
        <Select value={variant} onValueChange={setVariant}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Choose a section type" />
          </SelectTrigger>
          <SelectContent>
            {SECTION_REGISTRY.map((s) => (
              <SelectItem key={s.variant} value={s.variant}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => variant && onAdd(variant)} disabled={!variant}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}
