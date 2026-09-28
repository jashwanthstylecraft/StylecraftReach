"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LINE_CHART_COLORS, TOOLTIP_STYLE } from "@/components/analytics/chart-colors";
import type { TrackedHashtag } from "@/lib/intelligence-types";

// Reuses the same validated blue/aqua pair as the Phase 3 clicks/conversions
// chart (dataviz skill CVD check) — repurposed here as own-brand vs competitor.
const OWN_COLOR = LINE_CHART_COLORS.clicks;
const COMPETITOR_COLOR = LINE_CHART_COLORS.conversions;

export function HashtagComparisonChart({ hashtags }: { hashtags: TrackedHashtag[] }) {
  const data = hashtags.map((h) => ({
    hashtag: `#${h.hashtag}`,
    posts: h.post_count,
    avgEngagement: h.avg_engagement ?? 0,
    isOwnBrand: h.is_own_brand,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="hashtag"
            width={130}
            tick={{ fill: "#9B9BA8", fontSize: 11 }}
            axisLine={{ stroke: "#2A2A32" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) => [name === "posts" ? value : `${value}% avg engagement`, name === "posts" ? "Posts" : "Engagement"]}
          />
          <Bar dataKey="posts" radius={[0, 4, 4, 0]} barSize={16}>
            {data.map((d) => (
              <Cell key={d.hashtag} fill={d.isOwnBrand ? OWN_COLOR : COMPETITOR_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: OWN_COLOR }} />
          Our brands
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COMPETITOR_COLOR }} />
          Competitors
        </span>
      </div>
    </div>
  );
}
