/** Normalize a host or URL into an https link. */
export function toHttpsUrl(url: string): string {
  const trimmed = url.trim().replace(/^\/\//, "");
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** The stored live URL. Empty when the site has not been published. */
export function publicSiteUrl(row: {
  subdomain?: string | null;
  liveUrl?: string | null;
} | null): string | null {
  const url = row?.liveUrl?.trim();
  return url ? toHttpsUrl(url) : null;
}
