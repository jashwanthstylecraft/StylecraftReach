"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { inputClass, labelClass } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { DiscoveryPlatform, SearchFilters } from "@/lib/modash/types";

const PLATFORMS: DiscoveryPlatform[] = ["Instagram", "TikTok", "YouTube"];
const AGE_GROUPS = ["18-24", "25-34", "35-44"];
const LOCATIONS = [
  "United States",
  "California",
  "Texas",
  "New York",
  "Florida",
  "Canada",
  "United Kingdom",
  "Australia",
];

export const EMPTY_FILTERS: SearchFilters = {
  platforms: [],
  followers: { min: null, max: null },
  engagementRateMin: null,
  location: null,
  keyword: null,
  audienceGender: "any",
  audienceAge: [],
  credibilityScoreMin: null,
};

function countActive(filters: SearchFilters): number {
  let count = 0;
  if (filters.platforms.length > 0) count++;
  if (filters.followers.min !== null || filters.followers.max !== null) count++;
  if (filters.engagementRateMin !== null) count++;
  if (filters.location) count++;
  if (filters.keyword) count++;
  if (filters.audienceGender !== "any") count++;
  if (filters.audienceAge.length > 0) count++;
  if (filters.credibilityScoreMin !== null) count++;
  return count;
}

export function DiscoveryFilters({
  filters,
  onChange,
  onSearch,
  isSearching,
}: {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  isSearching: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = countActive(filters);

  function togglePlatform(platform: DiscoveryPlatform) {
    const has = filters.platforms.includes(platform);
    onChange({
      ...filters,
      platforms: has ? filters.platforms.filter((p) => p !== platform) : [...filters.platforms, platform],
    });
  }

  function toggleAge(code: string) {
    const has = filters.audienceAge.includes(code);
    onChange({
      ...filters,
      audienceAge: has ? filters.audienceAge.filter((a) => a !== code) : [...filters.audienceAge, code],
    });
  }

  const content = (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Platform</label>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePlatform(p)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium",
                filters.platforms.includes(p)
                  ? "border-gold/40 bg-gold/15 text-gold"
                  : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Followers</label>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            className={inputClass}
            value={filters.followers.min ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                followers: { ...filters.followers, min: e.target.value ? Number(e.target.value) : null },
              })
            }
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            className={inputClass}
            value={filters.followers.max ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                followers: { ...filters.followers, max: e.target.value ? Number(e.target.value) : null },
              })
            }
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Engagement rate min (%)</label>
        <input
          type="number"
          min={0}
          step="0.1"
          className={inputClass}
          value={filters.engagementRateMin ?? ""}
          onChange={(e) =>
            onChange({ ...filters, engagementRateMin: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>

      <div>
        <label className={labelClass}>Location</label>
        <select
          className={inputClass}
          value={filters.location ?? ""}
          onChange={(e) => onChange({ ...filters, location: e.target.value || null })}
        >
          <option value="">Any</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Niche / keyword</label>
        <input
          className={inputClass}
          placeholder="barber, grooming, haircut..."
          value={filters.keyword ?? ""}
          onChange={(e) => onChange({ ...filters, keyword: e.target.value || null })}
        />
      </div>

      <div>
        <label className={labelClass}>Audience gender</label>
        <div className="flex gap-1.5">
          {(["any", "male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange({ ...filters, audienceGender: g })}
              className={cn(
                "flex-1 rounded-md border px-2 py-1 text-xs font-medium capitalize",
                filters.audienceGender === g
                  ? "border-gold/40 bg-gold/15 text-gold"
                  : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary"
              )}
            >
              {g === "any" ? "Any" : `Mostly ${g}`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Audience age</label>
        <div className="flex flex-wrap gap-1.5">
          {AGE_GROUPS.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => toggleAge(code)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium",
                filters.audienceAge.includes(code)
                  ? "border-gold/40 bg-gold/15 text-gold"
                  : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary"
              )}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Credibility score min</label>
        <input
          type="number"
          min={0}
          max={100}
          className={inputClass}
          value={filters.credibilityScoreMin ?? ""}
          onChange={(e) =>
            onChange({ ...filters, credibilityScoreMin: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={() => {
            onSearch();
            setMobileOpen(false);
          }}
          disabled={isSearching}
          className="w-full rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90 disabled:opacity-50"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
        <button
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-center text-xs text-text-secondary hover:text-text-primary"
        >
          Clear filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm text-text-secondary md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-gold/15 px-1.5 text-xs text-gold">{activeCount}</span>
        )}
      </button>

      <div className="hidden w-72 shrink-0 rounded-lg border border-border bg-surface p-4 md:block">
        {content}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-xl border-t border-border bg-surface p-4 scrollbar-thin">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">Filters</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close">
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
