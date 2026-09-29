export const metadata = {
  title: "Privacy Policy — SC Reach",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-text-primary">
      <h1 className="mb-2 font-sans text-2xl font-semibold">Privacy Policy</h1>
      <p className="mb-8 text-sm text-text-secondary">Last updated: September 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-text-secondary">
        <p>
          SC Reach ("the app") is an internal influencer-marketing tool built for StylecraftUS
          and its brands (GAMMA+, Johnny B). It is used by StylecraftUS team members to manage
          influencer campaigns, and by invited influencers through a separate portal.
        </p>

        <section>
          <h2 className="mb-1.5 font-medium text-text-primary">What we collect</h2>
          <p>
            Account data for team members and influencers (name, email, role) via Clerk, our
            authentication provider. Campaign, influencer, and content data entered into the app
            by the StylecraftUS team. Where an influencer connects a social account, basic public
            profile statistics for that account (e.g. follower count, likes, video count).
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 font-medium text-text-primary">Social account connections (TikTok)</h2>
          <p>
            When a StylecraftUS brand account connects TikTok, we request only{" "}
            <code className="text-text-primary">user.info.basic</code> and{" "}
            <code className="text-text-primary">user.info.stats</code> scopes — public account
            profile info and stats. We do not request permission to post, message, or access
            private data on your behalf. Access and refresh tokens are encrypted at rest and used
            only to refresh these stats. You can revoke access at any time from{" "}
            <code className="text-text-primary">/settings/social-accounts</code> in the app, or
            directly from your TikTok account's connected-apps settings.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 font-medium text-text-primary">How data is stored</h2>
          <p>
            Data is stored in a Supabase (PostgreSQL) database operated for StylecraftUS. We do
            not sell or share data with third parties beyond the service providers required to
            run the app (authentication, database hosting, and the social platforms you
            explicitly connect).
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 font-medium text-text-primary">Contact</h2>
          <p>Questions about this policy or a request to delete your data: contact your StylecraftUS admin.</p>
        </section>
      </div>
    </div>
  );
}
