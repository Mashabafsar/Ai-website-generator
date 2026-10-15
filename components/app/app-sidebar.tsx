"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useGenerationLock } from "@/components/app/generation-lock";
import { cn } from "@/lib/utils";
import { AnimatePresence, Easing, motion, Transition } from "motion/react"
import { MotionLink } from "../ui/motion";

// App rail from the sidebar study: 320px open, 100px collapsed, charcoal
// ground, Onest 14/16 labels, hairline rules, and a blue stroke on the
// current item.

type Match = "exact" | "prefix" | "project";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  activeIcon: string;
  gapClass: string;
  match: Match;
};

const EXPLORE: NavItem[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    icon: "/shell/dashboard.svg",
    activeIcon: "/shell/dashboard-active.svg",
    gapClass: "gap-3",
    match: "exact",
  },
  {
    href: "/app/templates",
    label: "Templates",
    icon: "/shell/templates.svg",
    activeIcon: "/shell/templates-active.svg",
    gapClass: "gap-[9px]",
    match: "prefix",
  },
  {
    href: "/app/credits",
    label: "Credits",
    icon: "/shell/credits.svg",
    activeIcon: "/shell/credits-active.svg",
    gapClass: "gap-[9px]",
    match: "prefix",
  },
];

const ADMIN_EXPLORE: NavItem[] = [
  {
    href: "/app/admin/clients",
    label: "Clients",
    icon: "/shell/clients.svg",
    activeIcon: "/shell/clients-active.svg",
    gapClass: "gap-[9px]",
    match: "prefix",
  },
  {
    href: "/app/admin/usage",
    label: "Usage",
    icon: "/shell/usage.svg",
    activeIcon: "/shell/usage-active.svg",
    gapClass: "gap-[9px]",
    match: "prefix",
  },
];

const PROJECTS: NavItem[] = [
  {
    href: "/app/dashboard",
    label: "All Projects",
    icon: "/shell/projects.svg",
    activeIcon: "/shell/projects-active.svg",
    gapClass: "gap-[9px]",
    match: "project",
  },
];

const ACCOUNT: { label: string; icon: string }[] = [
  { label: "Help", icon: "/shell/help.svg" },
  { label: "Settings", icon: "/shell/settings.svg" },
];

const SECTION_LABEL =
  "pl-[26px] text-[14px] font-medium leading-[30px] whitespace-nowrap text-[#a3a3a3]";

function isActive(pathname: string, item: NavItem): boolean {
  if (item.match === "exact") return pathname === item.href;
  if (item.match === "project") return pathname.startsWith("/app/project");
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}



