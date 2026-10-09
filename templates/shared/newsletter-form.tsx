"use client";

import { useState, type CSSProperties, type FormEvent } from "react";

type Props = {
  contactEmail: string;
  placeholder?: string;
  ctaLabel?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  inputStyle?: CSSProperties;
  buttonStyle?: CSSProperties;
};

/**
 * Working newsletter capture: opens mailto with the visitor's email so the
 * business can add them manually. Prefer this over decorative Subscribe buttons.
 */
export function NewsletterForm({
  contactEmail,
  placeholder = "you@example.com",
  ctaLabel = "Subscribe",
  className,
  inputClassName,
  buttonClassName,
  inputStyle,
  buttonStyle,
}: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const to = contactEmail.trim();
    const from = email.trim();
    if (to && from) {
      const subject = encodeURIComponent("Newsletter signup");
      const body = encodeURIComponent(`Please add this address to your list:\n\n${from}`);
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    }
    setSent(true);
  }

  return (
    <form className={className} onSubmit={onSubmit} data-template-newsletter-form="1">
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        style={inputStyle}
      />
      <button type="submit" className={buttonClassName} style={buttonStyle}>
        {ctaLabel}
      </button>
      {sent ? (
        <p className="mt-2 w-full text-sm opacity-80">
          {contactEmail.trim()
            ? "Your email app should open so you can send this signup."
            : "Add a contact email so visitors can reach you."}
        </p>
      ) : null}
    </form>
  );
}
