"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  Coins,
  Grid2x2,
  LayoutDashboard,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Logo, BrandMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

// App shell sidebar — the dashboard design system's left rail: brand mark, a
// primary "Create Website" CTA, grouped nav, and a collapse toggle. Only real
// routes are listed; the design's placeholder entries (CMS, Learn…) land as
// they ship.

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const EXPLORE: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/templates", label: "Templates", icon: Package },
  { href: "/app/credits", label: "Credits", icon: Coins },
];

const PROJECTS: NavItem[] = [{ href: "/app/dashboard", label: "All", icon: Grid2x2 }];

function isActive(pathname: string, href: string): boolean {
  if (href === "/app/dashboard") return pathname === "/app/dashboard" || pathname.startsWith("/app/project");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const explore: NavItem[] = isAdmin
    ? [...EXPLORE, { href: "/app/admin/usage", label: "Admin", icon: ShieldCheck }]
    : EXPLORE;

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col justify-between border-r border-line bg-white px-3 pb-4 pt-3 transition-[width] duration-200",
        collapsed ? "w-[64px]" : "w-[236px]"
      )}
    >
      <div className="flex flex-col gap-6 pt-1.5">
        <Link
          href="/app/dashboard"
          aria-label="Dashboard"
          className={cn("block", collapsed && "flex justify-center")}
        >
          {collapsed ? <BrandMark className="h-7 w-auto" /> : <Logo />}
        </Link>

        <Link
          href="/app/templates"
          className={cn(
            "flex h-10 items-center justify-center overflow-clip bg-primary text-primary-foreground text-[15px] transition-colors hover:bg-primary-hover active:bg-primary-pressed",
            collapsed && "px-0"
          )}
        >
          {collapsed ? <Package className="size-5" /> : "Create Website"}
        </Link>

        <NavGroup label="Explore" items={explore} pathname={pathname} collapsed={collapsed} />
        <NavGroup label="Projects" items={PROJECTS} pathname={pathname} collapsed={collapsed} />
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-line bg-white p-0.5"
        aria-label={collapsed ? "Expand menu" : "Collapse menu"}
      >
        <span className="flex flex-1 items-center justify-center gap-2 rounded-lg border-[0.5px] border-line px-3.5 py-2 text-sm font-medium text-ink">
          {collapsed ? (
            <ChevronsRight className="size-5" />
          ) : (
            <>
              <ChevronsLeft className="size-5" />
              Collapse Menu
            </>
          )}
        </span>
      </button>
    </aside>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  collapsed,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {!collapsed && <p className="text-sm text-ink">{label}</p>}
      <nav className="flex flex-col">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-2 overflow-clip rounded p-2 text-sm transition-colors",
                active
                  ? "border border-line bg-primary-surface text-ink"
                  : "border border-transparent bg-white text-ink hover:bg-primary-surface/60",
                collapsed && "justify-center"
              )}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && <span className="min-w-px flex-1">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
