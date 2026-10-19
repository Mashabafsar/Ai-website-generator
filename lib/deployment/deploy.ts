import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { DeploymentStatus, PackageType, ProjectStatus } from "@/lib/constants";
import { parseProject } from "@/lib/projects/projects";
import { withCustomerPhotos } from "@/lib/projects/customer-photos";
import { generateProjectFiles, type ProjectFile } from "@/lib/export/generate-project";
import {
  discardUnpublishedRelease,
  pruneOldReleases,
  publishSiteRelease,
  rememberPublishedRelease,
} from "@/lib/deployment/s3-sites";
import { slugify } from "@/lib/utils";
import { notifyOwnerSiteLive } from "@/lib/notify/owner";
import { hasPaidPackage } from "@/lib/payments/access";
import { CrmJobKind } from "@/lib/crm/config";
import { enqueueCrmJob } from "@/lib/crm/outbox";
import { scheduleCrmDrain } from "@/lib/crm/sync";

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
    release?: string;
    logs: DeploymentLog[];
  }
) {
  const release = data.release ? { release: data.release } : {};
  return prisma.deployment.upsert({
    where: { projectId },
    create: {
      projectId,
      status: data.status,
      subdomain: data.subdomain,
      liveUrl: data.liveUrl ?? undefined,
      provider: env.deployment.provider,
      logs: JSON.stringify(data.logs),
      ...release,
    },
    update: {
      status: data.status,
      subdomain: data.subdomain,
      liveUrl: data.liveUrl ?? undefined,
      provider: env.deployment.provider,
      logs: JSON.stringify(data.logs),
      ...release,
    },
  });
}

/**
 * Files a visitor needs. vercel.json stays in the ZIP export as optional
 * static-host config and is not published.
 */
function isLiveHostFile(filePath: string): boolean {
  const p = filePath.replace(/\\/g, "/");
  if (p === "vercel.json") return false;
  if (p.endsWith(".html")) return true;
  if (p.startsWith("templates/") || p.startsWith("uploads/")) return true;
  return /\.(png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf|css|js)$/i.test(p);
}

function publicSiteFiles(files: ProjectFile[]): ProjectFile[] {
  return files.filter((f) => isLiveHostFile(f.path));
}

/**
 * Deployment Agent — publishes the generated site to the sites bucket.
 * The client only clicks Make it live. Files are uploaded from this app.
 */
export async function deployProject(projectId: string): Promise<{
  status: string;
  liveUrl: string | null;
  subdomain: string;
}> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  const parsed = await withCustomerPhotos(parseProject(project));
  if (!parsed.blueprint || !parsed.assembledPages) {
    throw new Error("Website has not been generated yet");
  }

  if (!env.deployment.enabled) {
    throw new HostingNotConfiguredError();
  }

  const subdomain = `${slugify(project.businessName)}-${project.id.slice(-6)}`;
  const liveUrl = `https://${subdomain}.${env.deployment.platformDomain}`;
  let logs: DeploymentLog[] = [];
  let pendingRelease: string | null = null;

  logs = log(logs, DeploymentStatus.PENDING, "Publishing requested");
  await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.DEPLOYING } });
  await saveDeployment(projectId, { status: DeploymentStatus.BUILD_STARTED, subdomain, logs });

  try {
    const files = publicSiteFiles(
      await generateProjectFiles({
        businessName: project.businessName,
        blueprint: parsed.blueprint,
        site: parsed.assembledPages,
      })
    );

    logs = log(logs, DeploymentStatus.BUILD_STARTED, "Uploading the site to hosting");
    await saveDeployment(projectId, { status: DeploymentStatus.BUILD_STARTED, subdomain, logs });

    pendingRelease = await publishSiteRelease({ subdomain, files });
    logs = log(logs, DeploymentStatus.DEPLOYED, `Live at ${liveUrl}`);
    await saveDeployment(projectId, {
      status: DeploymentStatus.DEPLOYED,
      subdomain,
      liveUrl,
      release: pendingRelease,
      logs,
    });
    rememberPublishedRelease(subdomain, pendingRelease);
    const releaseId = pendingRelease;
    pendingRelease = null;

    await markProjectLive(projectId);
    await removeOlderReleases(subdomain, releaseId);
    await tellOwnerTheSiteIsLive({ projectId, businessName: project.businessName, liveUrl });
    await refreshCrmAfterGoingLive(projectId, project.userId);
    return { status: DeploymentStatus.DEPLOYED, liveUrl, subdomain };
  } catch (err) {
    if (pendingRelease) {
      await discardUnpublishedRelease(subdomain, pendingRelease);
    }
    console.error("[sites] publish failed:", err);
    const message = err instanceof Error ? err.message : "We couldn't put the site online";
    logs = log(logs, DeploymentStatus.FAILED, message);
    await recordFailedPublish(projectId, subdomain, liveUrl, logs);
    throw err;
  }
}

