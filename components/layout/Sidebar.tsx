"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Megaphone,
  UserPlus,
  Scissors,
  Search,
  BarChart2,
  Link2,
  Tag,
  DollarSign,
  FileText,
  CheckSquare,
  Grid,
  AtSign,
  GitCompare,
  Zap,
  FolderKanban,
  Users2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  exact?: boolean;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  { label: null, items: [{ href: "/dashboard", label: "Console", icon: LayoutGrid, exact: true }] },
  {
    label: "Discovery",
    items: [
      { href: "/discover", label: "Discover", icon: Search },
      { href: "/influencers", label: "Influencers", icon: Users, exact: true },
      { href: "/influencers/new", label: "Add influencer", icon: UserPlus },
    ],
  },
  {
    label: "Campaigns",
    items: [
      { href: "/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/reports", label: "Reports", icon: FolderKanban },
      { href: "/brand-comparison", label: "Brand Comparison", icon: GitCompare },
      { href: "/community", label: "Community", icon: Users2 },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart2 },
      { href: "/links", label: "Links", icon: Link2 },
      { href: "/promo-codes", label: "Promo Codes", icon: Tag },
    ],
  },
  {
    label: "Payments",
    items: [
      { href: "/payments", label: "Payments", icon: DollarSign },
      { href: "/invoices", label: "Invoices", icon: FileText },
    ],
  },
  {
    label: "Content Intelligence",
    items: [
      { href: "/content-approvals", label: "Content Approvals", icon: CheckSquare },
      { href: "/content-library", label: "Content Library", icon: Grid },
      { href: "/mentions", label: "Mentions", icon: AtSign },
      { href: "/competitor-overlap", label: "Competitor Overlap", icon: GitCompare },
      { href: "/intelligence", label: "Intelligence", icon: Zap },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/settings/social-accounts", label: "Social Accounts", icon: Settings }],
  },
];

export function Sidebar({ pendingApprovalsCount = 0 }: { pendingApprovalsCount?: number }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col overflow-y-auto border-r border-border bg-surface scrollbar-thin">
      <div className="flex items-center gap-2 border-b border-border px-5 py-5">
        <Scissors className="h-5 w-5 text-gold" />
        <span className="font-sans text-sm font-semibold tracking-tight text-text-primary">
          SC Reach
        </span>
      </div>
      <nav className="flex-1 space-y-4 px-3 py-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label ?? `group-${gi}`} className="space-y-1">
            {group.label && (
              <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface-elevated text-text-primary"
                      : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.href === "/content-approvals" && pendingApprovalsCount > 0 && (
                    <span className="rounded-full bg-gold/20 px-1.5 py-0.5 font-mono text-[10px] text-gold">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-border px-5 py-4 font-mono text-[11px] text-text-muted">
        StylecraftUS
      </div>
    </aside>
  );
}
