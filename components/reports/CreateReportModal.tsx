"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal, inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";
import { createReport } from "@/lib/reports-actions";
import type { Influencer } from "@/lib/types";
import type { ReportPlatform } from "@/lib/affable-types";
import { cn } from "@/lib/utils";

export function CreateReportModal({
  influencers,
  campaignId,
  defaultSelectedIds,
  onClose,
}: {
  influencers: Influencer[];
  campaignId?: string;
  defaultSelectedIds?: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<ReportPlatform>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelectedIds ?? []));
  const [saving, setSaving] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || selected.size === 0) return;
    setSaving(true);
    try {
      await createReport(name.trim(), platform, Array.from(selected), [], campaignId ?? null);
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Create report" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Report name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sep 2026 Overview" />
        </div>
        <div>
          <label className={labelClass}>Platform</label>
          <select className={inputClass} value={platform} onChange={(e) => setPlatform(e.target.value as ReportPlatform)}>
            <option value="all">All platforms</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Include influencers ({selected.size} selected)</label>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2 scrollbar-thin">
            {influencers.map((inf) => (
              <label
                key={inf.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm",
                  selected.has(inf.id) ? "bg-gold/10 text-text-primary" : "text-text-secondary"
                )}
              >
                <span>
                  {inf.name} <span className="font-mono text-xs text-text-muted">{inf.handle}</span>
                </span>
                <input type="checkbox" checked={selected.has(inf.id)} onChange={() => toggle(inf.id)} className="accent-gold" />
              </label>
            ))}
          </div>
        </div>
        <button type="submit" disabled={saving || selected.size === 0} className={primaryButtonClass}>
          {saving ? "Saving..." : "Create report"}
        </button>
      </form>
    </Modal>
  );
}
