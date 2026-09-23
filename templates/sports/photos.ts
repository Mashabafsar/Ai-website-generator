const TEMPLATE_ASSET = /^\/templates\//;

/** Photographs that belong to this website, not the Athlo sample library. */
export function ownPhotos(urls: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const photos: string[] = [];
  for (const url of urls) {
    if (!url || TEMPLATE_ASSET.test(url) || seen.has(url)) continue;
    seen.add(url);
    photos.push(url);
  }
  return photos;
}

/**
 * Customer sites never fall back to the sports sample library. The Athlo
 * gallery still uses those files.
 */
export function photoFor(
  current: string | undefined,
  pool: string[],
  index: number,
  demo: boolean,
  demoFallback: string
): string {
  if (current && !TEMPLATE_ASSET.test(current)) return current;
  if (demo) return demoFallback;
  return pool.length ? pool[index % pool.length] : "";
}
