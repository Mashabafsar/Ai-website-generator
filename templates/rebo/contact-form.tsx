"use client";

import { useState, type FormEvent } from "react";
import { RB } from "./tokens";

const A = "/templates/rebo";

type Props = {
  ctaLabel: string;
  contactEmail: string;
};

/**
 * Real contact fields for the Rebo contact page. The Figma frame used
 * underline-only labels with no inputs; those could not be typed into.
 */
export function ReboContactForm({ ctaLabel, contactEmail }: Props) {
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

  return (
    <form className="flex w-full flex-col items-center gap-[53px]" onSubmit={onSubmit}>
      <div className="grid w-full gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-3 text-[18px]" style={{ color: "#7E7E7E" }}>
          Your Name
          <input
            name="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-0 border-b border-black bg-transparent pb-2 text-[18px] text-black outline-none placeholder:text-[#B0B0B0]"
            placeholder="Jane Doe"
          />
        </label>
        <label className="flex flex-col gap-3 text-[18px]" style={{ color: "#7E7E7E" }}>
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-0 border-b border-black bg-transparent pb-2 text-[18px] text-black outline-none placeholder:text-[#B0B0B0]"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="flex w-full flex-col gap-3 text-[18px]" style={{ color: "#7E7E7E" }}>
        Message
        <textarea
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-32 w-full resize-y border-0 border-b border-black bg-transparent pb-2 text-[18px] text-black outline-none placeholder:text-[#B0B0B0]"
          placeholder="How can we help?"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 px-[18px] py-3 text-[15px] font-semibold text-white"
        style={{ backgroundColor: RB.brand }}
      >
        {ctaLabel || "Send Message"}
        <img src={`${A}/arrow-up-right.svg`} alt="" width={20} height={20} className="size-5" />
      </button>
      {sent && (
        <p className="text-center text-[15px]" style={{ color: "#7E7E7E" }}>
          {contactEmail.trim()
            ? "Your email app should open with this message ready to send."
            : "Thanks — your message is ready. Add a contact email in the questionnaire so visitors can reach you."}
        </p>
      )}
    </form>
  );
}
