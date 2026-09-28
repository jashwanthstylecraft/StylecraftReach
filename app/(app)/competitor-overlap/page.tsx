import { Header } from "@/components/layout/Header";
import { CompetitorOverlapTable } from "@/components/intelligence/CompetitorOverlapTable";
import { HashtagComparisonChart } from "@/components/intelligence/HashtagComparisonChart";
import { getCompetitorOverlapRows, getCompetitorSummary, getHashtagComparison } from "@/lib/intelligence-data";

export default async function CompetitorOverlapPage() {
  const [rows, summary, hashtags] = await Promise.all([
    getCompetitorOverlapRows(),
    getCompetitorSummary(),
    getHashtagComparison(),
  ]);

  return (
    <div>
      <Header title="Competitor overlap" subtitle="Which creators also work with competitor brands" />
      <div className="space-y-6 p-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {summary.length === 0 && (
            <p className="col-span-full text-sm text-text-secondary">No competitor overlap detected yet.</p>
          )}
          {summary.map((s) => (
            <div key={s.brand} className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-text-primary">{s.brand}</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-text-primary">{s.count}</p>
              <p className="text-xs text-text-secondary">creator{s.count === 1 ? "" : "s"} working with {s.brand}</p>
            </div>
          ))}
        </div>

        <CompetitorOverlapTable rows={rows} />

        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Hashtag comparison — own vs competitor</h3>
          <HashtagComparisonChart hashtags={hashtags} />
        </div>
      </div>
    </div>
  );
}
