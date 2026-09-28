"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { Modal, inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";
import { updateInfluencer } from "@/lib/actions";
import { PLATFORMS, type Influencer, type Platform } from "@/lib/types";

export function EditInfluencerModal({ influencer }: { influencer: Influencer }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    const followersRaw = formData.get("followers") as string;
    const engagementRaw = formData.get("engagement_rate") as string;
    const scoreRaw = formData.get("ai_score") as string;

    startTransition(async () => {
      try {
        await updateInfluencer(influencer.id, {
          name: formData.get("name") as string,
          handle: formData.get("handle") as string,
          platform: formData.get("platform") as Platform,
          followers: followersRaw ? parseInt(followersRaw, 10) : null,
          engagement_rate: engagementRaw ? parseFloat(engagementRaw) : null,
          email: (formData.get("email") as string) || null,
          location: (formData.get("location") as string) || null,
          niche: (formData.get("niche") as string) || null,
          notes: (formData.get("notes") as string) || null,
          ai_score: scoreRaw ? parseInt(scoreRaw, 10) : null,
        });
        router.refresh();
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
      {open && (
        <Modal title="Edit influencer" onClose={() => setOpen(false)}>
          <form action={handleSubmit} className="space-y-3">
            <div>
              <label className={labelClass}>Name</label>
              <input name="name" required defaultValue={influencer.name} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Handle</label>
                <input name="handle" required defaultValue={influencer.handle} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Platform</label>
                <select name="platform" required defaultValue={influencer.platform} className={inputClass}>
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
                <input
                  name="followers"
                  type="number"
                  min={0}
                  defaultValue={influencer.followers ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Engagement rate (%)</label>
                <input
                  name="engagement_rate"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={influencer.engagement_rate ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Email</label>
                <input name="email" type="email" defaultValue={influencer.email ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input name="location" defaultValue={influencer.location ?? ""} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Niche</label>
                <input name="niche" defaultValue={influencer.niche ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>AI score (0-100)</label>
                <input
                  name="ai_score"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={influencer.ai_score ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Notes</label>
              <textarea name="notes" rows={3} defaultValue={influencer.notes ?? ""} className={inputClass} />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <button type="submit" disabled={isPending} className={primaryButtonClass}>
              {isPending ? "Saving..." : "Save changes"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
