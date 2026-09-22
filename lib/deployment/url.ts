import { env } from "@/lib/env";

function platformHost(): string {
  return env.deployment.platformDomain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
}

/** `{subdomain}.{PLATFORM_DOMAIN}` when the custom domain is actually attached. */
export function siteDomainUrl(subdomain: string): string {
  return `https://${subdomain}.${platformHost()}`;
}

export function toHttpsUrl(url: string): string {
  const trimmed = url.trim().replace(/^\/\//, "");
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Prefer the stored live URL (Vercel host or custom domain). */
export function publicSiteUrl(row: {
  subdomain?: string | null;
  liveUrl?: string | null;
} | null): string | null {
  if (!row) return null;
  const url = row.liveUrl?.trim();
  if (url) return toHttpsUrl(url);
  const sub = row.subdomain?.trim();
  if (sub) return siteDomainUrl(sub);
  return null;
}
