/** Runtime Google Fonts for templates — avoids next/font fetching fonts at build time. */

import type { CSSProperties } from "react";

export type TemplateFace = {
  family: string;
  variable: string;
  weights?: string | string[];
  kind?: "sans" | "serif" | "mono";
};

export type TemplateFaces = {
  href: string;
  style: CSSProperties;
};

function stack(family: string, kind: TemplateFace["kind"]): string {
  if (kind === "mono") return `'${family}', ui-monospace, SFMono-Regular, Menlo, monospace`;
  if (kind === "serif") return `'${family}', ui-serif, Georgia, 'Times New Roman', serif`;
  return `'${family}', ui-sans-serif, system-ui, sans-serif`;
}

function weightList(weights: TemplateFace["weights"]): string {
  if (!weights) return "400;500;600;700";
  const list = Array.isArray(weights) ? weights : [weights];
  return [...new Set(list.map(String))].sort().join(";");
}

export function templateFaces(faces: TemplateFace[]): TemplateFaces {
  const href =
    "https://fonts.googleapis.com/css2?" +
    faces
      .map((face) => `family=${encodeURIComponent(face.family)}:wght@${weightList(face.weights)}`)
      .join("&") +
    "&display=block";
  const style: CSSProperties = {};
  for (const face of faces) {
    (style as Record<string, string>)[face.variable] = stack(face.family, face.kind);
  }
  return { href, style };
}
