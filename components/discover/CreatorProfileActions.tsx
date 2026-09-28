"use client";

import { useState, useTransition } from "react";
import { Bookmark, Plus } from "lucide-react";
import { AddToCampaignModal } from "./AddToCampaignModal";
import { useToast } from "@/components/ui/Toast";
import { saveCreator } from "@/lib/actions";
import type { AiScore, DiscoveryPlatform, ModashProfile } from "@/lib/modash/types";
import type { Campaign } from "@/lib/types";

export function CreatorProfileActions({
  profile,
  platform,
  score,
  campaigns,
}: {
  profile: ModashProfile;
  platform: DiscoveryPlatform;
  score: AiScore;
  campaigns: Campaign[];
}) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);

  function handleSave() {
    startTransition(async () => {
      try {
        await saveCreator(profile, platform, score);
        showToast(`@${profile.username} saved`, "success");
      } catch {
        showToast("Couldn't save creator — try again", "error");
      }
    });
  }

  return (
    <>
      <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-border bg-background/95 px-8 py-4 backdrop-blur">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated hover:text-text-primary disabled:opacity-50"
        >
          <Bookmark className="h-4 w-4" />
          Save creator
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Add to campaign
        </button>
      </div>
      {modalOpen && (
        <AddToCampaignModal
          profile={profile}
          platform={platform}
          score={score}
          campaigns={campaigns}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
