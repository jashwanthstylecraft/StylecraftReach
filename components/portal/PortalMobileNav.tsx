"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Megaphone, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/portal", label: "Home", icon: Home },
  { href: "/portal/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/portal/earnings", label: "Earnings", icon: Wallet },
  { href: "/portal/profile", label: "Profile", icon: User },
];

export function PortalMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-portal-border bg-portal-surface sm:hidden">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/portal" ? pathname === "/portal" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]",
              active ? "text-gold" : "text-portal-text-secondary"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
