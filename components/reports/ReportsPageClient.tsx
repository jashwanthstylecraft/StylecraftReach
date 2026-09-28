"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Search, Trash2, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { CreateReportModal } from "./CreateReportModal";
import { useToast } from "@/components/ui/Toast";
import { deleteReports, mergeReports } from "@/lib/reports-actions";
import { formatDate, cn } from "@/lib/utils";
import type { Influencer } from "@/lib/types";
import type { ReportFull } from "@/lib/reports-data";

export function ReportsPageClient({
  reports,
  influencers,
  reportsThisMonth,
}: {
  reports: ReportFull[];
  influencers: Influencer[];
  reportsThisMonth: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"all" | "instagram" | "tiktok" | "youtube">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [mergeName, setMergeName] = useState("");
  const [showMergeInput, setShowMergeInput] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (platform !== "all" && r.platform !== "all" && r.platform !== platform) return false;
      if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [reports, platform, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDelete(ids: string[]) {
    startTransition(async () => {
      await deleteReports(ids);
      setSelected(new Set());
      router.refresh();
    });
  }

  function handleMerge() {
    if (!mergeName.trim()) return;
    startTransition(async () => {
      await mergeReports(Array.from(selected), mergeName.trim());
      showToast(`Merged into "${mergeName.trim()}"`, "success");
      setSelected(new Set());
      setShowMergeInput(false);
      setMergeName("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          Reports generated this month: <span className="font-mono text-text-primary">{reportsThisMonth}</span>
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports by name..."
              className="rounded-md border border-border bg-surface-elevated py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted"
            />
          </div>
          {selected.size >= 2 && !showMergeInput && (
            <button
              onClick={() => setShowMergeInput(true)}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              Merge Reports ({selected.size})
            </button>
          )}
          {selected.size > 0 && (
            <button
              onClick={() => handleDelete(Array.from(selected))}
              disabled={isPending}
              className="rounded-md border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
            >
              Delete ({selected.size})
            </button>
          )}
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-gold px-4 py-1.5 text-sm font-medium text-background hover:bg-gold/90"
          >
            Create report
          </button>
        </div>
      </div>

      {showMergeInput && (
        <div className="flex items-center gap-2 rounded-md border border-gold/30 bg-gold/10 p-3">
          <input
            autoFocus
            value={mergeName}
            onChange={(e) => setMergeName(e.target.value)}
            placeholder="Name the merged report..."
            className="flex-1 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text-primary"
          />
          <button onClick={handleMerge} disabled={isPending || !mergeName.trim()} className="rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-background">
            Confirm merge
          </button>
          <button onClick={() => setShowMergeInput(false)} className="text-xs text-text-secondary">
            Cancel
          </button>
        </div>
      )}

      <div className="flex gap-1.5">
        {(["all", "instagram", "tiktok", "youtube"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium capitalize",
              platform === p ? "bg-gold/15 text-gold" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface py-16 text-center text-sm text-text-secondary">
          No reports yet — create one to save a snapshot of influencer content.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex items-center justify-between p-3">
                <label className="flex flex-1 items-center gap-2 text-sm text-text-primary">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="accent-gold" />
                  <span className="truncate">{r.name}</span>
                </label>
                <button onClick={() => handleDelete([r.id])} className="text-text-muted hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex -space-x-2 px-3 pb-3">
                {r.influencers.length === 0 && <Users className="h-8 w-8 text-text-muted" />}
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

      {createOpen && <CreateReportModal influencers={influencers} onClose={() => setCreateOpen(false)} />}
    </div>
  );
}
