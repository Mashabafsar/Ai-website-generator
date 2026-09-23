import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { templateFaces } from "@/templates/shared/template-faces";

const faces = templateFaces([
  { family: "Sora", variable: "--font-sora" },
  { family: "Space Grotesk", variable: "--font-space-grotesk" },
  { family: "Onest", variable: "--font-onest" },
]);

export const metadata: Metadata = {
  title: {
    default: "Agency Partner Interactive — AI Website Builder",
    template: "%s | Agency Partner Interactive",
  },
  description:
    "Answer a few questions and Agency Partner Interactive's AI builds a launch-ready website: real pages, real words, real photos — then download your files or we put it online.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/brand/favicon.png", type: "image/png" },
    ],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={faces.style} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href={faces.href} />
      </head>
      <body>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
