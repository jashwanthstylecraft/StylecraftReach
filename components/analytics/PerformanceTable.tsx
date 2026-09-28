"use client";

import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { formatCurrency, formatFollowers } from "@/lib/utils";
import type { InfluencerPerformanceRow } from "@/lib/types";

export function PerformanceTable({ rows }: { rows: InfluencerPerformanceRow[] }) {
  const router = useRouter();

  const columns: DataTableColumn<InfluencerPerformanceRow>[] = [
    {
      key: "handle",
      label: "Handle",
      render: (r) => <span className="font-mono text-xs">{r.influencer.handle}</span>,
      sortValue: (r) => r.influencer.handle,
    },
    {
      key: "platform",
      label: "Platform",
      render: (r) => <PlatformBadge platform={r.influencer.platform} />,
      sortValue: (r) => r.influencer.platform,
    },
    {
      key: "campaign",
      label: "Campaign",
      render: (r) => r.campaign.name,
      sortValue: (r) => r.campaign.name,
    },
    {
      key: "clicks",
      label: "Clicks",
      align: "right",
      render: (r) => formatFollowers(r.clicks),
      sortValue: (r) => r.clicks,
    },
    {
      key: "conversions",
      label: "Conversions",
      align: "right",
      render: (r) => r.conversions,
      sortValue: (r) => r.conversions,
    },
    {
      key: "revenue",
      label: "Revenue",
      align: "right",
      render: (r) => formatCurrency(r.revenue),
      sortValue: (r) => r.revenue,
    },
    {
      key: "commission",
      label: "Commission",
      align: "right",
      render: (r) => formatCurrency(r.commission),
      sortValue: (r) => r.commission,
    },
    {
      key: "roi",
      label: "ROI",
      align: "right",
      render: (r) => (r.roi !== null ? `${r.roi.toFixed(1)}x` : "—"),
      sortValue: (r) => r.roi ?? -1,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.campaignInfluencerId}
      onRowClick={(r) => router.push(`/analytics/${r.campaignInfluencerId}`)}
      emptyMessage="No performance data yet — generate an affiliate link or promo code to start tracking."
    />
  );
}
