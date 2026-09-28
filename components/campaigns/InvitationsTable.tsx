"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Mail, Plus, Search, Send, Link as LinkIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { AddInfluencersModal } from "./AddInfluencersModal";
import { SendMailsModal } from "./SendMailsModal";
import { deriveInvitationStatus, INVITATION_STATUS_OPTIONS, INVITATION_STATUS_STYLES } from "./invitationStatus";
import { setAffiliateCode, setAssignee, setInvitationStatus } from "@/lib/campaigns-actions";
import { formatEMV } from "@/lib/utils/emv";
import { cn } from "@/lib/utils";
import type { Influencer, InvitationDisplayStatus } from "@/lib/types";
import type { InvitationRow } from "@/lib/campaigns-data";

export function InvitationsTable({
  campaignId,
  campaignName,
  rows,
  allInfluencers,
}: {
  campaignId: string;
  campaignName: string;
  rows: InvitationRow[];
  allInfluencers: Influencer[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [mailsOpen, setMailsOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editingAssignee, setEditingAssignee] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => rows.filter((r) => r.influencer.name.toLowerCase().includes(query.toLowerCase()) || r.influencer.handle.toLowerCase().includes(query.toLowerCase())),
    [rows, query]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSetStatus(id: string, status: InvitationDisplayStatus) {
    startTransition(async () => {
      await setInvitationStatus(id, status);
      router.refresh();
    });
  }

  function handleSaveCode(id: string, code: string) {
    startTransition(async () => {
      await setAffiliateCode(id, code);
      setEditingCode(null);
      router.refresh();
    });
  }

  function handleSaveAssignee(id: string, name: string) {
    startTransition(async () => {
      await setAssignee(id, name);
      setEditingAssignee(null);
      router.refresh();
    });
  }

  const selectedRows = rows.filter((r) => selected.has(r.id));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search influencers by name"
            className="rounded-md border border-border bg-surface-elevated py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted"
          />
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
          >
            <Plus className="h-3.5 w-3.5" /> Add influencers
          </button>
          <button
            onClick={() => setMailsOpen(true)}
            disabled={selected.size === 0}
            className="flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-background hover:bg-gold/90 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> Send mails ({selected.size})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[1400px] text-sm">
          <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-3 py-2.5" />
              <th className="px-3 py-2.5">Influencer</th>
              <th className="px-3 py-2.5">Location</th>
              <th className="px-3 py-2.5">Engagement</th>
              <th className="px-3 py-2.5">Followers</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Contact</th>
              <th className="px-3 py-2.5">Cost</th>
              <th className="px-3 py-2.5">EMV</th>
              <th className="px-3 py-2.5">Affiliate code</th>
              <th className="px-3 py-2.5">Assignee</th>
              <th className="px-3 py-2.5">Content</th>
              <th className="px-3 py-2.5">Clicks</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((r) => {
              const status = deriveInvitationStatus(r.stage, r.status);
              return (
                <tr key={r.id} className="bg-surface">
                  <td className="px-3 py-2.5">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="accent-gold" />
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/influencers/${r.influencer.id}`} className="flex items-center gap-2.5 hover:text-gold">
                      <Avatar name={r.influencer.name} src={r.influencer.avatar_url} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-text-primary">{r.influencer.name}</p>
                        <p className="truncate font-mono text-xs text-text-muted">{r.influencer.handle}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary">{r.influencer.location ?? "—"}</td>
                  <td className="px-3 py-2.5 text-text-secondary">
                    {r.influencer.engagement_rate ? `${r.influencer.engagement_rate.toFixed(2)}%` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary">{(r.influencer.followers ?? 0).toLocaleString()}</td>
                  <td className="px-3 py-2.5">
                    <select
                      value={status}
                      disabled={isPending}
                      onChange={(e) => handleSetStatus(r.id, e.target.value as InvitationDisplayStatus)}
                      className={cn("rounded px-2 py-0.5 text-[11px] font-medium", INVITATION_STATUS_STYLES[status])}
                    >
                      {INVITATION_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-surface text-text-primary">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary">
                    {r.influencer.email ? (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {r.influencer.email}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary">{r.fee ? `$${r.fee}` : "—"}</td>
                  <td className="px-3 py-2.5 text-text-secondary">{formatEMV(r.emv)}</td>
                  <td className="px-3 py-2.5">
                    {editingCode === r.id ? (
                      <input
                        autoFocus
                        defaultValue={r.affiliate_code ?? ""}
                        onBlur={(e) => handleSaveCode(r.id, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveCode(r.id, e.currentTarget.value)}
                        className="w-24 rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-xs text-text-primary"
                      />
                    ) : r.affiliate_code ? (
                      <button onClick={() => setEditingCode(r.id)} className="font-mono text-xs text-gold hover:underline">
                        {r.affiliate_code}
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingCode(r.id)}
                        className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
                      >
                        Not set <Plus className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {editingAssignee === r.id ? (
                      <input
                        autoFocus
                        defaultValue={r.assignee_name ?? ""}
                        onBlur={(e) => handleSaveAssignee(r.id, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveAssignee(r.id, e.currentTarget.value)}
                        className="w-28 rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-xs text-text-primary"
                        placeholder="Name or email"
                      />
                    ) : (
                      <button onClick={() => setEditingAssignee(r.id)} className="text-xs text-text-secondary hover:text-text-primary">
                        {r.assignee_name ?? "Unassigned"}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary">{r.contentCount}</td>
                  <td className="px-3 py-2.5 text-text-secondary">{r.clicks || "—"}</td>
                  <td className="px-3 py-2.5">
                    {r.affiliate_link && (
                      <a href={r.affiliate_link} target="_blank" rel="noreferrer" className="text-text-muted hover:text-text-primary">
                        <LinkIcon className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={14} className="px-3 py-10 text-center text-text-secondary">
                  No influencers match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <AddInfluencersModal
          campaignId={campaignId}
          allInfluencers={allInfluencers}
          alreadyInCampaign={new Set(rows.map((r) => r.influencer.id))}
          onClose={() => setAddOpen(false)}
        />
      )}
      {mailsOpen && (
        <SendMailsModal
          recipients={selectedRows.map((r) => ({ campaignInfluencerId: r.id, influencer: r.influencer }))}
          campaignName={campaignName}
          onClose={() => setMailsOpen(false)}
        />
      )}
    </div>
  );
}
