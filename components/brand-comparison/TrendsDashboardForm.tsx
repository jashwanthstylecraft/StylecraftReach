"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { TrendsLineChart } from "./TrendsLineChart";
import { BrandComparisonTable } from "./BrandComparisonTable";
import { TopPostsPerBrand } from "./TopPostsPerBrand";
import { SavedDashboards } from "./SavedDashboards";
import { saveDashboard } from "@/lib/saved-dashboards-actions";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { DEFAULT_BRANDS } from "@/lib/affable-types";
import type { BrandComparisonRow, DashboardMetric, Granularity, TrendsDashboardFilters, TrendsDataPoint } from "@/lib/affable-types";
import type { CapturedContentFull } from "@/lib/intelligence-data";
import type { SavedDashboard } from "@/lib/campaign-detail-types";

const METRIC_OPTIONS: { value: DashboardMetric; label: string }[] = [
  { value: "posts", label: "Posts" },
  { value: "reach", label: "Reach" },
  { value: "engagement", label: "Engagement rate" },
  { value: "emv", label: "Estimated Media Value (EMV)" },
  { value: "likes", label: "Likes" },
  { value: "comments", label: "Comments" },
  { value: "views", label: "Views" },
];

function defaultFilters(): TrendsDashboardFilters {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 1);
  return {
    brandIds: [DEFAULT_BRANDS[0].id],
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    granularity: "WEEK",
    hashtagOrCaption: "",
    metric: "emv",
    locations: [],
    sponsoredOnly: false,
  };
}

export function TrendsDashboardForm({ savedDashboards }: { savedDashboards: SavedDashboard[] }) {
  const { showToast } = useToast();
  const [filters, setFilters] = useState<TrendsDashboardFilters>(defaultFilters());
  const [locationInput, setLocationInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    series: TrendsDataPoint[];
    comparisonRows: BrandComparisonRow[];
    topPostsByBrand: Record<string, CapturedContentFull[]>;
  } | null>(null);

  function toggleBrand(id: string) {
    setFilters((f) => ({
      ...f,
      brandIds: f.brandIds.includes(id) ? f.brandIds.filter((b) => b !== id) : [...f.brandIds, id],
    }));
  }

  function addLocation() {
    const loc = locationInput.trim();
    if (loc && !filters.locations.includes(loc)) {
      setFilters((f) => ({ ...f, locations: [...f.locations, loc] }));
    }
    setLocationInput("");
  }

  async function handleCreate(overrideFilters?: TrendsDashboardFilters) {
    const activeFilters = overrideFilters ?? filters;
    if (activeFilters.brandIds.length === 0) {
      showToast("Select at least one brand", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/brand-comparison/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeFilters),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
    } catch {
      showToast("Couldn't build the dashboard", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const name = window.prompt("Name this dashboard");
    if (!name?.trim()) return;
    await saveDashboard(name.trim(), filters);
    showToast("Dashboard saved", "success");
  }

  function handleLoadSaved(loaded: TrendsDashboardFilters) {
    setFilters(loaded);
    handleCreate(loaded);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-1.5">
          <h2 className="text-sm font-semibold text-text-primary">Create Trends Dashboard</h2>
          <Info className="h-3.5 w-3.5 text-text-muted" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Brands</label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_BRANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleBrand(b.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs",
                    filters.brandIds.includes(b.id) ? "border-gold/40 bg-gold/10 text-text-primary" : "border-border text-text-secondary"
                  )}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">From</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                className="w-full rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">To</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                className="w-full rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-sm text-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Hashtag or caption</label>
            <input
              value={filters.hashtagOrCaption}
              onChange={(e) => setFilters((f) => ({ ...f, hashtagOrCaption: e.target.value }))}
              placeholder="Eg. #stylecraftpro or gamma"
              className="w-full rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Metric</label>
              <select
                value={filters.metric}
                onChange={(e) => setFilters((f) => ({ ...f, metric: e.target.value as DashboardMetric }))}
                className="w-full rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-sm text-text-primary"
              >
                {METRIC_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Granularity</label>
              <div className="flex gap-1">
                {(["MONTH", "WEEK", "DAY"] as Granularity[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, granularity: g }))}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1.5 text-xs font-medium",
                      filters.granularity === g ? "bg-gold/15 text-gold" : "border border-border text-text-secondary"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Locations <span className="text-text-muted">(informational — not yet used to filter results)</span>
            </label>
            <div className="flex gap-2">
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                placeholder="United States"
                className="flex-1 rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {filters.locations.map((loc) => (
                <span key={loc} className="rounded bg-surface-elevated px-2 py-0.5 text-xs text-text-secondary">
                  {loc}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={filters.sponsoredOnly}
                onChange={(e) => setFilters((f) => ({ ...f, sponsoredOnly: e.target.checked }))}
                className="accent-gold"
              />
              Only show sponsored content
            </label>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => handleCreate()}
            disabled={loading}
            className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90 disabled:opacity-50"
          >
            {loading ? "Building..." : "Create dashboard"}
          </button>
        </div>
      </div>

      {!result ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-text-secondary">
          Use filters to create a customized trends dashboard
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface p-5">
            <div className="mb-3 flex justify-end">
              <button onClick={handleSave} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary">
                Save dashboard
              </button>
            </div>
            <TrendsLineChart series={result.series} brandIds={filters.brandIds} />
          </div>
          <BrandComparisonTable rows={result.comparisonRows} />
          <div className="rounded-lg border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Top posts per brand</h3>
            <TopPostsPerBrand topPostsByBrand={result.topPostsByBrand} />
          </div>
        </div>
      )}

      <SavedDashboards dashboards={savedDashboards} onLoad={handleLoadSaved} />
    </div>
  );
}
