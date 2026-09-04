// Backward-compatibility check for the template lock. Run with
// `npm run templates:locks`.
//
// Editing a design's slot list in lib/templates/registry.ts is a schema change
// for every project already generated under the old list: the editor save path
// (lib/agents/editor.ts) compares a stored blueprint against the design's
// CURRENT slots, so a changed slot means those projects can no longer be saved
// at all — the owner can open the editor and then fail on every keystroke.
//
// This sweeps the stored projects through the same predicate the save path uses
// and fails when any of them would be locked out, which turns that class of
// regression into a red validation run instead of a broken editor.
//
// The remedy for a deliberate slot change is one of:
//   - declare `supersedes: ["<old-variant>"]` on the new variant, when it
//     replaces one of the same section type (lib/sections/registry.ts), or
//   - migrate the stored blueprints of the affected projects.
//
// Runs under tsx, which resolves the `@/` alias that plain ts-node does not.

import { prisma } from "@/lib/prisma";
import { findTemplateLockViolation } from "@/lib/templates/lock";
import { parseTemplate } from "@/lib/templates/store";

type Offender = { id: string; business: string; template: string; reason: string };

async function main() {
  // Unpublished designs included: a project stays attached to its design even
  // after the library stops offering it.
  let templates;
  try {
    templates = (await prisma.template.findMany()).map(parseTemplate);
  } catch (err) {
    console.log(
      `Template lock validation SKIPPED — no database reachable (${err instanceof Error ? err.message.split("\n")[0] : String(err)}).`
    );
    return;
  }

  const byId = new Map(templates.map((t) => [t.id, t]));

  const projects = await prisma.project.findMany({
    where: { blueprint: { not: null }, templateId: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { id: true, businessName: true, templateId: true, blueprint: true },
  });

  const offenders: Offender[] = [];
  let checked = 0;

  for (const project of projects) {
    const template = byId.get(project.templateId!);
    // A project whose design was deleted is not held to a lock on the save path.
    if (!template) continue;

    let blueprint;
    try {
      blueprint = JSON.parse(project.blueprint!) as Parameters<typeof findTemplateLockViolation>[1];
    } catch {
      offenders.push({
        id: project.id,
        business: project.businessName,
        template: template.name,
        reason: "stored blueprint is not valid JSON",
      });
      continue;
    }

    checked += 1;
    const reason = findTemplateLockViolation(template.pages, blueprint);
    if (reason) {
      offenders.push({ id: project.id, business: project.businessName, template: template.name, reason });
    }
  }

  if (offenders.length) {
    console.error(
      `\nTemplate lock validation FAILED — ${offenders.length} of ${checked} stored project(s) can no longer be saved:\n`
    );
    for (const o of offenders) {
      console.error(`  - ${o.id} · ${o.business} · ${o.template}: ${o.reason}`);
    }
    console.error(
      "\nA design's slot list changed without keeping its existing projects saveable." +
        "\nEither declare `supersedes` on the new variant (same section type only)" +
        "\nor migrate the stored blueprints. See scripts/validate-template-locks.ts.\n"
    );
    process.exit(1);
  }

  console.log(
    `Template lock validation passed: ${checked} stored project(s) across ${templates.length} design(s) still satisfy their locked slots.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
