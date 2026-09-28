import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, DollarSign, Package } from "lucide-react";
import { ActivityFeed, type ActivityItem } from "@/components/portal/ActivityFeed";
import { getPortalCampaigns, getPortalEarnings, getPortalInfluencer } from "@/lib/portal-data";
import { StageBadge } from "@/components/ui/StageBadge";
import { formatCurrency } from "@/lib/utils";

export default async function PortalHomePage() {
  const influencer = await getPortalInfluencer();
  if (!influencer) redirect("/portal/onboarding");

  const [campaigns, earnings] = await Promise.all([
    getPortalCampaigns(influencer.id),
    getPortalEarnings(influencer.id),
  ]);

  const activeCampaigns = campaigns.filter((c) => c.stage === "Active" || c.stage === "Negotiating");

  const deliverablesDue = campaigns.flatMap((c) =>
    c.deliverables.filter((d) => !d.completed).map((d) => ({ ...d, campaignName: c.campaign.name }))
  );

  const shippingGifts = campaigns.flatMap((c) => c.gifts.filter((g) => !g.delivered));

  const activity: ActivityItem[] = [
    ...campaigns.flatMap((c) =>
      c.deliverables.flatMap((d) => [
        { type: "deliverable_added" as const, date: d.created_at, text: `New deliverable added: ${d.description}` },
        ...d.content_submissions.map((cs) => ({
          type: "submitted" as const,
          date: cs.created_at,
          text: `You submitted content for ${c.campaign.name}`,
        })),
      ])
    ),
    ...campaigns.flatMap((c) =>
      c.gifts
        .filter((g) => g.shipped_date)
        .map((g) => ({
          type: "shipped" as const,
          date: g.shipped_date as string,
          text: `Your ${g.product_name} shipped${g.tracking_number ? ` — tracking: ${g.tracking_number}` : ""}`,
        }))
    ),
    ...earnings.payoutHistory.map((p) => ({
      type: "payment" as const,
      date: p.date,
      text: `Payment of ${formatCurrency(p.amount)} sent to your account`,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Hey {influencer.name.split(" ")[0]}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-portal-border bg-portal-surface p-4">
          <ClipboardList className="h-5 w-5 text-gold" />
          <p className="mt-2 text-lg font-semibold">{deliverablesDue.length} posts due</p>
          <Link href="/portal/campaigns" className="text-xs text-gold hover:underline">
            View deliverables
          </Link>
        </div>
        <div className="rounded-lg border border-portal-border bg-portal-surface p-4">
          <DollarSign className="h-5 w-5 text-gold" />
          <p className="mt-2 text-lg font-semibold">{formatCurrency(earnings.summary.thisMonth)} earned</p>
          <Link href="/portal/earnings" className="text-xs text-gold hover:underline">
            View earnings
          </Link>
        </div>
        <div className="rounded-lg border border-portal-border bg-portal-surface p-4">
          <Package className="h-5 w-5 text-gold" />
          <p className="mt-2 text-lg font-semibold">{shippingGifts.length} items on the way</p>
          <Link href="/portal/campaigns" className="text-xs text-gold hover:underline">
            View tracking
          </Link>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-portal-text-secondary">Active campaigns</h2>
        <div className="space-y-2">
          {activeCampaigns.length === 0 && (
            <p className="text-sm text-portal-text-secondary">No active campaigns right now.</p>
          )}
          {activeCampaigns.map((c) => {
            const completed = c.deliverables.filter((d) => d.completed).length;
            return (
              <Link
                key={c.id}
                href={`/portal/campaigns/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-portal-border bg-portal-surface p-4 hover:border-gold/40"
              >
                <div>
                  <p className="font-medium">{c.campaign.name}</p>
                  <p className="text-xs text-portal-text-secondary">
                    {c.deliverables.length > 0
                      ? `${completed} of ${c.deliverables.length} deliverables completed`
                      : "Brief available"}
                  </p>
                </div>
                <StageBadge stage={c.stage} />
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-portal-text-secondary">Recent activity</h2>
        <div className="rounded-lg border border-portal-border bg-portal-surface p-4">
          <ActivityFeed items={activity} />
        </div>
      </div>
    </div>
  );
}
