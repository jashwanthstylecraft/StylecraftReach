import { Header } from "@/components/layout/Header";
import { ReportsPageClient } from "@/components/reports/ReportsPageClient";
import { getInfluencers } from "@/lib/data";
import { getReports, getReportsThisMonthCount } from "@/lib/reports-data";

export default async function ReportsPage() {
  const [reports, reportsThisMonth, influencers] = await Promise.all([
    getReports(),
    getReportsThisMonthCount(),
    getInfluencers(),
  ]);

  return (
    <div>
      <Header title="Reports" subtitle="Saved snapshots of influencer content for sharing and export" />
      <div className="p-8">
        <ReportsPageClient reports={reports} influencers={influencers} reportsThisMonth={reportsThisMonth} />
      </div>
    </div>
  );
}
