import { Header } from "@/components/layout/Header";
import { CampaignsPageClient } from "@/components/campaigns/CampaignsPageClient";
import { getAllCampaignInfluencers, getCampaigns } from "@/lib/data";

export default async function CampaignsPage() {
  const [campaigns, rows] = await Promise.all([getCampaigns(), getAllCampaignInfluencers()]);

  return (
    <div>
      <Header title="Campaigns" subtitle={`${campaigns.length} campaigns`} />
      <div className="p-8">
        <CampaignsPageClient campaigns={campaigns} rows={rows} />
      </div>
    </div>
  );
}
