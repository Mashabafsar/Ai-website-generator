import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { DeploymentStatus, ProjectStatus } from "@/lib/constants";
import { parseProject } from "@/lib/projects/projects";
import { generateProjectFiles } from "@/lib/export/generate-project";
import { deployToVercel, aliasDeployment } from "@/lib/deployment/vercel";
import { slugify } from "@/lib/utils";
import { notifyOwnerSiteLive } from "@/lib/notify/owner";

export type DeploymentLog = { at: string; status: string; message: string };

function log(logs: DeploymentLog[], status: string, message: string): DeploymentLog[] {
  return [...logs, { at: new Date().toISOString(), status, message }];
}

async function saveDeployment(
  projectId: string,
  data: {
    status: string;
    subdomain?: string;
    liveUrl?: string | null;
    logs: DeploymentLog[];
  }
) {
  return prisma.deployment.upsert({
    where: { projectId },
    create: {
      projectId,
      status: data.status,
      subdomain: data.subdomain,
      liveUrl: data.liveUrl ?? undefined,
      provider: env.deployment.provider,
      logs: JSON.stringify(data.logs),
    },
    update: {
      status: data.status,
      subdomain: data.subdomain,
      liveUrl: data.liveUrl ?? undefined,
      logs: JSON.stringify(data.logs),
    },
  });
}

/**
 * Deployment Agent — deploys the already-generated, GitHub-backed site to a
 * subdomain. Uses the existing project source; no second "create repo" step.
 * Falls back to a recorded (simulated) deployment when no provider token is set,
 * so the managed-hosting flow still completes end-to-end in the MVP.
 */
export async function deployProject(projectId: string): Promise<{
  status: string;
  liveUrl: string | null;
  subdomain: string;
}> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  const parsed = parseProject(project);
  if (!parsed.blueprint || !parsed.assembledPages) {
    throw new Error("Website has not been generated yet");
  }

  const subdomain = `${slugify(project.businessName)}-${project.id.slice(-6)}`;
  const fqdn = `${subdomain}.${env.deployment.platformDomain}`;
  let logs: DeploymentLog[] = [];

  logs = log(logs, DeploymentStatus.PENDING, "Deployment requested");
  await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.DEPLOYING } });
  await saveDeployment(projectId, { status: DeploymentStatus.BUILD_STARTED, subdomain, logs });

  const files = await generateProjectFiles({
    businessName: project.businessName,
    blueprint: parsed.blueprint,
    site: parsed.assembledPages,
  });

  // No provider token: record a simulated deployment so the flow completes.
  if (!env.deployment.enabled) {
    logs = log(logs, DeploymentStatus.BUILD_STARTED, "No deployment provider configured — recording simulated deployment.");
    const liveUrl = `https://${fqdn}`;
    logs = log(logs, DeploymentStatus.DEPLOYED, `Site marked live at ${liveUrl}`);
    await saveDeployment(projectId, { status: DeploymentStatus.DEPLOYED, subdomain, liveUrl, logs });
    await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.LIVE } });
    await notifyOwnerSiteLive({ projectId, businessName: project.businessName, liveUrl });
    return { status: DeploymentStatus.DEPLOYED, liveUrl, subdomain };
  }

  try {
    logs = log(logs, DeploymentStatus.BUILD_STARTED, "Uploading files to Vercel");
    const result = await deployToVercel({ projectName: subdomain, files });
    logs = log(logs, DeploymentStatus.BUILD_STARTED, `Deployment created (${result.deploymentId})`);

    const aliased = await aliasDeployment(result.deploymentId, fqdn);
    const liveUrl = aliased ? `https://${fqdn}` : `https://${result.url}`;
    logs = log(
      logs,
      DeploymentStatus.DEPLOYED,
      aliased ? `Aliased to ${fqdn}` : `Live at ${result.url} (subdomain alias unavailable)`
    );

    await saveDeployment(projectId, { status: DeploymentStatus.DEPLOYED, subdomain, liveUrl, logs });
    await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.LIVE } });
    await notifyOwnerSiteLive({ projectId, businessName: project.businessName, liveUrl });
    return { status: DeploymentStatus.DEPLOYED, liveUrl, subdomain };
  } catch (err) {
    logs = log(logs, DeploymentStatus.FAILED, err instanceof Error ? err.message : "Deployment failed");
    await saveDeployment(projectId, { status: DeploymentStatus.FAILED, subdomain, liveUrl: null, logs });
    await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.PAID } });
    throw err;
  }
}
