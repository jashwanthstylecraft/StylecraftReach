"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { TOOLTIP_STYLE } from "@/components/analytics/chart-colors";
import { formatEMV } from "@/lib/utils/emv";
import { exportToCSV } from "@/lib/utils/export";
import { cn } from "@/lib/utils";
import { DEFAULT_BRANDS, type BrandComparisonRow, type DashboardMetric } from "@/lib/affable-types";

const METRICS: { key: DashboardMetric; label: string; format: (v: number) => string }[] = [
  { key: "posts", label: "Posts", format: (v) => v.toLocaleString() },
  { key: "reach", label: "Reach", format: (v) => v.toLocaleString() },
  { key: "engagement", label: "Avg. engagement", format: (v) => `${v.toFixed(1)}%` },
  { key: "emv", label: "EMV", format: formatEMV },
];

const METRIC_FIELD: Record<string, keyof BrandComparisonRow> = {
  posts: "posts",
  reach: "totalReach",
  engagement: "avgEngagement",
  emv: "totalEmv",
};

export function BrandComparisonChart({ rows }: { rows: BrandComparisonRow[] }) {
  const [metric, setMetric] = useState<DashboardMetric>("emv");
  const active = METRICS.find((m) => m.key === metric)!;
  const field = METRIC_FIELD[metric];

  const data = rows.map((r) => {
    const brand = DEFAULT_BRANDS.find((b) => b.id === r.brandId)!;
    return { ...r, value: r[field] as number, color: brand.color };
  });

  function handleExport() {
    exportToCSV(
      rows.map((r) => ({
        brand: r.brandName,
        posts: r.posts,
        total_reach: r.totalReach,
        avg_engagement: r.avgEngagement.toFixed(2),
        total_emv: r.totalEmv.toFixed(2),
      })),
      "brand-comparison"
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                metric === m.key ? "bg-gold/15 text-gold" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
          <XAxis
            dataKey="brandName"
            tick={{ fill: "#9B9BA8", fontSize: 11 }}
            axisLine={{ stroke: "#2A2A32" }}
            tickLine={false}
          />
          <YAxis tick={{ fill: "#9B9BA8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [active.format(value as number), active.label]} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((d) => (
              <Cell key={d.brandId} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-text-secondary">
        {DEFAULT_BRANDS.map((b) => (
          <span key={b.id} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
            {b.name}
            {!b.isOwnBrand && <span className="text-text-muted">(competitor)</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
