import { env } from "@/lib/env";
import {
  cacheControlForPath,
  contentTypeForPath,
  currentSiteRelease,
  siteFileCandidates,
  siteObjectKey,
  subdomainFromHost,
} from "@/lib/deployment/s3-sites";
import { getObject, type StoredObject } from "@/lib/storage/s3";

export const dynamic = "force-dynamic";

// Caddy rewrites *.PLATFORM_DOMAIN to /site-host{uri} and keeps the original Host.
// Any other host, including the app itself, gets a 404.

const ASSET_EXT =
  /\.(png|jpe?g|webp|gif|svg|ico|css|js|mjs|map|woff2?|ttf|otf|json|xml|txt|pdf|webmanifest)$/i;

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(request: Request, ctx: Ctx) {
  const subdomain = subdomainFromHost(request.headers.get("host"));
  if (!subdomain) return plain("Not found", 404);
  if (!env.storage.enabled) return plain("The site is temporarily unavailable.", 503);

  let release: string | null;
  try {
    release = await currentSiteRelease(subdomain);
  } catch (err) {
    console.error("[site-host] release lookup failed:", err);
    return plain("The site is temporarily unavailable.", 503);
  }
  if (!release) return plain("Not found", 404);

  const { path } = await ctx.params;
  const candidates = siteFileCandidates(path);
  if (!candidates) return plain("Not found", 404);

  const bucket = env.storage.sitesBucket;
  try {
    for (const filePath of candidates) {
      const obj = await getObject(bucket, siteObjectKey(subdomain, release, filePath));
      if (obj) return objectResponse(obj, filePath, 200);
    }
    if (wantsSite404(candidates)) {
      const notFoundPage = await getObject(bucket, siteObjectKey(subdomain, release, "404.html"));
      if (notFoundPage) return objectResponse(notFoundPage, "404.html", 404);
    }
  } catch (err) {
    console.error("[site-host] failed to read the site:", err);
    return plain("The site is temporarily unavailable.", 503);
  }
  return plain("Not found", 404);
}

function wantsSite404(candidates: string[]): boolean {
  const chosen = candidates[candidates.length - 1] ?? "";
  return !ASSET_EXT.test(chosen);
}

function objectResponse(obj: StoredObject, filePath: string, status: number): Response {
  const headers = new Headers();
  const fromPath = contentTypeForPath(filePath);
  headers.set("Content-Type", fromPath === "application/octet-stream" ? obj.contentType : fromPath);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Cache-Control", status === 200 ? cacheControlForPath(filePath) : "no-store");
  if (typeof obj.contentLength === "number") {
    headers.set("Content-Length", String(obj.contentLength));
  }
  if (obj.etag) headers.set("ETag", obj.etag);
  return new Response(obj.body, { status, headers });
}

function plain(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
