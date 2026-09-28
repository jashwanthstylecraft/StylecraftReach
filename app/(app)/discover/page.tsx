import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/layout/Header";
import { DiscoverySearch } from "@/components/discover/DiscoverySearch";
import { getCampaigns, getRecentSearches } from "@/lib/data";
import { MOCK_MODE } from "@/lib/modash/client";

export default async function DiscoverPage() {
  const { userId } = auth();
  const [campaigns, recentSearches] = await Promise.all([
    getCampaigns(),
    userId ? getRecentSearches(userId) : Promise.resolve([]),
  ]);

  return (
    <div>
      <Header
        title="Discover"
        subtitle={MOCK_MODE ? "Influencer search — mock data mode (no Modash key set)" : "Influencer search"}
      />
      <div className="p-8">
        <DiscoverySearch campaigns={campaigns} recentSearches={recentSearches} />
      </div>
    </div>
  );
}
