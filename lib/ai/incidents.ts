import { prisma } from "@/lib/prisma";
import { TEMPLATE_FALLBACK, type AiFailure } from "@/lib/ai/failure";

export type AiOperation = "heavy_generate" | "light_edit" | "scrape_extract";

/**
 * Writes the failures behind an AI operation to the admin ledger, plus a marker
 * row when the deterministic template ended up writing the site. Best-effort in
 * the same way token metering is: recording that something went wrong must never
 * be the thing that breaks the request.
 */
export async function recordAiIncidents(params: {
  userId?: string;
  projectId?: string;
  operation: AiOperation;
  failures: AiFailure[];
  /** True when no model answered and the deterministic template was used. */
  templateFallback?: boolean;
  /** Why the template was used, when nothing failed (e.g. explicit mock mode). */
  fallbackReason?: string;
}): Promise<void> {
  const { userId, projectId, operation, failures, templateFallback, fallbackReason } = params;
  if (!failures.length && !templateFallback) return;

  type IncidentRow = {
    userId: string | null;
    projectId: string | null;
    operation: AiOperation;
    provider: string;
    model: string;
    kind: string;
    message: string;
    detail: string | null;
  };

  const rows: IncidentRow[] = failures.map((f) => ({
    userId: userId ?? null,
    projectId: projectId ?? null,
    operation,
    provider: f.provider,
    model: f.model,
    kind: f.kind,
    message: f.message.slice(0, 500),
    detail: f.detail ?? null,
  }));

  if (templateFallback) {
    rows.push({
      userId: userId ?? null,
      projectId: projectId ?? null,
      operation,
      provider: "mock",
      model: "deterministic-template",
      kind: TEMPLATE_FALLBACK,
      message:
        fallbackReason ??
        `No model produced usable output (${
          failures.map((f) => `${f.provider}: ${f.kind}`).join(", ") || "no provider available"
        }).`,
      detail: null,
    });
  }

  try {
    await prisma.aiIncident.createMany({ data: rows });
  } catch (err) {
    console.error("[ai] failed to persist AI incidents:", err);
  }
}
