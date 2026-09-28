"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { InfluencerCombobox } from "@/components/analytics/InfluencerCombobox";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";
import type { CampaignInfluencerWithCampaign, CampaignInfluencerWithInfluencer } from "@/lib/types";

type Row = CampaignInfluencerWithInfluencer & CampaignInfluencerWithCampaign;

export function LinkGenerator({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [campaignInfluencerId, setCampaignInfluencerId] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedRow = rows.find((r) => r.id === campaignInfluencerId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!campaignInfluencerId || !destinationUrl) {
      setError("Select an influencer and a destination URL");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/links/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignInfluencerId, destinationUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create link");
      setCreated(json.affiliateLink.short_link);
      setDestinationUrl("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy() {
    if (!created) return;
    navigator.clipboard.writeText(created);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">Generate a new link</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
        <InfluencerCombobox
          rows={rows}
          value={campaignInfluencerId}
          onChange={setCampaignInfluencerId}
          listId="link-generator-influencers"
        />
        <div>
          <label className={labelClass}>Campaign</label>
          <input
            className={inputClass}
            value={selectedRow?.campaign.name ?? ""}
            disabled
            placeholder="Auto-filled"
          />
        </div>
        <div>
          <label className={labelClass}>Destination URL</label>
          <input
            className={inputClass}
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="https://stylecraftus.com/products/gamma-pro"
          />
        </div>
        <div className="sm:col-span-3">
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? "Generating..." : "Generate link"}
          </button>
        </div>
      </form>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {created && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm">
          <span className="font-mono text-text-primary">{created}</span>
          <button
            onClick={handleCopy}
            className="ml-auto flex items-center gap-1 text-xs text-success hover:underline"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
