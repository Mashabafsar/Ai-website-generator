"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, LayoutTemplate, Loader2, Repeat } from "lucide-react";
import type { SiteTemplate } from "@/lib/templates/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TemplatePreviewDialog } from "@/components/templates/template-preview-dialog";
import { SwitchDesignDialog } from "@/components/templates/switch-design-dialog";

/** The project a design switch would rebuild, once a site already exists. */
export type ExistingSite = {
  projectId: string;
  templateId: string | null;
  templateName: string | null;
};

export function TemplateGallery({
  templates,
  demoSlugs,
  existing,
  switchCost,
  balance,
}: {
  templates: SiteTemplate[];
  /** Slugs that have a live demo behind them; the rest fall back to an image. */
  demoSlugs: string[];
  /** Set once the user's site is generated — picking another design rebuilds it. */
  existing?: ExistingSite | null;
  switchCost: number;
  balance: number;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<SiteTemplate | null>(null);
  const [switching, setSwitching] = useState<SiteTemplate | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);
  const demos = new Set(demoSlugs);

  if (templates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card px-6 py-20 text-center">
        <LayoutTemplate className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-medium">The library is empty</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          No designs are published yet. Run <code className="font-mono">npm run db:seed</code> to
          populate the starter library.
        </p>
      </div>
    );
  }

  const isCurrent = (template: SiteTemplate) => existing?.templateId === template.id;

  /** The main call to action for a card or the preview footer. */
  const primaryAction = (template: SiteTemplate, size?: "sm") => {
    if (isCurrent(template)) {
      return (
        <Button asChild variant="outline" size={size}>
          <Link href={`/app/project/${existing!.projectId}/preview`}>Open my site</Link>
        </Button>
      );
    }

    if (existing) {
      return (
        <Button
          variant="brand"
          size={size}
          aria-label={`Switch to the ${template.name} design`}
          onClick={() => setSwitching(template)}
        >
          <Repeat className="h-4 w-4" />
          Switch to this design
        </Button>
      );
    }

    return (
      <Button
        asChild
        variant="brand"
        size={size}
        className="group/cta"
        onClick={() => setSelecting(template.id)}
      >
        <Link href={`/app/new-project?templateId=${template.id}`}>
          {selecting === template.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Use this design
          <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
        </Link>
      </Button>
    );
  };

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <article
            key={template.id}
            className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <button
              type="button"
              onClick={() => setPreview(template)}
              aria-label={`Preview the ${template.name} design`}
              className="relative block aspect-[16/10] w-full overflow-hidden bg-secondary"
            >
              <TemplateArt
                template={template}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-medium shadow">
                  <Eye className="h-4 w-4" />
                  {demos.has(template.slug) ? "View full design" : "Preview design"}
                </span>
              </span>
              {isCurrent(template) && (
                <Badge variant="brand" className="absolute left-3 top-3 shadow">
                  <Check className="mr-1 h-3 w-3" /> Your design
                </Badge>
              )}
            </button>

            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                  style={{ backgroundColor: template.accent }}
                  aria-hidden
                />
                <h2 className="font-display text-lg font-semibold">{template.name}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{template.tagline}</p>
              <p className="text-xs text-foreground/60">{template.bestFor}</p>

              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                {primaryAction(template, "sm")}
                <Button variant="ghost" size="sm" onClick={() => setPreview(template)}>
                  Preview
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <TemplatePreviewDialog
        template={preview}
        hasDemo={Boolean(preview && demos.has(preview.slug))}
        onOpenChange={(open) => !open && setPreview(null)}
        action={preview ? primaryAction(preview) : null}
      />

      <SwitchDesignDialog
        template={switching}
        currentTemplateName={existing?.templateName ?? null}
        projectId={existing?.projectId ?? ""}
        cost={switchCost}
        balance={balance}
        onOpenChange={(open) => !open && setSwitching(null)}
        onSwitched={() => {
          setSwitching(null);
          setPreview(null);
          router.push(`/app/project/${existing!.projectId}/preview`);
          router.refresh();
        }}
      />
    </>
  );
}

function TemplateArt({
  template,
  large,
  sizes,
}: {
  template: SiteTemplate;
  large?: boolean;
  sizes: string;
}) {
  const src = large
    ? template.previewImageUrl || template.thumbnailUrl
    : template.thumbnailUrl || template.previewImageUrl;

  if (!src) {
    return (
      <div
        className="flex h-full w-full items-end p-6"
        style={{ background: `linear-gradient(135deg, ${template.accent}33, ${template.accent}cc)` }}
      >
        <span className="font-display text-3xl font-bold text-white drop-shadow">
          {template.name}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${template.name} website design preview`}
      fill
      unoptimized
      sizes={sizes}
      className="object-cover object-top"
    />
  );
}
