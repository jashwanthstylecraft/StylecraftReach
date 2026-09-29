export const metadata = {
  title: "Terms of Service — SC Reach",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-text-primary">
      <h1 className="mb-2 font-sans text-2xl font-semibold">Terms of Service</h1>
      <p className="mb-8 text-sm text-text-secondary">Last updated: September 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-text-secondary">
        <p>
          SC Reach is an internal tool built for StylecraftUS and its brands (GAMMA+, Johnny B)
          to manage influencer marketing campaigns. Access is by invitation only, for
          StylecraftUS team members and the influencers they work with.
        </p>

        <section>
          <h2 className="mb-1.5 font-medium text-text-primary">Acceptable use</h2>
          <p>
            The app is used solely for the internal business purpose of running influencer
            campaigns — outreach, content tracking, payments, and reporting. It is not a public
            product and is not offered for use outside StylecraftUS and its invited partners.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 font-medium text-text-primary">Connected accounts</h2>
          <p>
            Where a user connects a third-party account (e.g. TikTok) to the app, that
            connection is used only to display account statistics inside the app. Access can be
            revoked at any time from within the app or from the third-party platform's own
            connected-apps settings.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 font-medium text-text-primary">No warranty</h2>
          <p>
            The app is provided as-is for internal StylecraftUS use, without warranty of any
            kind.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 font-medium text-text-primary">Contact</h2>
          <p>Questions about these terms: contact your StylecraftUS admin.</p>
        </section>
      </div>
    </div>
  );
}
