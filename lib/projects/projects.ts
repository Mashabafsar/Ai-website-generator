import type { Project } from "@prisma/client";
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
  return prisma.project.create({
    data: {
      userId,
      businessName: name,
      slug: slugify(name),
      status: ProjectStatus.DRAFT,
      templateId,
    },
  });
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
