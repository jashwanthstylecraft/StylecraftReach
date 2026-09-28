import { formatDate } from "@/lib/utils";
import type { Campaign, CampaignInfluencer } from "@/lib/types";

export function CampaignBriefCard({
  campaign,
  campaignInfluencer,
}: {
  campaign: Campaign;
  campaignInfluencer: CampaignInfluencer;
}) {
  return (
    <div className="rounded-lg border border-portal-border bg-portal-surface p-5">
      <h1 className="text-lg font-semibold">{campaign.name}</h1>
      <p className="text-sm text-portal-text-secondary">
        Brand: {campaign.brand}
        {campaign.start_date && campaign.end_date && (
          <> · Period: {formatDate(campaign.start_date)} – {formatDate(campaign.end_date)}</>
        )}
      </p>

      {campaign.brief && (
        <p className="mt-4 whitespace-pre-wrap text-sm text-portal-text-primary">{campaign.brief}</p>
      )}

      {(campaignInfluencer.affiliate_link || campaignInfluencer.affiliate_code) && (
        <div className="mt-4 space-y-1 rounded-md bg-portal-bg p-3 text-sm">
          {campaignInfluencer.affiliate_link && (
            <p>
              <span className="text-portal-text-secondary">Your affiliate link: </span>
              <span className="font-mono text-portal-text-primary">{campaignInfluencer.affiliate_link}</span>
            </p>
          )}
          {campaignInfluencer.affiliate_code && (
            <p>
              <span className="text-portal-text-secondary">Your promo code: </span>
              <span className="font-mono text-portal-text-primary">{campaignInfluencer.affiliate_code}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
