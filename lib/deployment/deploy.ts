import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { DeploymentStatus, ProjectStatus } from "@/lib/constants";
import { parseProject } from "@/lib/projects/projects";
import { generateProjectFiles, type ProjectFile } from "@/lib/export/generate-project";
import { deployToVercel, aliasDeployment, assignProjectDomain } from "@/lib/deployment/vercel";
import { siteDomainUrl } from "@/lib/deployment/url";
import { slugify } from "@/lib/utils";
import { notifyOwnerSiteLive } from "@/lib/notify/owner";

export type DeploymentLog = { at: string; status: string; message: string };

export class HostingNotConfiguredError extends Error {
  constructor() {
    super("Live hosting is not configured");
    this.name = "HostingNotConfiguredError";
  }
}

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

/** Only the files a visitor needs — not blueprint JSON or README. */
function isLiveHostFile(filePath: string): boolean {
  const p = filePath.replace(/\\/g, "/");
  if (p === "vercel.json") return true;
  if (p.endsWith(".html")) return true;
  if (p.startsWith("templates/") || p.startsWith("uploads/")) return true;
  return /\.(png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf|css|js)$/i.test(p);
}

function publicSiteFiles(files: ProjectFile[]): ProjectFile[] {
  return files.filter((f) => isLiveHostFile(f.path));
}

/**
 * Deployment Agent — publishes the generated site to live hosting (Vercel).
 * The client only clicks Make it live. Files are uploaded from this app; they
 * never download GitHub or log into the host.
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

  if (!env.deployment.enabled) {
    throw new HostingNotConfiguredError();
  }

  const subdomain = `${slugify(project.businessName)}-${project.id.slice(-6)}`;
  const fqdn = `${subdomain}.${env.deployment.platformDomain}`;
  let logs: DeploymentLog[] = [];

  logs = log(logs, DeploymentStatus.PENDING, "Publishing requested");
  await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.DEPLOYING } });
  await saveDeployment(projectId, { status: DeploymentStatus.BUILD_STARTED, subdomain, logs });

  const files = publicSiteFiles(
    await generateProjectFiles({
      businessName: project.businessName,
      blueprint: parsed.blueprint,
      site: parsed.assembledPages,
    })
  );

  try {
    logs = log(logs, DeploymentStatus.BUILD_STARTED, "Uploading the site to hosting");
    await saveDeployment(projectId, { status: DeploymentStatus.BUILD_STARTED, subdomain, logs });

    const result = await deployToVercel({ projectName: subdomain, files });
    logs = log(logs, DeploymentStatus.BUILD_STARTED, "Host confirmed the site is live");

    const liveUrl = siteDomainUrl(subdomain);
    await assignProjectDomain(result.projectId || subdomain, fqdn);
    await aliasDeployment(result.deploymentId, fqdn);
    logs = log(logs, DeploymentStatus.DEPLOYED, `Your domain is ${liveUrl}`);

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
