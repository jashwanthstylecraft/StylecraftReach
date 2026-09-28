"use client";

import { useEffect, useState } from "react";
import { AnalyticsFiltersBar, type AnalyticsFilterState } from "./AnalyticsFiltersBar";
import { StatsCard } from "./StatsCard";
import { ClicksLineChart } from "./ClicksLineChart";
import { RevenueBarChart } from "./RevenueBarChart";
import { PlatformPieChart } from "./PlatformPieChart";
import { ConversionRateBarChart } from "./ConversionRateBarChart";
import { PerformanceTable } from "./PerformanceTable";
import { formatCurrency, formatFollowers } from "@/lib/utils";
import type { AnalyticsSummary, Campaign, InfluencerPerformanceRow } from "@/lib/types";

interface SummaryResponse {
  summary: AnalyticsSummary;
  performanceRows: InfluencerPerformanceRow[];
  revenueByInfluencer: { handle: string; platform: string; revenue: number }[];
  platformSplit: { platform: string; clicks: number }[];
  conversionRateByCampaign: { name: string; rate: number }[];
}

export function AnalyticsDashboard({ campaigns }: { campaigns: Campaign[] }) {
  const [filters, setFilters] = useState<AnalyticsFilterState>({ days: 30 });
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [timeseries, setTimeseries] = useState<{ date: string; clicks: number; conversions: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ days: String(filters.days) });
    if (filters.campaignId) params.set("campaignId", filters.campaignId);
    if (filters.brand) params.set("brand", filters.brand);

    Promise.all([
      fetch(`/api/analytics/summary?${params}`).then((r) => r.json()),
      fetch(`/api/analytics/timeseries?${params}`).then((r) => r.json()),
    ])
      .then(([summaryRes, timeseriesRes]) => {
        setData(summaryRes);
        setTimeseries(timeseriesRes.timeseries);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="space-y-6">
      <AnalyticsFiltersBar campaigns={campaigns} value={filters} onChange={setFilters} />

      {loading && !data ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-surface" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatsCard label="Total clicks" value={formatFollowers(data.summary.totalClicks)} />
            <StatsCard label="Total conversions" value={String(data.summary.totalConversions)} />
            <StatsCard label="Total revenue" value={formatCurrency(data.summary.totalRevenue)} />
            <StatsCard label="Total commissions" value={formatCurrency(data.summary.totalCommissions)} />
            <StatsCard
              label="Overall ROI"
              value={data.summary.overallRoi !== null ? `${data.summary.overallRoi.toFixed(1)}x` : "—"}
            />
            <StatsCard
              label="Avg order value"
              value={data.summary.avgOrderValue !== null ? formatCurrency(data.summary.avgOrderValue) : "—"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Clicks over time</h3>
              <ClicksLineChart data={timeseries} />
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Revenue by influencer</h3>
              <RevenueBarChart data={data.revenueByInfluencer} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Platform split</h3>
              <PlatformPieChart data={data.platformSplit} />
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Conversion rate by campaign</h3>
              <ConversionRateBarChart data={data.conversionRateByCampaign} />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Top performing influencers</h3>
            <PerformanceTable rows={data.performanceRows} />
          </div>
        </>
      ) : null}
    </div>
  );
}