export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { locked, warnStay } = useGenerationLock();
  const explore = isAdmin ? [...EXPLORE, ...ADMIN_EXPLORE] : EXPLORE;

  const transition: Transition = {
    duration: 0.2,
    ease: 'linear',
  };

  return (
    <motion.aside
    animate={{
      width: collapsed ? "100px" : "320px",
    }}
    transition={transition}
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-[#1c1c1c] text-white transition-[width] duration-200",
        locked && "opacity-90",
        // collapsed ? "w-[100px]" : "w-[320px]",
      )}
      
      aria-busy={locked || undefined}
    >
      <div className="relative h-[128px] shrink-0">
      <AnimatePresence>
        {!collapsed && (
          <motion.div  initial={{ opacity: 0, transition: { ...transition, delay: 1 } }} 
          animate={{ 
            opacity: 1,
            transition: { ...transition, delay: 0.2 } // Delay on enter
          }} 
          exit={{ 
            opacity: 0,
            transition: { ...transition, delay: 0 } // No delay on exit
          }}>
          
            <ShellLink
              href="/app/dashboard"
              locked={locked}
              onBlocked={warnStay}
              aria-label="Agency Partner Interactive"
              className="absolute left-[26px] top-[30px] hover:bg-[#272727]"
            >
              <ShellLogo />
            </ShellLink></motion.div>
        )}
        </AnimatePresence>
        <motion.button
          type="button"
          animate={{
            left: collapsed ? "45px" : "274px",
            rotate: collapsed ? "180deg" : "0deg",
          }}
          transition={transition}
          onClick={() => setCollapsed((open) => !open)}
          className={cn(
            "absolute top-[44px] focus-visible:outline transition-color focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d71fb] left-[274px]",
            collapsed ? "text-blue-500" : "text-white"
          )}
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        >
          <Glyph src="/shell/collapse.svg" className="h-[19.5px] w-[19.5px]" />
        </motion.button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {locked && !collapsed ? (
          <p className="mx-[26px] mb-3 border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs leading-snug text-amber-950">
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
          className="mt-[30px]"
        />
      </div>

      <div className="shrink-0 pb-[26px]">
        <p className={SECTION_LABEL}>Account</p>
        <div className="mx-[26px] mt-1 overflow-hidden bg-[#272727]">
          {ACCOUNT.map((item, index) => (
            <div
              key={item.label}
              title={item.label}
              className="relative flex h-[50px] items-center gap-[9px] px-3"
            >
              <Glyph src={item.icon} className="size-6" />
              <span className={cn("text-[16px] font-medium leading-[30px] whitespace-nowrap", collapsed && "sr-only")}>
                {item.label}
              </span>
              {index === 0 ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[#535353]" /> : null}
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}

const INTERACTIVE: { src: string; left: number; width: number; height: number }[] = [
  { src: "/shell/i1.svg", left: 86.35, width: 0.827771, height: 5.58746 },
  { src: "/shell/i2.svg", left: 91.32, width: 3.93191, height: 5.58746 },
  { src: "/shell/i3.svg", left: 99.39, width: 3.31109, height: 5.58746 },
  { src: "/shell/i4.svg", left: 106.84, width: 2.8972, height: 5.58746 },
  { src: "/shell/i5.svg", left: 113.87, width: 3.51803, height: 5.58746 },
  { src: "/shell/i6.svg", left: 121.53, width: 4.55274, height: 5.58746 },
  { src: "/shell/i7.svg", left: 130.22, width: 4.3458, height: 5.7944 },
  { src: "/shell/i8.svg", left: 138.71, width: 3.31109, height: 5.58746 },
  { src: "/shell/i9.svg", left: 146.16, width: 0.827771, height: 5.58746 },
  { src: "/shell/i10.svg", left: 151.12, width: 4.55274, height: 5.58746 },
  { src: "/shell/i11.svg", left: 159.82, width: 2.8972, height: 5.58746 },
];

function ShellLogo() {
  return (
    <span className="relative block h-[41.542px] w-[219px]" aria-hidden>
      <Glyph src="/shell/logo-mark.svg" className="absolute left-0 top-0 h-[40.704px] w-[52.7216px]" />
      <Glyph
        src="/shell/logo-wordmark.svg"
        className="absolute left-[57.14px] top-[11.07px] h-[25.504px] w-[161.859px]"
      />
      {INTERACTIVE.map((letter) => (
        <Glyph
          key={letter.src}
          src={letter.src}
          className="absolute"
          style={{
            left: `${57.14 + letter.left}px`,
            top: "34.87px",
            width: `${letter.width}px`,
            height: `${letter.height}px`,
          }}
        />
      ))}
    </span>
  );
}

function Glyph({
  src,
  className,
  style,
}: {
  src: string;
  className: string;
  style?: React.CSSProperties;
}) {
  return <img alt="" src={src} style={style} className={cn("max-w-none shrink-0", className)} />;
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
  "aria-current"?: "page" | undefined;
}) {
  if (locked) {
    return (
      <button
        type="button"
        className={cn(className, "text-left")}
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
    <MotionLink href={href} className={cn("transition-all  hover:bg-[#3e3e3e]",className)} title={title} {...rest}
    whileHover={{
      paddingLeft: 20,
    }}
    transition={{
      duration: 0.05,
      ease: 'easeIn',
    }}
    >
      {children}
    </MotionLink>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  collapsed,
  locked,
  onBlocked,
  className,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  locked: boolean;
  onBlocked: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className={SECTION_LABEL}>{label}</p>
      <nav className="mx-[26px] mt-[6px] flex flex-col">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <ShellLink
              key={item.label}
              href={item.href}
              locked={locked}
              onBlocked={onBlocked}
              title={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-[50px] items-center overflow-hidden bg-[#272727] px-3 text-[16px] font-medium leading-[30px] text-white focus-visible:shadow-[inset_0_0_0_1px_#4d71fb] focus-visible:outline-none",
                item.gapClass,
                active && "shadow-[inset_0_0_0_1px_#4d71fb]",
                locked ? "cursor-not-allowed opacity-60" : undefined,
                collapsed && "w-12"
              )}
            >
              <Glyph src={active ? item.activeIcon : item.icon} className="size-6" />
              <span className={cn("whitespace-nowrap", collapsed && "sr-only")}>{item.label}</span>
              {active ? null : (
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[#535353]" />
              )}
            </ShellLink>
          );
        })}
      </nav>
    </div>
  );
}
