import { crc32, deflateSync } from "node:zlib";

// Classic Windows ICO: a directory of BMP (DIB) or PNG images. libvips/sharp
// often refuses BMP-in-ICO, which is still what /favicon.ico is on a lot of
// sites, so we decode the largest frame ourselves and emit a PNG.

/** ICO / CUR container: `00 00 01 00` (icon) — not the PNG some servers serve at `.ico`. */
export function isIcoBuffer(bytes: Buffer): boolean {
  return bytes.length >= 6 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0;
}

function rowStride(width: number, bitsPerPixel: number): number {
  return Math.ceil((width * bitsPerPixel) / 32) * 4;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])) >>> 0);
  return Buffer.concat([length, typeBytes, data, crc]);
}

export function encodePngRgba(width: number, height: number, rgba: Buffer): Buffer {
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function andMasked(image: Buffer, andOffset: number, andStride: number, x: number, yFromTop: number, height: number): boolean {
  const row = height - 1 - yFromTop;
  const index = andOffset + row * andStride + (x >> 3);
  if (index >= image.length) return false;
  return ((image[index] >> (7 - (x & 7))) & 1) === 1;
}

function decodeIcoDib(image: Buffer, dirW: number, dirH: number): Buffer | null {
  if (image.length >= 8 && image[0] === 0x89 && image[1] === 0x50 && image[2] === 0x4e && image[3] === 0x47) {
    return Buffer.from(image);
  }
  if (image.length < 40) return null;
  const headerSize = image.readUInt32LE(0);
  if (headerSize < 40 || headerSize > 124) return null;
  const width = image.readInt32LE(4);
  let dibHeight = image.readInt32LE(8);
  if (dibHeight < 0) dibHeight = -dibHeight;
  const planes = image.readUInt16LE(12);
  const bitCount = image.readUInt16LE(14);
  const compression = image.readUInt32LE(16);
  if (compression !== 0 || planes !== 1) return null;

  const w = width > 0 ? width : dirW || 0;
  const h =
    dirH > 0 && (dibHeight === dirH * 2 || dibHeight === w * 2)
      ? dirH
      : dibHeight === w * 2
        ? w
        : dibHeight || dirH;
  if (w < 1 || h < 1 || w > 1024 || h > 1024) return null;
  if (![1, 4, 8, 24, 32].includes(bitCount)) return null;

  const colorsUsed = image.readUInt32LE(32);
  const paletteCount = bitCount <= 8 ? colorsUsed || 1 << bitCount : 0;
  const paletteOffset = headerSize;
  const xorOffset = paletteOffset + paletteCount * 4;
  const xorStride = rowStride(w, bitCount);
  const xorSize = xorStride * h;
  const andOffset = xorOffset + xorSize;
  const andStride = rowStride(w, 1);
  if (xorOffset + xorSize > image.length) return null;

  const palette: Array<{ r: number; g: number; b: number }> = [];
  for (let i = 0; i < paletteCount; i++) {
    const o = paletteOffset + i * 4;
    if (o + 3 >= image.length) return null;
    palette.push({ b: image[o], g: image[o + 1], r: image[o + 2] });
  }

  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const srcRow = h - 1 - y;
    const rowOff = xorOffset + srcRow * xorStride;
    for (let x = 0; x < w; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 255;
      if (bitCount === 32) {
        const p = rowOff + x * 4;
        if (p + 3 >= image.length) return null;
        b = image[p];
        g = image[p + 1];
        r = image[p + 2];
        a = image[p + 3];
      } else if (bitCount === 24) {
        const p = rowOff + x * 3;
        if (p + 2 >= image.length) return null;
        b = image[p];
        g = image[p + 1];
        r = image[p + 2];
      } else if (bitCount === 8) {
        const c = palette[image[rowOff + x]];
        if (!c) return null;
        r = c.r;
        g = c.g;
        b = c.b;
      } else if (bitCount === 4) {
        const byte = image[rowOff + (x >> 1)];
        const idx = x & 1 ? byte & 0x0f : byte >> 4;
        const c = palette[idx];
        if (!c) return null;
        r = c.r;
        g = c.g;
        b = c.b;
      } else {
        const byte = image[rowOff + (x >> 3)];
        const idx = (byte >> (7 - (x & 7))) & 1;
        const c = palette[idx];
        if (!c) return null;
        r = c.r;
        g = c.g;
        b = c.b;
      }
      if (bitCount < 32 && andMasked(image, andOffset, andStride, x, y, h)) a = 0;
      const o = (y * w + x) * 4;
      rgba[o] = r;
      rgba[o + 1] = g;
      rgba[o + 2] = b;
      rgba[o + 3] = a;
    }
  }
  return encodePngRgba(w, h, rgba);
}

/** Largest embedded PNG frame, if the ICO is a PNG container. */
export function extractLargestPngFromIco(bytes: Buffer): Buffer | null {
  if (!isIcoBuffer(bytes)) return null;
  const count = bytes.readUInt16LE(4);
  if (count < 1 || count > 64) return null;
  let best: Buffer | null = null;
  for (let i = 0; i < count; i++) {
    const entry = 6 + i * 16;
    if (entry + 16 > bytes.length) break;
    const size = bytes.readUInt32LE(entry + 8);
    const offset = bytes.readUInt32LE(entry + 12);
    if (offset < 0 || size < 8 || offset + size > bytes.length) continue;
    const chunk = bytes.subarray(offset, offset + size);
    if (chunk[0] === 0x89 && chunk[1] === 0x50 && chunk[2] === 0x4e && chunk[3] === 0x47) {
      if (!best || chunk.length > best.length) best = Buffer.from(chunk);
    }
  }
  return best;
}

/** Decode the largest ICO frame to PNG bytes. */
export function decodeIcoToPng(bytes: Buffer): Buffer | null {
  const embedded = extractLargestPngFromIco(bytes);
  if (embedded) return embedded;
  if (!isIcoBuffer(bytes)) return null;
  const count = bytes.readUInt16LE(4);
  if (count < 1 || count > 64) return null;

  let best: { area: number; png: Buffer } | null = null;
  for (let i = 0; i < count; i++) {
    const entry = 6 + i * 16;
    if (entry + 16 > bytes.length) break;
    const dirW = bytes[entry] || 256;
    const dirH = bytes[entry + 1] || 256;
    const size = bytes.readUInt32LE(entry + 8);
    const offset = bytes.readUInt32LE(entry + 12);
    if (offset < 0 || size < 40 || offset + size > bytes.length) continue;
    const png = decodeIcoDib(bytes.subarray(offset, offset + size), dirW, dirH);
    if (!png) continue;
    const area = dirW * dirH;
    if (!best || area > best.area) best = { area, png };
  }
  return best?.png ?? null;
}
