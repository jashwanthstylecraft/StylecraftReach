import { Header } from "@/components/layout/Header";
import { CommunityPageClient } from "@/components/community/CommunityPageClient";
import { getCampaigns, getInfluencers } from "@/lib/data";
import { getCommunityLists } from "@/lib/community-data";
import { getCommunityCreatorStats } from "@/lib/community-stats";

export default async function CommunityPage() {
  const [lists, influencers, campaigns, statsMap] = await Promise.all([
    getCommunityLists(),
    getInfluencers(),
    getCampaigns(),
    getCommunityCreatorStats(),
  ]);

  const statsById = Object.fromEntries(statsMap);

  return (
    <div>
      <Header title="Community" subtitle="Group creators into named lists for outreach and reporting" />
      <div className="p-8">
        <CommunityPageClient lists={lists} influencers={influencers} campaigns={campaigns} statsById={statsById} />
      </div>
    </div>
  );
}
