"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Download, Plus, Trash2, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Modal, inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createCommunityList, deleteCommunityList, removeInfluencerFromList } from "@/lib/community-actions";
import { exportToCSV } from "@/lib/utils/export";
import { cn } from "@/lib/utils";
import type { Influencer } from "@/lib/types";
import type { CommunityListFull } from "@/lib/community-data";

export function CommunityPageClient({
  lists,
  influencers,
}: {
  lists: CommunityListFull[];
  influencers: Influencer[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [activeListId, setActiveListId] = useState<string | null>(lists[0]?.id ?? null);
  const [isPending, startTransition] = useTransition();

  const activeList = lists.find((l) => l.id === activeListId) ?? null;

  function handleDeleteList(id: string) {
    startTransition(async () => {
      await deleteCommunityList(id);
      if (activeListId === id) setActiveListId(null);
      router.refresh();
    });
  }

  function handleRemoveInfluencer(influencerId: string) {
    if (!activeList) return;
    startTransition(async () => {
      await removeInfluencerFromList(activeList.id, influencerId);
      router.refresh();
    });
  }

  function handleExport() {
    if (!activeList) return;
    exportToCSV(
      activeList.influencers.map((inf) => ({
        name: inf.name,
        handle: inf.handle,
        platform: inf.platform,
        followers: inf.followers ?? 0,
        email: inf.email ?? "",
      })),
      `community-${activeList.name.replace(/\s+/g, "-").toLowerCase()}`
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      <div className="space-y-2">
        <button
          onClick={() => setCreateOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-medium text-background hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" /> New list
        </button>
        {lists.length === 0 && <p className="px-1 text-xs text-text-secondary">No lists yet — create one to group creators.</p>}
        {lists.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveListId(l.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm",
              activeListId === l.id ? "bg-surface-elevated text-text-primary" : "text-text-secondary hover:bg-surface-elevated"
            )}
          >
            <span className="truncate">{l.name}</span>
            <span className="font-mono text-[10px] text-text-muted">{l.influencers.length}</span>
          </button>
        ))}
      </div>

      <div>
        {!activeList ? (
          <div className="rounded-lg border border-border bg-surface py-16 text-center text-sm text-text-secondary">
            Select or create a list to see its creators.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{activeList.name}</h2>
                {activeList.description && <p className="text-sm text-text-secondary">{activeList.description}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
                <button
                  onClick={() => handleDeleteList(activeList.id)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-md border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete list
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-text-muted">
                  <tr>
                    <th className="px-4 py-2.5">Creator</th>
                    <th className="px-4 py-2.5">Platform</th>
                    <th className="px-4 py-2.5">Followers</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeList.influencers.map((inf) => (
                    <tr key={inf.id} className="bg-surface">
                      <td className="flex items-center gap-2.5 px-4 py-2.5">
                        <Avatar name={inf.name} src={inf.avatar_url} size="sm" />
                        <div>
                          <p className="font-medium text-text-primary">{inf.name}</p>
                          <p className="font-mono text-xs text-text-muted">{inf.handle}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary">{inf.platform}</td>
                      <td className="px-4 py-2.5 text-text-secondary">{(inf.followers ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => handleRemoveInfluencer(inf.id)} className="text-text-muted hover:text-danger">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeList.influencers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-text-secondary">
                        No creators in this list yet — add them from Content Library or Discover.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {createOpen && (
        <CreateListModal
          influencers={influencers}
          onClose={() => setCreateOpen(false)}
          onCreated={(id) => {
            setActiveListId(id);
            showToast("List created", "success");
          }}
        />
      )}
    </div>
  );
}

function CreateListModal({
  influencers,
  onClose,
  onCreated,
}: {
  influencers: Influencer[];
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const id = await createCommunityList(name.trim(), description.trim(), Array.from(selected));
      router.refresh();
      onClose();
      onCreated(id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New community list" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>List name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Top Barbers" />
        </div>
        <div>
          <label className={labelClass}>Description (optional)</label>
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Add creators (optional, {selected.size} selected)</label>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2 scrollbar-thin">
            {influencers.map((inf) => (
              <label
                key={inf.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm",
                  selected.has(inf.id) ? "bg-gold/10 text-text-primary" : "text-text-secondary"
                )}
              >
                <span>
                  {inf.name} <span className="font-mono text-xs text-text-muted">{inf.handle}</span>
                </span>
                <input type="checkbox" checked={selected.has(inf.id)} onChange={() => toggle(inf.id)} className="accent-gold" />
              </label>
            ))}
          </div>
        </div>
        <button type="submit" disabled={saving || !name.trim()} className={primaryButtonClass}>
          {saving ? "Creating..." : "Create list"}
        </button>
      </form>
    </Modal>
  );
}
