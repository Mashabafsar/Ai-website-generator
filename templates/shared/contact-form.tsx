"use client";

import { useState, type CSSProperties, type FormEvent } from "react";

export type TemplateContactFormProps = {
  contactEmail: string;
  ctaLabel?: string;
  className?: string;
  /** Optional style overrides so each design can match its tokens. */
  style?: CSSProperties;
  inputStyle?: CSSProperties;
  buttonStyle?: CSSProperties;
  labelStyle?: CSSProperties;
};

/**
 * Shared working contact form for bespoke templates. Submits via mailto when
 * the business has an email; still accepts input when it does not.
 */
export function TemplateContactForm({
  contactEmail,
  ctaLabel = "Send message",
  className,
  style,
  inputStyle,
  buttonStyle,
  labelStyle,
}: TemplateContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const to = contactEmail.trim();
    if (to) {
      const subject = encodeURIComponent(`Message from ${name.trim() || "website visitor"}`);
      const body = encodeURIComponent(
        [`Name: ${name.trim()}`, `Email: ${email.trim()}`, "", message.trim()].join("\n")
      );
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    }
    setSent(true);
  }

  const field: CSSProperties = {
    width: "100%",
    borderRadius: "0.75rem",
    border: "1px solid color-mix(in oklab, currentColor 22%, transparent)",
    background: "transparent",
    padding: "0.875rem 1.125rem",
    fontSize: "1rem",
    outline: "none",
    ...inputStyle,
  };

  return (
    <form
      className={className ?? "mt-8 max-w-xl space-y-4 text-left"}
      style={style}
      onSubmit={onSubmit}
      data-template-contact-form="1"
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium" style={labelStyle}>
          Name
        </span>
        <input
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          style={field}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium" style={labelStyle}>
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={field}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium" style={labelStyle}>
          Message
        </span>
        <textarea
          name="message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          style={{ ...field, minHeight: "6.5rem", resize: "vertical" }}
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold"
        style={{
          backgroundColor: "var(--brand, currentColor)",
          color: "var(--on-brand, #fff)",
          ...buttonStyle,
        }}
      >
        {ctaLabel}
      </button>
      {sent ? (
        <p className="text-sm opacity-80">
          {contactEmail.trim()
            ? "Your email app should open with this message ready to send."
            : "Thanks — your message is ready. Add a contact email in the questionnaire so visitors can reach you."}
        </p>
      ) : null}
    </form>
  );
}
