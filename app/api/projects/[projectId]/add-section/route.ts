import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import { addSection } from "@/lib/agents/editor";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ projectId: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("Project not found", 404);

  const body = await readJson<{ pageSlug: string; variant: string }>(req);
  if (!body?.pageSlug || !body?.variant) return jsonError("Missing pageSlug or variant", 400);

  try {
    await addSection({ projectId, pageSlug: body.pageSlug, variant: body.variant });
    const updated = await prisma.project.findUnique({ where: { id: projectId } });
    return jsonOk({
      ok: true,
      blueprint: updated?.blueprint ? JSON.parse(updated.blueprint) : null,
      site: updated?.assembledPages ? JSON.parse(updated.assembledPages) : null,
    });
  } catch (err) {
    console.error("Add section error:", err);
    return jsonError("Could not add section", 500);
  }
}
