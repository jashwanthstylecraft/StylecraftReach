"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_PLATFORM_COLORS, TOOLTIP_STYLE } from "./chart-colors";
import { formatCurrency } from "@/lib/utils";

export function RevenueBarChart({
  data,
}: {
  data: { handle: string; platform: string; revenue: number }[];
}) {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 32)}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 24 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="handle"
          width={110}
          tick={{ fill: "#9B9BA8", fontSize: 11 }}
          axisLine={{ stroke: "#2A2A32" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={16}>
          {sorted.map((row) => (
            <Cell key={row.handle} fill={CHART_PLATFORM_COLORS[row.platform] ?? "#9B9BA8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
