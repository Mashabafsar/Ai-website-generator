// Pixel dimensions read straight from an image header. Enough to tell a hero
// banner from a portrait and to throw out anything too small to be content;
// no decoder and no dependency.

export type ImageSize = { width: number; height: number };

function png(bytes: Buffer): ImageSize | null {
  if (bytes.length < 24) return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function gif(bytes: Buffer): ImageSize | null {
  if (bytes.length < 10) return null;
  return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
}

function jpeg(bytes: Buffer): ImageSize | null {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = bytes[offset + 1];
    const size = bytes.readUInt16BE(offset + 2);
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    if (size <= 0) return null;
    offset += 2 + size;
  }
  return null;
}

function webp(bytes: Buffer): ImageSize | null {
  const chunk = bytes.subarray(12, 16).toString("latin1");
  if (chunk === "VP8X" && bytes.length >= 30) {
    return {
      width: 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)),
      height: 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)),
    };
  }
  if (chunk === "VP8 " && bytes.length >= 30) {
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L" && bytes.length >= 25) {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function svg(bytes: Buffer): ImageSize | null {
  const head = bytes.subarray(0, 2048).toString("utf8");
  const viewBox = /viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/i.exec(head);
  if (viewBox) return { width: Math.round(+viewBox[1]), height: Math.round(+viewBox[2]) };
  const w = /\bwidth\s*=\s*["']?([\d.]+)/i.exec(head);
  const h = /\bheight\s*=\s*["']?([\d.]+)/i.exec(head);
  if (w && h) return { width: Math.round(+w[1]), height: Math.round(+h[1]) };
  return null;
}

export function imageSize(bytes: Buffer, contentType: string): ImageSize | null {
  let size: ImageSize | null = null;
  if (contentType === "image/png") size = png(bytes);
  else if (contentType === "image/gif") size = gif(bytes);
  else if (contentType === "image/jpeg") size = jpeg(bytes);
  else if (contentType === "image/webp") size = webp(bytes);
  else if (contentType === "image/svg+xml") size = svg(bytes);
  if (!size || !size.width || !size.height) return null;
  if (!Number.isFinite(size.width) || !Number.isFinite(size.height)) return null;
  return size;
}

export function orientationOf(size: ImageSize | null): "landscape" | "portrait" | "square" {
  if (!size) return "landscape";
  const ratio = size.width / size.height;
  if (ratio > 1.2) return "landscape";
  if (ratio < 0.85) return "portrait";
  return "square";
}
