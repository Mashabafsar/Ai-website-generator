import { imageSize } from "@/lib/scraper/image-size";
import { decodeIcoToPng } from "@/lib/images/ico";
import type { StoredImageType } from "@/lib/images/storage";

export { extractLargestPngFromIco, isIcoBuffer } from "@/lib/images/ico";

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
  png: (options?: { compressionLevel?: number }) => SharpPipeline;
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
 * `sharp` is a declared dependency (and also ships with Next). A missing or
 * blocked native encoder must cost a customer nothing more than an unoptimized
 * file. Webpack's `import("sharp")` can throw outside a try/catch when the
 * `.node` addon fails `dlopen` (WDAC on Windows), so load through Node's
 * `createRequire` instead and never retry after the first failure.
 */
async function loadSharp(): Promise<SharpFactory | null> {
  if (sharpModule !== undefined) return sharpModule;
  sharpModule = null;
  try {
    const { createRequire } = await import("node:module");
    const { join } = await import("node:path");
    const require = createRequire(join(process.cwd(), "package.json"));
    const loaded = require("sharp") as { default?: unknown } | SharpFactory;
    const candidate = typeof loaded === "function" ? loaded : loaded?.default;
    if (typeof candidate === "function") sharpModule = candidate as SharpFactory;
  } catch (err) {
    console.warn(
      "[images] sharp unavailable; storing original bytes:",
      err instanceof Error ? err.message : err
    );
  }
  return sharpModule;
}

/**
 * Turns a favicon ICO into PNG. Sharp first, then an embedded PNG frame, then
 * a BMP-in-ICO decode — so a site that only ships `/favicon.ico` still gets a
 * logo the generated header can show.
 */
export async function decodeIcoToRaster(
  bytes: Buffer
): Promise<{ bytes: Buffer; type: StoredImageType } | null> {
  const sharp = await loadSharp();
  if (sharp) {
    try {
      const encoded = await sharp(bytes).png().toBuffer({ resolveWithObject: true });
      if (encoded.data.length > 0) {
        return { bytes: encoded.data, type: "image/png" };
      }
    } catch {
      // Classic BMP-in-ICO is the usual sharp miss.
    }
  }
  const png = decodeIcoToPng(bytes);
  return png ? { bytes: png, type: "image/png" } : null;
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
  try {
    return await optimizeImageInner(bytes, contentType, profile, original);
  } catch (err) {
    console.warn(
      "[images] optimize failed; storing original bytes:",
      err instanceof Error ? err.message : err
    );
    return original;
  }
}

async function optimizeImageInner(
  bytes: Buffer,
  contentType: StoredImageType,
  profile: ImageProfile,
  original: OptimizedImage
): Promise<OptimizedImage> {
  // A sanitized SVG is already small, resolution-independent, and would only
  // lose by being rasterized.
  if (contentType === "image/svg+xml") return original;

  // Favicon ICO cannot stay as a multi-image container in the generated site.
  // Convert to PNG first; if that fails, keep the original so `<img>` can
  // still show it in browsers that decode ICO.
  if (contentType === "image/x-icon") {
    const raster = await decodeIcoToRaster(bytes);
    if (!raster) return original;
    const converted = await optimizeImage(raster.bytes, raster.type, profile);
    return { ...converted, originalLength: bytes.length };
  }

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
}
