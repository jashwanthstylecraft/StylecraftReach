"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { InvoiceDownloadButton } from "./InvoiceDownloadButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentFull } from "@/lib/payments-data";

const TYPE_LABELS = { flat_fee: "Flat fee", commission: "Commission", bonus: "Bonus" };

export function PaymentHistoryTable({ payments }: { payments: PaymentFull[] }) {
  const columns: DataTableColumn<PaymentFull>[] = [
    {
      key: "date",
      label: "Date",
      render: (p) => formatDate(p.paid_at ?? p.created_at),
      sortValue: (p) => p.paid_at ?? p.created_at,
    },
    {
      key: "influencer",
      label: "Influencer",
      render: (p) => (
        <Link href={`/payments/${p.campaign_influencer_id}`} className="hover:text-gold">
          {p.campaign_influencer.influencer.handle}
        </Link>
      ),
      sortValue: (p) => p.campaign_influencer.influencer.handle,
    },
    {
      key: "campaign",
      label: "Campaign",
      render: (p) => p.campaign_influencer.campaign.name,
      sortValue: (p) => p.campaign_influencer.campaign.name,
    },
    {
      key: "type",
      label: "Type",
      render: (p) => TYPE_LABELS[p.payment_type],
      sortValue: (p) => p.payment_type,
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (p) => formatCurrency(p.amount),
      sortValue: (p) => p.amount,
    },
    {
      key: "status",
      label: "Status",
      render: (p) => <PaymentStatusBadge status={p.status} />,
      sortValue: (p) => p.status,
    },
    {
      key: "invoice",
      label: "Invoice",
      render: (p) => (
        <InvoiceDownloadButton pdfUrl={p.invoice?.pdf_url ?? null} invoiceNumber={p.invoice?.invoice_number} />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={payments}
      rowKey={(p) => p.id}
      emptyMessage="No payments sent yet."
    />
  );
}
