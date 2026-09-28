import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/portal/OnboardingWizard";
import { getPortalInfluencer } from "@/lib/portal-data";
import { MOCK_MODE } from "@/lib/stripe/client";

export default async function PortalOnboardingPage() {
  const influencer = await getPortalInfluencer();
  if (!influencer) redirect("/portal/sign-in");

  return (
    <div className="py-8">
      <OnboardingWizard influencer={influencer} mockMode={MOCK_MODE} />
    </div>
  );
}
