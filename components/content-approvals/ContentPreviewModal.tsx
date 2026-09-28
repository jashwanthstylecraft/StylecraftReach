import { ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { SubmissionForReview } from "@/lib/portal-data";

export function ContentPreviewModal({
  submission,
  onClose,
}: {
  submission: SubmissionForReview;
  onClose: () => void;
}) {
  return (
    <Modal title={`${submission.campaign_influencer.influencer.handle} — ${submission.deliverable.description}`} onClose={onClose}>
      <div className="space-y-3">
        {submission.submitted_url && (
          <a
            href={submission.submitted_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-gold hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            {submission.submitted_url}
          </a>
        )}
        {submission.caption && (
          <div>
            <p className="mb-1 text-xs font-medium text-text-secondary">Caption</p>
            <p className="text-sm text-text-primary">{submission.caption}</p>
          </div>
        )}
        {submission.notes && (
          <div>
            <p className="mb-1 text-xs font-medium text-text-secondary">Notes from influencer</p>
            <p className="text-sm text-text-primary">{submission.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
