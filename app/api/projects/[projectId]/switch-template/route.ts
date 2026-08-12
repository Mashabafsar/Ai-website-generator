import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import {
  switchProjectTemplate,
  GenerationInProgressError,
  NoQuestionnaireError,
  NoTemplateError,
  SameTemplateError,
} from "@/lib/agents/orchestrator";
import { InsufficientCreditsError } from "@/lib/credits/credits";
import { isPublishedTemplate } from "@/lib/templates/store";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 300;

type Ctx = { params: Promise<{ projectId: string }> };

/** Rebuilds an existing website on a different design, for the generation price. */
export async function POST(req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const limit = rateLimit(`switch_template:${user.id}`, 5, 60_000);
  if (!limit.ok) {
    return jsonError("Too many design switches. Please wait a moment.", 429, "RATE_LIMITED", {
      retryAfterMs: limit.retryAfterMs,
    });
  }

  const body = await readJson<{ templateId: string }>(req);
  if (!body?.templateId) return jsonError("Missing templateId", 400);

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("Project not found", 404, "NOT_FOUND");
  if (!project.blueprint) {
    return jsonError("Generate your website first", 409, "NOT_GENERATED");
  }
  if (!(await isPublishedTemplate(body.templateId))) {
    return jsonError("That design is not available", 400, "UNKNOWN_TEMPLATE");
  }

  try {
    const result = await switchProjectTemplate({
      userId: user.id,
      projectId,
      templateId: body.templateId,
    });
    return jsonOk(result);
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return jsonError(
        "Not enough credits to switch designs. Please top up.",
        402,
        "INSUFFICIENT_CREDITS",
        { required: err.required, available: err.available }
      );
    }
    if (err instanceof SameTemplateError) {
      return jsonError(err.message, 409, "SAME_TEMPLATE");
    }
    if (err instanceof GenerationInProgressError) {
      return jsonError(err.message, 409, "IN_PROGRESS");
    }
    if (err instanceof NoQuestionnaireError) {
      return jsonError(err.message, 400, "NO_QUESTIONNAIRE");
    }
    if (err instanceof NoTemplateError) {
      return jsonError(err.message, 400, "UNKNOWN_TEMPLATE");
    }
    console.error("Template switch error:", err);
    return jsonError("Could not switch designs. Your credits were refunded.", 500, "SWITCH_FAILED");
  }
}
