"use client";

import { useEffect } from "react";
import type { AssembledSite } from "@/lib/blueprint/types";
import { SitePreview } from "@/components/editor/site-preview";

/** Minimal preview document rendered inside the device iframe. */
export function PreviewFrameContent({
  site,
  pageSlug,
}: {
  site: AssembledSite;
  pageSlug: string;
}) {
  useEffect(() => {
    const postHeight = () => {
      const height = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      window.parent.postMessage({ type: "preview-frame-height", height }, window.location.origin);
    };

    postHeight();
    const observer = new ResizeObserver(postHeight);
    observer.observe(document.body);

    window.addEventListener("load", postHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("load", postHeight);
    };
  }, [site, pageSlug]);

  return <SitePreview site={site} pageSlug={pageSlug} />;
}
