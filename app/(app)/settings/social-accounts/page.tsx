import { Header } from "@/components/layout/Header";
import { SocialAccountsClient } from "@/components/settings/SocialAccountsClient";
import { getSocialConnections } from "@/lib/social-data";
import { SOCIAL_APP_CONFIGURED } from "@/lib/social/config";

export default async function SocialAccountsPage() {
  const connections = await getSocialConnections();

  return (
    <div>
      <Header title="Social accounts" subtitle="Connect your brands' own Instagram, TikTok, and YouTube accounts" />
      <div className="p-8">
        <SocialAccountsClient connections={connections} configured={SOCIAL_APP_CONFIGURED} />
      </div>
    </div>
  );
}
