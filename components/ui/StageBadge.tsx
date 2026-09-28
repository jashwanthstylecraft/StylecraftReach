import type { Stage } from "@/lib/types";
import { cn } from "@/lib/utils";

const STAGE_STYLES: Record<Stage, { color: string; bg: string }> = {
  Shortlisted: { color: "#9B9BA8", bg: "rgba(155,155,168,0.12)" },
  "Outreach sent": { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  Negotiating: { color: "#C8A96E", bg: "rgba(200,169,110,0.14)" },
  Active: { color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  Completed: { color: "#9B9BA8", bg: "rgba(155,155,168,0.08)" },
};

export function stageAccentColor(stage: Stage): string {
  return STAGE_STYLES[stage].color;
}

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  const style = STAGE_STYLES[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        className
      )}
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {stage}
    </span>
  );
}
