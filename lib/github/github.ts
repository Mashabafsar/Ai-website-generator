import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { generateProjectFiles, type ProjectFile } from "@/lib/export/generate-project";
import { GithubSyncStatus } from "@/lib/constants";
import { parseProject } from "@/lib/projects/projects";
import { slugify } from "@/lib/utils";
import type { Project } from "@prisma/client";

export class GithubNotConfiguredError extends Error {
  constructor() {
    super("GitHub is not configured (missing GITHUB_TOKEN).");
    this.name = "GithubNotConfiguredError";
  }
}

async function getOctokit() {
  const { Octokit } = await import("@octokit/rest");
  return new Octokit({ auth: env.github.token });
}

async function ensureRepo(project: Project): Promise<{ owner: string; repo: string; htmlUrl: string }> {
  const octokit = await getOctokit();
  const repoName = `${slugify(project.businessName)}-${project.id.slice(-6)}`;
  const isPrivate = env.github.visibility !== "public";

  // If we already have a repo URL, reuse it.
  if (project.githubRepoUrl) {
    const match = project.githubRepoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (match) return { owner: match[1], repo: match[2], htmlUrl: project.githubRepoUrl };
  }

  if (env.github.org) {
    const { data } = await octokit.repos.createInOrg({
      org: env.github.org,
      name: repoName,
      private: isPrivate,
      auto_init: true,
      description: `Website for ${project.businessName}`,
    });
    return { owner: data.owner.login, repo: data.name, htmlUrl: data.html_url };
  }

  const { data } = await octokit.repos.createForAuthenticatedUser({
    name: repoName,
    private: isPrivate,
    auto_init: true,
    description: `Website for ${project.businessName}`,
  });
  return { owner: data.owner.login, repo: data.name, htmlUrl: data.html_url };
}

async function upsertFile(
  owner: string,
  repo: string,
  file: ProjectFile,
  message: string
): Promise<void> {
  const octokit = await getOctokit();
  let sha: string | undefined;
  try {
    const existing = await octokit.repos.getContent({ owner, repo, path: file.path });
    if (!Array.isArray(existing.data) && "sha" in existing.data) sha = existing.data.sha;
  } catch {
    // File doesn't exist yet — that's fine.
  }
  const content =
    typeof file.content === "string"
      ? Buffer.from(file.content, "utf8").toString("base64")
      : file.content.toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: file.path,
    message,
    content,
    sha,
  });
}

/**
 * GitHub Repository Agent — commits the generated website to a private repo.
 * Runs after generation regardless of payment. Updates the project's github*
 * fields; never throws in a way that loses the DB project.
 */
export async function syncProjectToGitHub(projectId: string): Promise<{ repoUrl: string; commitSha: string }> {
  if (!env.github.enabled) throw new GithubNotConfiguredError();

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  const parsed = parseProject(project);
  if (!parsed.blueprint || !parsed.assembledPages) {
    throw new Error("Project has not been generated yet");
  }

  const files = await generateProjectFiles({
    businessName: project.businessName,
    blueprint: parsed.blueprint,
    site: parsed.assembledPages,
  });

  const { owner, repo, htmlUrl } = await ensureRepo(project);

  let lastSha = "";
  for (const file of files) {
    await upsertFile(owner, repo, file, `chore: update ${file.path}`);
  }

  // Record the latest commit sha on the default branch.
  const octokit = await getOctokit();
  try {
    const branch = await octokit.repos.getBranch({ owner, repo, branch: "main" });
    lastSha = branch.data.commit.sha;
  } catch {
    lastSha = "";
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      githubRepoUrl: htmlUrl,
      githubCommitSha: lastSha,
      githubSyncStatus: GithubSyncStatus.SYNCED,
    },
  });

  return { repoUrl: htmlUrl, commitSha: lastSha };
}

/** Best-effort sync used by the orchestrator: records FAILED instead of throwing. */
export async function trySyncProjectToGitHub(projectId: string): Promise<boolean> {
  try {
    await syncProjectToGitHub(projectId);
    return true;
  } catch (err) {
    await prisma.project.update({
      where: { id: projectId },
      data: { githubSyncStatus: GithubSyncStatus.FAILED },
    });
    if (!(err instanceof GithubNotConfiguredError)) {
      console.error("GitHub sync failed:", err);
    }
    return false;
  }
}
