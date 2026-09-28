import { Avatar } from "@/components/ui/Avatar";
import { formatEMV } from "@/lib/utils/emv";
import { DEFAULT_BRANDS, type BrandComparisonRow } from "@/lib/affable-types";
import type { CampaignInfluencerWithInfluencer, CampaignInfluencerWithCampaign, Influencer } from "@/lib/types";

type Row = CampaignInfluencerWithInfluencer & CampaignInfluencerWithCampaign;

export function BrandCollaborationTable({
  rows,
  contentCountByBrand,
  brandComparisonRows,
}: {
  rows: Row[];
  contentCountByBrand: Record<string, number>;
  brandComparisonRows: BrandComparisonRow[];
}) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-text-primary">Influencer Collaboration: Your Brand vs Competitors</h3>
        <p className="text-xs text-text-secondary">EMV, content produced, and recommended creators per brand</p>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-text-muted">
          <tr>
            <th className="px-5 py-2.5">Brand</th>
            <th className="px-5 py-2.5">EMV</th>
            <th className="px-5 py-2.5">Influencer-created content</th>
            <th className="px-5 py-2.5">Recommendations</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {DEFAULT_BRANDS.map((brand) => {
            const emv = brandComparisonRows.find((r) => r.brandId === brand.id)?.totalEmv ?? 0;
            const contentCount = contentCountByBrand[brand.name] ?? 0;
            const recommended = distinctInfluencersForBrand(rows, brand.name);

            return (
              <tr key={brand.id}>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2 font-medium text-text-primary">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: brand.color }} />
                    {brand.name}
                    {!brand.isOwnBrand && <span className="text-xs font-normal text-text-muted">(competitor)</span>}
                  </span>
                </td>
                <td className="px-5 py-3 text-text-secondary">{formatEMV(emv)}</td>
                <td className="px-5 py-3 text-text-secondary">{contentCount}</td>
                <td className="px-5 py-3">
                  {recommended.length === 0 ? (
                    <span className="text-xs text-text-muted">—</span>
                  ) : (
                    <div className="flex -space-x-2">
                      {recommended.map((inf) => (
                        <Avatar key={inf.id} name={inf.name} src={inf.avatar_url} size="sm" className="border-2 border-surface" />
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function distinctInfluencersForBrand(rows: Row[], brandName: string): Influencer[] {
  const seen = new Map<string, Influencer>();
  for (const r of rows) {
    if (r.campaign.brand === brandName && !seen.has(r.influencer.id)) {
      seen.set(r.influencer.id, r.influencer);
    }
  }
  return Array.from(seen.values())
    .sort((a, b) => (b.ai_score ?? 0) - (a.ai_score ?? 0))
    .slice(0, 6);
}
