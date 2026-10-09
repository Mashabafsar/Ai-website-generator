function esc(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type ContactFormHtmlOptions = {
  contactEmail: string;
  ctaLabel?: string;
  /** Extra class on the form wrapper */
  className?: string;
  /** Inline styles for inputs */
  inputStyle?: string;
  /** Inline styles for the submit button */
  buttonStyle?: string;
};

/**
 * Static HTML + tiny script for exported / demo sites. Mirrors
 * TemplateContactForm: mailto when an email exists.
 */
export function contactFormHtml({
  contactEmail,
  ctaLabel = "Send message",
  className = "mt-8 max-w-xl space-y-4 text-left",
  inputStyle = "width:100%;border-radius:0.75rem;border:1px solid color-mix(in oklab, currentColor 22%, transparent);background:transparent;padding:0.875rem 1.125rem;font-size:1rem;outline:none",
  buttonStyle = "background:var(--brand, currentColor);color:var(--on-brand, #fff);border-radius:999px;padding:0.75rem 1.5rem;font-size:0.875rem;font-weight:600",
}: ContactFormHtmlOptions): string {
  const to = esc(contactEmail.trim());
  const label = esc(ctaLabel);
  return `<form data-template-contact-form="1" class="${esc(className)}" onsubmit="return window.__templateContactSubmit(event,'${to}')">
  <label class="block"><span class="mb-1.5 block text-sm font-medium">Name</span>
    <input name="name" required autocomplete="name" placeholder="Jane Doe" style="${esc(inputStyle)}" /></label>
  <label class="block"><span class="mb-1.5 block text-sm font-medium">Email</span>
    <input name="email" type="email" required autocomplete="email" placeholder="you@example.com" style="${esc(inputStyle)}" /></label>
  <label class="block"><span class="mb-1.5 block text-sm font-medium">Message</span>
    <textarea name="message" required rows="4" placeholder="How can we help?" style="${esc(inputStyle)};min-height:6.5rem;resize:vertical"></textarea></label>
  <button type="submit" style="${esc(buttonStyle)}">${label}</button>
  <p data-contact-sent hidden class="text-sm opacity-80 mt-3"></p>
</form>`;
}

/** Inline script once per HTML document that uses contactFormHtml. */
export function contactFormScript(): string {
  return `<script>
window.__templateContactSubmit=function(event,to){
  event.preventDefault();
  var form=event.target;
  var name=(form.elements.namedItem("name")||{}).value||"";
  var email=(form.elements.namedItem("email")||{}).value||"";
  var message=(form.elements.namedItem("message")||{}).value||"";
  if(to){
    var subject=encodeURIComponent("Message from "+(name.trim()||"website visitor"));
    var body=encodeURIComponent(["Name: "+name.trim(),"Email: "+email.trim(),"",message.trim()].join("\\n"));
    window.location.href="mailto:"+to+"?subject="+subject+"&body="+body;
  }
  var note=form.querySelector("[data-contact-sent]");
  if(note){
    note.hidden=false;
    note.textContent=to
      ?"Your email app should open with this message ready to send."
      :"Thanks — your message is ready. Add a contact email in the questionnaire so visitors can reach you.";
  }
  return false;
};
<\/script>`;
}
