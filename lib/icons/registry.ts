// Icon registry — the allowlist the heavy model picks section icons from and the
// editor's picker offers. Model output is never trusted: an unknown name
// resolves to null and the caller falls back to the design's own glyph.
//
// Geometry comes from the generated catalog so the React preview
// (lib/icons/glyph.tsx) and the static HTML export (`iconSvg` below) draw the
// same paths — the same one-source rule the motion runtime follows.

import { ICON_GROUPS } from "./catalog";
import type { IconEntry, IconNode } from "./types";

export { ICON_GROUPS };
export type { IconEntry, IconGroup, IconNode } from "./types";

export const ICON_CATALOG: IconEntry[] = ICON_GROUPS.flatMap((g) => g.entries);

const BY_NAME = new Map(ICON_CATALOG.map((e) => [e.name, e]));

/** Every allowed icon name, for prompts and validation messages. */
export const ICON_NAMES: string[] = ICON_CATALOG.map((e) => e.name);

export function isIconName(name: unknown): name is string {
  return typeof name === "string" && BY_NAME.has(name);
}

/** The stored name if it is still in the allowlist, else null. */
export function normalizeIconName(name: unknown): string | null {
  return isIconName(name) ? name : null;
}

export function resolveIconNode(name: unknown): IconNode | null {
  return isIconName(name) ? BY_NAME.get(name)!.node : null;
}

export function iconLabel(name: string): string {
  return BY_NAME.get(name)?.label ?? name;
}

export type IconRenderOptions = {
  /** Rendered box in px. The 24x24 geometry scales to it. */
  size?: number;
  /** Stroke paint. Defaults to `currentColor` so designs can tint by cascade. */
  color?: string;
  /**
   * Stroke width on the 24-unit grid. Large glyphs need more than lucide's
   * default 2 or they read as hairlines next to the design's other ink.
   */
  strokeWidth?: number;
  className?: string;
};

const attrString = (attrs: Record<string, string | number>): string =>
  Object.entries(attrs)
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, "&quot;")}"`)
    .join(" ");

/**
 * Static-export twin of `<IconGlyph>`. Returns "" for an unknown name so the
 * caller's own fallback markup takes over.
 */
export function iconSvg(name: unknown, opts: IconRenderOptions = {}): string {
  const node = resolveIconNode(name);
  if (!node) return "";

  const { size = 24, color = "currentColor", strokeWidth = 2, className } = opts;
  const children = node.map(([tag, attrs]) => `<${tag} ${attrString(attrs)} />`).join("");
  const svgAttrs = attrString({
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    "stroke-width": strokeWidth,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    ...(className ? { class: className } : {}),
    "aria-hidden": "true",
  });

  return `<svg ${svgAttrs}>${children}</svg>`;
}
