// Structural validation for the template system. Run with `npm run templates:validate`.
// Fails loudly if a bespoke design is only half-registered, which is exactly the
// class of bug the old copy-paste dispatch made easy to ship.
//
// Runs standalone under ts-node (no @/ path resolution, no React), so it only
// imports data modules and verifies renderer presence via the filesystem.
//
// Checks:
//   1. Seed metadata is internally valid (every slot -> a real section variant).
//   2. Every published bespoke seed has a registered module.
//   3. Every registered module has a matching seed.
//   4. Every module has a site.tsx (preview) and export.ts (export) on disk.
//   5. Every declared asset file actually exists under public/.
//   6. Slot maps line up with the seed's locked section list.
//   7. Every published bespoke design has demo content (live preview).

import { existsSync } from "node:fs";
import path from "node:path";
import { ALL_SEEDS, assertSeedTemplatesValid } from "../lib/templates/registry";
import { TEMPLATE_MODULES, getTemplateModule } from "./registry";

const STANDARD = "standard-sections";
const ROOT = process.cwd();
const publicDir = path.join(ROOT, "public");
const templatesDir = path.join(ROOT, "templates");

function main() {
  const errors: string[] = [];

  // 1. Seeds valid.
  try {
    assertSeedTemplatesValid();
  } catch (err) {
    errors.push(`Seed validation failed: ${(err as Error).message}`);
  }

  // 2. Published bespoke seeds must have a registered module + renderers.
  for (const seed of ALL_SEEDS) {
    if (seed.renderer === STANDARD || !seed.published) continue;

    const mod = getTemplateModule(seed.renderer);
    if (!mod) {
      errors.push(
        `Published design "${seed.slug}" uses renderer "${seed.renderer}" with no module (templates/registry.ts).`
      );
      continue;
    }
    if (mod.slug !== seed.slug) {
      errors.push(`Module for renderer "${seed.renderer}" has slug "${mod.slug}" but seed slug is "${seed.slug}".`);
    }

    // 6. Slot map lines up with the locked section list (count + type histogram).
    if (mod.slots.length !== seed.sections.length) {
      errors.push(
        `Design "${seed.slug}": slot map has ${mod.slots.length} regions but the seed locks ${seed.sections.length} sections.`
      );
    } else {
      const slotTypes = mod.slots.map((s) => s.type).sort();
      const seedTypes = seed.sections.map(sectionTypeFromVariant).sort();
      if (JSON.stringify(slotTypes) !== JSON.stringify(seedTypes)) {
        errors.push(
          `Design "${seed.slug}": slot map types ${JSON.stringify(slotTypes)} do not match seed section types ${JSON.stringify(seedTypes)}.`
        );
      }
    }
  }

  // 3 + 4 + 5 + 7. Module completeness.
  for (const mod of TEMPLATE_MODULES) {
    const seed = ALL_SEEDS.find((s) => s.slug === mod.slug);
    if (!seed) {
      errors.push(`Module "${mod.slug}" has no seed in lib/templates/registry.ts.`);
    }

    const site = path.join(templatesDir, mod.slug, "site.tsx");
    if (!existsSync(site)) errors.push(`Module "${mod.slug}" is missing templates/${mod.slug}/site.tsx (preview renderer).`);

    const exp = path.join(templatesDir, mod.slug, "export.ts");
    if (!existsSync(exp)) errors.push(`Module "${mod.slug}" is missing templates/${mod.slug}/export.ts (export renderer).`);

    for (const asset of mod.assets) {
      if (!existsSync(path.join(publicDir, asset))) {
        errors.push(`Design "${mod.slug}": missing asset public/${asset}`);
      }
    }

    try {
      const bp = mod.demo.buildBlueprint();
      if (!bp?.pages?.length) errors.push(`Design "${mod.slug}": demo blueprint has no pages.`);
    } catch (err) {
      errors.push(`Design "${mod.slug}": demo blueprint threw: ${(err as Error).message}`);
    }
  }

  if (errors.length) {
    console.error(`\nTemplate validation FAILED with ${errors.length} issue(s):\n`);
    for (const e of errors) console.error(`  - ${e}`);
    console.error("");
    process.exit(1);
  }

  console.log(
    `Template validation passed: ${TEMPLATE_MODULES.length} bespoke module(s), ${ALL_SEEDS.length} seed(s).`
  );
}

/** Best-effort section type from a registry variant slug (e.g. hero-x -> hero). */
function sectionTypeFromVariant(variant: string): string {
  return variant.split("-")[0];
}

main();
