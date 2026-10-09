import type { SiteContact } from "@/lib/blueprint/types";
import {
  SOCIAL_NETWORKS,
  configuredSocialLinks,
  socialHref,
  socialHrefForLabel,
  type SocialNetworkKey,
} from "@/lib/contact/links";

function esc(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function socialTextLinksHtml(
  contact: SiteContact | null | undefined,
  opts: {
    linkClassName?: string;
    labels?: string[];
    showEmptyAsText?: boolean;
  } = {}
): string {
  const linkClass = opts.linkClassName ?? "";
  const items = opts.labels?.length
    ? opts.labels.map((label) => ({
        key: label,
        label,
        href: socialHrefForLabel(contact, label),
      }))
    : configuredSocialLinks(contact).map((l) => ({
        key: l.key,
        label: l.label,
        href: l.href as string | undefined,
      }));

  const visible = opts.showEmptyAsText ? items : items.filter((i) => i.href);
  return visible
    .map((item) =>
      item.href
        ? `<a href="${esc(item.href)}" target="_blank" rel="noopener noreferrer" class="${esc(linkClass)}">${esc(item.label)}</a>`
        : `<span class="${esc(linkClass)}">${esc(item.label)}</span>`
    )
    .join("");
}

export function socialIconLinksHtml(
  contact: SiteContact | null | undefined,
  icons: Partial<Record<SocialNetworkKey, string>>,
  opts: {
    linkClassName?: string;
    imgClassName?: string;
    width?: number;
    height?: number;
    order?: SocialNetworkKey[];
  } = {}
): string {
  const width = opts.width ?? 40;
  const height = opts.height ?? 40;
  const linkClass = opts.linkClassName ?? "";
  const imgClass = opts.imgClassName ?? "";
  const keys = opts.order ?? SOCIAL_NETWORKS.map((n) => n.key);
  return keys
    .map((key) => {
      const network = SOCIAL_NETWORKS.find((n) => n.key === key);
      const href = socialHref(contact, key);
      const src = icons[key];
      if (!network || !href || !src) return "";
      return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(network.label)}" class="${esc(linkClass)}"><img src="${esc(src)}" alt="" width="${width}" height="${height}" class="${esc(imgClass)}" /></a>`;
    })
    .join("");
}
