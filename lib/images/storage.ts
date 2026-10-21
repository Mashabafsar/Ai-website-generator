import { randomBytes } from "node:crypto";
import type { ImageProfile, OptimizedImage } from "@/lib/images/optimize";
import { env } from "@/lib/env";
import { publicMediaUrl, putObject } from "@/lib/storage/s3";

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
  if (/^GIF8[79]a$/.exec(bytes.subarray(0, 6).toString("latin1"))) return "image/gif";
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

export class StorageUploadError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "StorageUploadError";
  }
}

/**
 * Uploads one image to the media bucket and returns its public URL.
 * `filename` is the full object key inside the bucket.
 */
export async function uploadScrapedImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  if (!env.storage.enabled || !env.storage.publicUrl) {
    throw new StorageUploadError(
      "Media storage is not configured. Set the S3_* variables and S3_PUBLIC_URL."
    );
  }

  const bucket = env.storage.mediaBucket;
  try {
    await putObject({
      bucket,
      key: filename,
      body: buffer,
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new StorageUploadError(`Failed to upload ${filename} to bucket ${bucket}: ${reason}`, err);
  }
  return publicMediaUrl(filename);
}

/**
 * Uploads an image into the media bucket and returns the URL the renderer and
 * generated site can use directly. Callers that hand over third-party bytes
 * pass a profile so the file is downscaled and re-encoded before upload.
 */
export async function saveProjectImage(params: {
  projectId: string;
  bytes: Buffer;
  contentType: StoredImageType;
  /** Optional sub-folder, e.g. "imported", to keep provenance obvious in storage. */
  subdir?: string;
  optimize?: ImageProfile;
}): Promise<StoredImage> {
  const { projectId, subdir, optimize } = params;
  let optimized: OptimizedImage | null = null;
  if (optimize) {
    try {
      const { optimizeImage } = await import("@/lib/images/optimize");
      optimized = await optimizeImage(params.bytes, params.contentType, optimize);
    } catch (err) {
      console.warn(
        "[images] optimize skipped; uploading original:",
        err instanceof Error ? err.message : err
      );
    }
  }
  const bytes = optimized?.bytes ?? params.bytes;
  const contentType = optimized?.contentType ?? params.contentType;

  const safeSubdir = subdir?.replace(/[^a-z0-9-]/gi, "") || "";
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${EXTENSIONS[contentType]}`;
  const objectKey = `${projectId}/${safeSubdir ? `${safeSubdir}/` : ""}${filename}`;
  const url = await uploadScrapedImage(bytes, objectKey, contentType);
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
