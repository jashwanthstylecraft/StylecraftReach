"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CreatorCard } from "./CreatorCard";
import { AddToCampaignModal } from "./AddToCampaignModal";
import { useToast } from "@/components/ui/Toast";
import { removeSavedCreator } from "@/lib/actions";
import type { AiScore, SavedCreatorRow } from "@/lib/modash/types";
import type { Campaign } from "@/lib/types";

function toAiScore(row: SavedCreatorRow): AiScore | null {
  if (row.ai_score === null) return null;
  return {
    score: row.ai_score,
    tier: row.ai_tier ?? "B",
    fitReason: row.ai_fit_reason ?? "",
    redFlags: [],
    suggestedCampaign: "Stylecraft",
  };
}

export function SavedCreatorsGrid({
  savedCreators,
  campaigns,
}: {
  savedCreators: SavedCreatorRow[];
  campaigns: Campaign[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const [modalTarget, setModalTarget] = useState<SavedCreatorRow | null>(null);

  function handleRemove(row: SavedCreatorRow) {
    startTransition(async () => {
      try {
        await removeSavedCreator(row.id);
        router.refresh();
      } catch {
        showToast("Couldn't remove creator — try again", "error");
      }
    });
  }

  if (savedCreators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface py-16 text-center">
        <p className="text-sm text-text-secondary">
          No saved creators yet — save one from Discover to shortlist it here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {savedCreators.map((row) => (
          <CreatorCard
            key={row.id}
            profile={row.raw_data}
            platform={row.platform}
            score={toAiScore(row)}
            onAddToCampaign={() => setModalTarget(row)}
            onRemove={() => handleRemove(row)}
          />
        ))}
      </div>
      {modalTarget && (
        <AddToCampaignModal
          profile={modalTarget.raw_data}
          platform={modalTarget.platform}
          score={toAiScore(modalTarget)}
          campaigns={campaigns}
          onClose={() => setModalTarget(null)}
          onAdded={() => {
            removeSavedCreator(modalTarget.id).then(() => router.refresh());
          }}
        />
      )}
    </>
  );
}
