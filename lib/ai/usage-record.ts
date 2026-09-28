import { prisma } from "@/lib/prisma";
import type { UsageEvent } from "@/lib/ai/usage";

/**
 * Persists captured token-usage events to the admin ledger. Best-effort: a
 * metering failure must never break generation or an edit.
 */
export async function persistUsageEvents(params: {
  userId?: string;
  projectId?: string;
  operation: "heavy_generate" | "light_edit" | "scrape_extract" | "site_plan" | "image_analysis";
  events: UsageEvent[];
}): Promise<void> {
  const { userId, projectId, operation, events } = params;
  if (!events.length) return;

  try {
    await prisma.aiUsage.createMany({
      data: events.map((e) => ({
        userId: userId ?? null,
        projectId: projectId ?? null,
        operation,
        provider: e.provider,
        model: e.model,
        promptTokens: e.promptTokens,
        completionTokens: e.completionTokens,
        totalTokens: e.totalTokens,
        estimated: e.estimated,
      })),
    });
  } catch (err) {
    console.error("[usage] failed to persist AI usage:", err);
  }
}
