// Structural validation for the icon system. Run with `npm run icons:validate`.
//
// The fallback keyword table in lib/agents/icon-selection.ts names icons as
// plain strings, so nothing but this check stops a typo from silently
// downgrading a section to a generic glyph. It also holds the one-source rule
// between the two renderers: lib/icons/glyph.tsx (React preview) and `iconSvg`
// in lib/icons/registry.ts (static export) must draw the same geometry.
//
// Runs under tsx, which resolves the `@/` alias that plain ts-node does not.
//
// Checks:
//   1. Every icon name referenced by the selection agent is in the allowlist.
//   2. Every catalog entry carries geometry.
//   3. Every catalog entry renders to an <svg> through the export renderer.
//   4. The export renderer reads the same node the catalog stores.
//   5. An unknown name renders to "" so callers fall back to their own glyph.

import { readFileSync } from "node:fs";
import path from "node:path";
import { ICON_CATALOG, ICON_GROUPS, iconSvg, isIconName, resolveIconNode } from "@/lib/icons/registry";

const SELECTION_AGENT = path.join(process.cwd(), "lib", "agents", "icon-selection.ts");

/** Icon names the selection agent hard-codes: keyword table + generic cycle. */
function referencedNames(): Set<string> {
  const source = readFileSync(SELECTION_AGENT, "utf8");
  const names = new Set<string>();
  for (const m of source.matchAll(/\],\s*"([a-z0-9-]+)"\]/g)) names.add(m[1]);
  for (const m of source.matchAll(/GENERIC_CYCLE = \[([^\]]+)\]/g)) {
    for (const n of m[1].matchAll(/"([a-z0-9-]+)"/g)) names.add(n[1]);
  }
  return names;
}

function main() {
  const errors: string[] = [];
  const referenced = referencedNames();

  if (!referenced.size) {
    errors.push(`No icon references found in ${SELECTION_AGENT} — the extraction patterns are stale.`);
  }

  for (const name of referenced) {
    if (!isIconName(name)) {
      errors.push(`lib/agents/icon-selection.ts references "${name}", which is not in the icon allowlist.`);
    }
  }

  for (const entry of ICON_CATALOG) {
    if (!entry.node.length) {
      errors.push(`Icon "${entry.name}" has no geometry (re-run scripts/gen-icon-catalog.mjs).`);
    }
    if (!iconSvg(entry.name).startsWith("<svg")) {
      errors.push(`Icon "${entry.name}" does not render through iconSvg().`);
    }
    if (resolveIconNode(entry.name) !== entry.node) {
      errors.push(`Icon "${entry.name}": the export renderer resolves different geometry than the catalog stores.`);
    }
  }

  if (iconSvg("not-a-real-icon") !== "") {
    errors.push(`iconSvg() must return "" for an unknown name so designs can fall back to their own glyph.`);
  }

  if (errors.length) {
    console.error(`\nIcon validation FAILED with ${errors.length} issue(s):\n`);
    for (const e of errors) console.error(`  - ${e}`);
    console.error("");
    process.exit(1);
  }

  console.log(
    `Icon validation passed: ${ICON_CATALOG.length} icon(s) in ${ICON_GROUPS.length} group(s), ${referenced.size} selection-agent reference(s).`
  );
}

main();
