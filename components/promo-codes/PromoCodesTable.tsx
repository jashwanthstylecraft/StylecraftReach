"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { togglePromoCodeActive } from "@/lib/analytics-actions";
import { formatCurrency } from "@/lib/utils";
import type { PromoCodeFull } from "@/lib/analytics-data";

export interface PromoCodeRow extends PromoCodeFull {
  revenue: number;
}

export function PromoCodesTable({ rows }: { rows: PromoCodeRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(row: PromoCodeRow) {
    startTransition(async () => {
      await togglePromoCodeActive(row.id, !row.is_active);
      router.refresh();
    });
  }

  const columns: DataTableColumn<PromoCodeRow>[] = [
    {
      key: "code",
      label: "Code",
      render: (r) => <span className="font-mono text-xs">{r.code}</span>,
      sortValue: (r) => r.code,
    },
    {
      key: "influencer",
      label: "Influencer",
      render: (r) => r.campaign_influencer.influencer.handle,
      sortValue: (r) => r.campaign_influencer.influencer.handle,
    },
    {
      key: "campaign",
      label: "Campaign",
      render: (r) => r.campaign_influencer.campaign.name,
      sortValue: (r) => r.campaign_influencer.campaign.name,
    },
    {
      key: "discount",
      label: "Discount",
      render: (r) => (r.discount_type === "percentage" ? `${r.discount_value}% off` : `$${r.discount_value} off`),
      sortValue: (r) => r.discount_value,
    },
    {
      key: "commission",
      label: "Commission",
      align: "right",
      render: (r) => `${r.commission_rate}%`,
      sortValue: (r) => r.commission_rate,
    },
    {
      key: "uses",
      label: "Uses",
      align: "right",
      render: (r) => `${r.usage_count}${r.usage_limit ? ` / ${r.usage_limit}` : ""}`,
      sortValue: (r) => r.usage_count,
    },
    {
      key: "revenue",
      label: "Revenue",
      align: "right",
      render: (r) => formatCurrency(r.revenue),
      sortValue: (r) => r.revenue,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[11px] font-medium",
            r.is_active ? "bg-success/15 text-success" : "bg-text-muted/15 text-text-secondary"
          )}
        >
          {r.is_active ? "Active" : "Inactive"}
        </span>
      ),
      sortValue: (r) => (r.is_active ? 1 : 0),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <button
          onClick={() => handleToggle(r)}
          disabled={isPending}
          className="text-xs text-text-secondary hover:text-text-primary disabled:opacity-40"
        >
          {r.is_active ? "Deactivate" : "Activate"}
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      emptyMessage="No promo codes yet — create one above."
    />
  );
}
