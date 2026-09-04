import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo, BrandMark } from "@/components/brand/logo";
import { getCurrentUserId } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  if (userId) redirect("/app/templates");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-primary-surface p-12 lg:flex">
        <Link href="/" className="relative">
          <Logo />
        </Link>
        <div className="relative">
          <BrandMark className="h-14 w-auto" />
          <h2 className="mt-6 max-w-md font-display text-4xl font-bold leading-tight text-ink">
            Your next website is a few questions away.
          </h2>
          <p className="mt-4 max-w-sm text-ink-muted">
            Sign in to generate, edit, and ship a complete site — versioned on GitHub and
            ready to deploy.
          </p>
        </div>
        <div className="relative text-sm text-ink-muted">
          © {new Date().getFullYear()} Agency Partner Interactive
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
