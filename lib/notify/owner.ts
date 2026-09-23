import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/notify/email";

/**
 * Email the account owner that their site is live.
 */
export async function notifyOwnerSiteLive(params: {
  projectId: string;
  businessName: string;
  liveUrl: string;
}): Promise<void> {
  const to = await ownerEmail(params.projectId);
  if (!to) return;

  const appLink = `${env.appUrl.replace(/\/$/, "")}/app/project/${params.projectId}/deployment`;
  const subject = `${params.businessName} is live`;
  const text = [
    `${params.businessName} is now live.`,
    params.liveUrl,
    `Manage it here: ${appLink}`,
  ].join("\n");

  await sendEmail({
    to,
    subject,
    text,
    html: `<p><strong>${escapeHtml(params.businessName)}</strong> is now live.</p>
<p><a href="${escapeHtml(params.liveUrl)}">${escapeHtml(params.liveUrl)}</a></p>
<p><a href="${escapeHtml(appLink)}">Open your project</a></p>`,
  });
}

/**
 * Email the account owner that their website files are ready to download.
 */
export async function notifyOwnerZipReady(params: {
  projectId: string;
  businessName: string;
}): Promise<void> {
  const to = await ownerEmail(params.projectId);
  if (!to) return;

  const appLink = `${env.appUrl.replace(/\/$/, "")}/app/project/${params.projectId}/quote`;
  const subject = `${params.businessName} website files are ready`;
  const text = [
    `Your ${params.businessName} website files are ready to download.`,
    `Open your project: ${appLink}`,
  ].join("\n");

  await sendEmail({
    to,
    subject,
    text,
    html: `<p>Your <strong>${escapeHtml(params.businessName)}</strong> website files are ready to download.</p>
<p><a href="${escapeHtml(appLink)}">Open your project</a></p>`,
  });
}

async function ownerEmail(projectId: string): Promise<string | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { user: { select: { email: true } } },
  });
  return project?.user.email?.trim() || null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
