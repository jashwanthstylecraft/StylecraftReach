"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Copy } from "lucide-react";
import { duplicateCampaign } from "@/lib/campaigns-actions";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Campaign } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/15 text-success",
  draft: "bg-text-muted/15 text-text-secondary",
  paused: "bg-warning/15 text-warning",
  completed: "bg-gold/15 text-gold",
};

export function CampaignCard({ campaign: c, influencerCount }: { campaign: Campaign; influencerCount: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const spendPct = c.budget ? Math.round((c.spend / c.budget) * 100) : 0;

  function handleDuplicate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await duplicateCampaign(c.id);
      router.refresh();
    });
  }

  return (
    <Link
      href={`/campaigns/${c.id}`}
      className="relative rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-elevated"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-text-primary">{c.name}</p>
          <p className="text-xs text-text-secondary">{c.brand}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("rounded px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_STYLES[c.status])}>
            {c.status}
          </span>
          <button
            onClick={handleDuplicate}
            disabled={isPending}
            title="Duplicate campaign"
            className="rounded p-1 text-text-muted hover:bg-surface hover:text-text-primary"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 text-xs">
        <div className="flex justify-between text-text-secondary">
          <span>Budget</span>
          <span className="font-mono text-text-primary">
            {c.budget_label ?? `${formatCurrency(c.spend)} / ${formatCurrency(c.budget)}`}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
          <div className="h-full bg-gold" style={{ width: `${Math.min(spendPct, 100)}%` }} />
        </div>
      </div>

      {(c.tracked_hashtags.length > 0 || c.tracked_mentions.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1">
          {c.tracked_hashtags.slice(0, 3).map((h) => (
            <span key={h} className="rounded bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
              #{h}
            </span>
          ))}
          {c.tracked_mentions.slice(0, 2).map((m) => (
            <span key={m} className="rounded bg-gold/10 px-1.5 py-0.5 font-mono text-[10px] text-gold">
              @{m}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
        <span>{influencerCount} influencers</span>
        <span>
          {formatDate(c.start_date)} – {formatDate(c.end_date)}
        </span>
      </div>
    </Link>
  );
}
