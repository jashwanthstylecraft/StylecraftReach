"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { CampaignCard } from "./CampaignCard";
import { CreateCampaignWizard } from "./CreateCampaignWizard";
import { useGlobalPlatform } from "@/lib/platform-context";
import { cn } from "@/lib/utils";
import type { Campaign, CampaignInfluencerWithInfluencer } from "@/lib/types";

export function CampaignsPageClient({
  campaigns,
  rows,
}: {
  campaigns: Campaign[];
  rows: CampaignInfluencerWithInfluencer[];
}) {
  const { platform: globalPlatform } = useGlobalPlatform();
  const [query, setQuery] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);

  const platformsByCampaign = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const r of rows) {
      if (!map.has(r.campaign_id)) map.set(r.campaign_id, new Set());
      map.get(r.campaign_id)!.add(r.influencer.platform);
    }
    return map;
  }, [rows]);

  const filtered = campaigns.filter((c) => {
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (globalPlatform !== "all" && !(platformsByCampaign.get(c.id)?.has(globalPlatform) ?? false)) return false;
    return true;
  });

  const activeCount = campaigns.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          Active campaigns: <span className="font-mono text-text-primary">{activeCount}</span>
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campaigns by name"
              className="rounded-md border border-border bg-surface-elevated py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted"
            />
          </div>
          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-gold px-4 py-1.5 text-sm font-medium text-background hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" /> Create new campaign
          </button>
        </div>
      </div>

      {globalPlatform !== "all" && (
        <p className={cn("text-xs text-text-secondary")}>
          Filtered to campaigns with <span className="text-gold">{globalPlatform}</span> influencers (change in the header switcher)
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface py-16 text-center text-sm text-text-secondary">
          No campaigns match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} influencerCount={rows.filter((r) => r.campaign_id === c.id).length} />
          ))}
        </div>
      )}

      {wizardOpen && <CreateCampaignWizard onClose={() => setWizardOpen(false)} />}
    </div>
  );
}
