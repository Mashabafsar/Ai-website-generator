import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

// Admin gate for internal tools (e.g. the AI usage ledger). Access is strictly
// limited to admins — there is NO development bypass.
//
// An account is an admin if any of these is true:
//   1. its email is in the bootstrap allowlist below, or
//   2. its email is in ADMIN_EMAILS, or
//   3. its User.isAdmin flag is set (grant via `npm run admin:grant <email>`).

const BOOTSTRAP_ADMIN_EMAILS = ["admin@admin.com"];

/** Synchronous email-only check (allowlists). */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return BOOTSTRAP_ADMIN_EMAILS.includes(e) || env.admin.emails.includes(e);
}

/** Full check: allowlisted email OR the DB isAdmin flag. */
export async function isAdmin(
  userId?: string | null,
  email?: string | null
): Promise<boolean> {
  if (isAdminEmail(email)) return true;
  if (!userId) return false;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });
  return Boolean(user?.isAdmin);
}
