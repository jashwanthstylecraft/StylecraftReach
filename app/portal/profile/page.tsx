import { redirect } from "next/navigation";
import { StripeOnboardingBanner } from "@/components/payments/StripeOnboardingBanner";
import { PortalProfileForm } from "@/components/portal/PortalProfileForm";
import { getNotificationPrefs, getPortalInfluencer } from "@/lib/portal-data";
import { MOCK_MODE } from "@/lib/stripe/client";

export default async function PortalProfilePage() {
  const influencer = await getPortalInfluencer();
  if (!influencer) redirect("/portal/onboarding");

  const notificationPrefs = await getNotificationPrefs(influencer.id);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Your profile</h1>

      <StripeOnboardingBanner
        influencerId={influencer.id}
        influencerName={influencer.name}
        influencerEmail={influencer.email}
        onboarded={influencer.stripe_onboarded}
        onboardedAt={influencer.stripe_onboarded_at}
        mockMode={MOCK_MODE}
      />

      <PortalProfileForm influencer={influencer} notificationPrefs={notificationPrefs} />
    </div>
  );
}
