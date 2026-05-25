"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Target, Settings, Sprout } from "lucide-react";
import { TreeMark } from "./TreeMark";
import { UserAvatar } from "./auth/UserAvatar";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/transactions",
    label: "Activity",
    icon: Receipt,
    match: (p: string) => p.startsWith("/transactions"),
  },
  {
    href: "/goals",
    label: "Goals",
    icon: Target,
    match: (p: string) => p.startsWith("/goals"),
  },
  {
    href: "/setup",
    label: "Setup",
    icon: Sprout,
    match: (p: string) => p.startsWith("/setup"),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    match: (p: string) => p.startsWith("/settings"),
  },
] as const;

/**
 * Desktop sidebar nav. Hidden below the lg breakpoint where BottomNav
 * takes over.
 */
export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <Link href="/" className="flex items-center gap-2 px-5 pt-6 pb-5">
        <TreeMark size={24} />
        <span className="text-[16px] font-semibold tracking-tight">
          treebudget
        </span>
      </Link>

      <nav className="flex-1 px-2">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname ?? "");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-primary-ink"
                      : "text-muted hover:bg-bg hover:text-ink",
                  )}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2 : 1.7}
                    aria-hidden
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-bg"
        >
          <UserAvatar />
          <div className="min-w-0 flex-1 text-[12px] text-muted">
            Your account
          </div>
        </Link>
      </div>
    </aside>
  );
}
