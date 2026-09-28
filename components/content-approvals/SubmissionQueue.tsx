"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Eye, X } from "lucide-react";
import { ContentPreviewModal } from "./ContentPreviewModal";
import { FeedbackModal } from "./FeedbackModal";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/utils";
import type { SubmissionForReview } from "@/lib/portal-data";

export function SubmissionQueue({ submissions }: { submissions: SubmissionForReview[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [preview, setPreview] = useState<SubmissionForReview | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<SubmissionForReview | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleApprove(submission: SubmissionForReview) {
    setPendingId(submission.id);
    try {
      const res = await fetch("/api/content-approvals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission.id }),
      });
      if (!res.ok) throw new Error();
      showToast("Content approved", "success");
      router.refresh();
    } catch {
      showToast("Couldn't approve — try again", "error");
    } finally {
      setPendingId(null);
    }
  }

  async function handleRequestChanges(feedback: string) {
    if (!feedbackTarget) return;
    try {
      const res = await fetch("/api/content-approvals/request-changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: feedbackTarget.id, feedback }),
      });
      if (!res.ok) throw new Error();
      showToast("Feedback sent", "success");
      setFeedbackTarget(null);
      router.refresh();
    } catch {
      showToast("Couldn't send feedback — try again", "error");
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface py-12 text-center text-sm text-text-secondary">
        No content awaiting review.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((s) => (
        <div key={s.id} className="rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {s.campaign_influencer.influencer.handle} — {s.deliverable.description}
              </p>
              <p className="text-xs text-text-secondary">
                {s.campaign_influencer.campaign.name} · Submitted {formatDateTime(s.created_at)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPreview(s)}
                className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
              <button
                onClick={() => handleApprove(s)}
                disabled={pendingId === s.id}
                className="flex items-center gap-1 rounded-md bg-success/15 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/25 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                onClick={() => setFeedbackTarget(s)}
                className="flex items-center gap-1 rounded-md bg-danger/15 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/25"
              >
                <X className="h-3.5 w-3.5" />
                Request changes
              </button>
            </div>
          </div>
        </div>
      ))}

      {preview && <ContentPreviewModal submission={preview} onClose={() => setPreview(null)} />}
      {feedbackTarget && (
        <FeedbackModal onClose={() => setFeedbackTarget(null)} onSubmit={handleRequestChanges} />
      )}
    </div>
  );
}
