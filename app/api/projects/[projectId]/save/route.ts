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
  if (!project) return jsonError("Project not found", 404);

  const body = await readJson<{ blueprint: WebsiteBlueprint; theme: ThemeTokens }>(req);
  if (!body?.blueprint || !body?.theme) return jsonError("Missing blueprint or theme", 400);

  const theme = themeSchema.safeParse(body.theme);
  if (!theme.success) {
    return jsonError("Invalid theme", 400, "VALIDATION", theme.error.issues);
  }

  try {
    await saveProjectContent({ projectId, blueprint: body.blueprint, theme: theme.data });
    return jsonOk({ ok: true });
  } catch (err) {
    if (err instanceof BlueprintInvalidError) {
      return jsonError("Invalid content", 400, "VALIDATION", err.errors);
    }
    if (err instanceof TemplateStructureError) {
      return jsonError(err.message, 400, "TEMPLATE_LOCKED");
    }
    console.error("Save error:", err);
    return jsonError("Could not save changes", 500);
  }
}
