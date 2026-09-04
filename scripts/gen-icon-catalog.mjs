// Regenerates lib/icons/catalog.ts from the installed lucide-react package.
//
// The website icons must render identically in the React preview and in the
// static HTML export, which has no React. Shipping lucide's raw icon nodes as
// data is the only way both paths can draw from one source; importing the
// components would leave the export path with a hand-written copy to drift
// against. Run after changing CURATED or bumping lucide-react:
//
//   node scripts/gen-icon-catalog.mjs

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ICON_DIR = "node_modules/lucide-react/dist/esm/icons";
const OUT = "lib/icons/catalog.ts";

/**
 * The allowlist the AI picks from. Grouped so the editor's picker can offer
 * sections, and broad enough to cover the industries the questionnaire sees.
 * Names are lucide's own kebab-case ids.
 */
const CURATED = [
  [
    "Trust & quality",
    [
      "check",
      "circle-check",
      "badge-check",
      "shield-check",
      "shield",
      "star",
      "heart",
      "thumbs-up",
      "award",
      "trophy",
      "medal",
      "crown",
      "gem",
      "sparkles",
      "handshake",
      "smile",
      "eye",
      "lock",
      "fingerprint",
    ],
  ],
  [
    "Growth & results",
    [
      "target",
      "trending-up",
      "chart-column",
      "chart-pie",
      "chart-line",
      "rocket",
      "zap",
      "lightbulb",
      "gauge",
      "activity",
      "percent",
      "flag",
    ],
  ],
  [
    "Process & service",
    [
      "clipboard-list",
      "clipboard-check",
      "list-checks",
      "workflow",
      "git-branch",
      "refresh-cw",
      "repeat",
      "settings",
      "sliders-horizontal",
      "cog",
      "search",
      "filter",
      "layers",
      "layout-dashboard",
      "file-text",
      "file-check",
      "folder",
      "clock",
      "calendar",
      "calendar-check",
      "hourglass",
    ],
  ],
  [
    "People & support",
    [
      "users",
      "user-check",
      "user-plus",
      "briefcase",
      "headphones",
      "life-buoy",
      "message-circle",
      "message-square",
      "phone",
      "mail",
      "send",
      "at-sign",
      "bell",
      "megaphone",
      "share-2",
      "globe",
      "map-pin",
      "map",
    ],
  ],
  [
    "Trades & property",
    [
      "hammer",
      "wrench",
      "drill",
      "hard-hat",
      "construction",
      "ruler",
      "pencil-ruler",
      "paintbrush",
      "paint-roller",
      "brush",
      "house",
      "building",
      "building-2",
      "door-open",
      "bed",
      "sofa",
      "lamp",
      "key",
      "plug",
      "plug-zap",
      "droplet",
      "droplets",
      "thermometer",
      "snowflake",
      "flame",
      "wind",
      "sun",
      "leaf",
      "tree-pine",
      "flower-2",
      "trash-2",
      "recycle",
    ],
  ],
  [
    "Health & wellbeing",
    [
      "stethoscope",
      "heart-pulse",
      "pill",
      "syringe",
      "bandage",
      "brain",
      "bone",
      "hospital",
      "ambulance",
      "cross",
      "dumbbell",
      "bike",
      "footprints",
      "mountain",
    ],
  ],
  [
    "Food & hospitality",
    [
      "utensils",
      "utensils-crossed",
      "chef-hat",
      "cooking-pot",
      "soup",
      "salad",
      "sandwich",
      "pizza",
      "beef",
      "fish",
      "egg",
      "carrot",
      "wheat",
      "milk",
      "croissant",
      "cake",
      "cake-slice",
      "ice-cream-cone",
      "coffee",
      "cup-soda",
      "wine",
      "beer",
      "apple",
      "hotel",
    ],
  ],
  [
    "Retail & commerce",
    [
      "shopping-bag",
      "shopping-cart",
      "store",
      "package",
      "box",
      "truck",
      "tag",
      "gift",
      "ticket",
      "shirt",
      "scissors",
      "spray-can",
      "barcode",
      "qr-code",
    ],
  ],
  [
    "Money & legal",
    [
      "dollar-sign",
      "credit-card",
      "wallet",
      "banknote",
      "receipt",
      "calculator",
      "piggy-bank",
      "landmark",
      "scale",
      "gavel",
      "book-open",
      "graduation-cap",
      "school",
    ],
  ],
  [
    "Technology",
    [
      "monitor",
      "smartphone",
      "laptop",
      "tablet",
      "cpu",
      "database",
      "server",
      "cloud",
      "cloud-upload",
      "hard-drive",
      "wifi",
      "code",
      "terminal",
      "bug",
      "puzzle",
      "scan",
    ],
  ],
  [
    "Creative & media",
    [
      "palette",
      "pen-tool",
      "image",
      "camera",
      "video",
      "film",
      "music",
      "mic",
      "radio",
      "tv",
      "printer",
      "newspaper",
      "bookmark",
      "type",
    ],
  ],
  [
    "Travel & motor",
    [
      "car",
      "car-front",
      "fuel",
      "plane",
      "plane-takeoff",
      "train-front",
      "ship",
      "luggage",
      "compass",
      "tent",
      "waves",
      "tree-palm",
      "dog",
      "cat",
      "paw-print",
      "bird",
    ],
  ],
];

