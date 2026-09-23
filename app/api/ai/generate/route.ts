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

export const maxDuration = 300;

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const limit = rateLimit(`ai_generate:${user.id}`, 5, 60_000);
  if (!limit.ok) {
    return jsonError("Please wait a moment, then try writing your website again.", 429, "RATE_LIMITED", {
      retryAfterMs: limit.retryAfterMs,
    });
  }

  const body = await readJson<{ projectId: string }>(req);
  if (!body?.projectId) return jsonError("We couldn't find your website project.", 400);

  const project = await getOwnedProject(user.id, body.projectId);
  if (!project) return jsonError("We couldn't find that website project.", 404, "NOT_FOUND");

  try {
    const result = await generateWebsite({ userId: user.id, projectId: project.id });
    return jsonOk(result);
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return jsonError(
        "Not enough credits to write your website. Please buy more.",
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
    return jsonError("We couldn't write your website. Your credits were returned.", 500, "GENERATION_FAILED");
  }
}
