import { requireUser, jsonError, readJson } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import {
  generateWebsite,
  AlreadyGeneratedError,
  GenerationInProgressError,
  NoQuestionnaireError,
} from "@/lib/agents/orchestrator";
import { InsufficientCreditsError } from "@/lib/credits/credits";
import { rateLimit } from "@/lib/rate-limit";
import type { GenerationStepId } from "@/lib/ai/generation-steps";

export const maxDuration = 300;

type StreamEvent =
  | { type: "step"; id: GenerationStepId }
  | { type: "done"; result: unknown }
  | { type: "error"; error: string; code?: string };

function streamGeneration(work: (send: (event: StreamEvent) => void) => Promise<void>): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try {
        await work(send);
      } catch (err) {
        console.error("Generation stream error:", err);
        send({ type: "error", error: "We couldn't write your website. Your credits were returned.", code: "GENERATION_FAILED" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

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

  return streamGeneration(async (send) => {
    try {
      const result = await generateWebsite({
        userId: user.id,
        projectId: project.id,
        onProgress: (id) => send({ type: "step", id }),
      });
      send({ type: "done", result });
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        send({
          type: "error",
          error: "Not enough credits to write your website. Please buy more.",
          code: "INSUFFICIENT_CREDITS",
        });
        return;
      }
      if (err instanceof AlreadyGeneratedError) {
        send({ type: "error", error: err.message, code: "ALREADY_GENERATED" });
        return;
      }
      if (err instanceof GenerationInProgressError) {
        send({ type: "error", error: err.message, code: "IN_PROGRESS" });
        return;
      }
      if (err instanceof NoQuestionnaireError) {
        send({ type: "error", error: err.message, code: "NO_QUESTIONNAIRE" });
        return;
      }
      console.error("Generation error:", err);
      send({
        type: "error",
        error: "We couldn't write your website. Your credits were returned.",
        code: "GENERATION_FAILED",
      });
    }
  });
}
