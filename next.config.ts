import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["@cursor/sdk", "@prisma/client", "archiver"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "image.shutterstock.com" },
      { protocol: "https", hostname: "www.shutterstock.com" },
      { protocol: "https", hostname: "download.shutterstock.com" },
    ],
  },
  async headers() {
    return [
      {
        // Uploaded and imported assets are third-party bytes served from our
        // own origin. An SVG logo would otherwise be a same-origin script.
        source: "/uploads/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
          },
        ],
      },
    ];
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
