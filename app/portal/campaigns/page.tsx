import Link from "next/link";
import { redirect } from "next/navigation";
import { StageBadge } from "@/components/ui/StageBadge";
import { getPortalCampaigns, getPortalInfluencer } from "@/lib/portal-data";
import { formatCurrency } from "@/lib/utils";
import type { PortalCampaignRow } from "@/lib/portal-data";

const GROUPS: { label: string; stages: string[] }[] = [
  { label: "Active", stages: ["Active"] },
  { label: "Negotiating", stages: ["Shortlisted", "Outreach sent", "Negotiating"] },
  { label: "Completed", stages: ["Completed"] },
];

export default async function PortalCampaignsPage() {
  const influencer = await getPortalInfluencer();
  if (!influencer) redirect("/portal/onboarding");

  const campaigns = await getPortalCampaigns(influencer.id);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Your campaigns</h1>
      {GROUPS.map((group) => {
        const rows = campaigns.filter((c) => group.stages.includes(c.stage));
        if (rows.length === 0) return null;
        return (
          <div key={group.label}>
            <h2 className="mb-3 text-sm font-semibold text-portal-text-secondary">{group.label}</h2>
            <div className="space-y-2">
              {rows.map((c) => (
                <CampaignCard key={c.id} row={c} />
              ))}
            </div>
          </div>
        );
      })}
      {campaigns.length === 0 && (
        <p className="text-sm text-portal-text-secondary">You&apos;re not part of any campaigns yet.</p>
      )}
    </div>
  );
}

function CampaignCard({ row }: { row: PortalCampaignRow }) {
  const completed = row.deliverables.filter((d) => d.completed).length;

  return (
    <Link
      href={`/portal/campaigns/${row.id}`}
      className="flex items-center justify-between rounded-lg border border-portal-border bg-portal-surface p-4 hover:border-gold/40"
    >
      <div>
        <p className="font-medium">{row.campaign.name}</p>
        <p className="text-xs text-portal-text-secondary">{row.campaign.brand}</p>
        {row.deliverables.length > 0 && (
          <p className="mt-1 text-xs text-portal-text-secondary">
            {completed} of {row.deliverables.length} deliverables completed
          </p>
        )}
      </div>
      <div className="text-right">
        {row.fee !== null && (
          <p className="font-mono text-sm text-portal-text-primary">{formatCurrency(row.fee)}</p>
        )}
        <StageBadge stage={row.stage} />
      </div>
    </Link>
  );
}
