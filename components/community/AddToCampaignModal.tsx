"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal, primaryButtonClass, labelClass, inputClass } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { addInfluencersToCampaign } from "@/lib/campaigns-actions";
import type { Campaign } from "@/lib/types";

export function AddToCampaignModal({
  campaigns,
  influencerIds,
  onClose,
}: {
  campaigns: Campaign[];
  influencerIds: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!campaignId) return;
    setSaving(true);
    try {
      await addInfluencersToCampaign(campaignId, influencerIds);
      showToast(`Added ${influencerIds.length} creator(s) to campaign`, "success");
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Add ${influencerIds.length} creator(s) to a campaign`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Campaign</label>
          <select className={inputClass} value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={saving || !campaignId} className={primaryButtonClass}>
          {saving ? "Adding..." : "Add to campaign"}
        </button>
      </form>
    </Modal>
  );
}
