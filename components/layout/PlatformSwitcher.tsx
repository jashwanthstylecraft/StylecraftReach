"use client";

import { Globe } from "lucide-react";
import { useGlobalPlatform, type GlobalPlatform } from "@/lib/platform-context";

const OPTIONS: { value: GlobalPlatform; label: string }[] = [
  { value: "all", label: "All platforms" },
  { value: "Instagram", label: "Instagram" },
  { value: "TikTok", label: "TikTok" },
  { value: "YouTube", label: "YouTube" },
  { value: "X", label: "X" },
];

export function PlatformSwitcher() {
  const { platform, setPlatform } = useGlobalPlatform();

  return (
    <label className="flex items-center gap-1.5 rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-xs text-text-secondary">
      <Globe className="h-3.5 w-3.5" />
      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value as GlobalPlatform)}
        className="bg-transparent text-xs text-text-secondary outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
