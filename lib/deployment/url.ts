import { env } from "@/lib/env";

function platformHost(): string {
  return env.deployment.platformDomain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
}

/** Client-facing site URL: `{subdomain}.{PLATFORM_DOMAIN}` — never a Vercel deployment host. */
export function siteDomainUrl(subdomain: string): string {
  return `https://${subdomain}.${platformHost()}`;
}

export function isVercelDeploymentUrl(url: string): boolean {
  try {
    return new URL(url).hostname.toLowerCase().endsWith(".vercel.app");
  } catch {
    return /vercel\.app/i.test(url);
  }
}

export function publicSiteUrl(row: {
  subdomain?: string | null;
  liveUrl?: string | null;
} | null): string | null {
  if (!row) return null;
  const sub = row.subdomain?.trim();
  if (sub) return siteDomainUrl(sub);
  const url = row.liveUrl?.trim();
  if (!url || isVercelDeploymentUrl(url)) return null;
  return url;
}

export function hideDeploymentHosts(message: string): string {
  return message.replace(/https?:\/\/\S*vercel\.app\S*/gi, "").replace(/\s{2,}/g, " ").trim();
}
