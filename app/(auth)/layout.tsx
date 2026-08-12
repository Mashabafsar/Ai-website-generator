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
      <div className="hero-aurora relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="grid-texture absolute inset-0 opacity-40" />
        <Link href="/" className="relative">
          <Logo onDark />
        </Link>
        <div className="relative">
          <BrandMark className="h-14 w-auto" />
          <h2 className="mt-6 max-w-md font-display text-4xl font-bold leading-tight text-white">
            Your next website is a few questions away.
          </h2>
          <p className="mt-4 max-w-sm text-white/60">
            Sign in to generate, edit, and ship a complete site — versioned on GitHub and
            ready to deploy.
          </p>
        </div>
        <div className="relative text-sm text-white/40">
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
