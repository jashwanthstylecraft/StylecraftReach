import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { getAllCampaignInfluencers, getCampaigns } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/15 text-success",
  draft: "bg-text-muted/15 text-text-secondary",
  paused: "bg-warning/15 text-warning",
  completed: "bg-gold/15 text-gold",
};

export default async function CampaignsPage() {
  const [campaigns, rows] = await Promise.all([getCampaigns(), getAllCampaignInfluencers()]);

  return (
    <div>
      <Header title="Campaigns" subtitle={`${campaigns.length} campaigns`} />
      <div className="grid grid-cols-1 gap-4 p-8 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((c) => {
          const influencerCount = rows.filter((r) => r.campaign_id === c.id).length;
          const spendPct = c.budget ? Math.round((c.spend / c.budget) * 100) : 0;
          return (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-elevated"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-text-primary">{c.name}</p>
                  <p className="text-xs text-text-secondary">{c.brand}</p>
                </div>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[11px] font-medium capitalize",
                    STATUS_STYLES[c.status]
                  )}
                >
                  {c.status}
                </span>
              </div>
              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Budget</span>
                  <span className="font-mono text-text-primary">
                    {formatCurrency(c.spend)} / {formatCurrency(c.budget)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                  <div
                    className="h-full bg-gold"
                    style={{ width: `${Math.min(spendPct, 100)}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
                <span>{influencerCount} influencers</span>
                <span>
                  {formatDate(c.start_date)} – {formatDate(c.end_date)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
