"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/Modal";
import { createCampaign } from "@/lib/campaigns-actions";
import { BRANDS, PLATFORMS } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Brand, Platform } from "@/lib/types";

const STEPS = ["Basic info", "Tracking", "Creator portal"] as const;

export function CreateCampaignWizard({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState<Brand>(BRANDS[0]);
  const [budget, setBudget] = useState("");
  const [budgetLabel, setBudgetLabel] = useState("");
  const [platform, setPlatform] = useState<Platform>("Instagram");
  const [startDate, setStartDate] = useState("");

  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentionInput, setMentionInput] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);

  const [welcomeMessage, setWelcomeMessage] = useState("");

  function addHashtag() {
    const tag = hashtagInput.trim().replace(/^#/, "");
    if (tag && !hashtags.includes(tag)) setHashtags([...hashtags, tag]);
    setHashtagInput("");
  }

  function addMention() {
    const mention = mentionInput.trim().replace(/^@/, "");
    if (mention && !mentions.includes(mention)) setMentions([...mentions, mention]);
    setMentionInput("");
  }

  async function handleCreate() {
    setSaving(true);
    try {
      const id = await createCampaign({
        name: name.trim(),
        brand,
        budget: budget ? Number(budget) : null,
        budgetLabel: budgetLabel.trim() || null,
        platform,
        startDate: startDate || null,
        trackedHashtags: hashtags,
        trackedMentions: mentions,
        welcomeMessage,
      });
      router.refresh();
      router.push(`/campaigns/${id}`);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Create new campaign" onClose={onClose}>
      <div className="mb-4 flex gap-1.5">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-medium",
              i === step ? "bg-gold/15 text-gold" : "text-text-muted"
            )}
          >
            {i + 1}. {s}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Campaign name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Instinct Trimmer Video" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Brand</label>
              <select className={inputClass} value={brand} onChange={(e) => setBrand(e.target.value as Brand)}>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
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
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Budget ($)</label>
              <input type="number" className={inputClass} value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Budget label (optional)</label>
              <input className={inputClass} value={budgetLabel} onChange={(e) => setBudgetLabel(e.target.value)} placeholder="e.g. $100" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Start date</label>
            <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Hashtags to track</label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
                placeholder="e.g. stylecraftpro"
              />
              <button type="button" onClick={addHashtag} className={secondaryButtonClass}>
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hashtags.map((h) => (
                <span key={h} className="rounded bg-surface-elevated px-2 py-1 font-mono text-xs text-gold">
                  #{h}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Mentions to track</label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={mentionInput}
                onChange={(e) => setMentionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMention())}
                placeholder="e.g. stylecraftpro"
              />
              <button type="button" onClick={addMention} className={secondaryButtonClass}>
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mentions.map((m) => (
                <span key={m} className="rounded bg-surface-elevated px-2 py-1 font-mono text-xs text-gold">
                  @{m}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <label className={labelClass}>Creator portal welcome message (optional)</label>
          <textarea
            className={inputClass}
            rows={5}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Shown to influencers when they open this campaign in the portal"
          />
        </div>
      )}

      <div className="mt-5 flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className={cn(secondaryButtonClass, "disabled:opacity-40")}
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !name.trim()} className={primaryButtonClass}>
            Next
          </button>
        ) : (
          <button onClick={handleCreate} disabled={saving || !name.trim()} className={primaryButtonClass}>
            {saving ? "Creating..." : "Create campaign"}
          </button>
        )}
      </div>
    </Modal>
  );
}
