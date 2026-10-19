import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import { editSectionWithAi, SectionNotFoundError } from "@/lib/agents/editor";
import { InsufficientCreditsError } from "@/lib/credits/credits";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const limit = rateLimit(`ai_edit:${user.id}`, 20, 60_000);
  if (!limit.ok) {
    return jsonError("Please wait a moment, then try rewriting this section again.", 429, "RATE_LIMITED", {
      retryAfterMs: limit.retryAfterMs,
    });
  }

  const body = await readJson<{
    projectId: string;
    pageSlug: string;
    sectionId: string;
    instruction: string;
  }>(req);
  if (!body?.projectId || !body?.pageSlug || !body?.sectionId || !body?.instruction) {
    return jsonError("Please tell us what to change.", 400);
  }

  const project = await getOwnedProject(user.id, body.projectId);
  if (!project) return jsonError("We couldn't find that website project.", 404);

  try {
    const result = await editSectionWithAi({
      userId: user.id,
      projectId: body.projectId,
      pageSlug: body.pageSlug,
      sectionId: body.sectionId,
      instruction: body.instruction,
    });
    return jsonOk(result);
  } catch (err) {
    if (err instanceof SectionNotFoundError) {
      return jsonError(err.message, 404, "SECTION_NOT_FOUND");
    }
    if (err instanceof InsufficientCreditsError) {
      return jsonError("Not enough credits to rewrite this section. Please buy more.", 402, "INSUFFICIENT_CREDITS", {
        required: err.required,
        available: err.available,
      });
    }
    console.error("Edit section error:", err);
    return jsonError("We couldn't rewrite this section. Your credits were returned.", 500);
  }
}
