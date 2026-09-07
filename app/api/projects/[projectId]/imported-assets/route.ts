import { unlink } from "node:fs/promises";
import path from "node:path";
import { requireUser, jsonOk, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getOwnedProject } from "@/lib/projects/projects";
import { importedAssetPaths, parseImportedBrand } from "@/lib/branding/imported-brand";
import { isProjectImportPath } from "@/lib/branding/asset-consent";

type Ctx = { params: Promise<{ projectId: string }> };

/**
 * Discards the logo and photographs pulled off a customer's existing website.
 * The colours and typeface are left in place: those are a theme choice, and
 * dropping the files must not undo the look the customer picked.
 *
 * A file the generated site already points at is kept, because deleting it
 * would leave a live page with a broken image rather than a lawful one.
 */
export async function DELETE(_req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("Project not found", 404, "NOT_FOUND");

  const questionnaire = await prisma.questionnaire.findUnique({ where: { projectId } });
  if (!questionnaire) return jsonOk({ removed: 0, kept: 0 });

  const answers = JSON.parse(questionnaire.answers) as Record<string, unknown>;
  const brand = parseImportedBrand(answers.importedBrand);

  const inUse = [project.theme, project.assembledPages, project.blueprint]
    .filter((v): v is string => Boolean(v))
    .join("\n");

  let removed = 0;
  let kept = 0;
  for (const assetPath of importedAssetPaths(brand)) {
    if (!isProjectImportPath(assetPath, projectId)) continue;
    if (inUse.includes(assetPath)) {
      kept++;
      continue;
    }
    try {
      await unlink(path.join(process.cwd(), "public", assetPath.replace(/^\//, "")));
      removed++;
    } catch {
      // Already gone is the outcome we wanted.
      removed++;
    }
  }

  const next = {
    ...answers,
    ...(brand ? { importedBrand: { ...brand, logoUrl: undefined, images: [] } } : {}),
    importedAssetConsent: undefined,
  };
  await prisma.questionnaire.update({
    where: { projectId },
    data: { answers: JSON.stringify(next) },
  });

  return jsonOk({ removed, kept });
}
