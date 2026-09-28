"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { InfluencerCombobox } from "@/components/analytics/InfluencerCombobox";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";
import { generateCodeSuggestions } from "./code-suggestions";
import type {
  CampaignInfluencerWithCampaign,
  CampaignInfluencerWithInfluencer,
  DiscountType,
} from "@/lib/types";

type Row = CampaignInfluencerWithInfluencer & CampaignInfluencerWithCampaign;

export function PromoCodeForm({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [campaignInfluencerId, setCampaignInfluencerId] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState(15);
  const [commissionRate, setCommissionRate] = useState(10);
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRow = rows.find((r) => r.id === campaignInfluencerId);

  const suggestions = useMemo(() => {
    if (!selectedRow) return [];
    return generateCodeSuggestions(selectedRow.influencer.handle, selectedRow.campaign.brand, discountValue);
  }, [selectedRow, discountValue]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!campaignInfluencerId || !code) {
      setError("Select an influencer and enter a code");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/promo-codes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignInfluencerId,
          code,
          discountType,
          discountValue,
          commissionRate,
          usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
          expiresAt: expiresAt || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create code");
      setCode("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">Create promo code</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <InfluencerCombobox
          rows={rows}
          value={campaignInfluencerId}
          onChange={setCampaignInfluencerId}
          listId="promo-code-influencers"
        />

        <div>
          <label className={labelClass}>Code</label>
          <input
            className={inputClass}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. MARK15"
          />
          {suggestions.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCode(s)}
                  className="rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 text-[11px] text-text-secondary hover:text-gold"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Discount type</label>
            <select
              className={inputClass}
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            >
              <option value="percentage">% off</option>
              <option value="fixed">$ off</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Discount value</label>
            <input
              type="number"
              className={inputClass}
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Commission rate (%)</label>
            <input
              type="number"
              className={inputClass}
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Usage limit</label>
            <input
              type="number"
              className={inputClass}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="Unlimited"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Expiry date (optional)</label>
          <input
            type="date"
            className={inputClass}
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Creating..." : "Create code"}
        </button>
      </form>
    </div>
  );
}
