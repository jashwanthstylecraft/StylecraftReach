import type { InvitationDisplayStatus, Stage } from "@/lib/types";

// The Kanban board's `stage` stays the pipeline's source of truth (untouched from
// Phase 1). This derives an Affable-style display status from it by default, but
// `campaign_influencers.status` can override it (e.g. to mark "Published" or
// "Declined", which the stage pipeline has no equivalent for).
export function deriveInvitationStatus(stage: Stage, override: InvitationDisplayStatus | null): InvitationDisplayStatus {
  if (override) return override;
  switch (stage) {
    case "Shortlisted":
    case "Outreach sent":
      return "Invited";
    case "Negotiating":
      return "Accepted";
    case "Active":
      return "Active";
    case "Completed":
      return "Completed";
  }
}

export const INVITATION_STATUS_STYLES: Record<InvitationDisplayStatus, string> = {
  Published: "bg-blue-500 text-white",
  Invited: "bg-warning/15 text-warning border border-warning/30",
  Accepted: "bg-success/15 text-success border border-success/30",
  Declined: "bg-danger/15 text-danger border border-danger/30",
  Active: "bg-success text-white",
  Completed: "bg-text-muted/15 text-text-secondary border border-border",
};

export const INVITATION_STATUS_OPTIONS: InvitationDisplayStatus[] = [
  "Invited",
  "Accepted",
  "Declined",
  "Active",
  "Published",
  "Completed",
];
