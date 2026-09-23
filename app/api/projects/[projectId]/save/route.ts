import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import {
  saveProjectContent,
  BlueprintInvalidError,
  TemplateStructureError,
} from "@/lib/agents/editor";
import { themeSchema } from "@/lib/blueprint/schema";
import type { WebsiteBlueprint, ThemeTokens } from "@/lib/blueprint/types";

type Ctx = { params: Promise<{ projectId: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("We couldn't find that website project.", 404);

  const body = await readJson<{ blueprint: WebsiteBlueprint; theme: ThemeTokens }>(req);
  if (!body?.blueprint || !body?.theme) return jsonError("We couldn't find your site's content or colors.", 400);

  const theme = themeSchema.safeParse(body.theme);
  if (!theme.success) {
    return jsonError("Those colors don't look right. Please try again.", 400, "VALIDATION", theme.error.issues);
  }

  try {
    await saveProjectContent({ projectId, blueprint: body.blueprint, theme: theme.data });
    return jsonOk({ ok: true });
  } catch (err) {
    if (err instanceof BlueprintInvalidError) {
      return jsonError("We couldn't save those changes.", 400, "VALIDATION", err.errors);
    }
    if (err instanceof TemplateStructureError) {
      return jsonError(err.message, 400, "TEMPLATE_LOCKED");
    }
    console.error("Save error:", err);
    return jsonError("We couldn't save your changes.", 500);
  }
}
