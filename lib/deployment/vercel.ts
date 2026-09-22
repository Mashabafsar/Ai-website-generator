import { createHash } from "crypto";
import { env } from "@/lib/env";
import type { ProjectFile } from "@/lib/export/generate-project";

const API = "https://api.vercel.com";
const READY_TIMEOUT_MS = 90_000;
const POLL_MS = 2_000;

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${env.deployment.token}` };
}

function teamQuery(): string {
  const id = env.deployment.teamId.trim();
  return id ? `?teamId=${encodeURIComponent(id)}` : "";
}

function sha1(content: string | Buffer): { sha: string; size: number; buffer: Buffer } {
  const buffer = typeof content === "string" ? Buffer.from(content, "utf8") : content;
  const sha = createHash("sha1").update(buffer).digest("hex");
  return { sha, size: buffer.length, buffer };
}

/** Upload a single file to Vercel's file store, keyed by its sha1 digest. */
async function uploadFile(sha: string, buffer: Buffer): Promise<void> {
  const res = await fetch(`${API}/v2/files${teamQuery()}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/octet-stream",
      "x-vercel-digest": sha,
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(`Hosting upload failed (${res.status}): ${await safeText(res)}`);
  }
}

async function safeText(res: Response): Promise<string> {
  const text = await res.text();
  return text.replace(/Bearer\s+\S+/gi, "[redacted]").slice(0, 240);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type VercelDeployResult = {
  deploymentId: string;
  url: string;
  readyState: string;
  projectId?: string;
};

/**
 * Deploy static files to Vercel as a production deployment. Uploads each file by
 * digest, creates the deployment, then waits until it is actually READY.
 */
export async function deployToVercel(params: {
  projectName: string;
  files: ProjectFile[];
}): Promise<VercelDeployResult> {
  const { projectName, files } = params;

  const prepared = files
    .map((f) => ({ path: f.path.replace(/\\/g, "/"), ...sha1(f.content) }))
    .filter((f) => f.size > 0);

  for (let i = 0; i < prepared.length; i += 8) {
    await Promise.all(prepared.slice(i, i + 8).map((f) => uploadFile(f.sha, f.buffer)));
  }

  const res = await fetch(`${API}/v13/deployments${teamQuery()}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      name: projectName,
      files: prepared.map((f) => ({ file: f.path, sha: f.sha, size: f.size })),
      target: "production",
      projectSettings: { framework: null },
    }),
  });

  if (!res.ok) {
    throw new Error(`Hosting publish failed (${res.status}): ${await safeText(res)}`);
  }

  const data = (await res.json()) as { id: string; url: string; readyState?: string; projectId?: string };
  const ready = await waitUntilReady(data.id);
  return {
    deploymentId: data.id,
    url: ready.url || data.url,
    readyState: ready.readyState,
    projectId: ready.projectId || data.projectId,
  };
}

async function waitUntilReady(
  deploymentId: string
): Promise<{ url: string; readyState: string; projectId?: string }> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  let last = { url: "", readyState: "QUEUED", projectId: undefined as string | undefined };

  while (Date.now() < deadline) {
    const res = await fetch(`${API}/v13/deployments/${encodeURIComponent(deploymentId)}${teamQuery()}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Could not check publish status (${res.status}): ${await safeText(res)}`);
    }
    const data = (await res.json()) as {
      id: string;
      url: string;
      readyState?: string;
      projectId?: string;
    };
    last = {
      url: data.url ?? "",
      readyState: data.readyState ?? "QUEUED",
      projectId: data.projectId,
    };
    if (last.readyState === "READY") return last;
    if (last.readyState === "ERROR" || last.readyState === "CANCELED") {
      throw new Error("Hosting provider failed to publish the site.");
    }
    await sleep(POLL_MS);
  }

  throw new Error("Timed out waiting for the site to go live.");
}

/** Attach `{subdomain}.{PLATFORM_DOMAIN}` to the Vercel project so aliases can resolve. */
export async function assignProjectDomain(projectIdOrName: string, domain: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${API}/v10/projects/${encodeURIComponent(projectIdOrName)}/domains${teamQuery()}`,
      {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name: domain }),
      }
    );
    return res.ok || res.status === 409;
  } catch {
    return false;
  }
}

/** Best-effort: point a subdomain alias at the deployment. Requires the domain on the account. */
export async function aliasDeployment(deploymentId: string, alias: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/v2/deployments/${encodeURIComponent(deploymentId)}/aliases${teamQuery()}`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ alias }),
    });
    return res.ok || res.status === 409;
  } catch {
    return false;
  }
}
