import { Users, DollarSign, RefreshCw, Image as ImageIcon, Heart, MessageCircle, Eye, TrendingUp } from "lucide-react";
import { formatCurrency, formatFollowers } from "@/lib/utils";
import { formatEMV } from "@/lib/utils/emv";
import type { Campaign } from "@/lib/types";
import type { CampaignSummary } from "@/lib/campaign-detail-types";

export function CampaignStatCards({ campaign, summary }: { campaign: Campaign; summary: CampaignSummary }) {
  const cards = [
    {
      label: "Influencers",
      content: (
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> {summary.influencer_count}
        </span>
      ),
    },
    {
      label: "Budget",
      content: (
        <span className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5" /> {campaign.budget_label ?? formatCurrency(campaign.budget)}
        </span>
      ),
    },
    {
      label: "Media",
      content: (
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> {summary.video_count}
          </span>
          <span className="flex items-center gap-1">
            <ImageIcon className="h-3.5 w-3.5" /> {summary.image_count}
          </span>
        </span>
      ),
    },
    {
      label: "Engagement",
      content: (
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> {summary.avg_engagement.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" /> {summary.total_likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" /> {summary.total_comments}
          </span>
        </span>
      ),
    },
    {
      label: "Est. Reach",
      content: (
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> {formatFollowers(summary.est_reach)}
        </span>
      ),
    },
    {
      label: "Est. Impression",
      content: (
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" /> {formatFollowers(summary.est_impressions)}
        </span>
      ),
    },
    {
      label: "Est. Media Value",
      content: (
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" /> {formatEMV(summary.est_emv)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {cards.map((card) => (
        <div key={card.label} className="flex shrink-0 flex-col gap-1 rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-text-muted">{card.label}</p>
          <div className="text-sm font-medium text-text-primary">{card.content}</div>
        </div>
      ))}
    </div>
  );
}
