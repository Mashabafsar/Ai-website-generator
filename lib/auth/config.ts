/** Shared Better Auth URL + origin settings (server-only). */

const DEFAULT_APP_URL = "http://localhost:3000";

export function getAuthAppUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_APP_URL
  );
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

  return {
    allowedHosts: ["localhost", "localhost:*", "127.0.0.1", "127.0.0.1:*", "[::1]", "[::1]:*"],
    fallback,
    protocol: "http",
  };
}

export function getAuthTrustedOrigins(): string[] {
  const origins = new Set<string>();

  try {
    origins.add(new URL(getAuthAppUrl()).origin);
  } catch {
    origins.add(DEFAULT_APP_URL);
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:*");
    origins.add("http://127.0.0.1:*");
    origins.add("http://[::1]:*");
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
