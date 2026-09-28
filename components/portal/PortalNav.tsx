"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Scissors } from "lucide-react";
import { isClerkConfigured } from "@/lib/clerk-config";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/portal", label: "Home" },
  { href: "/portal/campaigns", label: "Campaigns" },
  { href: "/portal/earnings", label: "Earnings" },
  { href: "/portal/profile", label: "Profile" },
];

export function PortalNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-portal-border bg-portal-surface">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-gold" />
          <span className="text-sm font-semibold tracking-tight text-portal-text-primary">
            SC Reach
          </span>
        </div>
        <nav className="hidden gap-1 sm:flex">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/portal" ? pathname === "/portal" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium",
                  active
                    ? "bg-gold/15 text-gold"
                    : "text-portal-text-secondary hover:bg-portal-bg hover:text-portal-text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {isClerkConfigured && <UserButton afterSignOutUrl="/portal/sign-in" />}
      </div>
    </header>
  );
}
