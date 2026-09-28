"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";
import { createInfluencer } from "@/lib/actions";
import { PLATFORMS, type Platform } from "@/lib/types";

export function NewInfluencerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    const followersRaw = formData.get("followers") as string;

    startTransition(async () => {
      try {
        const influencer = await createInfluencer({
          name: formData.get("name") as string,
          handle: formData.get("handle") as string,
          platform: formData.get("platform") as Platform,
          followers: followersRaw ? parseInt(followersRaw, 10) : null,
          email: (formData.get("email") as string) || null,
          location: (formData.get("location") as string) || null,
          niche: (formData.get("niche") as string) || null,
          notes: (formData.get("notes") as string) || null,
          ai_score: null,
        });
        router.push(`/influencers/${influencer.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <form action={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <label className={labelClass}>Name</label>
        <input name="name" required className={inputClass} placeholder="Jane Doe" />
      </div>
      <div className="grid grid-cols-2 gap-4">
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Followers</label>
          <input name="followers" type="number" min={0} className={inputClass} placeholder="100000" />
        </div>
        <div>
          <label className={labelClass}>Niche</label>
          <input name="niche" className={inputClass} placeholder="Barbering" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" className={inputClass} placeholder="jane@example.com" />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input name="location" className={inputClass} placeholder="Los Angeles, CA" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Notes</label>
        <textarea name="notes" rows={3} className={inputClass} placeholder="Optional" />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <button type="submit" disabled={isPending} className={primaryButtonClass}>
        {isPending ? "Adding..." : "Add influencer"}
      </button>
    </form>
  );
}
