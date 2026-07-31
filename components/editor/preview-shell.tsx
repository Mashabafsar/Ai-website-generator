"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import type { AssembledSite } from "@/lib/blueprint/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Device = "desktop" | "tablet" | "mobile";
const WIDTHS: Record<Device, string> = {
  desktop: "100%",
  tablet: "820px",
  mobile: "390px",
};

export function PreviewShell({
  site,
  projectId,
}: {
  site: AssembledSite;
  projectId: string;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const [pageSlug, setPageSlug] = useState(site.pages[0]?.slug ?? "home");
  const [frameHeight, setFrameHeight] = useState(720);

  const frameSrc = useMemo(() => {
    const params = new URLSearchParams({ page: pageSlug });
    return `/preview-embed/${projectId}?${params.toString()}`;
  }, [projectId, pageSlug]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (
        event.data?.type === "preview-frame-height" &&
        typeof event.data.height === "number"
      ) {
        // Cap the frame so it scrolls internally instead of growing unbounded.
        setFrameHeight(Math.max(480, event.data.height));
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
          {site.pages.map((p) => (
            <button
              key={p.slug}
              onClick={() => setPageSlug(p.slug)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pageSlug === p.slug ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.title}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-lg border bg-card p-1">
          <DeviceButton active={device === "desktop"} onClick={() => setDevice("desktop")} label="Desktop">
            <Monitor className="h-4 w-4" />
          </DeviceButton>
          <DeviceButton active={device === "tablet"} onClick={() => setDevice("tablet")} label="Tablet">
            <Tablet className="h-4 w-4" />
          </DeviceButton>
          <DeviceButton active={device === "mobile"} onClick={() => setDevice("mobile")} label="Mobile">
            <Smartphone className="h-4 w-4" />
          </DeviceButton>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-muted/40 p-4">
        <div
          className="mx-auto overflow-hidden rounded-lg border bg-white shadow-sm transition-all"
          style={{ width: WIDTHS[device], maxWidth: "100%" }}
        >
          {/*
            Render inside an iframe so Tailwind breakpoints and vw units use the
            device frame width — not the full browser window. Scrollable so the
            full page can be viewed inside the device frame.
          */}
          <iframe
            key={`${device}-${pageSlug}`}
            title="Website preview"
            src={frameSrc}
            className="block w-full border-0 bg-white"
            style={{ height: frameHeight, maxHeight: "78vh" }}
          />
        </div>
      </div>
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
