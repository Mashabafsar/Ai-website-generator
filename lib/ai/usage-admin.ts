import { prisma } from "@/lib/prisma";
import { estimateCostUsdCents } from "@/lib/ai/pricing";

export const USAGE_OPERATION_LABEL: Record<string, string> = {
  heavy_generate: "Website generation",
  light_edit: "AI section edit",
  scrape_extract: "Website import (scraper AI)",
  site_plan: "Pages & sections plan",
  image_analysis: "Photo analysis",
};

/** Phases shown on the per-website cost table. */
export const WEBSITE_PHASES = [
  "heavy_generate",
  "site_plan",
  "scrape_extract",
  "image_analysis",
  "light_edit",
] as const;

export type WebsiteUsageRow = {
  projectId: string;
  businessName: string;
  userEmail: string;
  status: string;
  totalTokens: number;
  costUsdCents: number;
  calls: number;
  byOperation: Record<string, { tokens: number; costUsdCents: number; calls: number }>;
  lastAt: Date | null;
};

export function costCentsForRow(row: {
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsdCents?: number | null;
}): number {
  if (row.costUsdCents && row.costUsdCents > 0) return row.costUsdCents;
  return estimateCostUsdCents({
    model: row.model,
    promptTokens: row.promptTokens,
    completionTokens: row.completionTokens,
  });
}

/**
 * Aggregate AiUsage by project for the admin "per website" table.
 * Cost is recomputed from tokens when stored cost is missing (pre-migration rows).
 */
export async function loadWebsiteUsage(limit = 80): Promise<WebsiteUsageRow[]> {
  const usage = await prisma.aiUsage.findMany({
    where: { projectId: { not: null } },
    select: {
      projectId: true,
      operation: true,
      model: true,
      promptTokens: true,
      completionTokens: true,
      totalTokens: true,
      costUsdCents: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const byProject = new Map<
    string,
    {
      totalTokens: number;
      costUsdCents: number;
      calls: number;
      byOperation: Record<string, { tokens: number; costUsdCents: number; calls: number }>;
      lastAt: Date | null;
    }
  >();

  for (const row of usage) {
    const projectId = row.projectId;
    if (!projectId) continue;
    const cur = byProject.get(projectId) ?? {
      totalTokens: 0,
      costUsdCents: 0,
      calls: 0,
      byOperation: {},
      lastAt: null,
    };
    const cost = costCentsForRow(row);
    cur.totalTokens += row.totalTokens;
    cur.costUsdCents += cost;
    cur.calls += 1;
    const op = cur.byOperation[row.operation] ?? { tokens: 0, costUsdCents: 0, calls: 0 };
    op.tokens += row.totalTokens;
    op.costUsdCents += cost;
    op.calls += 1;
    cur.byOperation[row.operation] = op;
    if (!cur.lastAt || row.createdAt > cur.lastAt) cur.lastAt = row.createdAt;
    byProject.set(projectId, cur);
  }

  const projectIds = [...byProject.keys()];
  if (projectIds.length === 0) return [];

  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: {
      id: true,
      businessName: true,
      status: true,
      user: { select: { email: true } },
    },
  });
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return projectIds
    .map((projectId) => {
      const agg = byProject.get(projectId)!;
      const project = projectMap.get(projectId);
      return {
        projectId,
        businessName: project?.businessName ?? "(deleted project)",
        userEmail: project?.user.email ?? "—",
        status: project?.status ?? "—",
        totalTokens: agg.totalTokens,
        costUsdCents: agg.costUsdCents,
        calls: agg.calls,
        byOperation: agg.byOperation,
        lastAt: agg.lastAt,
      };
    })
    .sort((a, b) => (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0))
    .slice(0, limit);
}
