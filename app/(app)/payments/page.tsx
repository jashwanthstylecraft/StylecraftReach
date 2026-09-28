import { Header } from "@/components/layout/Header";
import { PaymentsDashboard } from "@/components/payments/PaymentsDashboard";
import { getCampaigns } from "@/lib/data";
import {
  getMonthlyPaidTotal,
  getNotOnboardedActiveCount,
  getOutstandingRows,
  getPaymentHistory,
  getProcessingCount,
} from "@/lib/payments-data";
import { createServerClient } from "@/lib/supabase/server";

export default async function PaymentsPage() {
  const supabase = createServerClient();

  const [outstandingRows, history, campaigns, monthlyPaidTotal, processingCount, notOnboardedCount, onboardedInfluencers] =
    await Promise.all([
      getOutstandingRows(),
      getPaymentHistory(),
      getCampaigns(),
      getMonthlyPaidTotal(),
      getProcessingCount(),
      getNotOnboardedActiveCount(),
      supabase.from("influencers").select("id").eq("stripe_onboarded", true),
    ]);

  const onboardedIds = (onboardedInfluencers.data ?? []).map((i) => i.id);

  return (
    <div>
      <Header title="Payments" subtitle="Payouts, commissions, and Stripe Connect status" />
      <div className="p-8">
        <PaymentsDashboard
          outstandingRows={outstandingRows}
          history={history}
          campaigns={campaigns}
          onboardedIds={onboardedIds}
          monthlyPaidTotal={monthlyPaidTotal}
          processingCount={processingCount}
          notOnboardedCount={notOnboardedCount}
        />
      </div>
    </div>
  );
}
