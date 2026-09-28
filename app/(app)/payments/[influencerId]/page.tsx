import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Avatar } from "@/components/ui/Avatar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { StripeOnboardingBanner } from "@/components/payments/StripeOnboardingBanner";
import { AddFlatFeeForm } from "@/components/payments/AddFlatFeeForm";
import { CommissionPayoutCard } from "@/components/payments/CommissionPayoutCard";
import { PaymentHistoryTable } from "@/components/payments/PaymentHistoryTable";
import { PaymentScheduleCard } from "@/components/payments/PaymentScheduleCard";
import { PendingPaymentsList } from "@/components/payments/PendingPaymentsList";
import { getCampaignInfluencerFull } from "@/lib/data";
import { getConversionsForCampaignInfluencer } from "@/lib/analytics-data";
import {
  getPaymentsForCampaignInfluencer,
  getScheduleForCampaignInfluencer,
} from "@/lib/payments-data";
import { MOCK_MODE } from "@/lib/stripe/client";
import { formatCurrency } from "@/lib/utils";

export default async function InfluencerPaymentsPage({
  params,
}: {
  params: { influencerId: string };
}) {
  const full = await getCampaignInfluencerFull(params.influencerId);
  if (!full) notFound();

  const [conversions, payments, schedule] = await Promise.all([
    getConversionsForCampaignInfluencer(params.influencerId),
    getPaymentsForCampaignInfluencer(params.influencerId),
    getScheduleForCampaignInfluencer(params.influencerId),
  ]);

  const unpaidConversions = conversions.filter((c) => !c.commission_paid);
  const commissionOwed = unpaidConversions.reduce((s, c) => s + c.commission_amount, 0);
  const totalRevenue = unpaidConversions.reduce((s, c) => s + c.order_amount, 0);

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const historyPayments = payments.filter((p) => p.status !== "pending");

  const historyFull = historyPayments.map((p) => ({
    ...p,
    campaign_influencer: { ...full, influencer: full.influencer, campaign: full.campaign },
    invoice: null,
  })) as never;

  return (
    <div>
      <Header title={full.influencer.name} subtitle={full.campaign.name} />
      <div className="space-y-6 p-8">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={full.influencer.name} src={full.influencer.avatar_url} size="lg" />
              <div>
                <p className="font-medium text-text-primary">{full.influencer.name}</p>
                <p className="font-mono text-xs text-text-secondary">{full.influencer.handle}</p>
                <div className="mt-1">
                  <PlatformBadge platform={full.influencer.platform} />
                </div>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-right">
                <p className="font-mono text-lg font-semibold text-text-primary">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-text-secondary">Total paid to date</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-semibold text-warning">
                  {formatCurrency(commissionOwed + pendingPayments.reduce((s, p) => s + Number(p.amount), 0))}
                </p>
                <p className="text-xs text-text-secondary">Outstanding</p>
              </div>
            </div>
          </div>
        </div>

        <StripeOnboardingBanner
          influencerId={full.influencer.id}
          influencerName={full.influencer.name}
          influencerEmail={full.influencer.email}
          onboarded={full.influencer.stripe_onboarded ?? false}
          onboardedAt={full.influencer.stripe_onboarded_at ?? null}
          mockMode={MOCK_MODE}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <AddFlatFeeForm campaignInfluencerId={full.id} />
            </div>
            {pendingPayments.length > 0 && (
              <PendingPaymentsList
                payments={pendingPayments}
                handle={full.influencer.handle}
                campaignName={full.campaign.name}
                onboarded={full.influencer.stripe_onboarded ?? false}
              />
            )}
          </div>
          <CommissionPayoutCard
            campaignInfluencerId={full.id}
            handle={full.influencer.handle}
            campaignName={full.campaign.name}
            conversionsCount={unpaidConversions.length}
            totalRevenue={totalRevenue}
            commissionRate={full.commission_rate}
            commissionOwed={commissionOwed}
            onboarded={full.influencer.stripe_onboarded ?? false}
          />
        </div>

        <PaymentScheduleCard schedule={schedule} />

        <div>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Payment history</h3>
          <PaymentHistoryTable payments={historyFull} />
        </div>
      </div>
    </div>
  );
}
