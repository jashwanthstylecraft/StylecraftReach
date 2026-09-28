"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Modal, inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";
import { createInfluencer } from "@/lib/actions";
import { PLATFORMS, type Campaign, type Platform, type Stage } from "@/lib/types";

export function AddInfluencerModal({
  stage,
  campaigns,
  onClose,
}: {
  stage: Stage;
  campaigns: Campaign[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    const campaignId = formData.get("campaign_id") as string;
    if (!campaignId) {
      setError("Select a campaign");
      return;
    }
    const followersRaw = formData.get("followers") as string;

    startTransition(async () => {
      try {
        await createInfluencer({
          name: formData.get("name") as string,
          handle: formData.get("handle") as string,
          platform: formData.get("platform") as Platform,
          followers: followersRaw ? parseInt(followersRaw, 10) : null,
          email: (formData.get("email") as string) || null,
          location: null,
          niche: (formData.get("niche") as string) || null,
          notes: (formData.get("notes") as string) || null,
          ai_score: null,
          campaign_id: campaignId,
          stage,
        });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <Modal title={`Add influencer — ${stage}`} onClose={onClose}>
      <form action={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Name</label>
          <input name="name" required className={inputClass} placeholder="Jane Doe" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Handle</label>
            <input name="handle" required className={inputClass} placeholder="@janedoe" />
          </div>
          <div>
            <label className={labelClass}>Platform</label>
            <select name="platform" required className={inputClass} defaultValue="Instagram">
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Followers</label>
            <input name="followers" type="number" min={0} className={inputClass} placeholder="100000" />
          </div>
          <div>
            <label className={labelClass}>Niche</label>
            <input name="niche" className={inputClass} placeholder="Barbering" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" className={inputClass} placeholder="jane@example.com" />
        </div>
        <div>
          <label className={labelClass}>Campaign</label>
          <select name="campaign_id" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Select campaign
            </option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea name="notes" rows={2} className={inputClass} placeholder="Optional" />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <button type="submit" disabled={isPending} className={primaryButtonClass}>
          {isPending ? "Adding..." : "Add influencer"}
        </button>
      </form>
    </Modal>
  );
}
