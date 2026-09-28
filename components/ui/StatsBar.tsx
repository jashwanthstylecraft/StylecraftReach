import type { LucideIcon } from "lucide-react";
import { Users, Megaphone, Zap, Mail } from "lucide-react";

interface Stat {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

export function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-2 text-text-secondary">
              <Icon className="h-4 w-4" />
              <span className="text-xs">{stat.label}</span>
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold text-text-primary">
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const STAT_ICONS = { Users, Megaphone, Zap, Mail };
