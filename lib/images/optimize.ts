import { imageSize } from "@/lib/scraper/image-size";
import type { StoredImageType } from "@/lib/images/storage";

// Re-encodes third-party bytes before they are stored. A customer's hero image
// is routinely a multi-megabyte original sized for a print workflow; shipping it
// unchanged puts that weight into the generated site and into every export ZIP.
//
// Stripping metadata is a second reason to run this: sharp drops EXIF by
// default, so camera serials and GPS coordinates in a client's photo never
// reach a page we publish.

export type ImageProfile = "photo" | "logo";

/** Long-edge caps. A hero spans a 1280px content column at 2x on the widest breakpoint. */
const MAX_EDGE: Record<ImageProfile, number> = {
  photo: 1600,
  logo: 640,
};

const PHOTO_QUALITY = 80;

/**
 * Above this weight per pixel an image is carrying detail it does not need for
 * the web. Below it, a lossy re-encode buys almost nothing and costs a second
 * generation of compression artefacts.
 */
const EFFICIENT_BYTES_PER_PIXEL = 0.75;

export type OptimizedImage = {
  bytes: Buffer;
  contentType: StoredImageType;
  width?: number;
  height?: number;
  /** The size before re-encoding, so callers can report what was saved. */
  originalLength: number;
};

type SharpPipeline = {
  rotate: () => SharpPipeline;
  resize: (options: {
    width: number;
    height: number;
    fit: "inside";
    withoutEnlargement: boolean;
  }) => SharpPipeline;
  webp: (options: { lossless?: boolean; quality?: number; effort: number }) => SharpPipeline;
  toBuffer: (options: {
    resolveWithObject: true;
  }) => Promise<{
    data: Buffer;
    info: { width: number; height: number; pageHeight?: number };
  }>;
};

/** Callable factory only — `typeof import("sharp")` is a namespace under tsc. */
type SharpFactory = (input: Buffer, options?: { animated?: boolean }) => SharpPipeline;

let sharpModule: SharpFactory | null | undefined;

/**
 * `sharp` is a declared dependency (and also ships with Next). A missing
 * encoder must cost a customer nothing more than an unoptimized file.
 */
async function loadSharp(): Promise<SharpFactory | null> {
  if (sharpModule !== undefined) return sharpModule;
  try {
    const loaded = (await import("sharp")) as { default?: unknown; sharp?: unknown };
    const candidate = loaded.default ?? loaded.sharp ?? loaded;
    sharpModule = typeof candidate === "function" ? (candidate as SharpFactory) : null;
  } catch {
    sharpModule = null;
  }
  return sharpModule;
}

/**
 * Downscales and re-encodes an image for the web. Aspect ratio is preserved,
 * nothing is ever enlarged, an SVG is returned untouched, and a result that
 * came out heavier than the original is discarded in favour of the original.
 */
export async function optimizeImage(
  bytes: Buffer,
  contentType: StoredImageType,
  profile: ImageProfile
): Promise<OptimizedImage> {
  const original: OptimizedImage = { bytes, contentType, originalLength: bytes.length };

  // A sanitized SVG is already small, resolution-independent, and would only
  // lose by being rasterized.
  if (contentType === "image/svg+xml") return original;

  const edge = MAX_EDGE[profile];
  const size = imageSize(bytes, contentType);
  if (
    contentType === "image/webp" &&
    size &&
    size.width <= edge &&
    size.height <= edge &&
    bytes.length / (size.width * size.height) <= EFFICIENT_BYTES_PER_PIXEL
  ) {
    return { ...original, width: size.width, height: size.height };
  }

  const sharp = await loadSharp();
  if (!sharp) return original;

  try {
    const animated = contentType === "image/gif";
    const pipeline = sharp(bytes, { animated })
      // Applies the EXIF orientation flag before the metadata carrying it is
      // dropped, so a phone photo does not come out on its side.
      .rotate()
      .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true });

    // A logo has to survive being scaled by the layout, so it is re-encoded
    // without loss; a photograph will not show the difference at quality 80.
    const encoded = await (profile === "logo"
      ? pipeline.webp({ lossless: true, effort: 4 })
      : pipeline.webp({ quality: PHOTO_QUALITY, effort: 4 })
    ).toBuffer({ resolveWithObject: true });

    if (encoded.data.length >= bytes.length) return original;

    return {
      bytes: encoded.data,
      contentType: "image/webp",
      width: encoded.info.width,
      height: encoded.info.pageHeight ?? encoded.info.height,
      originalLength: bytes.length,
    };
  } catch {
    return original;
  }
}
