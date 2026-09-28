"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { exportToCSV } from "@/lib/utils/export";
import { formatDate } from "@/lib/utils";
import type { ReportFull } from "@/lib/reports-data";

export function ReportDetailClient({ report }: { report: ReportFull }) {
  function handleExport() {
    exportToCSV(
      report.influencers.map((inf) => ({
        name: inf.name,
        handle: inf.handle,
        platform: inf.platform,
        followers: inf.followers ?? 0,
        engagement_rate: inf.engagement_rate ?? 0,
        email: inf.email ?? "",
      })),
      `report-${report.name.replace(/\s+/g, "-").toLowerCase()}`
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/reports" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to reports
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{report.name}</h2>
          <p className="text-sm text-text-secondary">
            {report.post_count} posts included · {report.influencers.length} influencers · created {formatDate(report.created_at)}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-2.5">Influencer</th>
              <th className="px-4 py-2.5">Platform</th>
              <th className="px-4 py-2.5">Followers</th>
              <th className="px-4 py-2.5">Engagement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {report.influencers.map((inf) => (
              <tr key={inf.id} className="bg-surface">
                <td className="flex items-center gap-2.5 px-4 py-2.5">
                  <Avatar name={inf.name} src={inf.avatar_url} size="sm" />
                  <div>
                    <p className="font-medium text-text-primary">{inf.name}</p>
                    <p className="font-mono text-xs text-text-muted">{inf.handle}</p>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <PlatformBadge platform={inf.platform} />
                </td>
                <td className="px-4 py-2.5 text-text-secondary">{(inf.followers ?? 0).toLocaleString()}</td>
                <td className="px-4 py-2.5 text-text-secondary">{inf.engagement_rate ? `${inf.engagement_rate.toFixed(1)}%` : "—"}</td>
              </tr>
            ))}
            {report.influencers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-text-secondary">
                  No influencers in this report.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
