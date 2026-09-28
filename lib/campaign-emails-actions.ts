"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { EmailTemplateKind } from "@/lib/campaign-detail-types";

// No email provider is wired up (see README — "SEND MAILS" is intentionally a
// stub, same posture as Phase 6's "no Resend installed" notes). This logs what
// would have been sent as a real, queryable audit trail rather than an ephemeral
// toast, so the brand can see history even though nothing is actually delivered.
export async function logCampaignEmails(
  recipients: { campaignInfluencerId: string; subject: string; body: string }[],
  template: EmailTemplateKind
) {
  auth().protect();
  const user = await currentUser();
  const sentBy = user?.primaryEmailAddress?.emailAddress ?? user?.username ?? "team";
  const supabase = createServerClient();

  const { error } = await supabase.from("campaign_emails_sent").insert(
    recipients.map((r) => ({
      campaign_influencer_id: r.campaignInfluencerId,
      template,
      subject: r.subject,
      body: r.body,
      sent_by: sentBy,
      delivered: false,
    }))
  );
  if (error) throw error;
  revalidatePath("/campaigns");
}
