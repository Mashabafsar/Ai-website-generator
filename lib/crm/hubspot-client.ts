// Low-level HubSpot HTTP layer: URL construction, bearer auth, bounded
// timeouts, and retry classification. Nothing here knows about contacts, deals,
// or lead scores — that lives in hubspot.ts.

import { env } from "@/lib/env";

export class HubSpotError extends Error {
  readonly status: number | null;
  readonly retryable: boolean;
  readonly retryAfterMs: number | null;

  constructor(
    message: string,
    options: { status?: number | null; retryable?: boolean; retryAfterMs?: number | null } = {}
  ) {
    super(message);
    this.name = "HubSpotError";
    this.status = options.status ?? null;
    this.retryable = options.retryable ?? false;
    this.retryAfterMs = options.retryAfterMs ?? null;
  }
}

export function isHubSpotConfigured(): boolean {
  return env.hubspot.enabled;
}

/**
 * HubSpot moved the version from a path prefix to a path segment when it
 * introduced date-based versions: `/crm/v3/objects/contacts` became
 * `/crm/objects/2026-09/contacts`. Both styles are configurable, so the
 * position is derived from the version string rather than hardcoded.
 */
function isLegacyVersion(version: string): boolean {
  return /^v\d+$/i.test(version.trim());
}

/** Path for a CRM object collection or record, e.g. `contacts` or `deals/123`. */
export function objectPath(...segments: string[]): string {
  const version = env.hubspot.apiVersion.trim().replace(/^\/+|\/+$/g, "");
  const tail = segments.filter(Boolean).join("/");
  return isLegacyVersion(version)
    ? `/crm/${version}/objects/${tail}`
    : `/crm/objects/${version}/${tail}`;
}

/**
 * Path for an association between two records. Uses the dedicated associations
 * API version, which a portal can pin separately from the objects version.
 */
export function associationPath(
  fromObjectType: string,
  fromObjectId: string,
  toObjectType: string,
  toObjectId: string
): string {
  const version = env.hubspot.associationsApiVersion.trim().replace(/^\/+|\/+$/g, "");
  const tail = `${fromObjectType}/${fromObjectId}/associations/${toObjectType}/${toObjectId}`;
  return isLegacyVersion(version)
    ? `/crm/${version}/objects/${tail}`
    : `/crm/objects/${version}/${tail}`;
}

/** Path listing every record of one type associated with a record. */
export function associationListPath(
  fromObjectType: string,
  fromObjectId: string,
  toObjectType: string
): string {
  const version = env.hubspot.associationsApiVersion.trim().replace(/^\/+|\/+$/g, "");
  const tail = `${fromObjectType}/${fromObjectId}/associations/${toObjectType}`;
  return isLegacyVersion(version)
    ? `/crm/${version}/objects/${tail}`
    : `/crm/objects/${version}/${tail}`;
}

/** Path for an object type's property definitions, e.g. `contacts` or `deals`. */
export function propertiesPath(objectType: string): string {
  const version = env.hubspot.apiVersion.trim().replace(/^\/+|\/+$/g, "");
  return isLegacyVersion(version)
    ? `/crm/${version}/properties/${objectType}`
    : `/crm/properties/${version}/${objectType}`;
}

/** Path for an object type's pipelines, e.g. `leads` or `leads/{pipelineId}/stages`. */
export function pipelinesPath(objectType: string, ...segments: string[]): string {
  const version = env.hubspot.apiVersion.trim().replace(/^\/+|\/+$/g, "");
  const tail = [objectType, ...segments].filter(Boolean).join("/");
  return isLegacyVersion(version)
    ? `/crm/${version}/pipelines/${tail}`
    : `/crm/pipelines/${version}/${tail}`;
}

/** Strip the API key from anything that might reach a log. */
export function redact(text: string): string {
  const key = env.hubspot.apiKey;
  let safe = text;
  if (key) safe = safe.split(key).join("[redacted]");
  return safe.replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1[redacted]");
}

function parseRetryAfterMs(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  // HubSpot documents Retry-After in seconds; ignore absurd values so a bad
  // header can't wedge a request for hours.
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, 60_000);
  }
  return null;
}

/** 429 and 477 are explicitly documented as retryable; so is any 5xx. */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 477 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  const base = Math.min(1000 * 2 ** attempt, 15_000);
  // Jitter keeps concurrent workers from retrying in lockstep.
  return base / 2 + Math.random() * (base / 2);
}

async function once<T>(path: string, init: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.hubspot.requestTimeoutMs);

  let res: Response;
  try {
    res = await fetch(`${env.hubspot.baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.hubspot.apiKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    throw new HubSpotError(
      aborted
        ? `Request to ${path} timed out after ${env.hubspot.requestTimeoutMs}ms`
        : `Request to ${path} failed: ${redact(err instanceof Error ? err.message : String(err))}`,
      { retryable: true }
    );
  } finally {
    clearTimeout(timer);
  }

  if (res.ok) {
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  const body = await res.text().catch(() => "");
  throw new HubSpotError(`HubSpot ${res.status} on ${path}: ${redact(body).slice(0, 300)}`, {
    status: res.status,
    retryable: isRetryableStatus(res.status),
    retryAfterMs: parseRetryAfterMs(res.headers.get("retry-after")),
  });
}

/**
 * Send a request, retrying transient failures a bounded number of times.
 * Authentication and validation errors are permanent and fail immediately —
 * retrying a 401 just burns rate limit.
 */
export async function hubspotRequest<T>(path: string, init: RequestInit): Promise<T> {
  if (!isHubSpotConfigured()) {
    throw new HubSpotError("HubSpot is not configured (HUBSPOT_API_KEY is unset)");
  }

  const maxAttempts = Math.max(1, env.hubspot.requestRetries + 1);
  let lastError: HubSpotError | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await once<T>(path, init);
    } catch (err) {
      const error = err instanceof HubSpotError ? err : new HubSpotError(redact(String(err)));
      if (!error.retryable || attempt === maxAttempts - 1) throw error;
      lastError = error;
      await sleep(error.retryAfterMs ?? backoffMs(attempt));
    }
  }

  throw lastError ?? new HubSpotError(`HubSpot request to ${path} failed`);
}

export const __testing = { isLegacyVersion, parseRetryAfterMs, isRetryableStatus, backoffMs };
