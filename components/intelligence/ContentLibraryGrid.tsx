"use client";

import { useMemo, useState } from "react";
import { ContentCard } from "./ContentCard";
import { ContentDetailModal } from "./ContentDetailModal";
import { StoryExpiryAlert } from "./StoryExpiryAlert";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/types";
import type { CapturedContentFull } from "@/lib/intelligence-data";

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
}: {
  content: CapturedContentFull[];
  expiringStories: CapturedContentFull[];
  campaigns: Campaign[];
}) {
  const [mediaTab, setMediaTab] = useState<(typeof MEDIA_TABS)[number]>("All");
  const [platform, setPlatform] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState<"newest" | "views" | "sentiment">("newest");
  const [selected, setSelected] = useState<CapturedContentFull | null>(null);

  const filtered = useMemo(() => {
    let rows = content;
    const mediaFilter = MEDIA_MAP[mediaTab];
    if (mediaFilter) rows = rows.filter((c) => c.media_type === mediaFilter);
    if (platform) rows = rows.filter((c) => c.platform === platform);
    if (campaignId) rows = rows.filter((c) => c.campaign?.id === campaignId);
    if (sentiment) rows = rows.filter((c) => c.overall_sentiment === sentiment);
    if (featuredOnly) rows = rows.filter((c) => c.featured);

    const sorted = [...rows];
    if (sort === "views") sorted.sort((a, b) => b.views - a.views);
    else if (sort === "sentiment") sorted.sort((a, b) => (b.sentiment_score ?? -Infinity) - (a.sentiment_score ?? -Infinity));
    else sorted.sort((a, b) => (b.posted_at ?? "").localeCompare(a.posted_at ?? ""));
    return sorted;
  }, [content, mediaTab, platform, campaignId, sentiment, featuredOnly, sort]);

  return (
    <div className="space-y-4">
      <StoryExpiryAlert stories={expiringStories} />

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
          <option value="">All platforms</option>
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
            <ContentCard key={c.id} content={c} onOpen={() => setSelected(c)} />
          ))}
        </div>
      )}

      {selected && <ContentDetailModal content={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
