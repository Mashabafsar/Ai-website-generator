import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { generateProjectFiles, type ProjectFile } from "@/lib/export/generate-project";
import { GithubSyncStatus, PAID_PROJECT_STATUSES } from "@/lib/constants";
import { parseProject } from "@/lib/projects/projects";
import { slugify } from "@/lib/utils";

const SITES_README = [
  "# AI Website Builder Websites",
  "",
  "Paid client sites from Agency Partner Interactive.",
  "Each folder under `clients/` is one delivered website.",
  "",
].join("\n");

export class GithubNotConfiguredError extends Error {
  constructor(message = "GitHub is not configured (missing GITHUB_TOKEN).") {
    super(message);
    this.name = "GithubNotConfiguredError";
  }
}

async function getOctokit() {
  const { Octokit } = await import("@octokit/rest");
  return new Octokit({ auth: env.github.token });
}

type GithubClient = Awaited<ReturnType<typeof getOctokit>>;

function httpStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object" || !("status" in err)) return undefined;
  const status = (err as { status: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

function isNotFound(err: unknown): boolean {
  return httpStatus(err) === 404;
}

/** Empty repos reject Git Data API calls (blobs/refs/commits) with 409. */
function isEmptyRepo(err: unknown): boolean {
  if (httpStatus(err) === 409) return true;
  const message = err instanceof Error ? err.message : "";
  return /git repository is empty/i.test(message);
}

function posixPath(...parts: string[]): string {
  return parts
    .join("/")
    .replaceAll("\\", "/")
    .replace(/\/{2,}/g, "/")
    .replace(/^\//, "");
}

/** Unique folder under `clients/` in the shared sites repo. */
export function clientFolderName(businessName: string, projectId: string): string {
  return `${slugify(businessName)}-${projectId.slice(-6)}`;
}

function sitesTarget(): { owner: string; repo: string } {
  const target = env.github.sitesTarget;
  if (!target) {
    throw new GithubNotConfiguredError(
      "GitHub sites repo is not configured (set GITHUB_ORG or GITHUB_SITES_REPO)."
    );
  }
  return target;
}

function folderUrl(owner: string, repo: string, branch: string, folder: string): string {
  return `https://github.com/${owner}/${repo}/tree/${branch}/clients/${folder}`;
}

type TreeEntry = {
  path: string;
  mode: "100644";
  type: "blob";
  sha: string;
};

async function createBlob(
  octokit: GithubClient,
  owner: string,
  repo: string,
  content: string | Buffer
): Promise<string> {
  const body =
    typeof content === "string"
      ? { content, encoding: "utf-8" as const }
      : { content: content.toString("base64"), encoding: "base64" as const };
  const { data } = await octokit.git.createBlob({ owner, repo, ...body });
  return data.sha;
}

async function resolveHead(
  octokit: GithubClient,
  owner: string,
  repo: string,
  branch: string
): Promise<{ parentSha: string; baseTree: string } | null> {
  try {
    const ref = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const commit = await octokit.git.getCommit({ owner, repo, commit_sha: ref.data.object.sha });
    return { parentSha: ref.data.object.sha, baseTree: commit.data.tree.sha };
  } catch (err) {
    if (isNotFound(err) || isEmptyRepo(err)) return null;
    throw err;
  }
}

/**
 * Git Data API (blobs/trees/commits) cannot write to a zero-commit repo.
 * The Contents API can, so we drop a README to create `main` first.
 */
async function bootstrapEmptyRepo(
  octokit: GithubClient,
  owner: string,
  repo: string,
  branch: string
): Promise<{ parentSha: string; baseTree: string }> {
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "README.md",
      message: "chore: initialize AI-WEBSITE-BUILDER-WEBSITE",
      content: Buffer.from(SITES_README).toString("base64"),
      branch,
    });
  } catch (err) {
    const head = await resolveHead(octokit, owner, repo, branch);
    if (head) return head;
    throw err;
  }

  const head = await resolveHead(octokit, owner, repo, branch);
  if (!head) {
    throw new Error(`Could not initialize empty GitHub repository ${owner}/${repo}`);
  }
  return head;
}

async function commitTree(params: {
  owner: string;
  repo: string;
  branch: string;
  message: string;
  files: Array<{ path: string; content: string | Buffer }>;
  bootstrapEmpty: boolean;
}): Promise<string> {
  const { owner, repo, branch, message, files } = params;
  const octokit = await getOctokit();

  let head = await resolveHead(octokit, owner, repo, branch);
  if (!head) {
    if (!params.bootstrapEmpty) {
      throw new Error(`GitHub repository ${owner}/${repo} has no commits on ${branch}`);
    }
    head = await bootstrapEmptyRepo(octokit, owner, repo, branch);
  }

  const entries: TreeEntry[] = [];
  for (const file of files) {
    const sha = await createBlob(octokit, owner, repo, file.content);
    entries.push({ path: posixPath(file.path), mode: "100644", type: "blob", sha });
  }

  const { data: tree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: head.baseTree,
    tree: entries,
  });

  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: tree.sha,
    parents: [head.parentSha],
  });

  await octokit.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: commit.sha });
  return commit.sha;
}

/**
 * GitHub Repository Agent — commits a paid website into the shared
 * AI-WEBSITE-BUILDER-WEBSITE repo under `clients/<folder>/`.
 */
export async function syncProjectToGitHub(
  projectId: string
): Promise<{ repoUrl: string; commitSha: string }> {
  if (!env.github.enabled) throw new GithubNotConfiguredError();

  const { owner, repo } = sitesTarget();

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

  const folder = clientFolderName(project.businessName, project.id);
  const prefixed: ProjectFile[] = files.map((file) => ({
    path: posixPath("clients", folder, file.path),
    content: file.content,
  }));

  const octokit = await getOctokit();
  let branch = "main";
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    branch = data.default_branch || "main";
  } catch (err) {
    if (isNotFound(err)) {
      throw new GithubNotConfiguredError(
        `Sites repo ${owner}/${repo} was not found. Create AI-WEBSITE-BUILDER-WEBSITE and grant GITHUB_TOKEN write access.`
      );
    }
    throw err;
  }

  const commitSha = await commitTree({
    owner,
    repo,
    branch,
    message: `chore: sync ${folder} (${project.businessName})`,
    files: prefixed,
    bootstrapEmpty: true,
  });

  const repoUrl = folderUrl(owner, repo, branch, folder);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      githubRepoUrl: repoUrl,
      githubCommitSha: commitSha,
      githubSyncStatus: GithubSyncStatus.SYNCED,
    },
  });

  return { repoUrl, commitSha };
}

/** Best-effort sync: records FAILED instead of throwing. */
export async function trySyncProjectToGitHub(projectId: string): Promise<void> {
  try {
    await syncProjectToGitHub(projectId);
  } catch (err) {
    await prisma.project.update({
      where: { id: projectId },
      data: { githubSyncStatus: GithubSyncStatus.FAILED },
    });
    if (!(err instanceof GithubNotConfiguredError)) {
      console.error("GitHub sync failed:", err instanceof Error ? err.message : err);
    }
  }
}

/** Same as trySync, but a no-op when the project has not been paid for. */
export async function trySyncPaidProjectToGitHub(projectId: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { status: true },
  });
  if (!project || !PAID_PROJECT_STATUSES.has(project.status)) return;
  await trySyncProjectToGitHub(projectId);
}
