import type { CSSProperties, ReactNode } from "react";
import type { SiteContact } from "@/lib/blueprint/types";
import {
  SOCIAL_NETWORKS,
  configuredSocialLinks,
  socialHref,
  socialHrefForLabel,
  type SocialNetworkKey,
} from "@/lib/contact/links";

type TextProps = {
  contact?: SiteContact | null;
  className?: string;
  linkClassName?: string;
  style?: CSSProperties;
  /** Prefer these labels (and order) when present. Falls back to catalog order. */
  labels?: string[];
  /** When true, show labels without URLs as plain text (demo chrome). */
  showEmptyAsText?: boolean;
  emptyClassName?: string;
};

/**
 * Renders social profile text links. Only configured URLs become anchors
 * unless showEmptyAsText is set for demo chrome.
 */
export function SocialTextLinks({
  contact,
  className,
  linkClassName,
  style,
  labels,
  showEmptyAsText = false,
  emptyClassName,
}: TextProps) {
  const items = labels?.length
    ? labels.map((label) => ({
        key: label,
        label,
        href: socialHrefForLabel(contact, label),
      }))
    : configuredSocialLinks(contact).map((l) => ({
        key: l.key,
        label: l.label,
        href: l.href as string | undefined,
      }));

  const visible = showEmptyAsText ? items : items.filter((item) => item.href);
  if (visible.length === 0) return null;

  return (
    <div className={className} style={style}>
      {visible.map((item) =>
        item.href ? (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {item.label}
          </a>
        ) : (
          <span key={item.key} className={emptyClassName ?? linkClassName}>
            {item.label}
          </span>
        )
      )}
    </div>
  );
}

type IconMap = Partial<Record<SocialNetworkKey, string>>;

type IconProps = {
  contact?: SiteContact | null;
  /** Map network → icon asset. Only networks with both a URL and an icon render. */
  icons: IconMap;
  className?: string;
  linkClassName?: string;
  imgClassName?: string;
  imgWidth?: number;
  imgHeight?: number;
  order?: SocialNetworkKey[];
  renderIcon?: (key: SocialNetworkKey, src: string) => ReactNode;
};

/**
 * Icon row for templates that ship decorative social SVGs.
 */
export function SocialIconLinks({
  contact,
  icons,
  className,
  linkClassName,
  imgClassName,
  imgWidth = 40,
  imgHeight = 40,
  order,
  renderIcon,
}: IconProps) {
  const keys = order ?? SOCIAL_NETWORKS.map((n) => n.key);
  const items = keys
    .map((key) => {
      const network = SOCIAL_NETWORKS.find((n) => n.key === key);
      const href = socialHref(contact, key);
      const src = icons[key];
      if (!network || !href || !src) return null;
      return { key, label: network.label, href, src };
    })
    .filter(Boolean) as { key: SocialNetworkKey; label: string; href: string; src: string }[];

  if (items.length === 0) return null;

  return (
    <div className={className}>
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          className={linkClassName}
        >
          {renderIcon
            ? renderIcon(item.key, item.src)
            : // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt=""
                width={imgWidth}
                height={imgHeight}
                className={imgClassName}
              />}
        </a>
      ))}
    </div>
  );
}
