import { GENERATION_STEPS, type GenerationStepId } from "@/lib/ai/generation-steps";

export type GenerationStreamResult = {
  status: "GENERATED";
  fromTemplate?: boolean;
  balanceAfter?: number;
  refunded?: number;
};

const STEP_IDS = new Set<string>(GENERATION_STEPS.map((step) => step.id));

export class GenerationStreamError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "GenerationStreamError";
    this.code = code;
  }
}

function isStepId(value: unknown): value is GenerationStepId {
  return typeof value === "string" && STEP_IDS.has(value);
}

/**
 * Starts a website build and reports each server step as it begins.
 * Early failures (missing project, rate limit) still arrive as JSON.
 */
export async function streamWebsiteGeneration(
  projectId: string,
  onStep: (id: GenerationStepId) => void,
  options?: { mode?: "generate" | "regenerate" }
): Promise<GenerationStreamResult> {
  const mode = options?.mode === "regenerate" ? "regenerate" : undefined;
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/x-ndjson",
    },
    body: JSON.stringify(mode ? { projectId, mode } : { projectId }),
  });

  const type = res.headers.get("content-type") || "";
  if (!type.includes("ndjson")) {
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      fromTemplate?: boolean;
      status?: "GENERATED";
    };
    if (!res.ok || data.status !== "GENERATED") {
      throw new GenerationStreamError(data.error || "We couldn't write your website", data.code);
    }
    return { status: "GENERATED", fromTemplate: data.fromTemplate };
  }

  if (!res.body) {
    throw new GenerationStreamError("We couldn't write your website");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: GenerationStreamResult | null = null;

  const handleLine = (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line) as {
      type?: string;
      id?: string;
      error?: string;
      code?: string;
      result?: GenerationStreamResult;
    };
    if (event.type === "step" && isStepId(event.id)) onStep(event.id);
    if (event.type === "done" && event.result) result = event.result;
    if (event.type === "error") {
      throw new GenerationStreamError(event.error || "We couldn't write your website", event.code);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) handleLine(line);
    if (done) break;
  }
  if (buffer.trim()) handleLine(buffer);
  if (!result) throw new GenerationStreamError("We couldn't write your website");
  return result;
}
