import { Header } from "@/components/layout/Header";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { getAllCampaignInfluencers, getCampaigns } from "@/lib/data";

export default async function CampaignsPage() {
  const [campaigns, rows] = await Promise.all([getCampaigns(), getAllCampaignInfluencers()]);

  return (
    <div>
      <Header title="Campaigns" subtitle={`${campaigns.length} campaigns`} />
      <div className="grid grid-cols-1 gap-4 p-8 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((c) => (
          <CampaignCard key={c.id} campaign={c} influencerCount={rows.filter((r) => r.campaign_id === c.id).length} />
        ))}
      </div>
    </div>
  );
}
