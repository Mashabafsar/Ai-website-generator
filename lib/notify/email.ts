import { env } from "@/lib/env";

export type OutboundEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Send a transactional email via Resend. Missing config or API errors are
 * logged and never thrown — delivery notify must not fail export/deploy.
 */
export async function sendEmail(message: OutboundEmail): Promise<boolean> {
  if (!env.notify.enabled) {
    console.info("Owner notify skipped — RESEND_API_KEY or NOTIFY_FROM_EMAIL is not set.");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.notify.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.notify.fromEmail,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`Resend ${res.status}: ${body.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Owner email failed:", err);
    return false;
  }
}
