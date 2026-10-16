/** Pure SMTP flags so tests do not have to import the live env object. */

export function isSmtpConfigured(input: {
  host?: string | null;
  fromEmail?: string | null;
  smtpUser?: string | null;
}): boolean {
  const from = input.fromEmail?.trim() || input.smtpUser?.trim();
  return Boolean(input.host?.trim() && from);
}

export function resolveSmtpFrom(input: {
  fromEmail?: string | null;
  smtpUser?: string | null;
}): string {
  return input.fromEmail?.trim() || input.smtpUser?.trim() || "";
}

export function parseSmtpPort(value: string | undefined, fallback = 587): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Implicit TLS (nodemailer `secure`) is only for 465. Other ports use STARTTLS. */
export function isSmtpSecure(port: number, explicit?: string): boolean {
  if (explicit === "false" || explicit === "0") return false;
  return port === 465;
}
