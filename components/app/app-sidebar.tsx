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
        "sticky top-0 flex h-screen shrink-0 flex-col bg-[#1c1c1c] text-white",
        locked && "opacity-90",
        // collapsed ? "w-[100px]" : "w-[320px]",
      )}

      aria-busy={locked || undefined}
    >
      <div className="relative h-32 shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, transition: { ...transition, delay: 1 } }}
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
                className="absolute left-6.5 top-7.5 hover:bg-[#1c1c1c]"
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
            "absolute top-11 focus-visible:outline transition-color focus-visible:outline-offset-2 focus-visible:outline-[#4d71fb] left-68.5",
            collapsed ? "fill-blue-500" : "fill-[#727272]"
          )}
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" overflow="visible" style={{ display: 'block' }} width="19.5" height="19.5" viewBox="0 0 19.5 19.5" fill="inherit">
            <g id="Left Square 1">
              <g id="Vector">
                <path d="M9.47796 6.28269C9.77216 5.99111 9.77427 5.51624 9.48269 5.22204C9.19111 4.92784 8.71624 4.92573 8.42204 5.21731L6.98091 6.64563C6.44474 7.17702 5.99754 7.62022 5.67869 8.01724C5.34427 8.43367 5.08989 8.87131 5.02193 9.4045C5.00731 9.51921 5 9.6346 5 9.75C5 9.8654 5.00731 9.98079 5.02193 10.0955C5.08989 10.6287 5.34426 11.0663 5.67869 11.4828C5.99753 11.8798 6.44472 12.323 6.9809 12.8544L8.42204 14.2827C8.71624 14.5743 9.19111 14.5722 9.48269 14.278C9.77427 13.9838 9.77216 13.5089 9.47796 13.2173L8.06758 11.8195C7.49268 11.2497 7.10733 10.8661 6.84823 10.5435C6.84526 10.5398 6.84231 10.5361 6.83939 10.5325C6.83063 10.5215 6.8221 10.5107 6.81379 10.5H13.75C14.1642 10.5 14.5 10.1642 14.5 9.75C14.5 9.33579 14.1642 9 13.75 9H6.81379C6.82487 8.98578 6.83635 8.97128 6.84823 8.95649C7.10733 8.63386 7.49268 8.25033 8.06758 7.68054L9.47796 6.28269Z" />
                <path fillRule="evenodd" clipRule="evenodd" d="M14.2135 0.123728C13.0714 -1.45286e-05 11.6318 -8.0335e-06 9.79525 1.32337e-07H9.70475C7.86821 -8.0335e-06 6.42861 -1.45286e-05 5.28648 0.123728C4.12094 0.250006 3.17656 0.512324 2.37024 1.09815C1.88209 1.45281 1.45281 1.88209 1.09815 2.37024C0.512324 3.17656 0.250006 4.12094 0.123728 5.28648C-1.45286e-05 6.42861 -8.0335e-06 7.86821 1.32337e-07 9.70475V9.79525C-8.0335e-06 11.6318 -1.45286e-05 13.0714 0.123728 14.2135C0.250006 15.3791 0.512324 16.3234 1.09815 17.1298C1.45281 17.6179 1.88209 18.0472 2.37024 18.4018C3.17656 18.9877 4.12094 19.25 5.28648 19.3763C6.42859 19.5 7.86817 19.5 9.70465 19.5H9.79527C11.6318 19.5 13.0714 19.5 14.2135 19.3763C15.3791 19.25 16.3234 18.9877 17.1298 18.4018C17.6179 18.0472 18.0472 17.6179 18.4018 17.1298C18.9877 16.3234 19.25 15.3791 19.3763 14.2135C19.5 13.0714 19.5 11.6318 19.5 9.79535V9.70473C19.5 7.86824 19.5 6.42859 19.3763 5.28648C19.25 4.12094 18.9877 3.17656 18.4018 2.37024C18.0472 1.88209 17.6179 1.45281 17.1298 1.09815C16.3234 0.512324 15.3791 0.250006 14.2135 0.123728ZM3.25191 2.31168C3.75992 1.94259 4.41013 1.72745 5.44804 1.615C6.49999 1.50103 7.85843 1.5 9.75 1.5C11.6416 1.5 13 1.50103 14.052 1.615C15.0899 1.72745 15.7401 1.94259 16.2481 2.31168C16.6089 2.57382 16.9262 2.89111 17.1883 3.25191C17.5574 3.75992 17.7725 4.41013 17.885 5.44804C17.999 6.49999 18 7.85843 18 9.75C18 11.6416 17.999 13 17.885 14.052C17.7725 15.0899 17.5574 15.7401 17.1883 16.2481C16.9262 16.6089 16.6089 16.9262 16.2481 17.1883C15.7401 17.5574 15.0899 17.7725 14.052 17.885C13 17.999 11.6416 18 9.75 18C7.85843 18 6.49999 17.999 5.44804 17.885C4.41013 17.7725 3.75992 17.5574 3.25191 17.1883C2.89111 16.9262 2.57382 16.6089 2.31168 16.2481C1.94259 15.7401 1.72745 15.0899 1.615 14.052C1.50103 13 1.5 11.6416 1.5 9.75C1.5 7.85843 1.50103 6.49999 1.615 5.44804C1.72745 4.41013 1.94259 3.75992 2.31168 3.25191C2.57382 2.89111 2.89111 2.57382 3.25191 2.31168Z" />
              </g>
            </g>
          </svg>
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
          className="mt-7.5"
        />
      </div>

      <div className="shrink-0 pb-6.5">
        <p className={SECTION_LABEL}>Account</p>
        <div className="mx-6.5 mt-1 overflow-hidden bg-[#272727]">
          {ACCOUNT.map((item, index) => (
            <div
              key={item.label}
              title={item.label}
              className="relative flex h-12.5 items-center gap-2.25 px-3"
            >
              <Glyph src={item.icon} className="size-6" />
              <span className={cn("text-[16px] font-medium leading-7.5 whitespace-nowrap", collapsed && "sr-only")}>
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
    <MotionLink href={href} className={cn("transition-all  hover:bg-[#3e3e3e]", className)} title={title} {...rest}
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

const MotionShellLink = motion(ShellLink);

function NavGroup({
  label,
  items,
  pathname,
  collapsed,
  locked,
  onBlocked,
  className,
}: Readonly<{
  label: string;
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  locked: boolean;
  onBlocked: () => void;
  className?: string;
}>) {
  return (
    <div className={className}>
      <p className={SECTION_LABEL}>{label}</p>
      <nav className="mx-6.5 mt-1.5 flex flex-col">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <MotionShellLink
              key={item.label}
              href={item.href}
              locked={locked}
              onBlocked={onBlocked}
              title={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-12.5 items-center overflow-hidden bg-[#272727] px-3 text-[16px] font-medium leading-7.5 text-white focus-visible:shadow-[inset_0_0_0_1px_#4d71fb] focus-visible:outline-none",
                item.gapClass,
                active && "shadow-[inset_0_0_0_1px_#4d71fb]",
                locked ? "cursor-not-allowed opacity-60" : undefined,
                collapsed && "w-12"
              )}
              animate={{
                width: collapsed ? "50px" : "100%",
              }}
              transition={{
                duration: 0.2,
                ease: 'linear',
              }}
            >
              <Glyph src={active ? item.activeIcon : item.icon} className="size-6" />
              <span className={cn("whitespace-nowrap", collapsed && "sr-only")}>{item.label}</span>
              {active ? null : (
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[#535353]" />
              )}
            </MotionShellLink>
          );
        })}
      </nav>
    </div>
  );
}
