import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  subtext,
  trend,
  trendValue,
}: {
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-text-primary">{value}</p>
      {(subtext || trend) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={cn(
                "flex items-center gap-0.5",
                trend === "up" && "text-success",
                trend === "down" && "text-danger",
                trend === "neutral" && "text-text-muted"
              )}
            >
              {trend === "up" && <ArrowUp className="h-3 w-3" />}
              {trend === "down" && <ArrowDown className="h-3 w-3" />}
              {trend === "neutral" && <Minus className="h-3 w-3" />}
              {trendValue}
            </span>
          )}
          {subtext && <span className="text-text-muted">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
