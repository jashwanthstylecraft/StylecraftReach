import { cn } from "@/lib/utils";

export function ScoreBadge({
  score,
  className,
}: {
  score: number | null;
  className?: string;
}) {
  if (score === null) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-gold/30 bg-gold/10 px-1.5 py-0.5 font-mono text-[11px] font-medium text-gold",
        className
      )}
      title="AI relevance score"
    >
      {score}
    </span>
  );
}
