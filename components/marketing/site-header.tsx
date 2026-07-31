import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" aria-label="Agency Partner Interactive home">
          <Logo onDark />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
          <a href="#how" className="transition-colors hover:text-white">How it works</a>
          <a href="#sections" className="transition-colors hover:text-white">Sections</a>
          <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
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
