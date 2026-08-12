import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CreditBalance } from "@/components/app/credit-balance";
import { UserMenu } from "@/components/app/user-menu";

const NAV = [
  { href: "/app/templates", label: "Templates" },
  { href: "/app/dashboard", label: "Dashboard" },
];

export function AppHeader({
  user,
  balance,
}: {
  user: { name: string; email: string };
  balance: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      {/* On narrow screens the navigation wraps onto its own row rather than
          disappearing — the template library is the app's entry point. */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/app/templates" aria-label="Template library" className="shrink-0">
          <Logo />
        </Link>
        <nav className="order-last flex w-full items-center gap-5 text-sm font-medium sm:order-none sm:mr-auto sm:w-auto sm:pl-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <CreditBalance balance={balance} />
          <UserMenu name={user.name} email={user.email} />
        </div>
      </div>
    </header>
  );
}
