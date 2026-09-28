"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal, primaryButtonClass, secondaryButtonClass } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils";
import type { PaymentType } from "@/lib/types";

export interface PayoutTarget {
  campaignInfluencerId: string;
  paymentType: PaymentType;
  paymentId?: string;
  handle: string;
  campaignName: string;
  amount: number;
  periodLabel?: string;
}

export function PayoutModal({
  target,
  onClose,
  onSent,
}: {
  target: PayoutTarget;
  onClose: () => void;
  onSent: () => void;
}) {
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignInfluencerId: target.campaignInfluencerId,
          paymentType: target.paymentType,
          paymentId: target.paymentId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Payment failed");
      setSent(true);
      showToast(`${formatCurrency(target.amount)} sent to ${target.handle}`, "success");
      onSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <Modal title="Payment sent" onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <p className="text-sm text-text-primary">
            {formatCurrency(target.amount)} sent to {target.handle}
          </p>
          <button onClick={onClose} className={secondaryButtonClass}>
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Confirm payment" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-text-secondary">
          Send <span className="font-mono text-text-primary">{formatCurrency(target.amount)}</span> to{" "}
          <span className="text-text-primary">{target.handle}</span> for{" "}
          <span className="text-text-primary">{target.campaignName}</span>
          {target.periodLabel ? ` (${target.periodLabel})` : ""}?
        </p>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} disabled={sending} className={secondaryButtonClass}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={sending} className={primaryButtonClass}>
            {sending ? "Sending payment..." : `Confirm & send ${formatCurrency(target.amount)}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
