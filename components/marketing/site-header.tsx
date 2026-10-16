import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="Agency Partner Interactive home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
          <a href="/#how" className="transition-colors hover:text-ink">How it works</a>
          <a href="/#sections" className="transition-colors hover:text-ink">Sections</a>
          <a href="/#pricing" className="transition-colors hover:text-ink">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="brand">
            <Link href="/signup">Start building</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
