"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { Package } from "lucide-react";
import { addGift, toggleGiftDelivered } from "@/lib/actions";
import type { Gift } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";
import { inputClass, primaryButtonClass } from "@/components/ui/Modal";

export function GiftTracker({
  campaignInfluencerId,
  gifts,
}: {
  campaignInfluencerId: string;
  gifts: Gift[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    const productName = (formData.get("product_name") as string)?.trim();
    if (!productName) return;
    const trackingNumber = (formData.get("tracking_number") as string) || null;
    const shippedDate = (formData.get("shipped_date") as string) || null;
    startTransition(async () => {
      await addGift(campaignInfluencerId, productName, trackingNumber, shippedDate);
      formRef.current?.reset();
      router.refresh();
    });
  }

  function handleToggle(id: string, delivered: boolean) {
    startTransition(async () => {
      await toggleGiftDelivered(id, delivered);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Package className="h-4 w-4 text-gold" />
        Gifting / product seeding
      </h3>
      <div className="space-y-2">
        {gifts.length === 0 && <p className="text-xs text-text-muted">No gifts logged yet.</p>}
        {gifts.map((g) => (
          <div
            key={g.id}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-elevated px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-text-primary">{g.product_name}</p>
              <p className="truncate text-[11px] text-text-muted">
                {g.tracking_number ? `Tracking: ${g.tracking_number}` : "No tracking number"}
                {g.shipped_date && ` · Shipped ${formatDate(g.shipped_date)}`}
              </p>
            </div>
            <button
              onClick={() => handleToggle(g.id, !g.delivered)}
              disabled={isPending}
              className={cn(
                "shrink-0 rounded px-2 py-1 text-[11px] font-medium",
                g.delivered
                  ? "bg-success/15 text-success"
                  : "bg-surface text-text-secondary hover:text-text-primary"
              )}
            >
              {g.delivered ? "Delivered" : "Mark delivered"}
            </button>
          </div>
        ))}
      </div>
      <form ref={formRef} action={handleAdd} className="mt-4 space-y-2 border-t border-border pt-4">
        <input name="product_name" required className={inputClass} placeholder="Product name" />
        <div className="flex gap-2">
          <input name="tracking_number" className={cn(inputClass, "flex-1")} placeholder="Tracking number" />
          <input name="shipped_date" type="date" className={inputClass} />
        </div>
        <button type="submit" disabled={isPending} className={primaryButtonClass}>
          Add gift
        </button>
      </form>
    </div>
  );
}
