import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { StageBadge } from "@/components/ui/StageBadge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { CommunicationLog } from "@/components/influencer/CommunicationLog";
import { DeliverableChecklist } from "@/components/influencer/DeliverableChecklist";
import { GiftTracker } from "@/components/influencer/GiftTracker";
import { EditInfluencerModal } from "@/components/influencer/EditInfluencerModal";
import { SendPortalInviteButton } from "@/components/influencer/SendPortalInviteButton";
import { Avatar } from "@/components/ui/Avatar";
import { getFullPlacementsForInfluencer, getInfluencerById } from "@/lib/data";
import { formatCurrency, formatFollowers } from "@/lib/utils";

export default async function InfluencerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [influencer, placements] = await Promise.all([
    getInfluencerById(params.id),
    getFullPlacementsForInfluencer(params.id),
  ]);

  if (!influencer) notFound();

  return (
    <div>
      <Header title={influencer.name} subtitle={influencer.handle} />
      <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={influencer.name} src={influencer.avatar_url} size="lg" />
                <div>
                  <p className="font-medium text-text-primary">{influencer.name}</p>
                  <p className="font-mono text-xs text-text-secondary">{influencer.handle}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <PlatformBadge platform={influencer.platform} />
              <ScoreBadge score={influencer.ai_score} />
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="Followers" value={formatFollowers(influencer.followers)} />
              <Row
                label="Engagement rate"
                value={influencer.engagement_rate !== null ? `${influencer.engagement_rate}%` : "—"}
              />
              <Row label="Email" value={influencer.email ?? "—"} />
              <Row label="Location" value={influencer.location ?? "—"} />
              <Row label="Niche" value={influencer.niche ?? "—"} />
            </dl>
            {influencer.notes && (
              <p className="mt-4 rounded-md bg-surface-elevated p-3 text-xs text-text-secondary">
                {influencer.notes}
              </p>
            )}
            <div className="mt-4 space-y-2">
              <EditInfluencerModal influencer={influencer} />
              <SendPortalInviteButton
                influencerId={influencer.id}
                influencerEmail={influencer.email}
                alreadyLinked={Boolean(influencer.clerk_user_id)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {placements.length === 0 && (
            <div className="rounded-lg border border-border bg-surface p-6 text-sm text-text-secondary">
              Not yet added to any campaign pipeline.
            </div>
          )}
          {placements.map((p) => (
            <div key={p.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface p-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{p.campaign.name}</p>
                  <p className="text-xs text-text-secondary">{p.campaign.brand}</p>
                </div>
                <div className="flex items-center gap-3">
                  {p.fee !== null && (
                    <span className="font-mono text-xs text-text-secondary">
                      Fee {formatCurrency(p.fee)}
                      {p.commission_rate ? ` + ${p.commission_rate}%` : ""}
                    </span>
                  )}
                  <StageBadge stage={p.stage} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CommunicationLog campaignInfluencerId={p.id} communications={p.communications} />
                <div className="space-y-4">
                  <DeliverableChecklist campaignInfluencerId={p.id} deliverables={p.deliverables} />
                  <GiftTracker campaignInfluencerId={p.id} gifts={p.gifts} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-text-primary">{value}</dd>
    </div>
  );
}
