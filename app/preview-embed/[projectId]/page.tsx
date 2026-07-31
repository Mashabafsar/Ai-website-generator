import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { getOwnedProject, parseProject } from "@/lib/projects/projects";
import { ProjectStatus } from "@/lib/constants";
import { PreviewFrameContent } from "@/components/editor/preview-frame-content";

export default async function PreviewEmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { projectId } = await params;
  const { page: pageSlug } = await searchParams;

  const raw = await getOwnedProject(userId, projectId);
  if (!raw) notFound();

  if (raw.status === ProjectStatus.DRAFT || !raw.blueprint) {
    notFound();
  }

  const project = parseProject(raw);
  const site = project.assembledPages;
  if (!site) notFound();

  const slug = pageSlug ?? site.pages[0]?.slug ?? "home";

  return (
    <div className="min-h-0 overflow-x-hidden bg-[var(--background,white)]">
      <PreviewFrameContent site={site} pageSlug={slug} />
    </div>
  );
}
