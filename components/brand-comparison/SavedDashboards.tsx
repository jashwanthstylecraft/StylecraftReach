"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { deleteSavedDashboard } from "@/lib/saved-dashboards-actions";
import type { SavedDashboard } from "@/lib/campaign-detail-types";
import type { TrendsDashboardFilters } from "@/lib/affable-types";

export function SavedDashboards({
  dashboards,
  onLoad,
}: {
  dashboards: SavedDashboard[];
  onLoad: (filters: TrendsDashboardFilters) => void;
}) {
  const router = useRouter();

  if (dashboards.length === 0) return null;

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteSavedDashboard(id).then(() => router.refresh());
  }

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">Saved dashboards</p>
      <div className="flex flex-wrap gap-2">
        {dashboards.map((d) => (
          <button
            key={d.id}
            onClick={() => onLoad(d.filters as unknown as TrendsDashboardFilters)}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-gold/40 hover:text-text-primary"
          >
            {d.name}
            <span onClick={(e) => handleDelete(d.id, e)} className="text-text-muted hover:text-danger">
              <X className="h-3 w-3" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
