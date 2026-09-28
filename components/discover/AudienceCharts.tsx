"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ModashProfile } from "@/lib/modash/types";

const GENDER_COLORS = { male: "#3987e5", female: "#d55181" };
const AGE_BAR_COLOR = "#3987e5";

const TOOLTIP_STYLE = {
  backgroundColor: "#1A1A1F",
  border: "1px solid #2A2A32",
  borderRadius: 6,
  fontSize: 12,
  color: "#F4F4F5",
};

export function GenderDonut({ genderSplit }: { genderSplit: ModashProfile["audience"]["genderSplit"] }) {
  const data = [
    { name: "Male", value: genderSplit.male, color: GENDER_COLORS.male },
    { name: "Female", value: genderSplit.female, color: GENDER_COLORS.female },
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
            stroke="#111114"
            strokeWidth={2}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) => [`${value}%`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-4 text-xs text-text-secondary">
        {data.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name} {d.value}%
          </span>
        ))}
      </div>
    </div>
  );
}

export function AgeBarChart({ ageGroups }: { ageGroups: ModashProfile["audience"]["ageGroups"] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={ageGroups} layout="vertical" margin={{ left: 8, right: 24 }}>
        <XAxis type="number" hide domain={[0, "dataMax + 10"]} />
        <YAxis
          type="category"
          dataKey="code"
          width={48}
          tick={{ fill: "#9B9BA8", fontSize: 11 }}
          axisLine={{ stroke: "#2A2A32" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [`${value}%`, "Audience"]}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="value" fill={AGE_BAR_COLOR} radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LocationList({ locations }: { locations: ModashProfile["audience"]["topLocations"] }) {
  const top = locations.slice(0, 5);
  const max = Math.max(...top.map((l) => l.value), 1);

  return (
    <div className="space-y-2">
      {top.map((loc) => (
        <div key={loc.name} className="flex items-center gap-3 text-xs">
          <span className="w-28 shrink-0 truncate text-text-secondary">{loc.name}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full bg-gold"
              style={{ width: `${(loc.value / max) * 100}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right font-mono text-text-primary">{loc.value}%</span>
        </div>
      ))}
    </div>
  );
}
