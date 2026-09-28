import { Loader2 } from "lucide-react";
import { TIER_COLORS } from "@/lib/modash/types";
import type { AiScore } from "@/lib/modash/types";

export function AiScoreBadge({ score, loading }: { score: AiScore | null; loading?: boolean }) {
  if (loading || !score) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-border bg-surface-elevated px-2 py-0.5 font-mono text-[11px] text-text-secondary">
        <Loader2 className="h-3 w-3 animate-spin" />
        Scoring...
      </span>
    );
  }

  const color = TIER_COLORS[score.tier];

  return (
    <span
      title={score.fitReason}
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] font-semibold"
      style={{ color, backgroundColor: `${color}1f` }}
    >
      {score.tier} · {score.score}
    </span>
  );
}
