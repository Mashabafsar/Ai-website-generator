import type { Metadata } from "next";
import { Sora, Space_Grotesk, Onest } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// App-shell typeface (dashboard design system).
const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Agency Partner Interactive — AI Website Builder",
    template: "%s | Agency Partner Interactive",
  },
  description:
    "Answer a few questions and Agency Partner Interactive's AI builds a launch-ready website: real sections, real copy, real images — saved to GitHub and ready to deploy.",
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
    <html lang="en" className={`${sora.variable} ${spaceGrotesk.variable} ${onest.variable}`} suppressHydrationWarning>
      <body>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
