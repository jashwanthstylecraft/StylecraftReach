import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { Avatar } from "@/components/ui/Avatar";
import { stageAccentColor } from "@/components/ui/StageBadge";
import { STAT_ICONS, StatsBar } from "@/components/ui/StatsBar";
import { getCampaignById, getFullPlacementsForCampaign } from "@/lib/data";
import { STAGES } from "@/lib/types";
import { formatCurrency, formatDate, formatFollowers } from "@/lib/utils";

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [campaign, placements] = await Promise.all([
    getCampaignById(params.id),
    getFullPlacementsForCampaign(params.id),
  ]);

  if (!campaign) notFound();

  const totalReach = placements.reduce((sum, p) => sum + (p.influencer.followers ?? 0), 0);
  const engagementRates = placements
    .map((p) => p.influencer.engagement_rate)
    .filter((r): r is number => r !== null);
  const avgEngagement =
    engagementRates.length > 0
      ? (engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length).toFixed(1)
      : "—";
  const postsSubmitted = placements.reduce(
    (sum, p) => sum + p.deliverables.filter((d) => d.completed).length,
    0
  );

  const stats = [
    { label: "Influencers", value: placements.length, icon: STAT_ICONS.Users },
    { label: "Total reach", value: formatFollowers(totalReach), icon: STAT_ICONS.Zap },
    {
      label: "Avg. engagement",
      value: avgEngagement === "—" ? "—" : `${avgEngagement}%`,
      icon: STAT_ICONS.Megaphone,
    },
    { label: "Posts submitted", value: postsSubmitted, icon: STAT_ICONS.Mail },
  ];

  const spendPct = campaign.budget ? Math.round((campaign.spend / campaign.budget) * 100) : 0;

  return (
    <div>
      <Header title={campaign.name} subtitle={campaign.brand} />
      <div className="space-y-6 p-8">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded bg-surface-elevated px-2 py-1 capitalize text-text-secondary">
                {campaign.status}
              </span>
              <span className="text-text-secondary">
                {formatDate(campaign.start_date)} – {formatDate(campaign.end_date)}
              </span>
            </div>
            <div className="font-mono text-sm text-text-primary">
              {formatCurrency(campaign.spend)} / {formatCurrency(campaign.budget)}
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
            <div className="h-full bg-gold" style={{ width: `${Math.min(spendPct, 100)}%` }} />
          </div>
          {campaign.brief && (
            <p className="mt-4 text-sm text-text-secondary">{campaign.brief}</p>
          )}
        </div>

        <StatsBar stats={stats} />

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {STAGES.map((stage) => {
            const stageRows = placements.filter((p) => p.stage === stage);
            const accent = stageAccentColor(stage);
            return (
              <div
                key={stage}
                className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-surface"
                style={{ borderTop: `2px solid ${accent}` }}
              >
                <div className="flex items-center gap-2 px-3 py-3">
                  <span className="text-sm font-medium text-text-primary">{stage}</span>
                  <span className="rounded-full bg-surface-elevated px-1.5 py-0.5 font-mono text-[11px] text-text-secondary">
                    {stageRows.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 px-2 pb-3">
                  {stageRows.map((p) => (
                    <Link
                      key={p.id}
                      href={`/influencers/${p.influencer.id}`}
                      className="rounded-md border border-border bg-surface-elevated p-3 hover:bg-surface"
                    >
                      <div className="flex items-start gap-2.5">
                        <Avatar name={p.influencer.name} src={p.influencer.avatar_url} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium text-text-primary">
                              {p.influencer.name}
                            </p>
                            <ScoreBadge score={p.influencer.ai_score} />
                          </div>
                          <p className="truncate font-mono text-xs text-text-secondary">
                            {p.influencer.handle}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <PlatformBadge platform={p.influencer.platform} />
                        <span className="text-[11px] text-text-secondary">
                          {formatFollowers(p.influencer.followers)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {stageRows.length === 0 && (
                    <p className="px-1 py-6 text-center text-xs text-text-muted">None</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
