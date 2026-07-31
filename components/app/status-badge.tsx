import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@/lib/constants";

const MAP: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "brand" }> = {
  [ProjectStatus.DRAFT]: { label: "Draft", variant: "secondary" },
  [ProjectStatus.GENERATING]: { label: "Generating", variant: "warning" },
  [ProjectStatus.GENERATED]: { label: "Generated", variant: "brand" },
  [ProjectStatus.QUOTED]: { label: "Quoted", variant: "default" },
  [ProjectStatus.PAID]: { label: "Paid", variant: "success" },
  [ProjectStatus.EXPORTED]: { label: "Exported", variant: "success" },
  [ProjectStatus.DEPLOYING]: { label: "Deploying", variant: "warning" },
  [ProjectStatus.LIVE]: { label: "Live", variant: "success" },
  [ProjectStatus.FAILED]: { label: "Failed", variant: "secondary" },
};

export function StatusBadge({ status }: { status: string }) {
  const item = MAP[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
