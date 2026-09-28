import { Header } from "@/components/layout/Header";
import { CommunityPageClient } from "@/components/community/CommunityPageClient";
import { getInfluencers } from "@/lib/data";
import { getCommunityLists } from "@/lib/community-data";

export default async function CommunityPage() {
  const [lists, influencers] = await Promise.all([getCommunityLists(), getInfluencers()]);

  return (
    <div>
      <Header title="Community" subtitle="Group creators into named lists for outreach and reporting" />
      <div className="p-8">
        <CommunityPageClient lists={lists} influencers={influencers} />
      </div>
    </div>
  );
}
