import { Header } from "@/components/layout/Header";
import { LinkGenerator } from "@/components/links/LinkGenerator";
import { LinksTable } from "@/components/links/LinksTable";
import { getAllCampaignInfluencers } from "@/lib/data";
import { getAffiliateLinksFull } from "@/lib/analytics-data";

export default async function LinksPage() {
  const [campaignInfluencers, links] = await Promise.all([
    getAllCampaignInfluencers(),
    getAffiliateLinksFull(),
  ]);

  return (
    <div>
      <Header title="Affiliate links" subtitle={`${links.length} active links`} />
      <div className="space-y-6 p-8">
        <LinkGenerator rows={campaignInfluencers} />
        <LinksTable links={links} />
      </div>
    </div>
  );
}
