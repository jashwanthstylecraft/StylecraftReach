"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Modal, secondaryButtonClass } from "@/components/ui/Modal";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { SentimentBadge } from "./SentimentBadge";
import { toggleContentApproved, toggleContentFeatured } from "@/lib/intelligence-actions";
import { formatDate, cn } from "@/lib/utils";
import type { CapturedContentFull } from "@/lib/intelligence-data";

export function ContentDetailModal({
  content,
  onClose,
}: {
  content: CapturedContentFull;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleFeature() {
    startTransition(async () => {
      await toggleContentFeatured(content.id, !content.featured);
      router.refresh();
    });
  }

  function handleApprove() {
    startTransition(async () => {
      await toggleContentApproved(content.id, !content.approved_by_brand);
      router.refresh();
    });
  }

  return (
    <Modal title={`${content.influencer.handle} — ${content.media_type}`} onClose={onClose}>
      <div className="space-y-4">
        {content.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={content.thumbnail_url} alt="" className="w-full rounded-md object-cover" />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge platform={content.platform} />
          {content.campaign && <span className="text-xs text-text-secondary">{content.campaign.name}</span>}
          <span className="text-xs text-text-muted">
            {content.posted_at ? formatDate(content.posted_at) : "—"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md bg-surface-elevated p-2">
            <p className="font-mono text-sm font-semibold text-text-primary">{content.views.toLocaleString()}</p>
            <p className="text-text-secondary">Views</p>
          </div>
          <div className="rounded-md bg-surface-elevated p-2">
            <p className="font-mono text-sm font-semibold text-text-primary">{content.likes.toLocaleString()}</p>
            <p className="text-text-secondary">Likes</p>
          </div>
          <div className="rounded-md bg-surface-elevated p-2">
            <p className="font-mono text-sm font-semibold text-text-primary">{content.comments.toLocaleString()}</p>
            <p className="text-text-secondary">Comments</p>
          </div>
        </div>

        {content.caption && (
          <div>
            <p className="mb-1 text-xs font-medium text-text-secondary">Caption</p>
            <p className="text-sm text-text-primary">{content.caption}</p>
          </div>
        )}

        <div className="rounded-md border border-border bg-surface-elevated p-3">
          <p className="mb-2 text-xs font-medium text-text-secondary">Sentiment analysis</p>
          <div className="flex items-center gap-2">
            <SentimentBadge sentiment={content.overall_sentiment} score={content.sentiment_score} />
            {content.brand_sentiment && (
              <span className="text-xs text-text-secondary">Brand: {content.brand_sentiment}</span>
            )}
          </div>
          {content.key_themes && content.key_themes.length > 0 && (
            <p className="mt-2 text-xs text-text-secondary">
              Key themes: {content.key_themes.join(", ")}
            </p>
          )}
          {content.quotable_comment && (
            <p className="mt-2 text-sm italic text-text-primary">&ldquo;{content.quotable_comment}&rdquo;</p>
          )}
          {content.sentiment_summary && (
            <p className="mt-2 text-xs text-text-secondary">{content.sentiment_summary}</p>
          )}
          {content.red_flags && content.red_flags.length > 0 && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {content.red_flags.join(", ")}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={content.post_url}
            target="_blank"
            rel="noreferrer"
            className={cn(secondaryButtonClass, "flex items-center gap-1.5")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open original
          </a>
          <button onClick={handleFeature} disabled={isPending} className={secondaryButtonClass}>
            {content.featured ? "Unfeature" : "Feature"}
          </button>
          <button onClick={handleApprove} disabled={isPending} className={secondaryButtonClass}>
            {content.approved_by_brand ? "Unapprove" : "Mark as approved"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
