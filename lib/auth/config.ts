/** Shared Better Auth URL + origin settings (server-only). */

const DEFAULT_APP_URL = "http://localhost:3000";

/** Next.js bumps the port when 3000 is busy; cover the usual range. */
const DEV_LOOPBACK_PORTS = [
  3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010,
] as const;

export function getAuthAppUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_APP_URL
  ).replace(/\/+$/, "");
}

/**
 * In dev, Next.js may bind to 3001/3002/etc. Better Auth rejects requests
 * whose Origin header does not match trustedOrigins — allow local ports.
 */
export function getAuthBaseURL(): string | {
  allowedHosts: string[];
  fallback: string;
  protocol: "http";
} {
  const fallback = getAuthAppUrl();

  if (process.env.NODE_ENV === "production") {
    return fallback;
  }

  // `*` covers the Network URL Next prints (a LAN address such as
  // 172.x.x.x:3001). Signup from that address is otherwise rejected.
  return {
    allowedHosts: ["localhost", "localhost:*", "127.0.0.1", "127.0.0.1:*", "[::1]", "[::1]:*", "*"],
    fallback,
    protocol: "http",
  };
}

/** Loopback origins only — Sonar S5332 exempts localhost / 127.0.0.1 / ::1. */
function addDevLoopbackOrigins(origins: Set<string>): void {
  for (const port of DEV_LOOPBACK_PORTS) {
    origins.add(`https://localhost:${port}`);
    origins.add(`https://127.0.0.1:${port}`);
    origins.add(`https://[::1]:${port}`);
  }
}

export function getAuthTrustedOrigins(request?: Request): string[] {
  const origins = new Set<string>();

  try {
    origins.add(new URL(getAuthAppUrl()).origin);
  } catch {
    origins.add(DEFAULT_APP_URL);
  }

  if (process.env.NODE_ENV !== "production") {
    addDevLoopbackOrigins(origins);
    origins.add("https://*");
    // LAN Network URL (e.g. 172.x) and any other local origin come from
    // the request — avoid a blanket http://* allowlist (Sonar S5332).
    const header = request?.headers.get("origin") || request?.headers.get("referer");
    if (header) {
      try {
        origins.add(new URL(header).origin);
      } catch {
        origins.add(header);
      }
    }
  }

  const extra = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  if (extra) {
    for (const origin of extra.split(",")) {
      const trimmed = origin.trim();
      if (trimmed) origins.add(trimmed);
    }
  }

  return [...origins];
}
