import { requireUser, jsonOk, jsonError } from "@/lib/http";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getOwnedProject } from "@/lib/projects/projects";
import { importedAssetPaths, parseImportedBrand } from "@/lib/branding/imported-brand";
import { isProjectImportPath } from "@/lib/branding/asset-consent";
import { deleteObjects, mediaKeyFromUrl } from "@/lib/storage/s3";

type Ctx = { params: Promise<{ projectId: string }> };

async function deleteMediaObjects(keys: string[]): Promise<void> {
  if (!keys.length) return;
  if (!env.storage.enabled) {
    console.error(
      `[imported-assets] S3 storage is not configured; ${keys.length} object(s) left in place.`
    );
    return;
  }
  try {
    const { failed } = await deleteObjects(env.storage.mediaBucket, keys);
    for (const f of failed) {
      console.error(`[imported-assets] Failed to remove ${f.key}: ${f.message}`);
    }
  } catch (err) {
    console.error("[imported-assets] Storage deletion failed:", err);
  }
}

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
  if (!project) return jsonError("We couldn't find that website project.", 404, "NOT_FOUND");

  const questionnaire = await prisma.questionnaire.findUnique({ where: { projectId } });
  if (!questionnaire) return jsonOk({ removed: 0, kept: 0 });

  const answers = JSON.parse(questionnaire.answers) as Record<string, unknown>;
  const brand = parseImportedBrand(answers.importedBrand);

  const inUse = [project.theme, project.assembledPages, project.blueprint]
    .filter((v): v is string => Boolean(v))
    .join("\n");

  let removed = 0;
  let kept = 0;
  const keys: string[] = [];

  for (const assetPath of importedAssetPaths(brand)) {
    if (!isProjectImportPath(assetPath, projectId)) continue;
    if (inUse.includes(assetPath)) {
      kept++;
      continue;
    }
    // Legacy local paths have no remote object to delete.
    const key = mediaKeyFromUrl(assetPath);
    if (key) keys.push(key);
    removed++;
  }

  await deleteMediaObjects(keys);

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
