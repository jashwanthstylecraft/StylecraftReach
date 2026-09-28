"use client";

import { useMemo, useState } from "react";
import { OutstandingTable } from "./OutstandingTable";
import { PaymentHistoryTable } from "./PaymentHistoryTable";
import { StatsCard } from "@/components/analytics/StatsCard";
import { BRANDS, type Brand, type Campaign, type PaymentStatus, type PaymentType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { OutstandingRow, PaymentFull } from "@/lib/payments-data";

const STATUS_OPTIONS: PaymentStatus[] = ["pending", "processing", "paid", "failed", "cancelled"];
const TYPE_OPTIONS: PaymentType[] = ["flat_fee", "commission", "bonus"];

export function PaymentsDashboard({
  outstandingRows,
  history,
  campaigns,
  onboardedIds,
  monthlyPaidTotal,
  processingCount,
  notOnboardedCount,
}: {
  outstandingRows: OutstandingRow[];
  history: PaymentFull[];
  campaigns: Campaign[];
  onboardedIds: string[];
  monthlyPaidTotal: number;
  processingCount: number;
  notOnboardedCount: number;
}) {
  const [tab, setTab] = useState<"outstanding" | "history">("outstanding");
  const [campaignId, setCampaignId] = useState("");
  const [brand, setBrand] = useState<Brand | "">("");
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [paymentType, setPaymentType] = useState<PaymentType | "">("");

  const onboardedSet = useMemo(() => new Set(onboardedIds), [onboardedIds]);

  const filteredOutstanding = outstandingRows.filter((r) => {
    if (campaignId && r.campaign.id !== campaignId) return false;
    if (brand && r.campaign.brand !== brand) return false;
    if (paymentType && r.type !== (paymentType === "flat_fee" ? "flat_fee" : "commission")) return false;
    return true;
  });

  const filteredHistory = history.filter((p) => {
    if (campaignId && p.campaign_influencer.campaign.id !== campaignId) return false;
    if (brand && p.campaign_influencer.campaign.brand !== brand) return false;
    if (status && p.status !== status) return false;
    if (paymentType && p.payment_type !== paymentType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard label="Paid this month" value={formatCurrency(monthlyPaidTotal)} />
        <StatsCard
          label="Outstanding"
          value={formatCurrency(outstandingRows.reduce((s, r) => s + r.amount, 0))}
        />
        <StatsCard label="Pending transfers" value={String(processingCount)} />
        <StatsCard label="Not onboarded" value={String(notOnboardedCount)} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          <button
            onClick={() => setTab("outstanding")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              tab === "outstanding" ? "bg-gold/15 text-gold" : "text-text-secondary hover:text-text-primary"
            )}
          >
            Outstanding
          </button>
          <button
            onClick={() => setTab("history")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              tab === "history" ? "bg-gold/15 text-gold" : "text-text-secondary hover:text-text-primary"
            )}
          >
            Payment history
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary"
          >
            <option value="">All campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={brand}
            onChange={(e) => setBrand((e.target.value as Brand) || "")}
            className="rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary"
          >
            <option value="">All brands</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType((e.target.value as PaymentType) || "")}
            className="rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary"
          >
            <option value="">All types</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t === "flat_fee" ? "Flat fee" : t === "commission" ? "Commission" : "Bonus"}
              </option>
            ))}
          </select>
          {tab === "history" && (
            <select
              value={status}
              onChange={(e) => setStatus((e.target.value as PaymentStatus) || "")}
              className="rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {tab === "outstanding" ? (
        <OutstandingTable rows={filteredOutstanding} onboardedIds={onboardedSet} />
      ) : (
        <PaymentHistoryTable payments={filteredHistory} />
      )}
    </div>
  );
}
