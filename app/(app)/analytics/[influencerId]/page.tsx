import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Avatar } from "@/components/ui/Avatar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { StageBadge } from "@/components/ui/StageBadge";
import { StatsCard } from "@/components/analytics/StatsCard";
import { ClicksLineChart } from "@/components/analytics/ClicksLineChart";
import { RankedBarList } from "@/components/analytics/RankedBarList";
import { CommissionTracker } from "@/components/analytics/CommissionTracker";
import { ConversionsTable } from "@/components/analytics/ConversionsTable";
import { getCampaignInfluencerFull } from "@/lib/data";
import {
  getAffiliateLinkForCampaignInfluencer,
  getConversionsWithPromoCode,
  getDailyStatsForCampaignInfluencer,
} from "@/lib/analytics-data";
import { getAnalytics } from "@/lib/dub/client";
import { formatCurrency, formatFollowers } from "@/lib/utils";

export default async function InfluencerAnalyticsPage({
  params,
}: {
  params: { influencerId: string };
}) {
  const full = await getCampaignInfluencerFull(params.influencerId);
  if (!full) notFound();

  const [affiliateLink, conversions, dailyStats] = await Promise.all([
    getAffiliateLinkForCampaignInfluencer(params.influencerId),
    getConversionsWithPromoCode(params.influencerId),
    getDailyStatsForCampaignInfluencer(params.influencerId, 30),
  ]);

  const linkAnalytics = affiliateLink ? await getAnalytics(affiliateLink.dub_link_id, "30d") : null;

  const totalClicks = dailyStats.reduce((s, d) => s + d.clicks, 0) || affiliateLink?.clicks || 0;
  const totalRevenue = conversions.reduce((s, c) => s + c.order_amount, 0);
  const roi = full.fee ? totalRevenue / Number(full.fee) : null;

  const timeseries = dailyStats.map((d) => ({
    date: d.date,
    clicks: d.clicks,
    conversions: d.conversions,
  }));

  return (
    <div>
      <Header title={full.influencer.name} subtitle={full.campaign.name} />
      <div className="space-y-6 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <Avatar name={full.influencer.name} src={full.influencer.avatar_url} size="lg" />
            <div>
              <p className="font-medium text-text-primary">{full.influencer.name}</p>
              <p className="font-mono text-xs text-text-secondary">{full.influencer.handle}</p>
              <div className="mt-1 flex items-center gap-2">
                <PlatformBadge platform={full.influencer.platform} />
                <StageBadge stage={full.stage} />
              </div>
            </div>
          </div>
          <a
            href={`/api/analytics/report/${full.id}`}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Download report PDF
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatsCard label="Total clicks" value={formatFollowers(totalClicks)} />
          <StatsCard label="Conversions" value={String(conversions.length)} />
          <StatsCard label="Revenue" value={formatCurrency(totalRevenue)} />
          <StatsCard
            label="ROI vs fee"
            value={roi !== null ? `${roi.toFixed(1)}x` : "—"}
            subtext={full.fee ? `Fee ${formatCurrency(full.fee)}` : undefined}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Clicks + conversions over time</h3>
            <ClicksLineChart data={timeseries} />
          </div>
          <div className="space-y-4">
            <CommissionTracker campaignInfluencerId={full.id} conversions={conversions} />
          </div>
        </div>

        {linkAnalytics && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Top referring sources</h3>
              <RankedBarList
                items={linkAnalytics.referers.map((r) => ({ label: r.referer, value: r.clicks }))}
              />
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Geo breakdown</h3>
              <RankedBarList
                items={linkAnalytics.countries.map((c) => ({ label: c.country, value: c.clicks }))}
              />
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Conversions</h3>
          <ConversionsTable conversions={conversions} />
        </div>
      </div>
    </div>
  );
}
