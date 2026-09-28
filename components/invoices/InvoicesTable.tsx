"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { InvoiceDownloadButton } from "@/components/payments/InvoiceDownloadButton";
import { inputClass } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceFull } from "@/lib/payments-data";

export function InvoicesTable({ invoices }: { invoices: InvoiceFull[] }) {
  const [query, setQuery] = useState("");

  const filtered = invoices.filter((inv) => {
    if (!query) return true;
    const haystack = `${inv.invoice_number} ${inv.influencer.handle} ${inv.influencer.name} ${inv.campaign.name}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const columns: DataTableColumn<InvoiceFull>[] = [
    {
      key: "invoice_number",
      label: "Invoice #",
      render: (i) => <span className="font-mono text-xs">{i.invoice_number}</span>,
      sortValue: (i) => i.invoice_number,
    },
    {
      key: "influencer",
      label: "Influencer",
      render: (i) => i.influencer.handle,
      sortValue: (i) => i.influencer.handle,
    },
    { key: "campaign", label: "Campaign", render: (i) => i.campaign.name, sortValue: (i) => i.campaign.name },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (i) => formatCurrency(i.amount),
      sortValue: (i) => i.amount,
    },
    { key: "date", label: "Date", render: (i) => formatDate(i.issued_at), sortValue: (i) => i.issued_at },
    {
      key: "pdf",
      label: "PDF",
      render: (i) => <InvoiceDownloadButton pdfUrl={i.pdf_url} />,
    },
  ];

  return (
    <div className="space-y-3">
      <input
        className={inputClass + " max-w-sm"}
        placeholder="Search invoice #, influencer, campaign..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(i) => i.id}
        emptyMessage="No invoices generated yet."
      />
    </div>
  );
}
