import { requireUser, jsonOk, jsonError, readJson } from "@/lib/http";
import { getOwnedProject } from "@/lib/projects/projects";
import { getTemplateById } from "@/lib/templates/store";
import { planWebsiteLayout } from "@/lib/agents/website-planner";
import { withUsageCapture } from "@/lib/ai/usage";
import { persistUsageEvents } from "@/lib/ai/usage-record";

type Ctx = { params: Promise<{ projectId: string }> };

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
}

/**
 * Website Planner — reads the customer's answers and returns the pages and
 * sections this design should use, in everyday language. No extra credit charge.
 */
export async function POST(req: Request, { params }: Ctx) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { projectId } = await params;

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return jsonError("We couldn't find that website project.", 404);
  if (!project.templateId) return jsonError("Choose a design first", 400, "TEMPLATE_REQUIRED");

  const template = await getTemplateById(project.templateId);
  if (!template) return jsonError("Choose a design first", 400, "TEMPLATE_REQUIRED");

  const body = (await readJson<Record<string, unknown>>(req)) ?? {};
  const answers = {
    businessName: asText(body.businessName),
    industry: asText(body.industry),
    description: asText(body.description),
    location: asText(body.location),
    targetAudience: asText(body.targetAudience),
    demographics: asText(body.demographics),
    goals: asText(body.goals),
    services: asList(body.services),
    brandingNotes: asText(body.brandingNotes),
  };

  const { result: plan, events } = await withUsageCapture(() =>
    planWebsiteLayout(answers, template.pages)
  );
  await persistUsageEvents({
    userId: user.id,
    projectId,
    operation: "site_plan",
    events,
  });

  return jsonOk({
    layout: plan.layout,
    view: plan.view,
    fromAi: plan.fromAi,
  });
}
