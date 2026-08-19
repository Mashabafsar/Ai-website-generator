"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Lock, Save, Sparkles, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type {
  WebsiteBlueprint,
  ThemeTokens,
  WebsiteSection,
  SiteContact,
  StockImageReference,
} from "@/lib/blueprint/types";
import { assembleSite } from "@/lib/agents/section-assembly";
import { getVariantSpec } from "@/lib/sections/registry";
import { SitePreview } from "@/components/editor/site-preview";
import { ImagePicker } from "@/components/editor/image-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function EditorWorkspace({
  projectId,
  initialBlueprint,
  initialTheme,
  templateName,
  renderer,
  templateSlug,
  contact,
  editCost,
}: {
  projectId: string;
  initialBlueprint: WebsiteBlueprint;
  initialTheme: ThemeTokens;
  templateName: string;
  renderer?: string;
  templateSlug?: string;
  contact?: SiteContact;
  editCost: number;
}) {
  const router = useRouter();
  const [blueprint, setBlueprint] = useState<WebsiteBlueprint>(initialBlueprint);
  const [theme, setTheme] = useState<ThemeTokens>(initialTheme);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeSlug = blueprint.pages[0]?.slug ?? "home";
  const site = useMemo(
    () => ({ ...assembleSite(blueprint, theme), renderer, templateSlug, contact }),
    [blueprint, theme, renderer, templateSlug, contact]
  );
  const activePage = blueprint.pages[0];

  function mutate(fn: (bp: WebsiteBlueprint) => void) {
    setBlueprint((prev) => {
      const next = clone(prev);
      fn(next);
      return next;
    });
    setDirty(true);
  }

  function withSection(bp: WebsiteBlueprint, sectionId: string): WebsiteSection | undefined {
    return bp.pages[0]?.sections.find((s) => s.id === sectionId);
  }

  function updateField(sectionId: string, key: string, value: string | string[]) {
    mutate((bp) => {
      const section = withSection(bp, sectionId);
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
      const section = withSection(bp, sectionId);
      if (section) section.selectedImage = image;
    });
  }

  function updateItemImage(sectionId: string, index: number, image: StockImageReference | null) {
    mutate((bp) => {
      const section = withSection(bp, sectionId);
      if (!section) return;
      const titles = Array.isArray(section.content.itemTitles) ? section.content.itemTitles : [];
      const next = section.itemImages ? [...section.itemImages] : [];
      while (next.length < Math.max(titles.length, index + 1)) next.push(null);
      next[index] = image;
      section.itemImages = next;
    });
  }

  function applyAiEdit(sectionId: string, content: Record<string, string | string[]>) {
    mutate((bp) => {
      const section = withSection(bp, sectionId);
      if (section) section.content = content;
    });
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Controls */}
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{templateName}</span>
            <span className="text-muted-foreground">layout locked</span>
            <Link
              href="/app/templates"
              className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Change design
            </Link>
          </div>
          <Button variant="brand" size="sm" onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {dirty ? "Save changes" : "Saved"}
          </Button>
        </div>

        <ThemeEditor
          projectId={projectId}
          businessName={blueprint.business.name}
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
              defaultOpen={i === 0}
              editCost={editCost}
              onField={(k, v) => updateField(section.id, k, v)}
              onSectionImage={(img) => updateSectionImage(section.id, img)}
              onItemImage={(itemIndex, img) => updateItemImage(section.id, itemIndex, img)}
              onAiEdit={(content) => applyAiEdit(section.id, content)}
            />
          ))}
        </div>

        <p className="rounded-xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
          This design ships as a complete website, so sections can&apos;t be added, removed, or
          reordered. Edit any section&apos;s text and images above, or ask AI to rewrite one.
        </p>
      </div>

      {/* Live preview */}
      <div className="min-w-0 lg:sticky lg:top-24 lg:h-fit">
        <div className="overflow-hidden rounded-xl border bg-muted/40 p-3">
          <div className="max-h-[80vh] overflow-y-auto rounded-lg border bg-white">
            <SitePreview site={site} pageSlug={activeSlug} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeEditor({
  projectId,
  businessName,
  theme,
  onChange,
}: {
  projectId: string;
  businessName: string;
  theme: ThemeTokens;
  onChange: (t: ThemeTokens) => void;
}) {
  const set = (key: keyof ThemeTokens["colors"], value: string) =>
    onChange({ ...theme, colors: { ...theme.colors, [key]: value } });

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div>
        <div className="mb-3 text-sm font-semibold">Brand colors</div>
        <div className="grid grid-cols-3 gap-3">
          {(["primary", "secondary", "accent"] as const).map((key) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs capitalize">{key}</Label>
              <input
                type="color"
                value={theme.colors[key]}
                onChange={(e) => set(key, e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border"
                aria-label={`${key} color`}
              />
            </div>
          ))}
        </div>
      </div>

      <LogoUploader
        projectId={projectId}
        businessName={businessName}
        value={theme.logoUrl}
        onChange={(url) => onChange({ ...theme, logoUrl: url ?? undefined })}
      />
    </div>
  );
}

