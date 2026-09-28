import { formatCurrency } from "@/lib/utils";
import type { PortalEarningsSummary } from "@/lib/portal-data";

export function EarningsSummary({ summary }: { summary: PortalEarningsSummary }) {
  const cards = [
    { label: "Total earned (all time)", value: summary.totalEarned },
    { label: "Paid out", value: summary.paidOut },
    { label: "Pending / processing", value: summary.pending },
    { label: "This month", value: summary.thisMonth },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-portal-border bg-portal-surface p-4">
          <p className="text-xs text-portal-text-secondary">{c.label}</p>
          <p className="mt-1.5 text-lg font-semibold">{formatCurrency(c.value)}</p>
        </div>
      ))}
    </div>
  );
}
