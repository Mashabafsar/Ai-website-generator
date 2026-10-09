import type { SiteContact } from "@/lib/blueprint/types";

export const SOCIAL_NETWORKS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourbusiness" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/yourbusiness" },
  { key: "twitter", label: "X (Twitter)", placeholder: "https://x.com/yourbusiness" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourbusiness" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourbusiness" },
] as const;

export type SocialNetworkKey = (typeof SOCIAL_NETWORKS)[number]["key"];

export type SiteSocial = Partial<Record<SocialNetworkKey, string>>;

const LABEL_TO_KEY: Record<string, SocialNetworkKey> = {
  instagram: "instagram",
  ig: "instagram",
  linkedin: "linkedin",
  "linked in": "linkedin",
  in: "linkedin",
  twitter: "twitter",
  "twitter (x)": "twitter",
  "x (twitter)": "twitter",
  x: "twitter",
  facebook: "facebook",
  fb: "facebook",
  youtube: "youtube",
  yt: "youtube",
};

/** Add https:// when the visitor pasted a bare domain or handle path. */
export function normalizeExternalUrl(raw: string | undefined | null): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  if (/^(mailto|tel|sms):/i.test(value)) return value;
  if (value.startsWith("#") || value.startsWith("/")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[\w.-]+/.test(value)) return `https://${value}`;
  return undefined;
}

export function socialFromContact(contact?: SiteContact | null): SiteSocial {
  return contact?.social ?? {};
}

export function socialHref(
  contact: SiteContact | null | undefined,
  key: SocialNetworkKey
): string | undefined {
  return normalizeExternalUrl(contact?.social?.[key]);
}

/** Resolve a display label ("Instagram", "X") to a live URL when configured. */
export function socialHrefForLabel(
  contact: SiteContact | null | undefined,
  label: string
): string | undefined {
  const key = LABEL_TO_KEY[label.trim().toLowerCase()];
  return key ? socialHref(contact, key) : undefined;
}

export function mailtoHref(contact?: SiteContact | null): string | undefined {
  const email = contact?.email?.trim();
  return email ? `mailto:${email}` : undefined;
}

export function telHref(contact?: SiteContact | null): string | undefined {
  const phone = contact?.phone?.trim();
  if (!phone) return undefined;
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Primary action href: mailto when available, otherwise an in-page contact
 * anchor the template already exposes.
 */
export function primaryCtaHref(
  contact: SiteContact | null | undefined,
  fallbackAnchor: string
): string {
  return mailtoHref(contact) || fallbackAnchor;
}

/** Networks that have a usable URL, in catalog order. */
export function configuredSocialLinks(
  contact?: SiteContact | null
): { key: SocialNetworkKey; label: string; href: string }[] {
  const out: { key: SocialNetworkKey; label: string; href: string }[] = [];
  for (const network of SOCIAL_NETWORKS) {
    const href = socialHref(contact, network.key);
    if (href) out.push({ key: network.key, label: network.label, href });
  }
  return out;
}

/** Merge editor/questionnaire social maps; empty strings clear a key. */
export function mergeSocial(
  base: SiteSocial | undefined,
  patch: SiteSocial | undefined
): SiteSocial | undefined {
  const next: SiteSocial = { ...(base ?? {}) };
  if (patch) {
    for (const network of SOCIAL_NETWORKS) {
      if (patch[network.key] === undefined) continue;
      const normalized = normalizeExternalUrl(patch[network.key]);
      if (normalized) next[network.key] = normalized;
      else delete next[network.key];
    }
  }
  return Object.keys(next).length ? next : undefined;
}

export function buildSiteContact(input: {
  email?: string;
  phone?: string;
  address?: string;
  social?: SiteSocial;
}): SiteContact | undefined {
  const email = input.email?.trim() || undefined;
  const phone = input.phone?.trim() || undefined;
  const address = input.address?.trim() || undefined;
  const social = mergeSocial(undefined, input.social);
  if (!email && !phone && !address && !social) return undefined;
  return { email, phone, address, social };
}

/** Loose URL check for form fields (allows empty). */
export function isOptionalUrl(value: string): boolean {
  if (!value.trim()) return true;
  return Boolean(normalizeExternalUrl(value));
}
