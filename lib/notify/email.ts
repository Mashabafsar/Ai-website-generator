import nodemailer from "nodemailer";
import { env } from "@/lib/env";

export type OutboundEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Send a transactional email over SMTP.
 * Missing config or delivery errors are logged and never thrown — notify
 * must not fail signup, export, or deploy.
 */
export async function sendEmail(message: OutboundEmail): Promise<boolean> {
  if (!env.notify.enabled) {
    console.info("Outbound email skipped — SMTP_HOST and a From address are not set.");
    return false;
  }

  try {
    const transport = nodemailer.createTransport({
      host: env.notify.smtpHost,
      port: env.notify.smtpPort,
      secure: env.notify.smtpSecure,
      requireTLS: !env.notify.smtpSecure,
      auth: env.notify.smtpUser
        ? { user: env.notify.smtpUser, pass: env.notify.smtpPass }
        : undefined,
    });
    await transport.sendMail({
      from: env.notify.fromEmail,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return true;
  } catch (err) {
    console.error("SMTP email failed:", err instanceof Error ? err.message : err);
    return false;
  }
}
