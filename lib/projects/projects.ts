import { Prisma, type Project } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { ProjectStatus } from "@/lib/constants";
import type { WebsiteBlueprint, AssembledSite, ThemeTokens } from "@/lib/blueprint/types";

export class ProjectLimitError extends Error {
  constructor() {
    super("You can only create one website per account.");
    this.name = "ProjectLimitError";
  }
}

/** True when the user already has their one project (lookup hit or unique-constraint race). */
export function isProjectLimitError(error: unknown): boolean {
  if (error instanceof ProjectLimitError) return true;
  if (error instanceof Error && error.name === "ProjectLimitError") return true;
  return isUniqueUserIdConstraint(error);
}

function isUniqueUserIdConstraint(error: unknown): boolean {
  const code =
    error instanceof Prisma.PrismaClientKnownRequestError
      ? error.code
      : error && typeof error === "object" && "code" in error
        ? String((error as { code: unknown }).code)
        : null;
  if (code !== "P2002") return false;

  const target =
    error instanceof Prisma.PrismaClientKnownRequestError
      ? error.meta?.target
      : error && typeof error === "object" && "meta" in error
        ? (error as { meta?: { target?: unknown } }).meta?.target
        : undefined;
  if (target == null) return true;
  if (Array.isArray(target)) return target.includes("userId");
  if (typeof target === "string") return target === "userId" || target.includes("userId");
  return true;
}

/** Draft and failed sites can still swap designs for free before generation. */
export function canChangeProjectDesign(status: string): boolean {
  return status === ProjectStatus.DRAFT || status === ProjectStatus.FAILED;
}

/**
 * Where an existing project should continue — same destinations as the dashboard CTA.
 */
export function nextProjectStep(project: {
  id: string;
  status: string;
  templateId: string | null;
  questionnaire?: unknown;
}): { label: string; href: string } {
  const base = `/app/project/${project.id}`;
  switch (project.status) {
    case ProjectStatus.DRAFT:
      if (!project.templateId) return { label: "Choose a design", href: "/app/templates" };
      return project.questionnaire
        ? { label: "Generate website", href: `${base}/questionnaire` }
        : { label: "Continue questionnaire", href: `${base}/questionnaire` };
    case ProjectStatus.FAILED:
      return { label: "Continue questionnaire", href: `${base}/questionnaire` };
    case ProjectStatus.GENERATING:
      return { label: "View progress", href: `${base}/preview` };
    default:
      return { label: "Open preview", href: `${base}/preview` };
  }
}

/** The single project belonging to a user (or null). */
export async function getUserProject(userId: string): Promise<Project | null> {
  return prisma.project.findUnique({ where: { userId } });
}

/** Fetch a project by id only if it belongs to the user. */
export async function getOwnedProject(userId: string, projectId: string): Promise<Project | null> {
  return prisma.project.findFirst({ where: { id: projectId, userId } });
}

export async function getUserProjectWithRelations(userId: string) {
  return prisma.project.findUnique({
    where: { userId },
    include: { questionnaire: true, quote: true, payments: true, deployment: true },
  });
}

/**
 * Create the user's single project. Enforces one-project-per-user via the unique
 * constraint on Project.userId; throws ProjectLimitError if one already exists.
 */
export async function createProjectForUser(
  userId: string,
  businessName: string,
  templateId: string
): Promise<Project> {
  const existing = await prisma.project.findUnique({ where: { userId } });
  if (existing) throw new ProjectLimitError();

  const name = businessName.trim() || "My Website";
  try {
    return await prisma.project.create({
      data: {
        userId,
        businessName: name,
        slug: slugify(name),
        status: ProjectStatus.DRAFT,
        templateId,
      },
    });
  } catch (error) {
    // Two tabs can both pass the lookup and then collide on Project.userId.
    if (isUniqueUserIdConstraint(error)) throw new ProjectLimitError();
    throw error;
  }
}

/** Parsed project view with typed JSON fields. */
export type ParsedProject = Omit<Project, "blueprint" | "assembledPages" | "theme"> & {
  blueprint: WebsiteBlueprint | null;
  assembledPages: AssembledSite | null;
  theme: ThemeTokens | null;
};

export function parseProject(project: Project): ParsedProject {
  return {
    ...project,
    blueprint: safeParse<WebsiteBlueprint>(project.blueprint),
    assembledPages: safeParse<AssembledSite>(project.assembledPages),
    theme: safeParse<ThemeTokens>(project.theme),
  };
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
