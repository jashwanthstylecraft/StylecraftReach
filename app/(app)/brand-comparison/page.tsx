import { Header } from "@/components/layout/Header";
import { BrandComparisonChart } from "@/components/brand-comparison/BrandComparisonChart";
import { getBrandComparisonRows } from "@/lib/brand-comparison-data";
import { formatEMV } from "@/lib/utils/emv";
import { DEFAULT_BRANDS } from "@/lib/affable-types";

export default async function BrandComparisonPage() {
  const rows = await getBrandComparisonRows();

  return (
    <div>
      <Header title="Brand Comparison" subtitle="Our brands vs. competitors across posts, reach, engagement, and EMV" />
      <div className="space-y-6 p-8">
        <BrandComparisonChart rows={rows} />

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-2.5">Brand</th>
                <th className="px-4 py-2.5">Posts</th>
                <th className="px-4 py-2.5">Reach</th>
                <th className="px-4 py-2.5">Avg. engagement</th>
                <th className="px-4 py-2.5">EMV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const brand = DEFAULT_BRANDS.find((b) => b.id === r.brandId)!;
                return (
                  <tr key={r.brandId} className="bg-surface">
                    <td className="flex items-center gap-2 px-4 py-2.5 font-medium text-text-primary">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: brand.color }} />
                      {r.brandName}
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary">{r.posts.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-text-secondary">{r.totalReach.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-text-secondary">{r.avgEngagement.toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-text-secondary">{formatEMV(r.totalEmv)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
