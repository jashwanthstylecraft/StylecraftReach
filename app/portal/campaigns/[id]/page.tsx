import { notFound, redirect } from "next/navigation";
import { CampaignBriefCard } from "@/components/portal/CampaignBriefCard";
import { DeliverableItem } from "@/components/portal/DeliverableItem";
import { GiftTrackingCard } from "@/components/portal/GiftTrackingCard";
import { MessageThread } from "@/components/portal/MessageThread";
import {
  getPortalCampaignDetail,
  getPortalEarnings,
  getPortalInfluencer,
  getPortalMessages,
} from "@/lib/portal-data";
import { formatCurrency } from "@/lib/utils";

export default async function PortalCampaignDetailPage({ params }: { params: { id: string } }) {
  const influencer = await getPortalInfluencer();
  if (!influencer) redirect("/portal/onboarding");

  const row = await getPortalCampaignDetail(params.id, influencer.id);
  if (!row) notFound();

  const [messages, earnings] = await Promise.all([
    getPortalMessages(row.id),
    getPortalEarnings(influencer.id),
  ]);

  const campaignEarnings = earnings.byCampaign.find((e) => e.campaignInfluencerId === row.id);

  return (
    <div className="space-y-6">
      <CampaignBriefCard campaign={row.campaign} campaignInfluencer={row} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-portal-text-secondary">Deliverables</h2>
        <div className="space-y-2">
          {row.deliverables.length === 0 && (
            <p className="text-sm text-portal-text-secondary">No deliverables added yet.</p>
          )}
          {row.deliverables.map((d) => (
            <DeliverableItem key={d.id} deliverable={d} campaignInfluencerId={row.id} />
          ))}
        </div>
      </div>

      <GiftTrackingCard gifts={row.gifts} />

      {campaignEarnings && (
        <div className="rounded-lg border border-portal-border bg-portal-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-portal-text-secondary">Earnings for this campaign</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-portal-text-secondary">Flat fee</dt>
              <dd>{formatCurrency(campaignEarnings.flatFee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-portal-text-secondary">Commissions</dt>
              <dd>{formatCurrency(campaignEarnings.commission)}</dd>
            </div>
            <div className="flex justify-between border-t border-portal-border pt-1.5 font-medium">
              <dt>Total</dt>
              <dd>{formatCurrency(campaignEarnings.total)}</dd>
            </div>
          </dl>
        </div>
      )}

      <MessageThread campaignInfluencerId={row.id} initialMessages={messages} currentRole="influencer" />
    </div>
  );
}
