import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// The single hardened network path for anything fetched from a customer's own
// website — the page itself, its stylesheets, its logo, and its photos. Every
// hop of every redirect chain is re-resolved and re-checked, so a public
// hostname cannot bounce a request onto a private address.

export type ScrapeErrorCode =
  | "INVALID_URL"
  | "BLOCKED_HOST"
  | "FETCH_FAILED"
  | "NOT_HTML"
  | "EMPTY_PAGE";

export class ScrapeError extends Error {
  constructor(
    public code: ScrapeErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ScrapeError";
  }
}

export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const MAX_REDIRECTS = 5;


export function normalizeUrl(raw: string): URL {
  const trimmed = (raw || "").trim();
  if (!trimmed) throw new ScrapeError("INVALID_URL", "Enter a website URL.");
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new ScrapeError("INVALID_URL", "That doesn't look like a valid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ScrapeError("INVALID_URL", "Please enter a website address that starts with http or https.");
  }
  url.username = "";
  url.password = "";
  url.hash = "";
  return url;
}


function isPrivateIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224 // multicast / reserved
    );
  }
  if (v === 6) {
    const lower = ip.toLowerCase();
    return (
      lower === "::1" ||
      lower === "::" ||
      lower.startsWith("fe80:") || // link-local
      lower.startsWith("fc") || // unique local fc00::/7
      lower.startsWith("fd") ||
      lower.startsWith("::ffff:0:") // v4-mapped handled above once unwrapped
    );
  }
  return false;
}

export async function assertPublicHost(url: URL): Promise<void> {
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost")
  ) {
    throw new ScrapeError("BLOCKED_HOST", "That address isn't allowed.");
  }
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new ScrapeError("BLOCKED_HOST", "That address isn't allowed.");
    return;
  }
  // DNS-rebinding guard: resolve and re-check the concrete address.
  try {
    const { address } = await lookup(host);
    if (isPrivateIp(address)) {
      throw new ScrapeError("BLOCKED_HOST", "That address isn't allowed.");
    }
  } catch (err) {
    if (err instanceof ScrapeError) throw err;
    throw new ScrapeError("FETCH_FAILED", "We couldn't find that website address.");
  }
}

export type GuardedResponse = {
  res: Response;
  /** The address the body actually came from, after every redirect. */
  finalUrl: URL;
};

/**
 * Fetches a URL, following redirects by hand so each hop is validated before
 * the next request is made. Throws ScrapeError; callers that must degrade
 * gracefully should use `tryFetchGuarded`.
 */
export async function fetchGuarded(
  rawUrl: string | URL,
  options: { timeoutMs: number; accept: string }
): Promise<GuardedResponse> {
  let url = rawUrl instanceof URL ? rawUrl : normalizeUrl(rawUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(url);

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        redirect: "manual",
        signal: AbortSignal.timeout(options.timeoutMs),
        headers: { "User-Agent": BROWSER_USER_AGENT, Accept: options.accept },
      });
    } catch {
      throw new ScrapeError("FETCH_FAILED", "We couldn't reach that website.");
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      await res.body?.cancel().catch(() => {});
      if (!location) throw new ScrapeError("FETCH_FAILED", "That website address didn't work. Try the main page.");
      let next: URL;
      try {
        next = new URL(location, url);
      } catch {
        throw new ScrapeError("FETCH_FAILED", "That website address didn't work. Try the main page.");
      }
      if (next.protocol !== "http:" && next.protocol !== "https:") {
        throw new ScrapeError("BLOCKED_HOST", "That address isn't allowed.");
      }
      next.username = "";
      next.password = "";
      url = next;
      continue;
    }

    if (!res.ok) {
      await res.body?.cancel().catch(() => {});
      throw new ScrapeError("FETCH_FAILED", "That website didn't load. You can fill in the details yourself.");
    }
    return { res, finalUrl: url };
  }

  throw new ScrapeError("FETCH_FAILED", "That website kept sending us somewhere else. Try the main page address.");
}

/** Reads a response body as text, stopping once `cap` bytes have arrived. */
export async function readCappedText(res: Response, cap: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > cap) {
      await reader.cancel().catch(() => {});
      out += decoder.decode(value.subarray(0, value.byteLength - (received - cap)));
      break;
    }
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

/**
 * Reads a response body as bytes. Returns null when the body exceeds `cap` —
 * an oversized asset is dropped rather than truncated, because a partial image
 * is useless.
 */
export async function readCappedBytes(res: Response, cap: number): Promise<Buffer | null> {
  if (!res.body) return null;
  const declared = Number(res.headers.get("content-length") ?? NaN);
  if (Number.isFinite(declared) && declared > cap) {
    await res.body.cancel().catch(() => {});
    return null;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > cap) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export type FetchedAsset = {
  bytes: Buffer;
  /** The header the server sent, which is a hint only — always sniff the bytes. */
  declaredType: string;
  finalUrl: string;
};


/**
 * Downloads one sub-resource (stylesheet, logo, photo). Never throws: any
 * failure — blocked host, timeout, oversized body — yields null so a single bad
 * asset can't fail the whole import.
 */
export async function tryFetchAsset(
  rawUrl: string | URL,
  options: { timeoutMs: number; maxBytes: number; accept: string }
): Promise<FetchedAsset | null> {
  try {
    const { res, finalUrl } = await fetchGuarded(rawUrl, {
      timeoutMs: options.timeoutMs,
      accept: options.accept,
    });
    const bytes = await readCappedBytes(res, options.maxBytes);
    if (!bytes || bytes.length === 0) return null;
    return {
      bytes,
      declaredType: (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase(),
      finalUrl: finalUrl.toString(),
    };
  } catch {
    return null;
  }
}
