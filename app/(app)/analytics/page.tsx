import { Header } from "@/components/layout/Header";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { getCampaigns } from "@/lib/data";

export default async function AnalyticsPage() {
  const campaigns = await getCampaigns();

  return (
    <div>
      <Header title="Analytics" subtitle="Affiliate link + promo code ROI across all campaigns" />
      <div className="p-8">
        <AnalyticsDashboard campaigns={campaigns} />
      </div>
    </div>
  );
}
