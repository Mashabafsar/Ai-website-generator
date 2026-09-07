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
  SectionTheme,
} from "@/lib/blueprint/types";
import { assembleSite } from "@/lib/agents/section-assembly";
import { CUSTOM_PALETTE_NAME, PALETTE_NAMES, deriveSurface, paletteColors } from "@/lib/agents/theme";
import { TONES } from "@/lib/questionnaire/schema";
import { ColorField } from "@/components/theme/color-field";
import { getVariantSpec, iconCount } from "@/lib/sections/registry";
import { SitePreview } from "@/components/editor/site-preview";
import { ImagePicker } from "@/components/editor/image-picker";
import { IconPickerList } from "@/components/editor/icon-picker";
import { FONT_CATALOG_HREF, THEME_FONTS, resolveThemeFont } from "@/templates/shared/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { notifyCreditsChanged } from "@/lib/credits/notify";

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
  const [activeSlug, setActiveSlug] = useState(initialBlueprint.pages[0]?.slug ?? "home");

  const site = useMemo(
    () => ({ ...assembleSite(blueprint, theme), renderer, templateSlug, contact }),
    [blueprint, theme, renderer, templateSlug, contact]
  );
  const activePage =
    blueprint.pages.find((p) => p.slug === activeSlug) ?? blueprint.pages[0];
  const multiPage = blueprint.pages.length > 1;

  function mutate(fn: (bp: WebsiteBlueprint) => void) {
    setBlueprint((prev) => {
      const next = clone(prev);
      fn(next);
      return next;
    });
    setDirty(true);
  }

  function withSection(bp: WebsiteBlueprint, sectionId: string): WebsiteSection | undefined {
    const page = bp.pages.find((p) => p.slug === activeSlug) ?? bp.pages[0];
    return page?.sections.find((s) => s.id === sectionId);
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
      // Same for icons, whichever array this variant hangs them off.
      const spec = getVariantSpec(section.variant);
      if (spec?.iconField === key && Array.isArray(value) && section.icons) {
        const next = [...section.icons];
        while (next.length < value.length) next.push(null);
        next.length = value.length;
        section.icons = next;
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

  function updateIcon(sectionId: string, index: number, name: string | null) {
    mutate((bp) => {
      const section = withSection(bp, sectionId);
      if (!section) return;
      const count = iconCount(section.variant, section.content);
      const next = section.icons ? [...section.icons] : [];
      while (next.length < Math.max(count, index + 1)) next.push(null);
      next[index] = name;
      section.icons = next;
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

        {multiPage && (
          <div className="space-y-2 rounded-xl border bg-card p-4">
            <div className="text-sm font-semibold">Pages</div>
            <div className="flex flex-wrap gap-1.5">
              {blueprint.pages.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => setActiveSlug(p.slug)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                    p.slug === activeSlug
                      ? "border-primary bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.title}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Editing the <span className="font-medium text-foreground">{activePage?.title}</span> page.
              Its sections are locked to this design.
            </p>
          </div>
        )}

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
              onIcon={(itemIndex, name) => updateIcon(section.id, itemIndex, name)}
              onAiEdit={(content) => applyAiEdit(section.id, content)}
              onTheme={(next) =>
                mutate((bp) => {
                  const s = withSection(bp, section.id);
                  if (!s) return;
                  if (next) s.theme = next;
                  else delete s.theme;
                })
              }
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
  const set = (key: keyof ThemeTokens["colors"], value: string) => {
    const colors = { ...theme.colors, [key]: value };
    if (key === "primary" || key === "secondary" || key === "accent") {
      const surface = deriveSurface(colors, colors.primary, theme.tone);
      colors.background = surface.bg;
      colors.foreground = surface.fg;
    }
    onChange({ ...theme, colors, palette: CUSTOM_PALETTE_NAME });
  };

  function applyPalette(name: string) {
    if (name === CUSTOM_PALETTE_NAME) {
      onChange({ ...theme, palette: CUSTOM_PALETTE_NAME });
      return;
    }
    const colors = paletteColors(name);
    if (!colors) return;
    onChange({ ...theme, colors, palette: name });
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div>
        <div className="mb-3 text-sm font-semibold">Site theme</div>
        <Label className="text-xs">Palette</Label>
        <Select value={theme.palette || "__template"} onValueChange={(v) => applyPalette(v)}>
          <SelectTrigger className="mt-1 h-9" aria-label="Website palette">
            <span>{theme.palette || "Template default"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__template" disabled>
              Template default
            </SelectItem>
            {PALETTE_NAMES.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_PALETTE_NAME}>{CUSTOM_PALETTE_NAME}</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-2 text-xs text-muted-foreground">
          A chosen palette repaints the whole site — canvas, bands, cards, and buttons.
          Type a hex or name if the color you want is not in the list.
        </p>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold">Brand colors</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(["primary", "secondary", "accent", "background", "foreground"] as const).map((key) => (
            <ColorField
              key={key}
              label={key}
              value={theme.colors[key]}
              onChange={(hex) => set(key, hex)}
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs">Brand tone</Label>
        <Select
          value={theme.tone || TONES[0]}
          onValueChange={(tone) => onChange({ ...theme, tone, palette: theme.palette || CUSTOM_PALETTE_NAME })}
        >
          <SelectTrigger className="mt-1 h-9" aria-label="Brand tone">
            <span>{theme.tone || TONES[0]}</span>
          </SelectTrigger>
          <SelectContent>
            {TONES.map((tone) => (
              <SelectItem key={tone} value={tone}>
                {tone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FontPicker
        value={theme.fontFamily}
        onChange={(id) => onChange({ ...theme, fontFamily: id || undefined })}
      />

      <LogoUploader
        projectId={projectId}
        businessName={businessName}
        value={theme.logoUrl}
        onChange={(url) => onChange({ ...theme, logoUrl: url ?? undefined })}
      />
    </div>
  );
}

/** Sentinel for "use the template's own type" — Radix forbids an empty value. */
const FONT_DEFAULT = "__default";

function FontPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (id: string) => void;
}) {
  const selected = resolveThemeFont(value ? ({ fontFamily: value } as ThemeTokens) : null);

  return (
    <div className="border-t pt-4">
      {/* Loads every catalog family once so each option previews in its own typeface. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={FONT_CATALOG_HREF} />
      <div className="mb-1 text-sm font-semibold">Font</div>
      <p className="mb-3 text-xs text-muted-foreground">
        One typeface for the whole website — headings, body, and buttons.
      </p>
      {/* Radix portals the list, so it is never clipped by the scrolling panel. */}
      <Select
        value={value || FONT_DEFAULT}
        onValueChange={(v) => onChange(v === FONT_DEFAULT ? "" : v)}
      >
        <SelectTrigger className="h-10 rounded-none" aria-label="Website font">
          <span style={selected ? { fontFamily: selected.stack } : undefined}>
            {selected ? selected.name : "Template default"}
          </span>
        </SelectTrigger>
        <SelectContent className="max-h-80 rounded-none">
          <SelectItem value={FONT_DEFAULT}>Template default</SelectItem>
          {THEME_FONTS.map((f) => (
            <SelectItem key={f.id} value={f.id} className="text-[15px]">
              <span style={{ fontFamily: f.stack }}>{f.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
  onIcon,
  onAiEdit,
  onTheme,
}: {
  projectId: string;
  pageSlug: string;
  section: WebsiteSection;
  defaultOpen: boolean;
  editCost: number;
  onField: (key: string, value: string | string[]) => void;
  onSectionImage: (image: StockImageReference | null) => void;
  onItemImage: (index: number, image: StockImageReference | null) => void;
  onIcon: (index: number, name: string | null) => void;
  onAiEdit: (content: Record<string, string | string[]>) => void;
  onTheme: (theme: SectionTheme | undefined) => void;
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
        notifyCreditsChanged();
        throw new Error(data.error || "AI edit failed");
      }
      onAiEdit(data.content);
      setInstruction("");
      setAiOpen(false);
      notifyCreditsChanged();
      if (data.fromTemplate) {
        toast.error("Our writing tools are unavailable. You were not charged.");
      } else {
        toast.success(`Section updated · ${data.balanceAfter} credits left`);
      }
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

          {spec?.iconField && (
            <IconPickerList
              items={
                Array.isArray(section.content[spec.iconField])
                  ? (section.content[spec.iconField] as string[])
                  : []
              }
              values={section.icons ?? []}
              onChange={onIcon}
            />
          )}

          <SectionThemeControls value={section.theme} onChange={onTheme} />

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

function SectionThemeControls({
  value,
  onChange,
}: {
  value?: SectionTheme;
  onChange: (theme: SectionTheme | undefined) => void;
}) {
  const set = (key: keyof SectionTheme, hex: string) => {
    onChange({ ...value, [key]: hex });
  };
  const clear = (key: keyof SectionTheme) => {
    const next = { ...value };
    delete next[key];
    onChange(next.background || next.foreground || next.accent ? next : undefined);
  };
  const hasOverride = Boolean(value?.background || value?.foreground || value?.accent);

  return (
    <div className="space-y-2 border-t pt-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-semibold">Section colors</Label>
        {hasOverride ? (
          <button
            type="button"
            className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => onChange(undefined)}
          >
            Inherit site theme
          </button>
        ) : (
          <span className="text-[11px] text-muted-foreground">Inherit site theme</span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {(
          [
            ["background", "Band"],
            ["foreground", "Text"],
            ["accent", "Accent"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-1">
            <ColorField
              label={label}
              value={value?.[key] || ""}
              allowEmpty
              onChange={(hex) => (hex ? set(key, hex) : clear(key))}
            />
            {value?.[key] ? (
              <button
                type="button"
                className="text-[10px] text-muted-foreground"
                onClick={() => clear(key)}
              >
                Reset {label.toLowerCase()}
              </button>
            ) : null}
          </div>
        ))}
      </div>
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
