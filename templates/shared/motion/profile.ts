// Motion profile — the small, declarative knob set a template exposes to the
// shared motion runtime. Everything else (reveal, stagger, FAQ, hover, press,
// reduced-motion) is automatic, so a new template rarely needs more than the
// defaults here.

export type MotionIntensity = "restrained" | "expressive";

export type MotionProfile = {
  /** Overall expressiveness. "expressive" enables parallax + longer reveals. */
  intensity: MotionIntensity;
  /** Enable subtle scroll parallax on elements tagged `data-parallax`. */
  parallax: boolean;
  /** Stagger step between siblings, in milliseconds. */
  staggerMs: number;
};

export const DEFAULT_MOTION_PROFILE: MotionProfile = {
  intensity: "expressive",
  parallax: true,
  staggerMs: 80,
};

/** Serializes a profile into the `data-*` attributes the runtime reads. */
export function motionRootAttributes(
  profile: MotionProfile = DEFAULT_MOTION_PROFILE
): Record<string, string> {
  return {
    "data-template-motion": "",
    "data-motion-active": "",
    "data-motion-intensity": profile.intensity,
    "data-motion-parallax": profile.parallax ? "on" : "off",
    "data-motion-stagger": String(profile.staggerMs),
  };
}
