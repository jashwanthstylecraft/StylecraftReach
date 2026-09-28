"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Megaphone, UserPlus, Scissors, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/influencers", label: "Influencers", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/influencers/new", label: "Add influencer", icon: UserPlus },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-5 py-5">
        <Scissors className="h-5 w-5 text-gold" />
        <span className="font-sans text-sm font-semibold tracking-tight text-text-primary">
          SC Reach
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href) &&
                (item.href !== "/influencers" || pathname === "/influencers");
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
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border px-5 py-4 font-mono text-[11px] text-text-muted">
        StylecraftUS
      </div>
    </aside>
  );
}
