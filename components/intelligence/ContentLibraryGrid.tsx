"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Download, ListPlus } from "lucide-react";
import { ContentCard } from "./ContentCard";
import { ContentDetailModal } from "./ContentDetailModal";
import { StoryExpiryAlert } from "./StoryExpiryAlert";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { addInfluencersToList } from "@/lib/community-actions";
import { exportToCSV } from "@/lib/utils/export";
import { useGlobalPlatform } from "@/lib/platform-context";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/types";
import type { CapturedContentFull } from "@/lib/intelligence-data";
import type { CommunityListFull } from "@/lib/community-data";

const MEDIA_TABS = ["All", "Reels", "Stories", "Posts", "Shorts"] as const;
const MEDIA_MAP: Record<(typeof MEDIA_TABS)[number], string | null> = {
  All: null,
  Reels: "reel",
  Stories: "story",
  Posts: "image",
  Shorts: "short",
};

export function ContentLibraryGrid({
  content,
  expiringStories,
  campaigns,
  communityLists,
}: {
  content: CapturedContentFull[];
  expiringStories: CapturedContentFull[];
  campaigns: Campaign[];
  communityLists: CommunityListFull[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { platform: globalPlatform } = useGlobalPlatform();
  const [mediaTab, setMediaTab] = useState<(typeof MEDIA_TABS)[number]>("All");
  const [platform, setPlatform] = useState("");
  const effectivePlatform = platform || (globalPlatform !== "all" ? globalPlatform : "");
  const [campaignId, setCampaignId] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState<"newest" | "views" | "sentiment">("newest");
  const [selected, setSelected] = useState<CapturedContentFull | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addToListOpen, setAddToListOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let rows = content;
    const mediaFilter = MEDIA_MAP[mediaTab];
    if (mediaFilter) rows = rows.filter((c) => c.media_type === mediaFilter);
    if (effectivePlatform) rows = rows.filter((c) => c.platform === effectivePlatform);
    if (campaignId) rows = rows.filter((c) => c.campaign?.id === campaignId);
    if (sentiment) rows = rows.filter((c) => c.overall_sentiment === sentiment);
    if (featuredOnly) rows = rows.filter((c) => c.featured);

    const sorted = [...rows];
    if (sort === "views") sorted.sort((a, b) => b.views - a.views);
    else if (sort === "sentiment") sorted.sort((a, b) => (b.sentiment_score ?? -Infinity) - (a.sentiment_score ?? -Infinity));
    else sorted.sort((a, b) => (b.posted_at ?? "").localeCompare(a.posted_at ?? ""));
    return sorted;
  }, [content, mediaTab, effectivePlatform, campaignId, sentiment, featuredOnly, sort]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExportSelected() {
    const rows = filtered.filter((c) => selectedIds.has(c.id));
    exportToCSV(
      rows.map((c) => ({
        influencer: c.influencer.handle,
        platform: c.platform,
        media_type: c.media_type,
        post_url: c.post_url,
        likes: c.likes,
        comments: c.comments,
        views: c.views,
        emv: c.emv ?? 0,
        sentiment: c.overall_sentiment ?? "",
      })),
      "content-library-selection"
    );
  }

  function handleAddToList(listId: string) {
    const influencerIds = Array.from(new Set(filtered.filter((c) => selectedIds.has(c.id)).map((c) => c.influencer.id)));
    startTransition(async () => {
      await addInfluencersToList(listId, influencerIds);
      showToast(`Added ${influencerIds.length} creator(s) to list`, "success");
      setAddToListOpen(false);
      setSelectedIds(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <StoryExpiryAlert stories={expiringStories} />

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-md border border-gold/30 bg-gold/10 px-4 py-2.5">
          <span className="text-sm text-text-primary">{selectedIds.size} selected</span>
          <div className="flex gap-2">
            <button
              onClick={handleExportSelected}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              <Download className="h-3.5 w-3.5" /> Export selected
            </button>
            <button
              onClick={() => setAddToListOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              <ListPlus className="h-3.5 w-3.5" /> Add influencers to...
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-text-secondary hover:text-text-primary">
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {MEDIA_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setMediaTab(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                mediaTab === tab ? "bg-gold/15 text-gold" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary">
          <option value="">{globalPlatform !== "all" ? `Global: ${globalPlatform}` : "All platforms"}</option>
          <option value="Instagram">Instagram</option>
          <option value="TikTok">TikTok</option>
          <option value="YouTube">YouTube</option>
        </select>
        <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary">
          <option value="">All campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={sentiment} onChange={(e) => setSentiment(e.target.value)} className="rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary">
          <option value="">All sentiment</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-text-secondary">
          <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} className="accent-gold" />
          Featured only
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="ml-auto rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary">
          <option value="newest">Newest</option>
          <option value="views">Most views</option>
          <option value="sentiment">Best sentiment</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface py-16 text-center text-sm text-text-secondary">
          No content matches these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ContentCard
              key={c.id}
              content={c}
              onOpen={() => setSelected(c)}
              selected={selectedIds.has(c.id)}
              onToggleSelect={() => toggleSelect(c.id)}
            />
          ))}
        </div>
      )}

      {selected && <ContentDetailModal content={selected} onClose={() => setSelected(null)} />}

      {addToListOpen && (
        <Modal title="Add influencers to list" onClose={() => setAddToListOpen(false)}>
          {communityLists.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No community lists yet — create one from the Community page first.
            </p>
          ) : (
            <div className="space-y-2">
              {communityLists.map((l) => (
                <button
                  key={l.id}
                  disabled={isPending}
                  onClick={() => handleAddToList(l.id)}
                  className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-sm text-text-primary hover:border-gold/40"
                >
                  <span>{l.name}</span>
                  <span className="font-mono text-xs text-text-muted">{l.influencers.length}</span>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
