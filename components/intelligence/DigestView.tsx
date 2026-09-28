"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AlertTriangle, ExternalLink, Mail } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { sendDigestEmail } from "@/lib/intelligence-actions";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { IntelligenceDigest } from "@/lib/intelligence-types";

export function DigestView({ digest }: { digest: IntelligenceDigest }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    startTransition(async () => {
      await sendDigestEmail(digest.id);
      showToast("Digest handed off for sending", "success");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-5">
        <p className="text-xs text-text-secondary">
          Week of {formatDate(digest.week_start)} – {formatDate(digest.week_end)}
        </p>
        <h1 className="mt-1 text-lg font-semibold text-text-primary">{digest.headline}</h1>
      </div>

      {digest.executive_summary && (
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Executive summary
          </h2>
          <p className="text-sm text-text-primary">{digest.executive_summary}</p>
        </div>
      )}

      {digest.top_performing_content && digest.top_performing_content.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Top performing content
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {digest.top_performing_content.map((c) => (
              <a
                key={c.id}
                href={c.postUrl}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-md border border-border bg-surface-elevated"
              >
                {c.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.thumbnailUrl} alt="" className="aspect-square w-full object-cover" />
                )}
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-text-primary">{c.handle}</p>
                  <p className="text-[11px] text-text-secondary">{c.views.toLocaleString()} views</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {digest.sentiment_overview && (
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Sentiment overview
          </h2>
          <p className="text-sm text-text-primary">
            Overall: <span className="text-gold">{digest.sentiment_overview.label}</span> ({digest.sentiment_overview.score >= 0 ? "+" : ""}{digest.sentiment_overview.score})
          </p>
          <p className="mt-1 text-xs text-text-secondary">Most discussed: {digest.sentiment_overview.topTheme}</p>
          <p className="text-xs text-text-secondary">Biggest mover: {digest.sentiment_overview.biggestMover}</p>
        </div>
      )}

      {digest.mention_highlights && digest.mention_highlights.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Notable organic mentions
          </h2>
          <div className="space-y-2">
            {digest.mention_highlights.map((m, i) => (
              <p key={i} className="text-sm text-text-primary">
                <span className="font-medium">{m.handle}</span> ({m.followers.toLocaleString()} followers) — {m.recommendation}
              </p>
            ))}
          </div>
        </div>
      )}

      {digest.competitor_alerts && digest.competitor_alerts.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-5">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            Competitor alerts
          </h2>
          <div className="space-y-2">
            {digest.competitor_alerts.map((a, i) => (
              <p key={i} className="text-sm text-text-primary">
                <span className="font-medium">{a.influencer}</span> is also working with{" "}
                <span className="font-medium">{a.competitor}</span> · Risk: {a.risk}
                <br />
                <span className="text-xs text-text-secondary">{a.action}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {digest.recommended_actions && digest.recommended_actions.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Recommended actions
          </h2>
          <div className="space-y-3">
            {digest.recommended_actions.map((a) => (
              <div key={a.priority} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-gold">
                  {a.priority}
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{a.action}</p>
                  <p className="text-xs text-text-secondary">{a.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSend}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90 disabled:opacity-50"
        >
          <Mail className="h-4 w-4" />
          {digest.sent_at ? `Sent ${formatDateTime(digest.sent_at)}` : isPending ? "Sending..." : "Send digest email"}
        </button>
        <a
          href={`/api/intelligence/digest-html/${digest.id}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
        >
          <ExternalLink className="h-4 w-4" />
          View HTML email
        </a>
        <Link href="/intelligence" className="text-sm text-text-secondary hover:text-text-primary">
          View past digests
        </Link>
      </div>
    </div>
  );
}
