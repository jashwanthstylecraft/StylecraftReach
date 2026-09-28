import { Package } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Gift } from "@/lib/types";

export function GiftTrackingCard({ gifts }: { gifts: Gift[] }) {
  if (gifts.length === 0) return null;

  return (
    <div className="rounded-lg border border-portal-border bg-portal-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-portal-text-secondary">Gifts / products received</h2>
      <div className="space-y-3">
        {gifts.map((g) => (
          <div key={g.id} className="flex items-start gap-3 text-sm">
            <Package className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="text-portal-text-primary">{g.product_name}</p>
              <p className="text-xs text-portal-text-secondary">
                {g.delivered ? "Delivered" : g.shipped_date ? `Shipped ${formatDate(g.shipped_date)}` : "Not yet shipped"}
                {g.tracking_number && ` · ${g.tracking_number}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