/** Attributes lucide sets globally on the <svg>; per-node copies are redundant. */
const DROP_ATTRS = new Set(["key"]);

function iconNodeFor(name, from = name) {
  const file = path.join(ICON_DIR, `${name}.js`);
  let source;
  try {
    source = readFileSync(file, "utf8");
  } catch {
    throw new Error(`lucide-react has no icon "${from}"`);
  }

  // Deprecated ids are thin re-exports of the canonical icon module.
  const alias = source.match(/export \{ default \} from '\.\/([^']+)\.js';/);
  if (alias) {
    console.warn(`  "${from}" is a lucide alias for "${alias[1]}" — prefer the canonical id in CURATED.`);
    return iconNodeFor(alias[1], from);
  }

  const start = source.indexOf("createLucideIcon(");
  if (start === -1) throw new Error(`Could not find createLucideIcon( in ${file}`);
  const open = source.indexOf("[", start);
  if (open === -1) throw new Error(`Could not find the icon node array in ${file}`);

  // Walk to the bracket that closes the node array; `d` path data never
  // contains brackets, so depth counting is sufficient here.
  let depth = 0;
  let end = -1;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "[") depth += 1;
    else if (source[i] === "]") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) throw new Error(`Unbalanced icon node array in ${file}`);

  const literal = source.slice(open, end + 1);
  const node = new Function(`return ${literal};`)();
  if (!Array.isArray(node) || !node.length) throw new Error(`Empty icon node for "${name}"`);

  return node.map(([tag, attrs]) => {
    const kept = {};
    for (const [k, v] of Object.entries(attrs ?? {})) {
      if (!DROP_ATTRS.has(k)) kept[k] = v;
    }
    return [tag, kept];
  });
}

function label(name) {
  return name
    .split("-")
    .map((part) => (/^\d/.test(part) ? part : part[0].toUpperCase() + part.slice(1)))
    .join(" ");
}

function main() {
  const version = JSON.parse(readFileSync("node_modules/lucide-react/package.json", "utf8")).version;

  const seen = new Set();
  const groups = [];
  for (const [group, names] of CURATED) {
    const entries = [];
    for (const name of names) {
      if (seen.has(name)) throw new Error(`Duplicate icon "${name}" in CURATED`);
      seen.add(name);
      entries.push({ name, label: label(name), node: iconNodeFor(name) });
    }
    groups.push({ group, entries });
  }

  const lines = [
    `// GENERATED by scripts/gen-icon-catalog.mjs from lucide-react ${version}. Do not edit.`,
    "// Icon geometry lives here as data so the React preview and the static HTML",
    "// export render the same glyph from one source. See lib/icons/registry.ts.",
    "",
    'import type { IconGroup } from "./types";',
    "",
    "export const ICON_GROUPS: IconGroup[] = [",
  ];

  for (const { group, entries } of groups) {
    lines.push(`  {`);
    lines.push(`    group: ${JSON.stringify(group)},`);
    lines.push(`    entries: [`);
    for (const entry of entries) {
      lines.push(
        `      { name: ${JSON.stringify(entry.name)}, label: ${JSON.stringify(entry.label)}, node: ${JSON.stringify(entry.node)} },`
      );
    }
    lines.push(`    ],`);
    lines.push(`  },`);
  }

  lines.push("];", "");

  writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`Wrote ${OUT}: ${seen.size} icons in ${groups.length} groups (lucide-react ${version}).`);
}

main();
