"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Loader2, Monitor, Smartphone, Tablet } from "lucide-react";
import type { SiteTemplate } from "@/lib/templates/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Device = "desktop" | "tablet" | "mobile";
const WIDTHS: Record<Device, string> = {
  desktop: "100%",
  tablet: "820px",
  mobile: "390px",
};

/**
 * Shows the whole design as a real, scrollable website before the user commits
 * to it. Designs with a live demo render in an iframe at the chosen device
 * width; anything without one falls back to its still image.
 */
export function TemplatePreviewDialog({
  template,
  hasDemo,
  onOpenChange,
  action,
}: {
  template: SiteTemplate | null;
  hasDemo: boolean;
  onOpenChange: (open: boolean) => void;
  /** Buttons shown under the preview — "use", "switch", or a locked message. */
  action: React.ReactNode;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const [loading, setLoading] = useState(true);

  // Every newly opened design starts on desktop with its own loading state.
  useEffect(() => {
    setDevice("desktop");
    setLoading(true);
  }, [template?.slug]);

  return (
    <Dialog open={Boolean(template)} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[94vh] w-[min(98vw,84rem)] max-w-none flex-col gap-0 overflow-hidden p-0">
        {template && (
          <>
            <DialogHeader className="shrink-0 space-y-3 border-b px-5 py-4 text-left">
              <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                <div className="min-w-0">
                  <DialogTitle className="font-display text-xl">{template.name}</DialogTitle>
                  <DialogDescription className="mt-0.5">
                    {template.tagline} Built for {template.bestFor}.
                  </DialogDescription>
                </div>

                {hasDemo && (
                  <div className="flex shrink-0 gap-1 rounded-lg border bg-card p-1">
                    <DeviceButton
                      active={device === "desktop"}
                      onClick={() => setDevice("desktop")}
                      label="Desktop"
                    >
                      <Monitor className="h-4 w-4" />
                    </DeviceButton>
                    <DeviceButton
                      active={device === "tablet"}
                      onClick={() => setDevice("tablet")}
                      label="Tablet"
                    >
                      <Tablet className="h-4 w-4" />
                    </DeviceButton>
                    <DeviceButton
                      active={device === "mobile"}
                      onClick={() => setDevice("mobile")}
                      label="Mobile"
                    >
                      <Smartphone className="h-4 w-4" />
                    </DeviceButton>
                  </div>
                )}
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-auto bg-muted/40 p-3 sm:p-4">
              {hasDemo ? (
                <div
                  className="relative mx-auto h-full overflow-hidden rounded-lg border bg-white shadow-sm transition-[width] duration-300"
                  style={{ width: WIDTHS[device], maxWidth: "100%" }}
                >
                  {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading the full design…
                    </div>
                  )}
                  {/*
                    An iframe so the design's own breakpoints respond to the
                    device width rather than the browser window, and so the user
                    can scroll the entire site inside the dialog.
                  */}
                  <iframe
                    key={`${template.slug}-${device}`}
                    title={`${template.name} live demo`}
                    src={`/templates/${template.slug}`}
                    onLoad={() => setLoading(false)}
                    className="block h-full w-full border-0 bg-white"
                  />
                </div>
              ) : (
                <StillPreview template={template} />
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3 border-t bg-card px-5 py-4">
              {action}
              {hasDemo && (
                <Button asChild variant="outline">
                  <Link href={`/templates/${template.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    Open in a new tab
                  </Link>
                </Button>
              )}
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StillPreview({ template }: { template: SiteTemplate }) {
  const src = template.previewImageUrl || template.thumbnailUrl;
  if (!src) {
    return (
      <div
        className="flex h-full w-full items-end rounded-lg p-8"
        style={{
          background: `linear-gradient(135deg, ${template.accent}33, ${template.accent}cc)`,
        }}
      >
        <span className="font-display text-4xl font-bold text-white drop-shadow">
          {template.name}
        </span>
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-[16/10] w-full max-w-5xl overflow-hidden rounded-lg border bg-secondary">
      <Image
        src={src}
        alt={`${template.name} website design preview`}
        fill
        unoptimized
        sizes="(max-width: 1024px) 96vw, 1024px"
        className="object-cover object-top"
      />
    </div>
  );
}

function DeviceButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className={cn("h-8 w-8", active && "bg-secondary")}
    >
      {children}
    </Button>
  );
}
