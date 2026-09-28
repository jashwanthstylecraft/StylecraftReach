import { SubmissionQueue } from "@/components/content-approvals/SubmissionQueue";
import type { SubmissionForReview } from "@/lib/portal-data";

export function ContentApprovalTab({ submissions }: { submissions: SubmissionForReview[] }) {
  return <SubmissionQueue submissions={submissions} />;
}
