"use client";

import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { platformAccentColor, PlatformBadge } from "@/components/ui/PlatformBadge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { Avatar } from "@/components/ui/Avatar";
import { formatFollowers, cn } from "@/lib/utils";
import type {
  CampaignInfluencerWithCampaign,
  CampaignInfluencerWithInfluencer,
} from "@/lib/types";

type Row = CampaignInfluencerWithInfluencer & CampaignInfluencerWithCampaign;

export function InfluencerCard({ row, dragging }: { row: Row; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: row.id,
  });
  const influencer = row.influencer;
  const accent = platformAccentColor(influencer.platform);

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: accent }}
      {...listeners}
      {...attributes}
      className={cn(
        "group cursor-grab rounded-md border border-border border-l-2 bg-surface-elevated p-3 active:cursor-grabbing",
        (isDragging || dragging) && "opacity-60 shadow-xl"
      )}
    >
      <Link href={`/influencers/${influencer.id}`} className="block">
        <div className="flex items-start gap-2.5">
          <Avatar name={influencer.name} src={influencer.avatar_url} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-text-primary">
                {influencer.name}
              </p>
              <ScoreBadge score={influencer.ai_score} />
            </div>
            <p className="truncate font-mono text-xs text-text-secondary">
              {influencer.handle}
            </p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PlatformBadge platform={influencer.platform} />
          <span className="text-[11px] text-text-secondary">
            {formatFollowers(influencer.followers)}
          </span>
          {influencer.niche && (
            <span className="rounded bg-surface px-1.5 py-0.5 text-[11px] text-text-secondary">
              {influencer.niche}
            </span>
          )}
        </div>
        <p className="mt-2 truncate text-[11px] text-text-muted">{row.campaign.name}</p>
      </Link>
    </div>
  );
}
