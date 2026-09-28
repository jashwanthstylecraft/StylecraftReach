"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal, primaryButtonClass, secondaryButtonClass } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import type { ConversionWithPromoCode } from "@/lib/analytics-data";

export function CommissionTracker({
  campaignInfluencerId,
  conversions,
}: {
  campaignInfluencerId: string;
  conversions: ConversionWithPromoCode[];
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const paid = conversions.filter((c) => c.commission_paid).reduce((s, c) => s + c.commission_amount, 0);
  const owed = conversions.filter((c) => !c.commission_paid).reduce((s, c) => s + c.commission_amount, 0);
  const hasUnpaid = conversions.some((c) => !c.commission_paid);

  function handleMarkPaid() {
    startTransition(async () => {
      await fetch("/api/commissions/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignInfluencerId }),
      });
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">Commission</h3>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="font-mono text-lg font-semibold text-text-primary">{formatCurrency(paid)}</p>
          <p className="text-xs text-text-secondary">Paid</p>
        </div>
        <div>
          <p className="font-mono text-lg font-semibold text-warning">{formatCurrency(owed)}</p>
          <p className="text-xs text-text-secondary">Outstanding</p>
        </div>
        <div>
          <p className="font-mono text-lg font-semibold text-text-primary">{formatCurrency(paid + owed)}</p>
          <p className="text-xs text-text-secondary">Total</p>
        </div>
      </div>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={!hasUnpaid}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-elevated hover:text-text-primary disabled:opacity-40"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Mark commission paid
      </button>

      {confirmOpen && (
        <Modal title="Mark commission paid" onClose={() => setConfirmOpen(false)}>
          <p className="text-sm text-text-secondary">
            This marks {formatCurrency(owed)} in outstanding commission as paid. This can&apos;t be
            undone automatically.
          </p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setConfirmOpen(false)} className={secondaryButtonClass}>
              Cancel
            </button>
            <button onClick={handleMarkPaid} disabled={isPending} className={primaryButtonClass}>
              {isPending ? "Marking..." : "Confirm"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
