"use client";

import { useState } from "react";
import { Modal, primaryButtonClass } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { AiScore, DiscoveryPlatform, ModashProfile } from "@/lib/modash/types";
import type { Campaign } from "@/lib/types";

export function AddToCampaignModal({
  profile,
  platform,
  score,
  campaigns,
  onClose,
  onAdded,
}: {
  profile: ModashProfile;
  platform: DiscoveryPlatform;
  score: AiScore | null;
  campaigns: Campaign[];
  onClose: () => void;
  onAdded?: () => void;
}) {
  const { showToast } = useToast();
  const [campaignId, setCampaignId] = useState<string>(
    campaigns.find((c) => c.status === "active")?.id ?? campaigns[0]?.id ?? ""
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!campaignId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/add-to-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modashProfile: profile,
          campaignId,
          platform,
          aiScore: score?.score ?? 50,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const campaignName = campaigns.find((c) => c.id === campaignId)?.name ?? "campaign";
      showToast(`@${profile.username} added to ${campaignName}`, "success");
      onAdded?.();
      onClose();
    } catch {
      showToast("Couldn't add creator to campaign — try again", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add to campaign" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-text-secondary">
          Add <span className="text-text-primary">@{profile.username}</span> to a campaign pipeline as{" "}
          <span className="text-text-primary">Shortlisted</span>.
        </p>
        {campaigns.length === 0 ? (
          <p className="text-xs text-text-muted">No campaigns yet — create one first.</p>
        ) : (
          <div className="max-h-56 space-y-1.5 overflow-y-auto scrollbar-thin">
            {campaigns.map((c) => (
              <label
                key={c.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm",
                  campaignId === c.id
                    ? "border-gold/40 bg-gold/10 text-text-primary"
                    : "border-border bg-surface-elevated text-text-secondary hover:text-text-primary"
                )}
              >
                <span>
                  {c.name}
                  <span className="ml-2 text-xs text-text-muted">{c.brand}</span>
                </span>
                <input
                  type="radio"
                  name="campaign"
                  checked={campaignId === c.id}
                  onChange={() => setCampaignId(c.id)}
                  className="accent-gold"
                />
              </label>
            ))}
          </div>
        )}
        <button
          onClick={handleConfirm}
          disabled={submitting || !campaignId}
          className={primaryButtonClass}
        >
          {submitting ? "Adding..." : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}
