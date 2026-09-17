import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import {
  generateWebsite,
  AlreadyGeneratedError,
  GenerationInProgressError,
  NoQuestionnaireError,
} from "@/lib/agents/orchestrator";
import { InsufficientCreditsError } from "@/lib/credits/credits";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 900;

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const limit = rateLimit(`ai_generate:${user.id}`, 5, 60_000);
  if (!limit.ok) {
    return jsonError("Too many generation requests. Please wait a moment.", 429, "RATE_LIMITED", {
      retryAfterMs: limit.retryAfterMs,
    });
  }

  const body = await readJson<{ projectId: string }>(req);
  if (!body?.projectId) return jsonError("Missing projectId", 400);

  const project = await getOwnedProject(user.id, body.projectId);
  if (!project) return jsonError("Project not found", 404, "NOT_FOUND");

  try {
    const result = await generateWebsite({ userId: user.id, projectId: project.id });
    return jsonOk(result);
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return jsonError(
        "Not enough credits to generate. Please top up.",
        402,
        "INSUFFICIENT_CREDITS",
        { required: err.required, available: err.available }
      );
    }
    if (err instanceof AlreadyGeneratedError) {
      return jsonError(err.message, 409, "ALREADY_GENERATED");
    }
    if (err instanceof GenerationInProgressError) {
      return jsonError(err.message, 409, "IN_PROGRESS");
    }
    if (err instanceof NoQuestionnaireError) {
      return jsonError(err.message, 400, "NO_QUESTIONNAIRE");
    }
    console.error("Generation error:", err);
    return jsonError("Generation failed. Your credits were refunded.", 500, "GENERATION_FAILED");
  }
}
