// Generates the branded thumbnail/preview artwork shown on template library
// cards. Each image is a wireframe of that template's real section order, so the
// card previews the actual design rather than a generic placeholder.
//
// Usage: node scripts/generate-template-art.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const TEMPLATES = [
  {
    slug: "meridian",
    name: "Meridian",
    accent: "#5D4AFE",
    ink: "#0B1020",
    paper: "#FFFFFF",
    sections: [
      "hero-split-with-image",
      "about-with-image",
      "services-cards",
      "portfolio-case-studies",
      "process-steps",
      "testimonials-grid",
      "faq-accordion",
      "cta-banner",
      "contact-split",
      "footer-simple",
    ],
  },
  {
    slug: "aurora",
    name: "Aurora",
    accent: "#0EA5E9",
    ink: "#082F49",
    paper: "#F8FEFF",
    sections: [
      "hero-centered",
      "features-grid",
      "services-grid",
      "process-steps",
      "testimonials-grid",
      "pricing-tiers",
      "faq-accordion",
      "cta-banner",
      "contact-simple",
      "footer-simple",
    ],
  },
  {
    slug: "lumen",
    name: "Lumen",
    accent: "#0F172A",
    ink: "#0F172A",
    paper: "#FFFFFF",
    sections: [
      "hero-centered",
      "about-simple",
      "services-grid",
      "portfolio-case-studies",
      "testimonials-grid",
      "faq-accordion",
      "contact-simple",
      "footer-simple",
    ],
  },
  {
    slug: "verde",
    name: "Verde",
    accent: "#10B981",
    ink: "#052E20",
    paper: "#F7FDFA",
    sections: [
      "hero-background-image",
      "about-with-image",
      "services-grid",
      "features-grid",
      "testimonials-grid",
      "faq-accordion",
      "cta-banner",
      "contact-split",
      "footer-simple",
    ],
  },
  {
    slug: "noir",
    name: "Noir",
    accent: "#C084FC",
    ink: "#F5F3FF",
    paper: "#12101A",
    sections: [
      "hero-background-image",
      "about-with-image",
      "services-cards",
      "portfolio-case-studies",
      "testimonials-grid",
      "pricing-tiers",
      "cta-banner",
      "contact-split",
      "footer-simple",
    ],
  },
  {
    slug: "studio",
    name: "Studio",
    accent: "#F43F5E",
    ink: "#1F0A12",
    paper: "#FFF9FA",
    sections: [
      "hero-split-with-image",
      "portfolio-case-studies",
      "about-with-image",
      "services-grid",
      "process-steps",
      "testimonials-grid",
      "cta-banner",
      "contact-simple",
      "footer-simple",
    ],
  },
  {
    slug: "commerce",
    name: "Commerce",
    accent: "#1D4ED8",
    ink: "#0A1733",
    paper: "#FFFFFF",
    sections: [
      "hero-split-with-image",
      "products-grid",
      "features-grid",
      "about-simple",
      "pricing-tiers",
      "testimonials-grid",
      "faq-accordion",
      "cta-banner",
      "contact-split",
      "footer-simple",
    ],
  },
];

const W = 1600;
const H = 1000;
const PAD = 72;
const INNER = W - PAD * 2;

const alpha = (hex, a) => {
  const v = Math.round(Math.max(0, Math.min(1, a)) * 255);
  return `${hex}${v.toString(16).padStart(2, "0")}`;
};

const rect = (x, y, w, h, fill, r = 8) =>
  `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" rx="${r}" fill="${fill}"/>`;

const round = (n) => Math.round(n * 100) / 100;

function textLines(x, y, widths, height, gap, fill) {
  return widths
    .map((wFraction, i) => rect(x, y + i * (height + gap), INNER * wFraction, height, fill, height / 2))
    .join("");
}

