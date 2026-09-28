import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ReportDetailClient } from "@/components/reports/ReportDetailClient";
import { getReportById } from "@/lib/reports-data";

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const report = await getReportById(params.id);
  if (!report) notFound();

  return (
    <div>
      <Header title="Report" subtitle={report.name} />
      <div className="p-8">
        <ReportDetailClient report={report} />
      </div>
    </div>
  );
}
