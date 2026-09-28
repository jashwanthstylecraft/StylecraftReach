import { Header } from "@/components/layout/Header";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { STAT_ICONS, StatsBar } from "@/components/ui/StatsBar";
import { GetStartedTiles } from "@/components/dashboard/GetStartedTiles";
import { BrandCollaborationTable } from "@/components/dashboard/BrandCollaborationTable";
import { getAllCampaignInfluencers, getCampaigns, getInfluencers } from "@/lib/data";
import { getCapturedContent } from "@/lib/intelligence-data";
import { getBrandComparisonRows } from "@/lib/brand-comparison-data";
import { getSocialConnections } from "@/lib/social-data";

export default async function DashboardPage() {
  const [rows, campaigns, influencers, capturedContent, brandComparisonRows, socialConnections] = await Promise.all([
    getAllCampaignInfluencers(),
    getCampaigns(),
    getInfluencers(),
    getCapturedContent(),
    getBrandComparisonRows(),
    getSocialConnections(),
  ]);

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const inActiveStage = rows.filter((r) => r.stage === "Active").length;
  const needsFollowUp = rows.filter((r) => r.stage === "Outreach sent").length;

  const stats = [
    { label: "Influencers tracked", value: influencers.length, icon: STAT_ICONS.Users },
    { label: "Active campaigns", value: activeCampaigns, icon: STAT_ICONS.Megaphone },
    { label: "In active campaigns", value: inActiveStage, icon: STAT_ICONS.Zap },
    { label: "Needs follow-up", value: needsFollowUp, icon: STAT_ICONS.Mail },
  ];

  const contentCountByBrand: Record<string, number> = {};
  for (const c of capturedContent) {
    if (!c.campaign) continue;
    contentCountByBrand[c.campaign.brand] = (contentCountByBrand[c.campaign.brand] ?? 0) + 1;
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Pipeline across all campaigns" />
      <div className="space-y-6 p-8">
        <GetStartedTiles
          hasInfluencers={influencers.length > 0}
          hasActiveCampaign={activeCampaigns > 0}
          hasCapturedContent={capturedContent.length > 0}
          hasSocialConnection={socialConnections.length > 0}
        />
        <StatsBar stats={stats} />
        <BrandCollaborationTable rows={rows} contentCountByBrand={contentCountByBrand} brandComparisonRows={brandComparisonRows} />
        <KanbanBoard rows={rows} campaigns={campaigns} />
      </div>
    </div>
  );
}
