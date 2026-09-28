import { Header } from "@/components/layout/Header";
import { SubmissionQueue } from "@/components/content-approvals/SubmissionQueue";
import { getPendingSubmissions } from "@/lib/portal-data";

export default async function ContentApprovalsPage() {
  const submissions = await getPendingSubmissions();

  return (
    <div>
      <Header title="Content approvals" subtitle={`${submissions.length} awaiting review`} />
      <div className="p-8">
        <SubmissionQueue submissions={submissions} />
      </div>
    </div>
  );
}
