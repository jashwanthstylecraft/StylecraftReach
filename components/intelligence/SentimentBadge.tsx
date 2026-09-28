import { cn } from "@/lib/utils";
import type { SentimentLabel } from "@/lib/intelligence-types";

const STYLES: Record<SentimentLabel, string> = {
  positive: "bg-success/15 text-success",
  neutral: "bg-text-muted/15 text-text-secondary",
  negative: "bg-danger/15 text-danger",
  mixed: "bg-warning/15 text-warning",
};

export function SentimentBadge({
  sentiment,
  score,
}: {
  sentiment: SentimentLabel | null;
  score: number | null;
}) {
  if (!sentiment) {
    return <span className="text-xs text-text-muted">Not analyzed</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium capitalize", STYLES[sentiment])}>
      {sentiment}
      {score !== null && ` ${score >= 0 ? "+" : ""}${score}`}
    </span>
  );
}
