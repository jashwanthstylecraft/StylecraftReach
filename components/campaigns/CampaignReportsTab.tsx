"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { CreateReportModal } from "@/components/reports/CreateReportModal";
import { deleteReports } from "@/lib/reports-actions";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import type { Influencer } from "@/lib/types";
import type { ReportFull } from "@/lib/reports-data";

export function CampaignReportsTab({
  campaignId,
  reports,
  influencers,
}: {
  campaignId: string;
  reports: ReportFull[];
  influencers: Influencer[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  function handleDelete(id: string) {
    deleteReports([id]).then(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-background hover:bg-gold/90"
        >
          <Plus className="h-3.5 w-3.5" /> Create campaign report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface py-12 text-center text-sm text-text-secondary">
          No reports saved for this campaign yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex items-center justify-between p-3">
                <span className="truncate text-sm font-medium text-text-primary">{r.name}</span>
                <button onClick={() => handleDelete(r.id)} className="text-text-muted hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex -space-x-2 px-3 pb-3">
                {r.influencers.slice(0, 10).map((inf) => (
                  <Avatar key={inf.id} name={inf.name} src={inf.avatar_url} size="sm" className="border-2 border-surface" />
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border bg-surface-elevated px-3 py-2">
                <span className="text-xs text-text-secondary">
                  {r.post_count} Posts Included · {formatDate(r.created_at)}
                </span>
                <Link href={`/reports/${r.id}`} className="text-xs font-medium text-gold hover:underline">
                  View report
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <CreateReportModal
          influencers={influencers}
          campaignId={campaignId}
          defaultSelectedIds={influencers.map((i) => i.id)}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}
