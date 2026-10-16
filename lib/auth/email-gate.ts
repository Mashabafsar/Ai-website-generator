export const AFTER_AUTH_PATH = "/app/templates";

/** Whether a signed-in user may enter /app. SMTP off keeps today's open signup. */
export function sessionCanEnterApp(
  user: { emailVerified?: boolean } | null | undefined,
  smtpEnabled: boolean
): boolean {
  if (!user) return false;
  if (!smtpEnabled) return true;
  return user.emailVerified !== false;
}

export function isUnverifiedEmailError(
  error: { message?: string | null; code?: string | null } | null | undefined
): boolean {
  if (!error) return false;
  const haystack = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  return haystack.includes("verif");
}

export function verifyEmailPath(email?: string, unverified = false): string {
  const params = new URLSearchParams();
  const trimmed = email?.trim();
  if (trimmed) params.set("email", trimmed);
  if (unverified) params.set("unverified", "1");
  const query = params.toString();
  return query ? `/verify-email?${query}` : "/verify-email";
}
