"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { revokeAffiliateLink } from "@/lib/analytics-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AffiliateLinkFull } from "@/lib/analytics-data";

export function LinksTable({ links }: { links: AffiliateLinkFull[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [syncing, setSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopy(link: AffiliateLinkFull) {
    navigator.clipboard.writeText(link.short_link);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleRevoke(id: string) {
    startTransition(async () => {
      await revokeAffiliateLink(id);
      router.refresh();
    });
  }

  async function handleSync() {
    setSyncing(true);
    try {
      await fetch("/api/links/sync", { method: "POST" });
      router.refresh();
    } finally {
      setSyncing(false);
    }
  }

  const columns: DataTableColumn<AffiliateLinkFull>[] = [
    {
      key: "influencer",
      label: "Influencer",
      render: (l) => l.campaign_influencer.influencer.handle,
      sortValue: (l) => l.campaign_influencer.influencer.handle,
    },
    {
      key: "campaign",
      label: "Campaign",
      render: (l) => l.campaign_influencer.campaign.name,
      sortValue: (l) => l.campaign_influencer.campaign.name,
    },
    {
      key: "short_link",
      label: "Short link",
      render: (l) => <span className="font-mono text-xs">{l.short_link}</span>,
      sortValue: (l) => l.short_link,
    },
    {
      key: "destination",
      label: "Destination",
      render: (l) => (
        <span className="block max-w-[200px] truncate text-xs text-text-secondary">
          {l.destination_url}
        </span>
      ),
      sortValue: (l) => l.destination_url,
    },
    {
      key: "clicks",
      label: "Clicks",
      align: "right",
      render: (l) => l.clicks,
      sortValue: (l) => l.clicks,
    },
    {
      key: "conversions",
      label: "Conversions",
      align: "right",
      render: (l) => l.conversions,
      sortValue: (l) => l.conversions,
    },
    {
      key: "revenue",
      label: "Revenue",
      align: "right",
      render: (l) => formatCurrency(l.revenue),
      sortValue: (l) => l.revenue,
    },
    {
      key: "created",
      label: "Created",
      render: (l) => formatDate(l.created_at),
      sortValue: (l) => l.created_at,
    },
    {
      key: "actions",
      label: "Actions",
      render: (l) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(l)}
            className="text-xs text-text-secondary hover:text-text-primary"
          >
            {copiedId === l.id ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => handleRevoke(l.id)}
            disabled={isPending}
            className="flex items-center gap-1 text-xs text-danger hover:underline disabled:opacity-40"
          >
            <Trash2 className="h-3 w-3" />
            Revoke
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-elevated hover:text-text-primary disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync all stats"}
        </button>
      </div>
      <DataTable
        columns={columns}
        rows={links}
        rowKey={(l) => l.id}
        emptyMessage="No affiliate links yet — generate one above."
      />
    </div>
  );
}
