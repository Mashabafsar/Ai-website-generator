import type { ProjectFile } from "@/lib/export/generate-project";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { deleteObjects, listKeys, putObject } from "@/lib/storage/s3";

// Publishes a managed site to sites/<subdomain>/<releaseId>/... in the sites
// bucket. The caller stores Deployment.release only after publishSiteRelease
// returns, so visitors move to the new copy in one step. Old prefixes are
// removed after that, keeping the release just published and the one before it.

const UPLOAD_CONCURRENCY = 8;
const RELEASE_CACHE_MS = 60_000;
const RELEASE_CACHE_LIMIT = 1000;

const HTML_CACHE = "public, max-age=60";
const ASSET_CACHE = "public, max-age=86400";
const HASHED_ASSET_CACHE = "public, max-age=31536000, immutable";

const HASHED_FILE = /(?:^|[._-])[a-f0-9]{8,}(?:[._-]|$)/i;
const SUBDOMAIN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const ASSET_EXTENSION = /\.[a-z0-9]+$/i;

const CONTENT_TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  txt: "text/plain; charset=utf-8",
  xml: "application/xml",
  webmanifest: "application/manifest+json",
  map: "application/json",
  pdf: "application/pdf",
};

type PreparedFile = { path: string; body: string | Buffer };
type ReleaseCacheEntry = { release: string | null; expiresAt: number };

const releaseCache = new Map<string, ReleaseCacheEntry>();
let releaseSequence = 0;

export function contentTypeForPath(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

/**
 * HTML stays briefly cached. Hashed asset names can stay for a year.
 * Other assets use a day: the public URL does not include the release id,
 * so a year-long cache would keep the previous file after a republish.
 */
export function cacheControlForPath(filePath: string): string {
  const name = filePath.split("/").pop() ?? filePath;
  if (/\.html?$/i.test(name)) return HTML_CACHE;
  if (HASHED_FILE.test(name)) return HASHED_ASSET_CACHE;
  return ASSET_CACHE;
}

export function siteObjectKey(subdomain: string, releaseId: string, filePath: string): string {
  return `sites/${subdomain}/${releaseId}/${filePath}`;
}

/** Host header or `domain` query → the single label in front of PLATFORM_DOMAIN. */
export function subdomainFromHost(hostHeader: string | null | undefined): string | null {
  const platform = env.deployment.platformDomain;
  if (!platform || !hostHeader?.trim()) return null;
  const host = bareHost(hostHeader);
  const suffix = `.${platform}`;
  if (!host.endsWith(suffix)) return null;
  const subdomain = host.slice(0, -suffix.length);
  if (!SUBDOMAIN.test(subdomain)) return null;
  return subdomain;
}

/**
 * Clean URLs try `page.html`, then `page/index.html`, then the path itself.
 * A path that already has a file extension is fetched as that file.
 * Returns null when the path could escape the release prefix.
 */
export function siteFileCandidates(segments: string[] | undefined): string[] | null {
  const parts: string[] = [];
  for (const segment of segments ?? []) {
    const decoded = decodePathSegment(segment);
    if (decoded == null || isUnsafePathSegment(decoded)) return null;
    parts.push(decoded);
  }
  if (parts.length === 0) return ["index.html"];
  const joined = parts.join("/");
  if (joined.length > 900) return null;
  const base = parts[parts.length - 1];
  if (ASSET_EXTENSION.test(base)) return [joined];
  return [`${joined}.html`, `${joined}/index.html`, joined];
}

export function rememberPublishedRelease(subdomain: string, releaseId: string): void {
  storeRelease(subdomain, releaseId);
}

/** Current release for a subdomain, cached in memory for 60 seconds. */
export async function currentSiteRelease(subdomain: string): Promise<string | null> {
  const hit = freshRelease(subdomain);
  if (hit) return hit.release;

  const row = await prisma.deployment.findFirst({
    where: { subdomain },
    orderBy: { updatedAt: "desc" },
    select: { release: true },
  });
  const release = row?.release?.trim() || null;
  const duringLookup = freshRelease(subdomain);
  if (duringLookup) return duringLookup.release;
  storeRelease(subdomain, release);
  return release;
}

/**
 * Uploads every file into a new release prefix. Throws if any upload fails,
 * after trying to delete the partial prefix. Does not change Deployment.release.
 */
export async function publishSiteRelease(params: {
  subdomain: string;
  files: ProjectFile[];
}): Promise<string> {
  if (!env.storage.enabled) {
    throw new Error("S3 storage is not configured.");
  }
  const subdomain = assertSubdomain(params.subdomain);
  const files = prepareSiteFiles(params.files);
  const releaseId = newReleaseId();
  await uploadRelease(env.storage.sitesBucket, subdomain, releaseId, files);
  return releaseId;
}

/** Best-effort removal of a release that never became Deployment.release. */
export async function discardUnpublishedRelease(subdomain: string, releaseId: string): Promise<void> {
  try {
    const keys = await listKeys(env.storage.sitesBucket, releasePrefix(subdomain, releaseId));
    await deleteKeys(env.storage.sitesBucket, keys, "unpublished release delete failed");
  } catch (err) {
    console.error("[sites] could not remove unpublished release:", err);
  }
}

/**
 * Release ids to remove after `currentReleaseId` is the live one.
 * Keeps that id and the newest id older than it. Newer ids are left in place
 * so a publish still uploading is not deleted out from under itself.
 */
export function releaseIdsToPrune(existing: string[], currentReleaseId: string): string[] {
  const older = existing.filter((id) => id !== currentReleaseId && id < currentReleaseId).sort();
  older.pop();
  return older;
}

/**
 * Deletes release prefixes older than the one just published and the one
 * before it. Per-key failures are logged. A transport failure throws.
 */
export async function pruneOldReleases(subdomain: string, currentReleaseId: string): Promise<void> {
  const bucket = env.storage.sitesBucket;
  const root = `sites/${subdomain}/`;
  const keys = await listKeys(bucket, root);
  const byRelease = new Map<string, string[]>();
  for (const key of keys) {
    if (!key.startsWith(root)) continue;
    const releaseId = key.slice(root.length).split("/")[0];
    if (!releaseId) continue;
    const group = byRelease.get(releaseId);
    if (group) group.push(key);
    else byRelease.set(releaseId, [key]);
  }

  const drop = new Set(releaseIdsToPrune([...byRelease.keys()], currentReleaseId));
  const doomed = [...byRelease.entries()]
    .filter(([id]) => drop.has(id))
    .flatMap(([, group]) => group);
  await deleteKeys(bucket, doomed, "old release delete failed");
}

function isUnsafePathSegment(segment: string): boolean {
  return (
    !segment ||
    segment === "." ||
    segment === ".." ||
    segment.includes("/") ||
    segment.includes("\\") ||
    segment.includes("\0")
  );
}

function bareHost(value: string): string {
  let host = value.trim().toLowerCase();
  if (host.startsWith("[")) return host;
  const colon = host.lastIndexOf(":");
  if (colon > -1 && /^\d+$/.test(host.slice(colon + 1))) {
    host = host.slice(0, colon);
  }
  return host.replace(/\.$/, "");
}

function decodePathSegment(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch (err) {
    console.warn("[site-host] undecodable path segment:", segment, err);
    return null;
  }
}

function assertSubdomain(value: string): string {
  const subdomain = value.trim().toLowerCase();
  if (!SUBDOMAIN.test(subdomain)) {
    throw new Error("The site address is not valid.");
  }
  return subdomain;
}

function prepareSiteFiles(files: ProjectFile[]): PreparedFile[] {
  const prepared: PreparedFile[] = [];
  for (const file of files) {
    const path = normalizePublishedPath(file.path);
    if (!path) {
      throw new Error(`Refusing to publish "${file.path.slice(0, 160)}"`);
    }
    prepared.push({ path, body: file.content });
  }
  if (prepared.length === 0) {
    throw new Error("The site has no files to publish.");
  }
  return prepared;
}

function normalizePublishedPath(filePath: string): string | null {
  const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.length > 900) return null;
  const segments = normalized.split("/");
  for (const segment of segments) {
    if (!segment || segment === "." || segment === ".." || segment.includes("\0")) return null;
  }
  return normalized;
}

