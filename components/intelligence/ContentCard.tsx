"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Eye, Heart, MessageCircle, Star, Check } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { SentimentBadge } from "./SentimentBadge";
import { toggleContentApproved, toggleContentFeatured } from "@/lib/intelligence-actions";
import { formatDate, formatFollowers, cn } from "@/lib/utils";
import type { CapturedContentFull } from "@/lib/intelligence-data";

export function ContentCard({
  content,
  onOpen,
}: {
  content: CapturedContentFull;
  onOpen: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleFeature(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      await toggleContentFeatured(content.id, !content.featured);
      router.refresh();
    });
  }

  function handleApprove(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      await toggleContentApproved(content.id, !content.approved_by_brand);
      router.refresh();
    });
  }

  return (
    <div
      onClick={onOpen}
      className="cursor-pointer overflow-hidden rounded-lg border border-border bg-surface hover:border-gold/40"
    >
      <div className="relative aspect-square bg-surface-elevated">
        {content.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={content.thumbnail_url} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          <PlatformBadge platform={content.platform} />
          <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] uppercase text-white">
            {content.media_type}
          </span>
        </div>
        {content.featured && (
          <Star className="absolute right-2 top-2 h-4 w-4 fill-gold text-gold" />
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Avatar name={content.influencer.name} src={content.influencer.avatar_url} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-text-primary">{content.influencer.handle}</p>
            {content.campaign && <p className="truncate text-[10px] text-text-secondary">{content.campaign.name}</p>}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-text-secondary">
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {formatFollowers(content.views)}
          </span>
          <span className="flex items-center gap-0.5">
            <Heart className="h-3 w-3" />
            {formatFollowers(content.likes)}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageCircle className="h-3 w-3" />
            {formatFollowers(content.comments)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <SentimentBadge sentiment={content.overall_sentiment} score={content.sentiment_score} />
          <span className="text-[10px] text-text-muted">{content.posted_at ? formatDate(content.posted_at) : "—"}</span>
        </div>
        <div className="mt-2 flex gap-1.5">
          <button
            onClick={handleFeature}
            disabled={isPending}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded border px-2 py-1 text-[10px] font-medium",
              content.featured ? "border-gold/40 bg-gold/15 text-gold" : "border-border text-text-secondary"
            )}
          >
            <Star className="h-3 w-3" />
            Feature
          </button>
          <button
            onClick={handleApprove}
            disabled={isPending}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded border px-2 py-1 text-[10px] font-medium",
              content.approved_by_brand ? "border-success/40 bg-success/15 text-success" : "border-border text-text-secondary"
            )}
          >
            <Check className="h-3 w-3" />
            Approved
          </button>
        </div>
      </div>
    </div>
  );
}
