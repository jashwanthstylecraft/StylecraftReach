"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addFlatFeePayment } from "@/lib/payments-actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";

export function AddFlatFeeForm({ campaignInfluencerId }: { campaignInfluencerId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    const description = dueDate ? `Flat fee — due ${dueDate}` : "Flat fee";
    startTransition(async () => {
      await addFlatFeePayment(campaignInfluencerId, value, description);
      setAmount("");
      setDueDate("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-xs font-medium text-text-secondary">Flat fee setup</p>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className={labelClass}>Amount</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500.00"
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>Due date</label>
          <input
            type="date"
            className={inputClass}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" disabled={isPending} className={primaryButtonClass}>
        {isPending ? "Adding..." : "Add payment"}
      </button>
    </form>
  );
}