function newReleaseId(): string {
  releaseSequence += 1;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(".", "");
  return `${stamp}-${String(releaseSequence).padStart(6, "0")}`;
}

function releasePrefix(subdomain: string, releaseId: string): string {
  return `sites/${subdomain}/${releaseId}/`;
}

async function uploadRelease(
  bucket: string,
  subdomain: string,
  releaseId: string,
  files: PreparedFile[]
): Promise<void> {
  const uploaded: string[] = [];
  try {
    for (let i = 0; i < files.length; i += UPLOAD_CONCURRENCY) {
      const batch = files.slice(i, i + UPLOAD_CONCURRENCY);
      await Promise.all(batch.map((file) => uploadOne(bucket, subdomain, releaseId, file, uploaded)));
    }
  } catch (err) {
    await deleteUploadedBestEffort(bucket, uploaded);
    throw err;
  }
}

async function uploadOne(
  bucket: string,
  subdomain: string,
  releaseId: string,
  file: PreparedFile,
  uploaded: string[]
): Promise<void> {
  const key = siteObjectKey(subdomain, releaseId, file.path);
  await putObject({
    bucket,
    key,
    body: file.body,
    contentType: contentTypeForPath(file.path),
    cacheControl: cacheControlForPath(file.path),
  });
  uploaded.push(key);
}

async function deleteUploadedBestEffort(bucket: string, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await deleteKeys(bucket, keys, "incomplete release delete failed");
  } catch (err) {
    console.error("[sites] could not remove an incomplete release:", err);
  }
}

async function deleteKeys(bucket: string, keys: string[], label: string): Promise<void> {
  if (keys.length === 0) return;
  const result = await deleteObjects(bucket, keys);
  if (result.failed.length > 0) {
    console.error(`[sites] ${label}:`, result.failed);
  }
}

function freshRelease(subdomain: string): ReleaseCacheEntry | null {
  const entry = releaseCache.get(subdomain);
  if (!entry || entry.expiresAt <= Date.now()) return null;
  return entry;
}

function storeRelease(subdomain: string, release: string | null): void {
  if (releaseCache.size >= RELEASE_CACHE_LIMIT) releaseCache.clear();
  releaseCache.set(subdomain, { release, expiresAt: Date.now() + RELEASE_CACHE_MS });
}
