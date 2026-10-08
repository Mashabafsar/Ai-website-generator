"use client";

import { useState, type FormEvent } from "react";
import { FL } from "./tokens";

type Props = {
  ctaLabel: string;
  contactEmail: string;
  address?: string;
};

/**
 * Real contact fields for Forge Lime. The Figma frame used placeholder
 * spans that looked like inputs but could not be typed into.
 */
export function ForgeLimeContactForm({ ctaLabel, contactEmail, address }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const to = contactEmail.trim();
    if (to) {
      const subject = encodeURIComponent(`Message from ${name.trim() || "website visitor"}`);
      const body = encodeURIComponent(
        [`Name: ${name.trim()}`, `Email: ${email.trim()}`, "", question.trim()].join("\n")
      );
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    }
    setSent(true);
  }

  return (
    <form className="mt-8 space-y-7" onSubmit={onSubmit}>
      <label className="block">
        <span className="mb-2 block text-base" style={{ color: FL.ink }}>
          Full Name
        </span>
        <input
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full rounded-xl border bg-transparent px-6 py-5 text-base outline-none placeholder:opacity-50"
          style={{ borderColor: "color-mix(in oklab, var(--theme-fg, #F1FBE8) 30%, transparent)", color: FL.ink }}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-base" style={{ color: FL.ink }}>
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
          className="w-full rounded-xl border bg-transparent px-6 py-5 text-base outline-none placeholder:opacity-50"
          style={{ borderColor: "color-mix(in oklab, var(--theme-fg, #F1FBE8) 30%, transparent)", color: FL.ink }}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-base" style={{ color: FL.ink }}>
          Question
        </span>
        <textarea
          name="question"
          required
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="How can we help you?"
          className="min-h-[5.5rem] w-full resize-y rounded-xl border bg-transparent px-6 py-5 text-base outline-none placeholder:opacity-50"
          style={{ borderColor: "color-mix(in oklab, var(--theme-fg, #F1FBE8) 30%, transparent)", color: FL.ink }}
        />
      </label>
      <button
        type="submit"
        className="inline-block rounded-xl px-8 py-5 text-base font-bold"
        style={{ backgroundColor: FL.brand, color: FL.onLight }}
      >
        {ctaLabel || "Send a Question"}
      </button>
      {address ? (
        <p className="text-sm opacity-65" style={{ color: FL.ink }}>
          {address}
        </p>
      ) : null}
      {sent ? (
        <p className="text-sm" style={{ color: FL.body }}>
          {contactEmail.trim()
            ? "Your email app should open with this message ready to send."
            : "Thanks — your message is ready. Add a contact email in the questionnaire so visitors can reach you."}
        </p>
      ) : null}
    </form>
  );
}
