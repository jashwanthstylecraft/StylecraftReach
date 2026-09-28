"use client";

import { useState } from "react";
import { GiftTracker } from "@/components/influencer/GiftTracker";
import { cn } from "@/lib/utils";
import type { Gift } from "@/lib/types";
import type { InvitationRow } from "@/lib/campaigns-data";

export function ProductGiftingTab({ rows, giftsByCi }: { rows: InvitationRow[]; giftsByCi: Map<string, Gift[]> }) {
  const [expanded, setExpanded] = useState<string | null>(rows[0]?.id ?? null);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface py-12 text-center text-sm text-text-secondary">
        No influencers in this campaign yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const gifts = giftsByCi.get(r.id) ?? [];
        const isOpen = expanded === r.id;
        return (
          <div key={r.id} className="rounded-lg border border-border bg-surface">
            <button
              onClick={() => setExpanded(isOpen ? null : r.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
            >
              <span className="font-medium text-text-primary">{r.influencer.handle}</span>
              <span className={cn("text-text-secondary", isOpen && "text-gold")}>{gifts.length} gift(s)</span>
            </button>
            {isOpen && (
              <div className="border-t border-border p-3">
                <GiftTracker campaignInfluencerId={r.id} gifts={gifts} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