function columns(x, y, w, h, count, gap, fill, radius = 10) {
  const colWidth = (w - gap * (count - 1)) / count;
  return Array.from({ length: count }, (_, i) =>
    rect(x + i * (colWidth + gap), y, colWidth, h, fill, radius)
  ).join("");
}

/** Draws one section band and returns [markup, heightConsumed]. */
function drawSection(variant, y, t) {
  const soft = alpha(t.ink, 0.08);
  const softer = alpha(t.ink, 0.05);
  const mid = alpha(t.ink, 0.16);
  const accentSoft = alpha(t.accent, 0.22);
  const x = PAD;

  switch (variant) {
    case "hero-split-with-image": {
      const h = 260;
      const half = (INNER - 28) / 2;
      return [
        rect(x, y, half, h, softer, 14) +
          textLines(x + 28, y + 46, [0.16, 0.26, 0.22], 20, 16, mid) +
          rect(x + 28, y + 176, 150, 40, t.accent, 20) +
          rect(x + half + 28, y, half, h, accentSoft, 14),
        h,
      ];
    }
    case "hero-centered": {
      const h = 250;
      return [
        rect(x, y, INNER, h, accentSoft, 14) +
          rect(x + INNER * 0.22, y + 66, INNER * 0.56, 30, alpha(t.ink, 0.25), 15) +
          rect(x + INNER * 0.3, y + 116, INNER * 0.4, 18, alpha(t.ink, 0.16), 9) +
          rect(x + INNER * 0.42, y + 168, INNER * 0.16, 42, t.accent, 21),
        h,
      ];
    }
    case "hero-background-image": {
      const h = 270;
      return [
        rect(x, y, INNER, h, alpha(t.ink, 0.55), 14) +
          rect(x + 40, y + 74, INNER * 0.42, 30, alpha(t.paper, 0.85), 15) +
          rect(x + 40, y + 124, INNER * 0.3, 18, alpha(t.paper, 0.5), 9) +
          rect(x + 40, y + 176, 160, 42, t.accent, 21),
        h,
      ];
    }
    case "about-with-image": {
      const h = 180;
      const half = (INNER - 28) / 2;
      return [
        rect(x, y, half, h, soft, 12) +
          rect(x + half + 28, y + 16, half * 0.6, 22, mid, 11) +
          rect(x + half + 28, y + 58, half * 0.95, 14, softer, 7) +
          rect(x + half + 28, y + 84, half * 0.88, 14, softer, 7) +
          rect(x + half + 28, y + 110, half * 0.7, 14, softer, 7),
        h,
      ];
    }
    case "about-simple": {
      const h = 130;
      return [
        rect(x + INNER * 0.2, y, INNER * 0.3, 22, mid, 11) +
          rect(x + INNER * 0.1, y + 46, INNER * 0.8, 14, softer, 7) +
          rect(x + INNER * 0.14, y + 72, INNER * 0.72, 14, softer, 7) +
          rect(x + INNER * 0.22, y + 98, INNER * 0.56, 14, softer, 7),
        h,
      ];
    }
    case "services-grid":
    case "features-grid":
      return [
        rect(x + INNER * 0.36, y, INNER * 0.28, 20, mid, 10) +
          columns(x, y + 46, INNER, 130, 3, 24, soft),
        176,
      ];
    case "services-cards":
    case "products-grid":
      return [
        rect(x + INNER * 0.36, y, INNER * 0.28, 20, mid, 10) +
          columns(x, y + 46, INNER, 150, 4, 20, soft) +
          columns(x, y + 46, INNER, 76, 4, 20, accentSoft),
        196,
      ];
    case "portfolio-case-studies":
      return [
        rect(x, y, INNER * 0.3, 20, mid, 10) + columns(x, y + 44, INNER, 170, 3, 24, alpha(t.ink, 0.1)),
        214,
      ];
    case "process-steps":
      return [
        rect(x + INNER * 0.38, y, INNER * 0.24, 20, mid, 10) +
          columns(x, y + 44, INNER, 90, 4, 20, softer) +
          columns(x, y + 44, INNER * 0.32, 8, 4, 20, t.accent, 4),
        134,
      ];
    case "testimonials-grid":
      return [
        rect(x + INNER * 0.36, y, INNER * 0.28, 20, mid, 10) + columns(x, y + 44, INNER, 120, 3, 24, softer),
        164,
      ];
    case "pricing-tiers":
      return [
        rect(x + INNER * 0.4, y, INNER * 0.2, 20, mid, 10) +
          columns(x + INNER * 0.08, y + 44, INNER * 0.84, 160, 3, 24, soft),
        204,
      ];
    case "faq-accordion": {
      const rows = [0, 1, 2].map((i) => rect(x, y + 44 + i * 44, INNER, 30, softer, 8)).join("");
      return [rect(x, y, INNER * 0.26, 20, mid, 10) + rows, 176];
    }
    case "cta-banner":
      return [
        rect(x, y, INNER, 120, t.accent, 14) +
          rect(x + INNER * 0.3, y + 34, INNER * 0.4, 22, alpha("#FFFFFF", 0.85), 11) +
          rect(x + INNER * 0.43, y + 70, INNER * 0.14, 26, alpha("#FFFFFF", 0.95), 13),
        120,
      ];
    case "contact-split": {
      const half = (INNER - 28) / 2;
      return [
        rect(x, y, half, 150, softer, 12) +
          rect(x + half + 28, y, half, 150, soft, 12) +
          rect(x + half + 52, y + 100, 130, 30, t.accent, 15),
        150,
      ];
    }
    case "contact-simple":
      return [
        rect(x + INNER * 0.2, y, INNER * 0.6, 120, softer, 12) +
          rect(x + INNER * 0.42, y + 74, INNER * 0.16, 30, t.accent, 15),
        120,
      ];
    case "footer-simple":
      return [
        rect(x, y, INNER, 96, alpha(t.ink, 0.9), 12) +
          rect(x + 32, y + 34, 120, 18, alpha(t.paper, 0.7), 9) +
          columns(x + INNER - 360, y + 38, 320, 12, 4, 20, alpha(t.paper, 0.35), 6),
        96,
      ];
    default:
      return [rect(x, y, INNER, 110, softer, 12), 110];
  }
}

