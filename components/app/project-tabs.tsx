"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Pencil, ReceiptText, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/app/project/${projectId}`;
  const tabs = [
    { href: `${base}/preview`, label: "Preview", icon: Eye },
    { href: `${base}/editor`, label: "Editor", icon: Pencil },
    { href: `${base}/quote`, label: "Quote", icon: ReceiptText },
    { href: `${base}/deployment`, label: "Deliver", icon: Rocket },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-lg border bg-card p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
