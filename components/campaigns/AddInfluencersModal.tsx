"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Modal, inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";
import { addExistingInfluencerToCampaign } from "@/lib/campaigns-actions";
import { createInfluencer } from "@/lib/actions";
import { PLATFORMS } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Influencer, Platform } from "@/lib/types";

export function AddInfluencersModal({
  campaignId,
  allInfluencers,
  alreadyInCampaign,
  onClose,
}: {
  campaignId: string;
  allInfluencers: Influencer[];
  alreadyInCampaign: Set<string>;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"existing" | "manual">("existing");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<Platform>("Instagram");
  const [followers, setFollowers] = useState("");

  const available = useMemo(
    () =>
      allInfluencers.filter(
        (i) => !alreadyInCampaign.has(i.id) && (i.name.toLowerCase().includes(query.toLowerCase()) || i.handle.toLowerCase().includes(query.toLowerCase()))
      ),
    [allInfluencers, alreadyInCampaign, query]
  );

  function handleAddExisting(influencerId: string) {
    startTransition(async () => {
      await addExistingInfluencerToCampaign(campaignId, influencerId);
      router.refresh();
    });
  }

  function handleAddManual(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim()) return;
    startTransition(async () => {
      await createInfluencer({
        name: handle.replace(/^@/, ""),
        handle: handle.startsWith("@") ? handle : `@${handle}`,
        platform,
        followers: followers ? Number(followers) : null,
        email: null,
        location: null,
        niche: null,
        notes: null,
        ai_score: null,
        campaign_id: campaignId,
        stage: "Shortlisted",
      });
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal title="Add influencers" onClose={onClose}>
      <div className="mb-3 flex gap-1.5">
        <button
          onClick={() => setMode("existing")}
          className={cn("rounded-md px-3 py-1.5 text-xs font-medium", mode === "existing" ? "bg-gold/15 text-gold" : "text-text-secondary")}
        >
          From your influencers
        </button>
        <button
          onClick={() => setMode("manual")}
          className={cn("rounded-md px-3 py-1.5 text-xs font-medium", mode === "manual" ? "bg-gold/15 text-gold" : "text-text-secondary")}
        >
          Add by handle
        </button>
      </div>

      {mode === "existing" ? (
        <div className="space-y-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or handle"
            className={inputClass}
          />
          <div className="max-h-64 space-y-1 overflow-y-auto scrollbar-thin">
            {available.map((inf) => (
              <button
                key={inf.id}
                disabled={isPending}
                onClick={() => handleAddExisting(inf.id)}
                className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm hover:border-gold/40"
              >
                <span>
                  {inf.name} <span className="font-mono text-xs text-text-muted">{inf.handle}</span>
                </span>
                <span className="text-xs text-text-muted">{inf.platform}</span>
              </button>
            ))}
            {available.length === 0 && <p className="py-6 text-center text-sm text-text-secondary">No matching influencers.</p>}
          </div>
        </div>
      ) : (
        <form onSubmit={handleAddManual} className="space-y-3">
          <div>
            <label className={labelClass}>Handle</label>
            <input className={inputClass} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@handle" />
          </div>
          <div>
            <label className={labelClass}>Platform</label>
            <select className={inputClass} value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Followers (optional)</label>
            <input className={inputClass} type="number" value={followers} onChange={(e) => setFollowers(e.target.value)} />
          </div>
          <button type="submit" disabled={isPending || !handle.trim()} className={primaryButtonClass}>
            {isPending ? "Adding..." : "Add influencer"}
          </button>
        </form>
      )}
    </Modal>
  );
}
