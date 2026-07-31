import type { CompanyLogo } from "@/lib/blueprint/types";

function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return "Co";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Generates a deterministic SVG wordmark / monogram logo for the business.
 * Stored as a data URL so static export works without extra assets.
 */
export function generateCompanyLogo(businessName: string, primaryColor: string): CompanyLogo {
  const initials = initialsFromName(businessName);
  const safeName = escapeXml(businessName.slice(0, 24));
  const color = primaryColor.startsWith("#") ? primaryColor : "#5D4AFE";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" role="img" aria-label="${safeName} logo">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.75"/>
    </linearGradient>
  </defs>
  <rect x="0" y="4" width="40" height="40" rx="10" fill="url(#g)"/>
  <text x="20" y="30" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="16" font-weight="700">${escapeXml(initials)}</text>
  <text x="52" y="30" fill="${color}" font-family="system-ui,sans-serif" font-size="15" font-weight="700">${safeName}</text>
</svg>`;

  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;

  return { initials, dataUrl, svg };
}