async function markProjectLive(projectId: string): Promise<void> {
  try {
    await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.LIVE } });
  } catch (err) {
    console.error("[sites] could not mark the project live:", err);
  }
}

async function removeOlderReleases(subdomain: string, releaseId: string): Promise<void> {
  try {
    await pruneOldReleases(subdomain, releaseId);
  } catch (err) {
    console.error("[sites] could not remove older releases:", err);
  }
}

async function tellOwnerTheSiteIsLive(params: {
  projectId: string;
  businessName: string;
  liveUrl: string;
}): Promise<void> {
  try {
    await notifyOwnerSiteLive(params);
  } catch (err) {
    console.error("[sites] live notification failed:", err);
  }
}

async function recordFailedPublish(
  projectId: string,
  subdomain: string,
  liveUrl: string,
  logs: DeploymentLog[]
): Promise<void> {
  try {
    const existing = await prisma.deployment.findUnique({
      where: { projectId },
      select: { release: true, liveUrl: true },
    });
    if (existing?.release?.trim()) {
      const kept = log(logs, DeploymentStatus.DEPLOYED, "The previous version is still online.");
      await saveDeployment(projectId, {
        status: DeploymentStatus.DEPLOYED,
        subdomain,
        liveUrl: existing.liveUrl ?? liveUrl,
        logs: kept,
      });
      await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.LIVE } });
      return;
    }
    await saveDeployment(projectId, { status: DeploymentStatus.FAILED, subdomain, liveUrl: null, logs });
    await prisma.project.update({ where: { id: projectId }, data: { status: ProjectStatus.PAID } });
  } catch (err) {
    console.error("[sites] could not record the failed publish:", err);
  }
}

/**
 * The CRM was written at payment time, when the only URL that existed was the
 * preview. Now that there's a real address, re-queue the contact and every
 * purchase deal for this project so they point at the live site.
 */
async function refreshCrmAfterGoingLive(projectId: string, userId: string): Promise<void> {
  try {
    await enqueueCrmJob({ kind: CrmJobKind.CONTACT_SYNC, userId });
    await enqueueCrmJob({
      kind: CrmJobKind.PURCHASE_DEAL,
      userId,
      projectId,
      dedupeKey: `${CrmJobKind.PURCHASE_DEAL}:${userId}`,
    });
    scheduleCrmDrain();
  } catch (err) {
    console.error("[crm] live-URL refresh failed:", err instanceof Error ? err.message : err);
  }
}

/** After managed-hosting payment: publish unless the site is already live or in flight. */
export async function publishManagedSiteIfDue(projectId: string): Promise<void> {
  const paid = await hasPaidPackage(projectId, PackageType.MANAGED_HOSTING);
  if (!paid) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project?.blueprint) return;
  if (project.status === ProjectStatus.LIVE || project.status === ProjectStatus.DEPLOYING) return;
  await deployProject(projectId);
}
