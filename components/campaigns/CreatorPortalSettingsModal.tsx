"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy } from "lucide-react";
import { Modal, inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { saveCreatorPortalSettings } from "@/lib/creator-portal-settings-actions";
import type { Campaign } from "@/lib/types";
import type { CreatorPortalSettings } from "@/lib/campaign-detail-types";

export function CreatorPortalSettingsModal({
  campaign,
  settings,
  onClose,
}: {
  campaign: Campaign;
  settings: CreatorPortalSettings | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showBrief, setShowBrief] = useState(settings?.show_brief ?? true);
  const [showDeliverables, setShowDeliverables] = useState(settings?.show_deliverables ?? true);
  const [showGifting, setShowGifting] = useState(settings?.show_gifting ?? true);
  const [showEarnings, setShowEarnings] = useState(settings?.show_earnings ?? true);
  const [showOtherInfluencers, setShowOtherInfluencers] = useState(settings?.show_other_influencers ?? false);
  const [welcomeMessage, setWelcomeMessage] = useState(settings?.welcome_message ?? "");
  const [isPending, startTransition] = useTransition();

  const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/portal/campaigns/${campaign.id}` : "";

  function handleCopy() {
    navigator.clipboard.writeText(portalUrl);
    showToast("Portal link copied", "success");
  }

  function handleSave() {
    startTransition(async () => {
      await saveCreatorPortalSettings(campaign.id, {
        showBrief,
        showDeliverables,
        showGifting,
        showEarnings,
        showOtherInfluencers,
        welcomeMessage,
      });
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal title={`Creator portal settings — ${campaign.name}`} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className={labelClass}>Portal URL</label>
          <div className="flex gap-2">
            <input className={inputClass} value={portalUrl} readOnly />
            <button onClick={handleCopy} className="flex items-center gap-1 rounded-md border border-border px-3 text-xs text-text-secondary hover:text-text-primary">
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>What influencers see</label>
          <div className="space-y-1.5">
            {[
              { label: "Campaign brief", value: showBrief, set: setShowBrief },
              { label: "Deliverables checklist", value: showDeliverables, set: setShowDeliverables },
              { label: "Product gifting status", value: showGifting, set: setShowGifting },
              { label: "Their earnings", value: showEarnings, set: setShowEarnings },
              { label: "Other influencers in campaign", value: showOtherInfluencers, set: setShowOtherInfluencers },
            ].map((row) => (
              <label key={row.label} className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={row.value} onChange={(e) => row.set(e.target.checked)} className="accent-gold" />
                {row.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Portal welcome message</label>
          <textarea
            className={inputClass}
            rows={4}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Shown to the influencer when they open this campaign"
          />
        </div>

        <button onClick={handleSave} disabled={isPending} className={primaryButtonClass}>
          {isPending ? "Saving..." : "Save settings"}
        </button>
      </div>
    </Modal>
  );
}
