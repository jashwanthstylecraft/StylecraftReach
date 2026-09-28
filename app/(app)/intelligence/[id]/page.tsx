import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { DigestView } from "@/components/intelligence/DigestView";
import { getDigestById } from "@/lib/intelligence-data";
import { formatDate } from "@/lib/utils";

export default async function DigestDetailPage({ params }: { params: { id: string } }) {
  const digest = await getDigestById(params.id);
  if (!digest) notFound();

  return (
    <div>
      <Header title="Intelligence digest" subtitle={`Week of ${formatDate(digest.week_start)}`} />
      <div className="p-8">
        <DigestView digest={digest} />
      </div>
    </div>
  );
}
