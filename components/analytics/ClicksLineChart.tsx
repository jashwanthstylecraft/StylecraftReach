"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { LINE_CHART_COLORS, TOOLTIP_STYLE } from "./chart-colors";
import { formatDate } from "@/lib/utils";

export function ClicksLineChart({
  data,
}: {
  data: { date: string; clicks: number; conversions: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => formatDate(d)}
          tick={{ fill: "#9B9BA8", fontSize: 11 }}
          axisLine={{ stroke: "#2A2A32" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis tick={{ fill: "#9B9BA8", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelFormatter={(d) => (typeof d === "string" ? formatDate(d) : "")}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9B9BA8" }} />
        <Line
          type="monotone"
          dataKey="clicks"
          name="Clicks"
          stroke={LINE_CHART_COLORS.clicks}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="conversions"
          name="Conversions"
          stroke={LINE_CHART_COLORS.conversions}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
