import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-brand-navy text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-14 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Logo onDark />
          <p className="max-w-sm text-sm text-white/60">
            AI-generated websites, assembled from a curated component system — built,
            versioned on GitHub, and ready to ship.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm text-white/70">
          <Link href="/signup" className="hover:text-white">Get started</Link>
          <Link href="/login" className="hover:text-white">Log in</Link>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#how" className="hover:text-white">How it works</a>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Agency Partner Interactive. All rights reserved.
      </div>
    </footer>
  );
}
