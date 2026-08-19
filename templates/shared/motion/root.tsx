"use client";

import { useEffect, useRef } from "react";
import { initTemplateMotion, MOTION_CSS } from "./runtime";
import { DEFAULT_MOTION_PROFILE, type MotionProfile } from "./profile";

/**
 * Wraps a bespoke template in the editor / live preview and runs the exact same
 * motion runtime the exported site uses. The shared CSS is rendered inline so the
 * `data-motion-arm` pre-paint guard applies from the very first frame (no flash),
 * then the runtime takes per-element control on mount.
 */
export function TemplateMotionRoot({
  profile = DEFAULT_MOTION_PROFILE,
  children,
}: {
  profile?: MotionProfile;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const cleanup = initTemplateMotion(node);
    return cleanup;
  }, []);

  return (
    <div
      ref={ref}
      data-template-motion=""
      data-motion-active=""
      data-motion-arm=""
      data-motion-intensity={profile.intensity}
      data-motion-parallax={profile.parallax ? "on" : "off"}
      style={{ ["--motion-step" as string]: `${profile.staggerMs}ms` }}
    >
      {/* Single source of truth for motion CSS, shared with the static export. */}
      <style data-template-motion-css dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
      {children}
    </div>
  );
}
