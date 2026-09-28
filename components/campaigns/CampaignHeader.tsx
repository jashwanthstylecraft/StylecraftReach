"use client";

import { useState } from "react";
import { Calendar, Settings2, MoreHorizontal } from "lucide-react";
import { CreatorPortalSettingsModal } from "./CreatorPortalSettingsModal";
import { formatDate } from "@/lib/utils";
import type { Campaign } from "@/lib/types";
import type { CreatorPortalSettings } from "@/lib/campaign-detail-types";

export function CampaignHeader({
  campaign,
  portalSettings,
}: {
  campaign: Campaign;
  portalSettings: CreatorPortalSettings | null;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative text-center">
      <div className="absolute right-0 top-0 flex gap-2">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
        >
          <Settings2 className="h-3.5 w-3.5" /> Edit creator portal
        </button>
        <button className="rounded-md border border-border p-1.5 text-text-secondary hover:text-text-primary">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <h1 className="font-sans text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
        {campaign.budget_label ? `${campaign.budget_label} ` : ""}
        {campaign.name}
      </h1>
      {campaign.start_date && (
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-text-secondary">
          <Calendar className="h-4 w-4" />
          Tracking from {formatDate(campaign.start_date)}
        </p>
      )}
      {(campaign.tracked_hashtags.length > 0 || campaign.tracked_mentions.length > 0) && (
        <div className="mt-3 flex flex-wrap justify-center gap-x-2 gap-y-1">
          {campaign.tracked_hashtags.map((tag) => (
            <span key={tag} className="text-sm text-gold">
              #{tag}
            </span>
          ))}
          {campaign.tracked_mentions.map((mention) => (
            <span key={mention} className="text-sm text-gold">
              @{mention}
            </span>
          ))}
        </div>
      )}

      {settingsOpen && (
        <CreatorPortalSettingsModal campaign={campaign} settings={portalSettings} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
