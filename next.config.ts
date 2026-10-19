import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

// Read at build time, so the Docker build passes S3_PUBLIC_URL as a build arg.
function mediaRemotePattern(): RemotePattern[] {
  const raw = process.env.S3_PUBLIC_URL?.trim();
  if (!raw) return [];
  let url: URL;
  try {
    url = new URL(raw);
  } catch (err) {
    console.warn(`[next.config] Ignoring invalid S3_PUBLIC_URL "${raw}":`, err);
    return [];
  }
  return [
    {
      protocol: url.protocol === "http:" ? "http" : "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
    },
  ];
}

// HSTS is set by Caddy, which owns TLS.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["@cursor/sdk", "@prisma/client", "archiver", "sharp"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "image.shutterstock.com" },
      { protocol: "https", hostname: "www.shutterstock.com" },
      { protocol: "https", hostname: "download.shutterstock.com" },
      ...mediaRemotePattern(),
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // The SQLite database, uploads and exports all live inside the project,
      // so every signup or save would otherwise trip the dev file watcher and
      // trigger a Fast Refresh in the middle of a navigation.
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/prisma/*.db",
          "**/prisma/*.db-journal",
          "**/public/uploads/**",
          "**/generated-projects/**",
          "**/tmp/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
