import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Github,
  Globe,
  LayoutTemplate,
  Pencil,
  Plus,
  Sparkles,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getUserProjectWithRelations } from "@/lib/projects/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/app/status-badge";
import { ProjectStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const project = await getUserProjectWithRelations(session.user.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Hi {session.user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {project ? "Here's your website project." : "Let's build your website."}
        </p>
      </div>

      {project ? <ProjectPanel project={project} /> : <EmptyState />}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="overflow-hidden">
      <div className="hero-aurora relative p-10">
        <div className="grid-texture absolute inset-0 opacity-40" />
        <div className="relative max-w-lg">
          <Badge variant="brand" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" /> Free credits ready
          </Badge>
          <h2 className="font-display text-3xl font-bold text-white">
            Pick a design to start
          </h2>
          <p className="mt-3 text-white/70">
            Choose a complete website design from the library, tell us about your
            business, and our AI writes the content for it — saved to GitHub
            automatically.
          </p>
          <Button asChild size="lg" variant="brand" className="mt-6 group">
            <Link href="/app/templates">
              Browse templates
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ProjectPanel({
  project,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getUserProjectWithRelations>>>;
}) {
  const { label, href } = nextStep(project);
  const hasGenerated = ["GENERATED", "QUOTED", "PAID", "EXPORTED", "DEPLOYING", "LIVE"].includes(
    project.status
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">{project.businessName}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">/{project.slug}</p>
          </div>
          <StatusBadge status={project.status} />
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {hasGenerated
              ? "Your site has been generated. Continue editing, get a quote, or ship it."
              : "Continue where you left off to generate your website."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="brand" className="group">
              <Link href={href}>
                {label}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            {hasGenerated && (
              <>
                <Button asChild variant="outline">
                  <Link href={`/app/project/${project.id}/editor`}>
                    <Pencil className="h-4 w-4" /> Editor
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/app/project/${project.id}/quote`}>Get a quote</Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatusRow
              icon={<Github className="h-4 w-4" />}
              label="GitHub backup"
              value={
                project.githubRepoUrl ? (
                  <a
                    href={project.githubRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    View repo
                  </a>
                ) : (
                  <span className="text-muted-foreground">{githubStatusLabel(project.githubSyncStatus, hasGenerated)}</span>
                )
              }
            />
            <StatusRow
              icon={<Globe className="h-4 w-4" />}
              label="Live site"
              value={
                project.deployment?.liveUrl ? (
                  <a
                    href={project.deployment.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    Open
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not deployed</span>
                )
              }
            />
            <StatusRow
              icon={<LayoutTemplate className="h-4 w-4" />}
              label="Preview"
              value={
                hasGenerated ? (
                  <Link href={`/app/project/${project.id}/preview`} className="text-primary hover:underline">
                    Open preview
                  </Link>
                ) : (
                  <span className="text-muted-foreground">After generation</span>
                )
              }
            />
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="flex items-start gap-3 pt-6 text-sm text-muted-foreground">
            <Plus className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              One website per account. Editing and AI rewrites stay available on this
              project.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function githubStatusLabel(status: string, hasGenerated: boolean): string {
  if (!hasGenerated) return "After generation";
  if (status === "PENDING") return "Syncing…";
  if (status === "FAILED") return "Sync failed";
  return "—";
}

function nextStep(project: {
  id: string;
  status: string;
  templateId: string | null;
  questionnaire: unknown;
}): { label: string; href: string } {
  const base = `/app/project/${project.id}`;
  switch (project.status) {
    case ProjectStatus.DRAFT:
      if (!project.templateId) return { label: "Choose a design", href: "/app/templates" };
      return project.questionnaire
        ? { label: "Generate website", href: `${base}/questionnaire` }
        : { label: "Continue questionnaire", href: `${base}/questionnaire` };
    case ProjectStatus.GENERATING:
      return { label: "View progress", href: `${base}/preview` };
    default:
      return { label: "Open preview", href: `${base}/preview` };
  }
}
