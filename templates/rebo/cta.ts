/**
 * Rebo's Figma demo used agency CTAs ("Book a free consultant"). When a
 * generated site still carries those phrases for a non-agency business,
 * rewrite them so a bakery does not ask visitors to book a consultation.
 */

const AGENCY_CTA =
  /\b(book\s+a\s+free\s+consultant|book\s+a\s+(free\s+)?consultation|let'?s\s+start\s+a\s+project|start\s+a\s+project\s+together|bring\s+your\s+vision\s+into\s+reality)\b/i;

const AGENCY_INDUSTRY =
  /\b(agency|consult|design\s+studio|marketing|advertis|branding\s+studio|law\s+firm|attorney|clinic|dental|dentist|therap|coach|architect)\b/i;

const ORDER_INDUSTRY =
  /\b(baker|bakery|cafe|café|coffee|food|restaurant|cater|deli|pastry|dessert|pizza|grocery)\b/i;

export function industryAwareCta(label: string | undefined, industry: string | undefined, fallback = "Get in touch"): string {
  const raw = (label || "").trim() || fallback;
  const industryText = industry || "";
  if (!AGENCY_CTA.test(raw)) return raw;
  if (AGENCY_INDUSTRY.test(industryText)) return raw;
  if (ORDER_INDUSTRY.test(industryText)) return "Contact us for your order";
  return fallback;
}

export function industryAwareContactHeading(
  heading: string | undefined,
  industry: string | undefined,
  fallback = "Get in touch"
): string {
  return industryAwareCta(heading, industry, fallback);
}
