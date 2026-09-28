import { Header } from "@/components/layout/Header";
import { PromoCodeForm } from "@/components/promo-codes/PromoCodeForm";
import { PromoCodesTable, type PromoCodeRow } from "@/components/promo-codes/PromoCodesTable";
import { getAllCampaignInfluencers } from "@/lib/data";
import { getPromoCodeRevenueMap, getPromoCodesFull } from "@/lib/analytics-data";

export default async function PromoCodesPage() {
  const [campaignInfluencers, promoCodes, revenueMap] = await Promise.all([
    getAllCampaignInfluencers(),
    getPromoCodesFull(),
    getPromoCodeRevenueMap(),
  ]);

  const rows: PromoCodeRow[] = promoCodes.map((p) => ({
    ...p,
    revenue: revenueMap.get(p.id) ?? 0,
  }));

  return (
    <div>
      <Header title="Promo codes" subtitle={`${promoCodes.length} codes`} />
      <div className="space-y-6 p-8">
        <PromoCodeForm rows={campaignInfluencers} />
        <PromoCodesTable rows={rows} />
      </div>
    </div>
  );
}
