"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cancelScheduledPayment } from "@/lib/payments-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentSchedule } from "@/lib/types";

export function PaymentScheduleCard({ schedule }: { schedule: PaymentSchedule[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const upcoming = schedule.filter((s) => s.status === "scheduled");

  function handleCancel(id: string) {
    startTransition(async () => {
      await cancelScheduledPayment(id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">Upcoming scheduled payments</h3>
      {upcoming.length === 0 ? (
        <p className="text-xs text-text-muted">Nothing scheduled.</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm"
            >
              <div>
                <p className="text-text-primary">
                  {s.payment_type === "flat_fee" ? "Flat fee" : s.payment_type === "bonus" ? "Bonus" : "Commission"}
                  {s.amount !== null && ` · ${formatCurrency(s.amount)}`}
                </p>
                <p className="text-xs text-text-muted">Scheduled {formatDate(s.scheduled_date)}</p>
              </div>
              <button
                onClick={() => handleCancel(s.id)}
                disabled={isPending}
                className="text-xs text-danger hover:underline disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
