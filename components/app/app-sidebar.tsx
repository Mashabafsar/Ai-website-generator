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
  Users,
} from "lucide-react";
import { Logo, BrandMark } from "@/components/brand/logo";
import { useGenerationLock } from "@/components/app/generation-lock";
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
  const { locked, warnStay } = useGenerationLock();

  const explore: NavItem[] = isAdmin
    ? [
        ...EXPLORE,
        { href: "/app/admin/clients", label: "Clients", icon: Users },
        { href: "/app/admin/usage", label: "Usage", icon: ShieldCheck },
      ]
    : EXPLORE;

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col justify-between border-r border-line bg-white px-3 pb-4 pt-3 transition-[width] duration-200",
        collapsed ? "w-[64px]" : "w-[236px]",
        locked && "opacity-90"
      )}
      aria-busy={locked || undefined}
    >
      <div className="flex flex-col gap-6 pt-1.5">
        <ShellLink
          href="/app/dashboard"
          locked={locked}
          onBlocked={warnStay}
          aria-label="Dashboard"
          className={cn("block", collapsed && "flex justify-center")}
        >
          {collapsed ? <BrandMark className="h-7 w-auto" /> : <Logo />}
        </ShellLink>

        <ShellLink
          href="/app/templates"
          locked={locked}
          onBlocked={warnStay}
          className={cn(
            "flex h-10 items-center justify-center overflow-clip bg-primary text-primary-foreground text-[15px] transition-colors",
            locked ? "cursor-not-allowed opacity-60" : "hover:bg-primary-hover active:bg-primary-pressed",
            collapsed && "px-0"
          )}
        >
          {collapsed ? <Package className="size-5" /> : "Create Website"}
        </ShellLink>

        {locked && !collapsed ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs leading-snug text-amber-950">
            Creating your website — stay on this page. Menu links are paused until it finishes.
          </p>
        ) : null}

        <NavGroup
          label="Explore"
          items={explore}
          pathname={pathname}
          collapsed={collapsed}
          locked={locked}
          onBlocked={warnStay}
        />
        <NavGroup
          label="Projects"
          items={PROJECTS}
          pathname={pathname}
          collapsed={collapsed}
          locked={locked}
          onBlocked={warnStay}
        />
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

function ShellLink({
  href,
  locked,
  onBlocked,
  className,
  children,
  title,
  ...rest
}: {
  href: string;
  locked: boolean;
  onBlocked: () => void;
  className?: string;
  children: React.ReactNode;
  title?: string;
  "aria-label"?: string;
}) {
  if (locked) {
    return (
      <button
        type="button"
        className={cn(className, "w-full text-left")}
        onClick={onBlocked}
        aria-disabled="true"
        title={title}
        {...rest}
      >
        {children}
      </button>
    );
  }
  return (
    <Link href={href} className={className} title={title} {...rest}>
      {children}
    </Link>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  collapsed,
  locked,
  onBlocked,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  locked: boolean;
  onBlocked: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {!collapsed && <p className="text-sm text-ink">{label}</p>}
      <nav className="flex flex-col">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const className = cn(
            "flex items-center gap-2 overflow-clip rounded p-2 text-sm transition-colors",
            active
              ? "border border-line bg-primary-surface text-ink"
              : "border border-transparent bg-white text-ink",
            locked
              ? "cursor-not-allowed opacity-60"
              : !active && "hover:bg-primary-surface/60",
            collapsed && "justify-center"
          );
          return (
            <ShellLink
              key={item.label}
              href={item.href}
              locked={locked}
              onBlocked={onBlocked}
              title={item.label}
              className={className}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && <span className="min-w-px flex-1">{item.label}</span>}
            </ShellLink>
          );
        })}
      </nav>
    </div>
  );
}
