import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/layout/Header";
import { SavedCreatorsGrid } from "@/components/discover/SavedCreatorsGrid";
import { getCampaigns, getSavedCreators } from "@/lib/data";

export default async function SavedCreatorsPage() {
  const { userId } = auth();
  const [savedCreators, campaigns] = await Promise.all([
    userId ? getSavedCreators(userId) : Promise.resolve([]),
    getCampaigns(),
  ]);

  return (
    <div>
      <Header title="Saved creators" subtitle={`${savedCreators.length} shortlisted`} />
      <div className="p-8">
        <SavedCreatorsGrid savedCreators={savedCreators} campaigns={campaigns} />
      </div>
    </div>
  );
}
