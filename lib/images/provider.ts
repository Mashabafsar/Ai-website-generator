import { env } from "@/lib/env";
import type { StockImageReference } from "@/lib/blueprint/types";

export type ImageQuery = {
  keywords: string[];
  orientation?: "landscape" | "portrait" | "square";
  altText?: string;
  perPage?: number;
};

export type ImageSearchProvider = "pexels" | "shutterstock" | "unsplash" | "all";

function dims(orientation: ImageQuery["orientation"]): { w: number; h: number } {
  if (orientation === "portrait") return { w: 800, h: 1100 };
  if (orientation === "square") return { w: 1000, h: 1000 };
  return { w: 1280, h: 800 };
}

function placeholder(query: ImageQuery): StockImageReference {
  const seed = encodeURIComponent(query.keywords.join("-").slice(0, 40) || "site");
  const { w, h } = dims(query.orientation);
  return {
    provider: "placeholder",
    url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
    altText: query.altText || query.keywords[0] || "Website image",
    attributionRequired: false,
  };
}

async function searchPexelsMany(query: ImageQuery): Promise<StockImageReference[]> {
  if (!env.images.pexels) return [];
  try {
    const q = encodeURIComponent(query.keywords.join(" "));
    const orientation =
      query.orientation === "square" ? "square" : query.orientation ?? "landscape";
    const perPage = Math.min(query.perPage ?? 12, 24);
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${q}&per_page=${perPage}&orientation=${orientation}`,
      { headers: { Authorization: env.images.pexels }, cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      photos?: {
        id: number;
        src: { large: string; landscape: string; medium: string };
        photographer: string;
        alt?: string;
      }[];
    };
    return (data.photos ?? []).map((photo) => ({
      provider: "pexels" as const,
      providerImageId: String(photo.id),
      url: photo.src.large || photo.src.landscape || photo.src.medium,
      photographer: photo.photographer,
      attributionRequired: false,
      licenseInfo: "Pexels License",
      altText: query.altText || photo.alt || query.keywords[0] || "Website image",
    }));
  } catch {
    return [];
  }
}

async function searchShutterstockMany(query: ImageQuery): Promise<StockImageReference[]> {
  if (!env.images.shutterstock) return [];
  try {
    const q = encodeURIComponent(query.keywords.join(" "));
    const perPage = Math.min(query.perPage ?? 12, 24);
    const orientation =
      query.orientation === "portrait"
        ? "vertical"
        : query.orientation === "square"
          ? "square"
          : "horizontal";
    const res = await fetch(
      `https://api.shutterstock.com/v2/images/search?query=${q}&per_page=${perPage}&orientation=${orientation}&view=minimal`,
      {
        headers: {
          Authorization: `Bearer ${env.images.shutterstock}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: {
        id: string;
        description?: string;
        assets?: {
          preview?: { url?: string };
          huge_thumb?: { url?: string };
          preview_1000?: { url?: string };
        };
      }[];
    };
    const results: StockImageReference[] = [];
    for (const photo of data.data ?? []) {
      const url =
        photo.assets?.preview_1000?.url ||
        photo.assets?.huge_thumb?.url ||
        photo.assets?.preview?.url;
      if (!url) continue;
      results.push({
        provider: "shutterstock",
        providerImageId: String(photo.id),
        url,
        attributionRequired: true,
        licenseInfo: "Shutterstock License — preview for mockups; license before commercial use",
        altText: query.altText || photo.description || query.keywords[0] || "Website image",
      });
    }
    return results;
  } catch {
    return [];
  }
}

async function searchUnsplashMany(query: ImageQuery): Promise<StockImageReference[]> {
  if (!env.images.unsplash) return [];
  try {
    const q = encodeURIComponent(query.keywords.join(" "));
    const orientation =
      query.orientation === "square" ? "squarish" : query.orientation ?? "landscape";
    const perPage = Math.min(query.perPage ?? 12, 24);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${q}&per_page=${perPage}&orientation=${orientation}`,
      {
        headers: { Authorization: `Client-ID ${env.images.unsplash}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      results?: {
        id: string;
        urls: { regular: string };
        alt_description?: string;
        user: { name: string };
      }[];
    };
    return (data.results ?? []).map((photo) => ({
      provider: "unsplash" as const,
      providerImageId: photo.id,
      url: photo.urls.regular,
      photographer: photo.user?.name,
      attributionRequired: true,
      licenseInfo: "Unsplash License",
      altText: query.altText || photo.alt_description || query.keywords[0] || "Website image",
    }));
  } catch {
    return [];
  }
}

/**
 * Multi-result stock search for the editor. Prefer Shutterstock + Pexels when
 * configured; Unsplash is included when provider is "all" or as fallback.
 */
export async function searchImages(
  query: ImageQuery,
  provider: ImageSearchProvider = "all"
): Promise<StockImageReference[]> {
  const keywords = query.keywords.map((k) => k.trim()).filter(Boolean);
  if (!keywords.length) return [];

  const q = { ...query, keywords };

  if (provider === "pexels") return searchPexelsMany(q);
  if (provider === "shutterstock") return searchShutterstockMany(q);
  if (provider === "unsplash") return searchUnsplashMany(q);

  const [shutterstock, pexels, unsplash] = await Promise.all([
    searchShutterstockMany(q),
    searchPexelsMany(q),
    searchUnsplashMany(q),
  ]);

  // Prefer Shutterstock then Pexels then Unsplash, interleaved for variety.
  const merged: StockImageReference[] = [];
  const max = Math.max(shutterstock.length, pexels.length, unsplash.length);
  for (let i = 0; i < max; i++) {
    if (shutterstock[i]) merged.push(shutterstock[i]);
    if (pexels[i]) merged.push(pexels[i]);
    if (unsplash[i]) merged.push(unsplash[i]);
  }
  return merged.slice(0, query.perPage ?? 18);
}

/**
 * Image Sourcing — fallback chain: Shutterstock -> Pexels -> Unsplash -> placeholder.
 */
export async function findImage(query: ImageQuery): Promise<StockImageReference> {
  const [fromStock] = await searchShutterstockMany({ ...query, perPage: 1 });
  if (fromStock) return fromStock;
  const [fromPexels] = await searchPexelsMany({ ...query, perPage: 1 });
  if (fromPexels) return fromPexels;
  const [fromUnsplash] = await searchUnsplashMany({ ...query, perPage: 1 });
  if (fromUnsplash) return fromUnsplash;
  return placeholder(query);
}

export function isAllowedImageUrl(url: string): boolean {
  if (/^https:\/\//i.test(url)) return true;
  if (/^\/uploads\//i.test(url)) return true;
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(url)) return true;
  return false;
}
