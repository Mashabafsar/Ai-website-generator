import { createHash } from "crypto";
import { env } from "@/lib/env";
import type { ProjectFile } from "@/lib/export/generate-project";

const API = "https://api.vercel.com";

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${env.deployment.token}` };
}

function sha1(content: string | Buffer): { sha: string; size: number; buffer: Buffer } {
  const buffer = typeof content === "string" ? Buffer.from(content, "utf8") : content;
  const sha = createHash("sha1").update(buffer).digest("hex");
  return { sha, size: buffer.length, buffer };
}

/** Upload a single file to Vercel's file store, keyed by its sha1 digest. */
async function uploadFile(sha: string, buffer: Buffer): Promise<void> {
  const res = await fetch(`${API}/v2/files`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/octet-stream",
      "x-vercel-digest": sha,
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(`Vercel file upload failed (${res.status}): ${await res.text()}`);
  }
}

export type VercelDeployResult = { deploymentId: string; url: string; readyState: string };

/**
 * Deploy static files to Vercel as a production deployment. Uploads each file by
 * digest, then creates the deployment referencing those digests.
 */
export async function deployToVercel(params: {
  projectName: string;
  files: ProjectFile[];
}): Promise<VercelDeployResult> {
  const { projectName, files } = params;

  const prepared = files.map((f) => ({ path: f.path, ...sha1(f.content) }));

  for (const f of prepared) {
    await uploadFile(f.sha, f.buffer);
  }

  const res = await fetch(`${API}/v13/deployments`, {
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
    throw new Error(`Vercel deployment failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { id: string; url: string; readyState?: string };
  return { deploymentId: data.id, url: data.url, readyState: data.readyState ?? "QUEUED" };
}

/** Best-effort: point a subdomain alias at the deployment. Requires the domain on the account. */
export async function aliasDeployment(deploymentId: string, alias: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/v2/deployments/${deploymentId}/aliases`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ alias }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
