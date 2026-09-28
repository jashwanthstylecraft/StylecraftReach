"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, ExternalLink, MessageCircle, Plus, X } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";
import { useToast } from "@/components/ui/Toast";
import { actionMention, toggleMentionSaved } from "@/lib/intelligence-actions";
import { formatDateTime, formatFollowers, cn } from "@/lib/utils";
import type { BrandMention } from "@/lib/intelligence-types";

const TABS = [
  { key: "all", label: "All mentions" },
  { key: "high_reach", label: "High reach" },
  { key: "unactioned", label: "Unactioned" },
  { key: "saved", label: "Saved" },
] as const;

export function MentionFeed({
  mentions,
  keywordCounts,
}: {
  mentions: BrandMention[];
  keywordCounts: { keyword: string; count: number }[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (tab === "high_reach") return mentions.filter((m) => (m.author_followers ?? 0) >= 10000);
    if (tab === "unactioned") return mentions.filter((m) => !m.actioned);
    if (tab === "saved") return mentions.filter((m) => m.saved);
    return mentions;
  }, [mentions, tab]);

  function handleAction(id: string, action: "added_to_crm" | "ignored") {
    startTransition(async () => {
      await actionMention(id, action);
      showToast(action === "added_to_crm" ? "Added to CRM" : "Marked as ignored", "success");
      router.refresh();
    });
  }

  function handleSave(id: string, saved: boolean) {
    startTransition(async () => {
      await toggleMentionSaved(id, saved);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="w-full shrink-0 rounded-lg border border-border bg-surface p-4 md:w-56">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Tracked keywords</h3>
        <div className="space-y-1.5">
          {keywordCounts.length === 0 && <p className="text-xs text-text-muted">No mentions captured yet.</p>}
          {keywordCounts.map((k) => (
            <div key={k.keyword} className="flex items-center justify-between text-xs">
              <span className="truncate text-text-secondary">{k.keyword}</span>
              <span className="font-mono text-text-primary">{k.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                tab === t.key ? "bg-gold/15 text-gold" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface py-16 text-center text-sm text-text-secondary">
            No mentions here.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => (
              <div key={m.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {m.author_handle} · {m.platform}
                    </p>
                    <p className="text-xs text-text-secondary">{formatDateTime(m.posted_at ?? m.captured_at)}</p>
                  </div>
                  <SentimentBadge sentiment={m.sentiment} score={m.sentiment_score} />
                </div>
                {m.caption && <p className="mt-2 text-sm text-text-primary">&ldquo;{m.caption}&rdquo;</p>}
                <div className="mt-2 flex items-center gap-3 text-[11px] text-text-secondary">
                  <span>{formatFollowers(m.author_followers ?? 0)} followers</span>
                  <span className="flex items-center gap-0.5">
                    <MessageCircle className="h-3 w-3" />
                    {m.comments}
                  </span>
                  <span>Matched: {m.matched_keyword}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={m.post_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-md border border-border px-3 py-1 text-xs text-text-secondary hover:text-text-primary"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View post
                  </a>
                  <button
                    onClick={() => handleAction(m.id, "added_to_crm")}
                    disabled={isPending || m.actioned}
                    className="flex items-center gap-1 rounded-md border border-border px-3 py-1 text-xs text-text-secondary hover:text-text-primary disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                    Add to CRM
                  </button>
                  <button
                    onClick={() => handleSave(m.id, !m.saved)}
                    disabled={isPending}
                    className={cn(
                      "flex items-center gap-1 rounded-md border px-3 py-1 text-xs",
                      m.saved ? "border-gold/40 bg-gold/15 text-gold" : "border-border text-text-secondary"
                    )}
                  >
                    <Bookmark className="h-3 w-3" />
                    {m.saved ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={() => handleAction(m.id, "ignored")}
                    disabled={isPending || m.actioned}
                    className="flex items-center gap-1 rounded-md border border-border px-3 py-1 text-xs text-text-secondary hover:text-text-primary disabled:opacity-40"
                  >
                    <X className="h-3 w-3" />
                    Ignore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
