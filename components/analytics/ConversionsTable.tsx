"use client";

import { Check, X } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ConversionWithPromoCode } from "@/lib/analytics-data";

export function ConversionsTable({ conversions }: { conversions: ConversionWithPromoCode[] }) {
  const columns: DataTableColumn<ConversionWithPromoCode>[] = [
    { key: "order_id", label: "Order ID", render: (c) => `#${c.order_id}`, sortValue: (c) => c.order_id },
    {
      key: "date",
      label: "Date",
      render: (c) => formatDate(c.created_at),
      sortValue: (c) => c.created_at,
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (c) => formatCurrency(c.order_amount),
      sortValue: (c) => c.order_amount,
    },
    {
      key: "commission",
      label: "Commission",
      align: "right",
      render: (c) => formatCurrency(c.commission_amount),
      sortValue: (c) => c.commission_amount,
    },
    {
      key: "promo_code",
      label: "Promo code",
      render: (c) => (
        <span className="font-mono text-xs">{c.promo_code?.code ?? "—"}</span>
      ),
      sortValue: (c) => c.promo_code?.code ?? "",
    },
    {
      key: "paid",
      label: "Paid?",
      render: (c) =>
        c.commission_paid ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <X className="h-4 w-4 text-text-muted" />
        ),
      sortValue: (c) => (c.commission_paid ? 1 : 0),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={conversions}
      rowKey={(c) => c.id}
      emptyMessage="No conversions recorded yet."
    />
  );
}
