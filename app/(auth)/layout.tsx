import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo, BrandMark } from "@/components/brand/logo";
import { AFTER_AUTH_PATH, sessionCanEnterApp } from "@/lib/auth/email-gate";
import { getCurrentSession } from "@/lib/auth/session";
import { env } from "@/lib/env";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getCurrentSession();
  if (sessionCanEnterApp(session?.user, env.notify.smtpEnabled)) {
    redirect(AFTER_AUTH_PATH);
  }

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
            Log in to write, edit, and finish your website — then download the files or
            put it online.
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
