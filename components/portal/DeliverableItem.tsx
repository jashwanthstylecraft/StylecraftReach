"use client";

import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { ContentSubmitModal } from "./ContentSubmitModal";
import { formatDate, cn } from "@/lib/utils";
import type { DeliverableWithSubmissions } from "@/lib/portal-data";

const STATUS_LABEL: Record<string, string> = {
  pending_review: "Submitted — pending review",
  approved: "Approved",
  needs_revision: "Needs revision",
  rejected: "Rejected",
};

export function DeliverableItem({
  deliverable,
  campaignInfluencerId,
}: {
  deliverable: DeliverableWithSubmissions;
  campaignInfluencerId: string;
}) {
  const [submitOpen, setSubmitOpen] = useState(false);
  const latestSubmission = [...deliverable.content_submissions].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )[0];

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-portal-border bg-portal-bg px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
            deliverable.completed
              ? "border-portal-success bg-portal-success/15 text-portal-success"
              : "border-portal-border"
          )}
        >
          {deliverable.completed && <Check className="h-3.5 w-3.5" />}
        </div>
        <div>
          <p className="text-sm text-portal-text-primary">{deliverable.description}</p>
          <p className="text-xs text-portal-text-secondary">
            {deliverable.due_date && !deliverable.completed && `Due ${formatDate(deliverable.due_date)}`}
            {latestSubmission && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {STATUS_LABEL[latestSubmission.status]}
                {latestSubmission.status === "needs_revision" && latestSubmission.feedback && (
                  <span className="text-warning"> — {latestSubmission.feedback}</span>
                )}
              </span>
            )}
          </p>
        </div>
      </div>
      {!deliverable.completed && (
        <button
          onClick={() => setSubmitOpen(true)}
          className="shrink-0 rounded-md bg-gold px-3 py-1 text-xs font-medium text-background hover:bg-gold/90"
        >
          {latestSubmission?.status === "needs_revision" ? "Resubmit" : "Submit content"}
        </button>
      )}

      {submitOpen && (
        <ContentSubmitModal
          deliverableId={deliverable.id}
          campaignInfluencerId={campaignInfluencerId}
          description={deliverable.description}
          onClose={() => setSubmitOpen(false)}
        />
      )}
    </div>
  );
}
