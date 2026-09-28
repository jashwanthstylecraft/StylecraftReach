"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { PayoutModal, type PayoutTarget } from "./PayoutModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OutstandingRow } from "@/lib/payments-data";

export function OutstandingTable({
  rows,
  onboardedIds,
}: {
  rows: OutstandingRow[];
  onboardedIds: Set<string>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [target, setTarget] = useState<PayoutTarget | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [batchTargets, setBatchTargets] = useState<PayoutTarget[] | null>(null);
  const [batchSending, setBatchSending] = useState(false);

  function toRowKey(row: OutstandingRow) {
    return row.pendingPaymentId ?? `${row.campaignInfluencerId}-${row.type}`;
  }

  function toPayoutTarget(row: OutstandingRow): PayoutTarget {
    return {
      campaignInfluencerId: row.campaignInfluencerId,
      paymentType: row.type === "commission" ? "commission" : "flat_fee",
      paymentId: row.pendingPaymentId ?? undefined,
      handle: row.influencer.handle,
      campaignName: row.campaign.name,
      amount: row.amount,
      periodLabel:
        row.periodStart && row.periodEnd
          ? `${formatDate(row.periodStart)} – ${formatDate(row.periodEnd)}`
          : undefined,
    };
  }

  async function handleSendInvite(row: OutstandingRow) {
    setInvitingId(toRowKey(row));
    try {
      const res = await fetch("/api/stripe/onboarding-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencerId: row.influencer.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await navigator.clipboard.writeText(json.url);
      showToast(`Onboarding link copied for ${row.influencer.handle}`, "success");
    } catch {
      showToast("Couldn't create onboarding link", "error");
    } finally {
      setInvitingId(null);
    }
  }

  const payableRows = rows.filter((r) => onboardedIds.has(r.influencer.id));

  async function handleBatchConfirm() {
    setBatchSending(true);
    try {
      const res = await fetch("/api/payments/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: (batchTargets ?? []).map((t) => ({
            campaignInfluencerId: t.campaignInfluencerId,
            paymentType: t.paymentType,
            paymentId: t.paymentId,
          })),
        }),
      });
      const json = await res.json();
      showToast(`${json.succeeded} payment(s) sent${json.failed ? `, ${json.failed} failed` : ""}`, json.failed ? "error" : "success");
      setBatchTargets(null);
      router.refresh();
    } catch {
      showToast("Batch payout failed", "error");
    } finally {
      setBatchSending(false);
    }
  }

  const columns: DataTableColumn<OutstandingRow>[] = [
    {
      key: "influencer",
      label: "Influencer",
      render: (r) => (
        <Link href={`/payments/${r.campaignInfluencerId}`} className="hover:text-gold">
          {r.influencer.handle}
        </Link>
      ),
      sortValue: (r) => r.influencer.handle,
    },
    { key: "campaign", label: "Campaign", render: (r) => r.campaign.name, sortValue: (r) => r.campaign.name },
    {
      key: "type",
      label: "Type",
      render: (r) => (r.type === "commission" ? "Commission" : "Flat fee"),
      sortValue: (r) => r.type,
    },
    {
      key: "amount",
      label: "Amount owed",
      align: "right",
      render: (r) => formatCurrency(r.amount),
      sortValue: (r) => r.amount,
    },
    {
      key: "period",
      label: "Period",
      render: (r) =>
        r.periodStart && r.periodEnd ? `${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}` : "—",
    },
    {
      key: "stripe",
      label: "Stripe status",
      render: (r) =>
        onboardedIds.has(r.influencer.id) ? (
          <span className="text-success">✓ Onboarded</span>
        ) : (
          <span className="text-warning">⚠ Not onboarded</span>
        ),
      sortValue: (r) => (onboardedIds.has(r.influencer.id) ? 1 : 0),
    },
    {
      key: "actions",
      label: "Action",
      render: (r) =>
        onboardedIds.has(r.influencer.id) ? (
          <button
            onClick={() => setTarget(toPayoutTarget(r))}
            className="rounded-md bg-gold px-3 py-1 text-xs font-medium text-background hover:bg-gold/90"
          >
            Pay now
          </button>
        ) : (
          <button
            onClick={() => handleSendInvite(r)}
            disabled={invitingId === toRowKey(r)}
            className="rounded-md border border-border px-3 py-1 text-xs text-text-secondary hover:text-text-primary disabled:opacity-50"
          >
            {invitingId === toRowKey(r) ? "Copying..." : "Send invite"}
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      {payableRows.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setBatchTargets(payableRows.map(toPayoutTarget))}
            className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90"
          >
            Pay all outstanding ({formatCurrency(payableRows.reduce((s, r) => s + r.amount, 0))})
          </button>
        </div>
      )}
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={toRowKey}
        emptyMessage="Nothing outstanding — all caught up."
      />

      {target && (
        <PayoutModal target={target} onClose={() => setTarget(null)} onSent={() => router.refresh()} />
      )}

      {batchTargets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-2 text-sm font-semibold text-text-primary">Pay all outstanding</h2>
            <p className="text-sm text-text-secondary">
              Send a total of{" "}
              <span className="font-mono text-text-primary">
                {formatCurrency(batchTargets.reduce((s, t) => s + t.amount, 0))}
              </span>{" "}
              across {batchTargets.length} onboarded influencer{batchTargets.length === 1 ? "" : "s"}?
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setBatchTargets(null)}
                disabled={batchSending}
                className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchConfirm}
                disabled={batchSending}
                className="flex-1 rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90 disabled:opacity-50"
              >
                {batchSending ? "Sending..." : "Confirm & send all"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
