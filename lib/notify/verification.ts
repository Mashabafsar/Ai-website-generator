import { sendEmail, type OutboundEmail } from "@/lib/notify/email";
import { escapeHtml } from "@/lib/notify/html";

export type VerificationEmailInput = {
  to: string;
  name?: string;
  url: string;
};

export function buildVerificationEmail(input: VerificationEmailInput): OutboundEmail {
  const name = input.name?.trim() || "there";
  const subject = "Verify your email";
  const text = [
    `Hi ${name},`,
    "",
    "Confirm this email to finish creating your Agency Partner account.",
    input.url,
    "",
    "This link expires. If you did not create an account, you can ignore this email.",
  ].join("\n");
  const html = `<p>Hi ${escapeHtml(name)},</p>
<p>Confirm this email to finish creating your Agency Partner account.</p>
<p><a href="${escapeHtml(input.url)}">Verify email address</a></p>
<p>This link expires. If you did not create an account, you can ignore this email.</p>`;

  return { to: input.to, subject, text, html };
}

export async function sendAccountVerificationEmail(
  input: VerificationEmailInput
): Promise<boolean> {
  const sent = await sendEmail(buildVerificationEmail(input));
  if (!sent && process.env.NODE_ENV !== "production") {
    console.info("Verification email skipped — SMTP is not configured.");
  }
  return sent;
}
