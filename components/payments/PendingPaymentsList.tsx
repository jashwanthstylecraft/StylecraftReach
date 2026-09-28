"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PayoutModal, type PayoutTarget } from "./PayoutModal";
import { formatCurrency } from "@/lib/utils";
import type { Payment } from "@/lib/types";

export function PendingPaymentsList({
  payments,
  handle,
  campaignName,
  onboarded,
}: {
  payments: Payment[];
  handle: string;
  campaignName: string;
  onboarded: boolean;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<PayoutTarget | null>(null);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-2 text-xs font-medium text-text-secondary">Pending payments</p>
      <div className="space-y-2">
        {payments.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm"
          >
            <div>
              <p className="text-text-primary">{p.description ?? "Payment"}</p>
              <p className="text-xs text-text-muted font-mono">{formatCurrency(p.amount)}</p>
            </div>
            <button
              onClick={() =>
                setTarget({
                  campaignInfluencerId: p.campaign_influencer_id,
                  paymentType: p.payment_type,
                  paymentId: p.id,
                  handle,
                  campaignName,
                  amount: Number(p.amount),
                })
              }
              disabled={!onboarded}
              className="rounded-md bg-gold px-3 py-1 text-xs font-medium text-background hover:bg-gold/90 disabled:opacity-40"
            >
              Pay now
            </button>
          </div>
        ))}
      </div>

      {target && (
        <PayoutModal target={target} onClose={() => setTarget(null)} onSent={() => router.refresh()} />
      )}
    </div>
  );
}
