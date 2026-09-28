import { AlertTriangle } from "lucide-react";
import { TIER_COLORS } from "@/lib/modash/types";
import type { AiScore } from "@/lib/modash/types";

export function AiAnalysisCard({ score }: { score: AiScore }) {
  const color = TIER_COLORS[score.tier];

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">AI analysis</h3>
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold"
          style={{ color, backgroundColor: `${color}1f` }}
        >
          {score.tier}
        </span>
        <div>
          <p className="font-mono text-2xl font-semibold text-text-primary">{score.score}</p>
          <p className="text-xs text-text-secondary">Relevance score</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-text-secondary">{score.fitReason}</p>
      <p className="mt-3 text-xs text-text-muted">
        Suggested campaign: <span className="text-text-primary">{score.suggestedCampaign}</span>
      </p>
      {score.redFlags.length > 0 && (
        <div className="mt-4 space-y-1.5 rounded-md border border-warning/30 bg-warning/10 p-3">
          {score.redFlags.map((flag, i) => (
            <p key={i} className="flex items-start gap-1.5 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {flag}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
