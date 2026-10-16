import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white text-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-14 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-ink-muted">
            AI-written websites from a finished design — built for you, saved for you,
            and ready to go live.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm text-ink-muted">
          <Link href="/signup" className="hover:text-ink">Get started</Link>
          <Link href="/login" className="hover:text-ink">Log in</Link>
          <a href="/#pricing" className="hover:text-ink">Pricing</a>
          <a href="/#how" className="hover:text-ink">How it works</a>
        </div>
      </div>
      <div className="border-t border-line py-6 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} Agency Partner Interactive. All rights reserved.
      </div>
    </footer>
  );
}
