import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CreditBalance } from "@/components/app/credit-balance";
import { UserMenu } from "@/components/app/user-menu";

export function AppHeader({
  user,
  balance,
}: {
  user: { name: string; email: string };
  balance: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/app/dashboard" aria-label="Dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <CreditBalance balance={balance} />
          <UserMenu name={user.name} email={user.email} />
        </div>
      </div>
    </header>
  );
}
