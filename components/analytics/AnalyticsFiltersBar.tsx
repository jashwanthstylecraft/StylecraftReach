"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BRANDS, type Brand, type Campaign } from "@/lib/types";

export interface AnalyticsFilterState {
  days: number;
  campaignId?: string;
  brand?: Brand;
}

const PRESETS = [
  { label: "Last 7d", days: 7 },
  { label: "Last 30d", days: 30 },
  { label: "Last 90d", days: 90 },
];

export function AnalyticsFiltersBar({
  campaigns,
  value,
  onChange,
}: {
  campaigns: Campaign[];
  value: AnalyticsFilterState;
  onChange: (next: AnalyticsFilterState) => void;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const isPreset = PRESETS.some((p) => p.days === value.days);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setCustomOpen(false);
              onChange({ ...value, days: p.days });
            }}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium",
              value.days === p.days && isPreset
                ? "border-gold/40 bg-gold/15 text-gold"
                : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary"
            )}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setCustomOpen((o) => !o)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-xs font-medium",
            !isPreset || customOpen
              ? "border-gold/40 bg-gold/15 text-gold"
              : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary"
          )}
        >
          Custom
        </button>
        {customOpen && (
          <input
            type="number"
            min={1}
            max={365}
            defaultValue={value.days}
            onChange={(e) => onChange({ ...value, days: Number(e.target.value) || 1 })}
            className="w-20 rounded-md border border-border bg-surface-elevated px-2 py-1.5 text-xs text-text-primary"
            placeholder="Days"
          />
        )}
      </div>

      <select
        value={value.campaignId ?? ""}
        onChange={(e) => onChange({ ...value, campaignId: e.target.value || undefined })}
        className="rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary"
      >
        <option value="">All campaigns</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={value.brand ?? ""}
        onChange={(e) => onChange({ ...value, brand: (e.target.value as Brand) || undefined })}
        className="rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary"
      >
        <option value="">All brands</option>
        {BRANDS.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
    </div>
  );
}
