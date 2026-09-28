"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PayoutModal, type PayoutTarget } from "./PayoutModal";
import { formatCurrency } from "@/lib/utils";

export function CommissionPayoutCard({
  campaignInfluencerId,
  handle,
  campaignName,
  conversionsCount,
  totalRevenue,
  commissionRate,
  commissionOwed,
  onboarded,
}: {
  campaignInfluencerId: string;
  handle: string;
  campaignName: string;
  conversionsCount: number;
  totalRevenue: number;
  commissionRate: number | null;
  commissionOwed: number;
  onboarded: boolean;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<PayoutTarget | null>(null);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-2 text-xs font-medium text-text-secondary">Commission summary (from Phase 3 data)</p>
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-text-secondary">Conversions this period</dt>
          <dd className="text-text-primary">{conversionsCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">Total revenue driven</dt>
          <dd className="text-text-primary">{formatCurrency(totalRevenue)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">Commission rate</dt>
          <dd className="text-text-primary">{commissionRate !== null ? `${commissionRate}%` : "—"}</dd>
        </div>
        <div className="flex justify-between font-medium">
          <dt className="text-text-primary">Commission owed</dt>
          <dd className="text-gold">{formatCurrency(commissionOwed)}</dd>
        </div>
      </dl>
      <button
        onClick={() =>
          setTarget({
            campaignInfluencerId,
            paymentType: "commission",
            handle,
            campaignName,
            amount: commissionOwed,
          })
        }
        disabled={commissionOwed <= 0 || !onboarded}
        className="mt-3 w-full rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90 disabled:opacity-40"
      >
        Pay commission — {formatCurrency(commissionOwed)}
      </button>
      {!onboarded && commissionOwed > 0 && (
        <p className="mt-1.5 text-[11px] text-text-muted">Connect a bank account above before paying.</p>
      )}

      {target && (
        <PayoutModal target={target} onClose={() => setTarget(null)} onSent={() => router.refresh()} />
      )}
    </div>
  );
}
