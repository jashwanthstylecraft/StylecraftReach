import { LinkGenerator } from "@/components/links/LinkGenerator";
import { LinksTable } from "@/components/links/LinksTable";
import { PromoCodeForm } from "@/components/promo-codes/PromoCodeForm";
import { PromoCodesTable, type PromoCodeRow } from "@/components/promo-codes/PromoCodesTable";
import type { CampaignInfluencerWithCampaign, CampaignInfluencerWithInfluencer } from "@/lib/types";
import type { AffiliateLinkFull } from "@/lib/analytics-data";

export function AffiliatesTab({
  rows,
  links,
  promoCodes,
}: {
  rows: (CampaignInfluencerWithInfluencer & CampaignInfluencerWithCampaign)[];
  links: AffiliateLinkFull[];
  promoCodes: PromoCodeRow[];
}) {
  return (
    <div className="space-y-6">
      <LinkGenerator rows={rows} />
      <LinksTable links={links} />
      <PromoCodeForm rows={rows} />
      <PromoCodesTable rows={promoCodes} />
    </div>
  );
}
