import { Header } from "@/components/layout/Header";
import { TrendsDashboardForm } from "@/components/brand-comparison/TrendsDashboardForm";
import { getSavedDashboards } from "@/lib/saved-dashboards";

export default async function BrandComparisonPage() {
  const savedDashboards = await getSavedDashboards();

  return (
    <div>
      <Header title="Brand Comparison" subtitle="Build a custom trends dashboard across your brands and competitors" />
      <div className="p-8">
        <TrendsDashboardForm savedDashboards={savedDashboards} />
      </div>
    </div>
  );
}
