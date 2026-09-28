import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CampaignHeader } from "@/components/campaigns/CampaignHeader";
import { CampaignStatCards } from "@/components/campaigns/CampaignStatCards";
import { CampaignTabs, type TabDef } from "@/components/campaigns/CampaignTabs";
import { InfluencersTab } from "@/components/campaigns/InfluencersTab";
import { ContentTab } from "@/components/campaigns/ContentTab";
import { ChatsTab } from "@/components/campaigns/ChatsTab";
import { FixedPayTab } from "@/components/campaigns/FixedPayTab";
import { AffiliatesTab } from "@/components/campaigns/AffiliatesTab";
import { CampaignReportsTab } from "@/components/campaigns/CampaignReportsTab";
import { getCampaignById, getFullPlacementsForCampaign, getInfluencers } from "@/lib/data";
import { getCampaignSummary, getInvitationRows } from "@/lib/campaigns-data";
import { getProposalsForCampaign } from "@/lib/proposals-data";
import { getCapturedContent } from "@/lib/intelligence-data";
import { getPendingSubmissions } from "@/lib/portal-data";
import { getCommunityLists } from "@/lib/community-data";
import { getOutstandingRows } from "@/lib/payments-data";
import { getAffiliateLinksFull, getPromoCodeRevenueMap, getPromoCodesFull } from "@/lib/analytics-data";
import { getReports } from "@/lib/reports-data";
import { getCreatorPortalSettings } from "@/lib/creator-portal-settings";
import { createServerClient } from "@/lib/supabase/server";
import type { PromoCodeRow } from "@/components/promo-codes/PromoCodesTable";

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const campaignId = params.id;
  const supabase = createServerClient();

  const [
    campaign,
    summary,
    invitationRows,
    allInfluencers,
    placements,
    proposals,
    content,
    pendingSubmissions,
    communityLists,
    outstandingRows,
    onboardedInfluencers,
    links,
    promoCodes,
    promoRevenueMap,
    reports,
    portalSettings,
  ] = await Promise.all([
    getCampaignById(campaignId),
    getCampaignSummary(campaignId),
    getInvitationRows(campaignId),
    getInfluencers(),
    getFullPlacementsForCampaign(campaignId),
    getProposalsForCampaign(campaignId),
    getCapturedContent({ campaignId }),
    getPendingSubmissions(),
    getCommunityLists(),
    getOutstandingRows(),
    supabase.from("influencers").select("id").eq("stripe_onboarded", true),
    getAffiliateLinksFull(),
    getPromoCodesFull(),
    getPromoCodeRevenueMap(),
    getReports(campaignId),
    getCreatorPortalSettings(campaignId),
  ]);

  if (!campaign) notFound();

  const giftsByCi = new Map(placements.map((p) => [p.id, p.gifts]));
  const submissions = pendingSubmissions.filter((s) => s.campaign_influencer.campaign.id === campaignId);
  const onboardedIds = new Set((onboardedInfluencers.data ?? []).map((i) => i.id));
  const campaignOutstanding = outstandingRows.filter((r) => r.campaign.id === campaignId);
  const campaignLinks = links.filter((l) => l.campaign_influencer.campaign.id === campaignId);
  const campaignPromoCodes = promoCodes.filter((p) => p.campaign_influencer.campaign.id === campaignId);
  const promoCodeRows: PromoCodeRow[] = campaignPromoCodes.map((p) => ({ ...p, revenue: promoRevenueMap.get(p.id) ?? 0 }));
  const affiliateRows = invitationRows.map((r) => ({ ...r, influencer: r.influencer, campaign }));

  const tabs: TabDef[] = [
    {
      id: "influencers",
      label: "Influencers",
      content: (
        <InfluencersTab
          campaignId={campaignId}
          campaignName={campaign.name}
          invitationRows={invitationRows}
          allInfluencers={allInfluencers}
          proposals={proposals}
          giftsByCi={giftsByCi}
          submissions={submissions}
        />
      ),
    },
    {
      id: "content",
      label: "Content",
      content: <ContentTab campaign={campaign} content={content} communityLists={communityLists} />,
    },
    { id: "chats", label: "Chats", content: <ChatsTab rows={invitationRows} /> },
    {
      id: "fixed-pay",
      label: "Fixed Pay",
      content: <FixedPayTab rows={campaignOutstanding} onboardedIds={onboardedIds} />,
    },
    {
      id: "affiliates",
      label: "Affiliates",
      content: <AffiliatesTab rows={affiliateRows} links={campaignLinks} promoCodes={promoCodeRows} />,
    },
    {
      id: "reports",
      label: "Reports",
      content: (
        <CampaignReportsTab
          campaignId={campaignId}
          reports={reports}
          influencers={invitationRows.map((r) => r.influencer)}
        />
      ),
    },
  ];

  return (
    <div>
      <Header title={campaign.name} subtitle={campaign.brand} />
      <div className="space-y-6 p-8">
        <CampaignHeader campaign={campaign} portalSettings={portalSettings} />
        {summary && <CampaignStatCards campaign={campaign} summary={summary} />}
        <CampaignTabs tabs={tabs} />
      </div>
    </div>
  );
}