function LogoUploader({
  projectId,
  businessName,
  value,
  onChange,
}: {
  projectId: string;
  businessName: string;
  value?: string;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("altText", `${businessName} logo`);
      const res = await fetch(`/api/projects/${projectId}/images/upload`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.image.url as string);
      toast.success("Logo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="border-t pt-4">
      <div className="mb-1 text-sm font-semibold">Logo</div>
      <p className="mb-3 text-xs text-muted-foreground">
        Upload your own mark to replace the template icon. The name beside it always reads{" "}
        <span className="font-medium text-foreground">{businessName}</span> in the template&apos;s own
        type style.
      </p>

      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted/40">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={`${businessName} logo`} className="h-full w-full object-contain p-1" />
          ) : (
            <span className="text-[10px] text-muted-foreground">None</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="mr-1 size-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1 size-3.5" />
            )}
            {value ? "Replace logo" : "Upload logo"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onChange(null)}
            >
              Use template icon
            </Button>
          ) : null}
          <span className="text-[11px] text-muted-foreground">PNG, JPEG, WebP, or GIF · max 2MB</span>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void upload(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function SectionEditor({
  projectId,
  pageSlug,
  section,
  defaultOpen,
  editCost,
  onField,
  onSectionImage,
  onItemImage,
  onAiEdit,
}: {
  projectId: string;
  pageSlug: string;
  section: WebsiteSection;
  defaultOpen: boolean;
  editCost: number;
  onField: (key: string, value: string | string[]) => void;
  onSectionImage: (image: StockImageReference | null) => void;
  onItemImage: (index: number, image: StockImageReference | null) => void;
  onAiEdit: (content: Record<string, string | string[]>) => void;
}) {
  const spec = getVariantSpec(section.variant);
  const [open, setOpen] = useState(defaultOpen);
  const [aiOpen, setAiOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const router = useRouter();

  const title = sectionTitle(section) || spec?.label || section.variant;

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
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform", !open && "-rotate-90")}
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{title}</span>
            <span className="block truncate text-xs text-muted-foreground">{spec?.label}</span>
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => setAiOpen((o) => !o)}
          title="AI rewrite"
        >
          <Wand2 className={cn("h-3.5 w-3.5", aiOpen && "text-primary")} />
        </Button>
      </div>

      {aiOpen && (
        <div className="space-y-2 border-b bg-primary/5 p-4">
          <Label className="flex items-center gap-1 text-xs">
            <Sparkles className="h-3 w-3 text-primary" /> AI rewrite ({editCost} credits)
          </Label>
          <Textarea
            rows={2}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Make this more professional and shorter"
          />
          <Button
            variant="brand"
            size="sm"
            onClick={runAiEdit}
            disabled={aiLoading || !instruction.trim()}
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Rewrite this section
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
              <Label className="text-xs font-semibold">Item images</Label>
              <p className="text-[11px] opacity-60">
                Upload your own photo or search Pexels / Shutterstock for each item.
              </p>
              {(Array.isArray(section.content.itemTitles) ? section.content.itemTitles : []).map(
                (itemTitle, itemIndex) => (
                  <ImagePicker
                    key={`${section.id}-item-${itemIndex}`}
                    projectId={projectId}
                    label={itemTitle?.trim() || `Item ${itemIndex + 1}`}
                    value={section.itemImages?.[itemIndex] ?? null}
                    defaultQuery={itemTitle || ""}
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

/** Uses the section's own copy as its label — templates reuse variants. */
function sectionTitle(section: WebsiteSection): string {
  for (const key of ["heading", "headline", "businessName"]) {
    const value = section.content[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}
