import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@/lib/constants";

const MAP: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "brand" }> = {
  [ProjectStatus.DRAFT]: { label: "Draft", variant: "secondary" },
  [ProjectStatus.GENERATING]: { label: "Writing your site", variant: "warning" },
  [ProjectStatus.GENERATED]: { label: "Ready to review", variant: "brand" },
  [ProjectStatus.QUOTED]: { label: "Price ready", variant: "default" },
  [ProjectStatus.PAID]: { label: "Paid", variant: "success" },
  [ProjectStatus.EXPORTED]: { label: "Files ready", variant: "success" },
  [ProjectStatus.DEPLOYING]: { label: "Going live", variant: "warning" },
  [ProjectStatus.LIVE]: { label: "Live", variant: "success" },
  [ProjectStatus.FAILED]: { label: "Failed", variant: "secondary" },
};

export function StatusBadge({ status }: { status: string }) {
  const item = MAP[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
