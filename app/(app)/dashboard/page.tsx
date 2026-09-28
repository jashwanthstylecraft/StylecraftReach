import { Header } from "@/components/layout/Header";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { STAT_ICONS, StatsBar } from "@/components/ui/StatsBar";
import { getAllCampaignInfluencers, getCampaigns, getInfluencers } from "@/lib/data";

export default async function DashboardPage() {
  const [rows, campaigns, influencers] = await Promise.all([
    getAllCampaignInfluencers(),
    getCampaigns(),
    getInfluencers(),
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

  return (
    <div>
      <Header title="Dashboard" subtitle="Pipeline across all campaigns" />
      <div className="space-y-6 p-8">
        <StatsBar stats={stats} />
        <KanbanBoard rows={rows} campaigns={campaigns} />
      </div>
    </div>
  );
}
