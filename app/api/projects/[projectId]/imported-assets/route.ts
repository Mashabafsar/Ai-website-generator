import { requireUser, jsonOk, jsonError } from "@/lib/http";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getOwnedProject } from "@/lib/projects/projects";
import { importedAssetPaths, parseImportedBrand } from "@/lib/branding/imported-brand";
import { isProjectImportPath } from "@/lib/branding/asset-consent";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ projectId: string }> };

function parsePublicStorageObject(url: string): { bucket: string; objectPath: string } | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/i);
    if (!match) return null;
    return {
      bucket: decodeURIComponent(match[1]),
      objectPath: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
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
  let supabaseErrorLogged = false;
  const supabaseClient =
    env.supabase.enabled
      ? (() => {
          try {
            return getSupabaseAdminClient();
          } catch (err) {
            if (!supabaseErrorLogged) {
              console.error("[imported-assets] Supabase is not configured; skipping storage deletion.", err);
              supabaseErrorLogged = true;
            }
            return null;
          }
        })()
      : null;

  for (const assetPath of importedAssetPaths(brand)) {
    if (!isProjectImportPath(assetPath, projectId)) continue;
    if (inUse.includes(assetPath)) {
      kept++;
      continue;
    }

    const parsed = parsePublicStorageObject(assetPath);
    if (!parsed) {
      // Legacy local paths have no remote object to delete.
      removed++;
      continue;
    }

    if (!supabaseClient) {
      removed++;
      continue;
    }

    const { error } = await supabaseClient.storage
      .from(parsed.bucket)
      .remove([parsed.objectPath]);
    if (error && !supabaseErrorLogged) {
      console.error(`[imported-assets] Failed to remove ${assetPath}:`, error);
      supabaseErrorLogged = true;
    }
    removed++;
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
