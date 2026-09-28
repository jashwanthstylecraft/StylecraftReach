import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types";

const STYLES: Record<PaymentStatus, string> = {
  pending: "bg-text-muted/15 text-text-secondary",
  processing: "bg-warning/15 text-warning",
  paid: "bg-success/15 text-success",
  failed: "bg-danger/15 text-danger",
  cancelled: "bg-text-muted/10 text-text-muted line-through",
};

const LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium",
        STYLES[status]
      )}
    >
      {status === "processing" && <Loader2 className="h-3 w-3 animate-spin" />}
      {LABELS[status]}
    </span>
  );
}
