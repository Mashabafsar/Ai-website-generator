/**
 * Send one SMTP test message using the configured env.
 * Run: npm run mail:test
 * Never prints credentials.
 */

import { env } from "@/lib/env";
import { sendEmail } from "@/lib/notify/email";

const DEFAULT_TO = "zrwc5.test@inbox.testmail.app";

async function main(): Promise<void> {
  const to = process.argv[2]?.trim() || DEFAULT_TO;

  if (!env.notify.enabled) {
    console.error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and optionally NOTIFY_FROM_EMAIL.");
    process.exitCode = 1;
    return;
  }

  const sent = await sendEmail({
    to,
    subject: "Agency Partner SMTP test",
    text: "This is a test from the website builder SMTP mailer.",
    html: "<p>This is a test from the website builder SMTP mailer.</p>",
  });

  if (!sent) {
    console.error(`Could not send the test email to ${to}.`);
    process.exitCode = 1;
    return;
  }

  const host = env.notify.smtpHost;
  console.log(`SMTP accepted the message for ${to} via ${host}:${env.notify.smtpPort}.`);
  if (host.includes("sandbox.smtp.mailtrap.io")) {
    console.log(
      "This host is Mailtrap sandbox. It keeps the email in your Mailtrap inbox and does not deliver it to testmail.app or any real address. Open https://mailtrap.io/inboxes to read it, or switch SMTP_HOST to a sending SMTP if you need it to arrive at the To address."
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
