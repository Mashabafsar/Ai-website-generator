import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { optimizeImage, type ImageProfile } from "@/lib/images/optimize";

// Every image the platform stores for a project — editor uploads and assets
// pulled from a customer's existing website — lands here, so there is one place
// that decides what a real image is and where it is written.

export const RASTER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export type StoredImageType =
  | (typeof RASTER_IMAGE_TYPES)[number]
  | "image/svg+xml"
  | "image/x-icon";

const EXTENSIONS: Record<StoredImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
};

/**
 * Identifies an image from its bytes. A `Content-Type` header and a file
 * extension are both attacker-controlled, so neither is trusted.
 */
export function sniffImageType(bytes: Buffer): StoredImageType | null {
  if (bytes.length < 12) return null;

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 6).toString("latin1").match(/^GIF8[79]a$/)) return "image/gif";
  if (
    bytes.subarray(0, 4).toString("latin1") === "RIFF" &&
    bytes.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "image/webp";
  }
  // Favicon ICO (`00 00 01 00`). A `.ico` URL that is actually PNG/SVG is
  // caught by the signatures above / below, so this only fires for a real
  // container — which we convert on ingest when sharp can.
  if (
    bytes.length >= 6 &&
    bytes[0] === 0 &&
    bytes[1] === 0 &&
    bytes[2] === 1 &&
    bytes[3] === 0
  ) {
    return "image/x-icon";
  }

  const head = bytes.subarray(0, 1024).toString("utf8").trimStart();
  if (/^(<\?xml[\s\S]*?\?>\s*)?(<!--[\s\S]*?-->\s*)*(<!doctype svg[\s\S]*?>\s*)?<svg[\s>]/i.test(head)) {
    return "image/svg+xml";
  }

  return null;
}

const SVG_HARD_FAIL = [
  /<\s*script/i,
  /<\s*foreignobject/i,
  /<\s*(iframe|embed|object|audio|video|animate|set)\b/i,
  /\son\w+\s*=/i,
  /javascript\s*:/i,
  /\bdata:text\/html/i,
];

/**
 * Strips the parts of an SVG that can execute. Returns null when anything
 * dangerous survives: a scriptable SVG served from our own origin would be
 * stored XSS, and no logo is worth that.
 */
export function sanitizeSvg(source: string): string | null {
  let svg = source
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*script[^>]*\/>/gi, "")
    .replace(/<\s*foreignObject[\s\S]*?<\s*\/\s*foreignObject\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(xlink:href|href)\s*=\s*("|')\s*(?!#|data:image\/)[^"']*\2/gi, "");

  if (svg.length > 512 * 1024) return null;
  if (!/<svg[\s>]/i.test(svg)) return null;
  for (const pattern of SVG_HARD_FAIL) {
    if (pattern.test(svg)) return null;
  }
  // Entity-encoded payloads survive the replacements above but not a browser.
  if (/&#x?\d*[46]a;?avascript/i.test(svg)) return null;
  svg = svg.trim();
  return svg;
}

export type StoredImage = {
  url: string;
  filename: string;
  contentType: StoredImageType;
  /** Pixel size of the bytes actually written, when the encoder reported it. */
  width?: number;
  height?: number;
  bytesWritten: number;
  bytesReceived: number;
};

/**
 * Writes an image into the project's public upload folder and returns the
 * path the renderer and the static export both use. Callers that hand over
 * third-party bytes pass a profile so the file is downscaled and re-encoded
 * before it is stored, rather than after it has already shipped.
 */
export async function saveProjectImage(params: {
  projectId: string;
  bytes: Buffer;
  contentType: StoredImageType;
  /** Optional sub-folder, e.g. "imported", to keep provenance obvious on disk. */
  subdir?: string;
  optimize?: ImageProfile;
}): Promise<StoredImage> {
  const { projectId, subdir, optimize } = params;
  const optimized = optimize
    ? await optimizeImage(params.bytes, params.contentType, optimize)
    : null;
  const bytes = optimized?.bytes ?? params.bytes;
  const contentType = optimized?.contentType ?? params.contentType;

  const safeSubdir = subdir?.replace(/[^a-z0-9-]/gi, "") || "";
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${EXTENSIONS[contentType]}`;

  const segments = ["public", "uploads", projectId, ...(safeSubdir ? [safeSubdir] : [])];
  const dir = path.join(process.cwd(), ...segments);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);

  const url = `/uploads/${projectId}/${safeSubdir ? `${safeSubdir}/` : ""}${filename}`;
  return {
    url,
    filename,
    contentType,
    width: optimized?.width,
    height: optimized?.height,
    bytesWritten: bytes.length,
    bytesReceived: params.bytes.length,
  };
}
