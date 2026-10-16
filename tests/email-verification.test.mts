import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { isSmtpConfigured, isSmtpSecure, parseSmtpPort, resolveSmtpFrom } =
  await import("../lib/notify/config");
const { escapeHtml, maskEmail } = await import("../lib/notify/html");
const { buildVerificationEmail } = await import("../lib/notify/verification");
const {
  isUnverifiedEmailError,
  sessionCanEnterApp,
  verifyEmailPath,
} = await import("../lib/auth/email-gate");

describe("SMTP / notify flags", () => {
  it("enables SMTP only when host and from are both set", () => {
    assert.equal(isSmtpConfigured({ host: "smtp.example.com", fromEmail: "hi@example.com" }), true);
    assert.equal(isSmtpConfigured({ host: "smtp.example.com", smtpUser: "hi@example.com" }), true);
    assert.equal(isSmtpConfigured({ host: "smtp.example.com", fromEmail: "" }), false);
    assert.equal(isSmtpConfigured({ host: "", fromEmail: "hi@example.com" }), false);
    assert.equal(isSmtpConfigured({}), false);
    assert.equal(resolveSmtpFrom({ smtpUser: "hi@example.com" }), "hi@example.com");
    assert.equal(
      resolveSmtpFrom({ fromEmail: "from@example.com", smtpUser: "hi@example.com" }),
      "from@example.com"
    );
  });

  it("parses SMTP port and secure defaults", () => {
    assert.equal(parseSmtpPort(undefined), 587);
    assert.equal(parseSmtpPort("465"), 465);
    assert.equal(parseSmtpPort("nope"), 587);
    assert.equal(isSmtpSecure(465), true);
    assert.equal(isSmtpSecure(587), false);
    assert.equal(isSmtpSecure(2525, "true"), false);
    assert.equal(isSmtpSecure(465, "0"), false);
  });
});

describe("verification email", () => {
  const url = "https://app.example/api/auth/verify-email?token=abc&callbackURL=/app/templates";

  it("includes the verify URL in text and html", () => {
    const mail = buildVerificationEmail({
      to: "ada@example.com",
      name: "Ada",
      url,
    });
    assert.equal(mail.to, "ada@example.com");
    assert.equal(mail.subject, "Verify your email");
    assert.ok(mail.text.includes(url));
    assert.ok(mail.html.includes(escapeHtml(url)));
    assert.ok(mail.text.includes("Ada"));
  });

  it("escapes the name and URL in HTML", () => {
    const mail = buildVerificationEmail({
      to: "ada@example.com",
      name: `<script>alert(1)</script>`,
      url: `https://ok.example/verify?q="><img src=x>`,
    });
    assert.ok(mail.html.includes("&lt;script&gt;"));
    assert.equal(mail.html.includes("<script>"), false);
    assert.ok(mail.html.includes("&quot;"));
    assert.equal(mail.html.includes(`q=">`), false);
  });

  it("does not embed mailer secrets", () => {
    const mail = buildVerificationEmail({
      to: "ada@example.com",
      name: "Ada",
      url,
    });
    const body = `${mail.subject}\n${mail.text}\n${mail.html}`;
    assert.equal(body.includes("SMTP_PASS"), false);
    assert.equal(body.includes("BETTER_AUTH_SECRET"), false);
  });
});

describe("email helpers", () => {
  it("masks the local part of an address", () => {
    assert.equal(maskEmail("jane@company.com"), "j***@company.com");
    assert.equal(maskEmail("  a@b.co  "), "a***@b.co");
    assert.equal(maskEmail("not-an-email"), "not-an-email");
  });

  it("escapes HTML reserved characters", () => {
    assert.equal(escapeHtml(`&<>"`), "&amp;&lt;&gt;&quot;");
  });
});

describe("auth email gate", () => {
  it("lets anyone with a session in when SMTP is off", () => {
    assert.equal(sessionCanEnterApp({ emailVerified: false }, false), true);
    assert.equal(sessionCanEnterApp(null, false), false);
  });

  it("blocks unverified sessions when SMTP is on", () => {
    assert.equal(sessionCanEnterApp({ emailVerified: false }, true), false);
    assert.equal(sessionCanEnterApp({ emailVerified: true }, true), true);
  });

  it("detects Better Auth unverified-email errors", () => {
    assert.equal(isUnverifiedEmailError({ code: "EMAIL_NOT_VERIFIED" }), true);
    assert.equal(isUnverifiedEmailError({ message: "Email not verified" }), true);
    assert.equal(isUnverifiedEmailError({ message: "Invalid password" }), false);
    assert.equal(isUnverifiedEmailError(null), false);
  });

  it("builds the check-inbox path", () => {
    assert.equal(verifyEmailPath(), "/verify-email");
    assert.equal(
      verifyEmailPath("ada@example.com", true),
      "/verify-email?email=ada%40example.com&unverified=1"
    );
  });
});
