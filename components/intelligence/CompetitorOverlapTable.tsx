"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { toggleCompetitorAlert } from "@/lib/intelligence-actions";
import { formatDate, formatFollowers, cn } from "@/lib/utils";
import type { CompetitorOverlapRow } from "@/lib/intelligence-data";

const RISK_STYLES = {
  High: "bg-danger/15 text-danger",
  Medium: "bg-warning/15 text-warning",
  Low: "bg-success/15 text-success",
};

export function CompetitorOverlapTable({ rows }: { rows: CompetitorOverlapRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleAlert(id: string, enabled: boolean) {
    startTransition(async () => {
      await toggleCompetitorAlert(id, enabled);
      router.refresh();
    });
  }

  const columns: DataTableColumn<CompetitorOverlapRow>[] = [
    {
      key: "influencer",
      label: "Influencer",
      render: (r) => r.influencer.handle,
      sortValue: (r) => r.influencer.handle,
    },
    {
      key: "followers",
      label: "Followers",
      align: "right",
      render: (r) => formatFollowers(r.influencer.followers),
      sortValue: (r) => r.influencer.followers ?? 0,
    },
    {
      key: "our_campaign",
      label: "Our campaigns",
      render: (r) => r.ourCampaignName ?? "—",
    },
    {
      key: "competitor",
      label: "Also works with",
      render: (r) => r.competitor_brand,
      sortValue: (r) => r.competitor_brand,
    },
    {
      key: "last_seen",
      label: "Last seen",
      render: (r) => (r.post_date ? formatDate(r.post_date) : "—"),
      sortValue: (r) => r.post_date ?? "",
    },
    {
      key: "evidence",
      label: "Evidence",
      render: (r) => r.notes ?? r.evidence_type,
    },
    {
      key: "risk",
      label: "Risk",
      render: (r) => (
        <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", RISK_STYLES[r.risk])}>{r.risk}</span>
      ),
      sortValue: (r) => ({ High: 2, Medium: 1, Low: 0 })[r.risk],
    },
    {
      key: "alert",
      label: "Alert me",
      render: (r) => (
        <button
          onClick={() => handleToggleAlert(r.id, !r.alert_enabled)}
          disabled={isPending}
          className={cn(
            "rounded px-2 py-1 text-[11px] font-medium",
            r.alert_enabled ? "bg-gold/15 text-gold" : "bg-surface-elevated text-text-secondary"
          )}
        >
          {r.alert_enabled ? "On" : "Off"}
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      emptyMessage="No competitor overlap detected yet."
    />
  );
}
