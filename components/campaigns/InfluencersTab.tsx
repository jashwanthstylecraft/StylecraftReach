"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InvitationsTable } from "./InvitationsTable";
import { ProposalsTab } from "./ProposalsTab";
import { ProductGiftingTab } from "./ProductGiftingTab";
import { ContentApprovalTab } from "./ContentApprovalTab";
import type { Gift, Influencer } from "@/lib/types";
import type { InvitationRow } from "@/lib/campaigns-data";
import type { ProposalFull } from "@/lib/proposals-data";
import type { SubmissionForReview } from "@/lib/portal-data";

const SUB_TABS = ["Invitations", "Proposals", "Product Gifting", "Content Approval"] as const;

export function InfluencersTab({
  campaignId,
  campaignName,
  invitationRows,
  allInfluencers,
  proposals,
  giftsByCi,
  submissions,
}: {
  campaignId: string;
  campaignName: string;
  invitationRows: InvitationRow[];
  allInfluencers: Influencer[];
  proposals: ProposalFull[];
  giftsByCi: Map<string, Gift[]>;
  submissions: SubmissionForReview[];
}) {
  const [subTab, setSubTab] = useState<(typeof SUB_TABS)[number]>("Invitations");

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {SUB_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium",
              subTab === tab ? "bg-gold/15 text-gold" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {subTab === "Invitations" && (
        <InvitationsTable campaignId={campaignId} campaignName={campaignName} rows={invitationRows} allInfluencers={allInfluencers} />
      )}
      {subTab === "Proposals" && <ProposalsTab proposals={proposals} invitationRows={invitationRows} />}
      {subTab === "Product Gifting" && <ProductGiftingTab rows={invitationRows} giftsByCi={giftsByCi} />}
      {subTab === "Content Approval" && <ContentApprovalTab submissions={submissions} />}
    </div>
  );
}
