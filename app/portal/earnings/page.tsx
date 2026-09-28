import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { EarningsSummary } from "@/components/portal/EarningsSummary";
import { getPortalEarnings, getPortalInfluencer } from "@/lib/portal-data";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  paid: "Fully paid",
  partially_paid: "Partially paid",
  unpaid: "Unpaid",
};

export default async function PortalEarningsPage() {
  const influencer = await getPortalInfluencer();
  if (!influencer) redirect("/portal/onboarding");

  const earnings = await getPortalEarnings(influencer.id);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Earnings</h1>
      <EarningsSummary summary={earnings.summary} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-portal-text-secondary">By campaign</h2>
        <div className="overflow-hidden rounded-lg border border-portal-border bg-portal-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-portal-border text-xs text-portal-text-secondary">
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium text-right">Flat fee</th>
                <th className="px-4 py-3 font-medium text-right">Commissions</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {earnings.byCampaign.map((row) => (
                <tr key={row.campaignInfluencerId} className="border-b border-portal-border last:border-0">
                  <td className="px-4 py-3">{row.campaign.name}</td>
                  <td className="px-4 py-3 text-portal-text-secondary">{row.campaign.brand}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(row.flatFee)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(row.commission)}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{formatCurrency(row.total)}</td>
                  <td className="px-4 py-3 text-portal-text-secondary">{STATUS_LABEL[row.status]}</td>
                </tr>
              ))}
              {earnings.byCampaign.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-portal-text-secondary">
                    No campaigns yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-portal-text-secondary">Payout history</h2>
        <div className="overflow-hidden rounded-lg border border-portal-border bg-portal-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-portal-border text-xs text-portal-text-secondary">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {earnings.payoutHistory.map((p) => (
                <tr key={p.id} className="border-b border-portal-border last:border-0">
                  <td className="px-4 py-3">{formatDate(p.date)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 capitalize text-portal-text-secondary">
                    {p.type.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3">{p.campaignName}</td>
                  <td className="px-4 py-3">
                    {p.invoicePdfUrl ? (
                      <a
                        href={p.invoicePdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-gold hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Download
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {earnings.payoutHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-portal-text-secondary">
                    No payouts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