function buildSvg(t) {
  const gap = 34;
  let y = 140;
  let body = "";

  for (const variant of t.sections) {
    const [markup, height] = drawSection(variant, y, t);
    body += markup;
    y += height + gap;
    if (y > H - 40) break;
  }

  const chrome =
    rect(0, 0, W, 96, alpha(t.ink, 0.06), 0) +
    rect(PAD, 34, 40, 28, t.accent, 8) +
    rect(PAD + 56, 40, 170, 16, alpha(t.ink, 0.35), 8) +
    columns(W - PAD - 420, 42, 300, 12, 4, 24, alpha(t.ink, 0.18), 6) +
    rect(W - PAD - 96, 34, 96, 28, t.accent, 14);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${t.name} template layout preview">
  <title>${t.name} template layout</title>
  <defs>
    <linearGradient id="wash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${alpha(t.accent, 0.12)}"/>
      <stop offset="100%" stop-color="${alpha(t.accent, 0)}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${t.paper}"/>
  <rect width="${W}" height="${H}" fill="url(#wash)"/>
  ${chrome}
  ${body}
</svg>
`;
}

for (const t of TEMPLATES) {
  const dir = join(ROOT, "public", "templates", t.slug);
  mkdirSync(dir, { recursive: true });
  const svg = buildSvg(t);
  writeFileSync(join(dir, "preview.svg"), svg, "utf8");
  writeFileSync(join(dir, "thumbnail.svg"), svg, "utf8");
  console.log(`Wrote ${t.slug} thumbnail + preview`);
}
