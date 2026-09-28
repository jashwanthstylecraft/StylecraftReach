"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_PLATFORM_COLORS, TOOLTIP_STYLE } from "./chart-colors";

export function PlatformPieChart({ data }: { data: { platform: string; clicks: number }[] }) {
  const total = data.reduce((s, d) => s + d.clicks, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="clicks"
            nameKey="platform"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
            stroke="#111114"
            strokeWidth={2}
          >
            {data.map((d) => (
              <Cell key={d.platform} fill={CHART_PLATFORM_COLORS[d.platform] ?? "#9B9BA8"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) => [
              `${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-text-secondary">
        {data.map((d) => (
          <span key={d.platform} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CHART_PLATFORM_COLORS[d.platform] ?? "#9B9BA8" }}
            />
            {d.platform} {total > 0 ? Math.round((d.clicks / total) * 100) : 0}%
          </span>
        ))}
      </div>
    </div>
  );
}
