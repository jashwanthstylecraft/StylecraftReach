"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TOOLTIP_STYLE } from "@/components/analytics/chart-colors";
import { DEFAULT_BRANDS } from "@/lib/affable-types";
import type { TrendsDataPoint } from "@/lib/affable-types";

export function TrendsLineChart({ series, brandIds }: { series: TrendsDataPoint[]; brandIds: string[] }) {
  const brands = DEFAULT_BRANDS.filter((b) => brandIds.includes(b.id));

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={series} margin={{ left: 8, right: 16, top: 8 }}>
          <XAxis dataKey="date" tick={{ fill: "#9B9BA8", fontSize: 11 }} axisLine={{ stroke: "#2A2A32" }} tickLine={false} />
          <YAxis tick={{ fill: "#9B9BA8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {brands.map((b) => (
            <Line key={b.id} type="monotone" dataKey={b.id} name={b.name} stroke={b.color} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-text-secondary">
        {brands.map((b) => (
          <span key={b.id} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
}
