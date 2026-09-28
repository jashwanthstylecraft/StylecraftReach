"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Send, X, Check } from "lucide-react";
import { Modal, inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";
import { createProposal, sendProposal, setProposalStatus } from "@/lib/proposals-actions";
import { formatDate, cn } from "@/lib/utils";
import type { InvitationRow } from "@/lib/campaigns-data";
import type { ProposalFull } from "@/lib/proposals-data";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-text-muted/15 text-text-secondary",
  sent: "bg-warning/15 text-warning",
  accepted: "bg-success/15 text-success",
  declined: "bg-danger/15 text-danger",
};

export function ProposalsTab({ proposals, invitationRows }: { proposals: ProposalFull[]; invitationRows: InvitationRow[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSend(id: string) {
    startTransition(async () => {
      await sendProposal(id);
      router.refresh();
    });
  }

  function handleStatus(id: string, status: "accepted" | "declined") {
    startTransition(async () => {
      await setProposalStatus(id, status);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-background hover:bg-gold/90"
        >
          <Plus className="h-3.5 w-3.5" /> Create proposal
        </button>
      </div>

      {proposals.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface py-12 text-center text-sm text-text-secondary">
          No proposals yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-2.5">Influencer</th>
                <th className="px-4 py-2.5">Sent</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Fee</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {proposals.map((p) => (
                <tr key={p.id} className="bg-surface">
                  <td className="px-4 py-2.5 text-text-primary">{p.campaign_influencer.influencer.handle}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{p.sent_at ? formatDate(p.sent_at) : "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn("rounded px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_STYLES[p.status])}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">{p.fee ? `$${p.fee}` : "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-2">
                      {p.status === "draft" && (
                        <button onClick={() => handleSend(p.id)} disabled={isPending} className="flex items-center gap-1 text-xs text-gold hover:underline">
                          <Send className="h-3.5 w-3.5" /> Send
                        </button>
                      )}
                      {p.status === "sent" && (
                        <>
                          <button onClick={() => handleStatus(p.id, "accepted")} disabled={isPending} className="text-success hover:opacity-80">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleStatus(p.id, "declined")} disabled={isPending} className="text-danger hover:opacity-80">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {createOpen && <CreateProposalModal invitationRows={invitationRows} onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

function CreateProposalModal({ invitationRows, onClose }: { invitationRows: InvitationRow[]; onClose: () => void }) {
  const router = useRouter();
  const [campaignInfluencerId, setCampaignInfluencerId] = useState(invitationRows[0]?.id ?? "");
  const [deliverableType, setDeliverableType] = useState("1 Reel");
  const [quantity, setQuantity] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [fee, setFee] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!campaignInfluencerId) return;
    setSaving(true);
    try {
      await createProposal(
        campaignInfluencerId,
        [{ type: deliverableType, quantity, deadline: deadline || null, notes: null }],
        fee ? Number(fee) : null,
        notes
      );
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Create proposal" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Influencer</label>
          <select className={inputClass} value={campaignInfluencerId} onChange={(e) => setCampaignInfluencerId(e.target.value)}>
            {invitationRows.map((r) => (
              <option key={r.id} value={r.id}>
                {r.influencer.handle}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Deliverable</label>
            <input className={inputClass} value={deliverableType} onChange={(e) => setDeliverableType(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Quantity</label>
            <input type="number" min={1} className={inputClass} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Deadline</label>
            <input type="date" className={inputClass} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Fee ($)</label>
            <input type="number" className={inputClass} value={fee} onChange={(e) => setFee(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button type="submit" disabled={saving || !campaignInfluencerId} className={primaryButtonClass}>
          {saving ? "Saving..." : "Save as draft"}
        </button>
      </form>
    </Modal>
  );
}
