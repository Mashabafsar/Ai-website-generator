import { createElement } from "react";
import { resolveIconNode, type IconRenderOptions } from "./registry";

/**
 * Renders an allowlisted icon in the React preview. Returns null for an unknown
 * name so a caller can fall back to the design's own glyph, and draws from the
 * same catalog geometry as `iconSvg` in the static export.
 */
export function IconGlyph({
  name,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className,
}: { name: unknown } & IconRenderOptions) {
  const node = resolveIconNode(name);
  if (!node) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {node.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}
