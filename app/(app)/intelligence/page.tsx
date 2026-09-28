import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { DigestView } from "@/components/intelligence/DigestView";
import { getDigests } from "@/lib/intelligence-data";
import { formatDate } from "@/lib/utils";

export default async function IntelligencePage() {
  const digests = await getDigests();
  const current = digests[0];
  const past = digests.slice(1);

  return (
    <div>
      <Header title="Intelligence" subtitle="Weekly digest builder + archive" />
      <div className="space-y-8 p-8">
        {current ? (
          <DigestView digest={current} />
        ) : (
          <div className="rounded-lg border border-border bg-surface py-16 text-center text-sm text-text-secondary">
            No digest generated yet — the weekly cron (
            <code className="font-mono text-xs">/api/cron/generate-digest</code>) hasn&apos;t run.
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-text-secondary">Past digests</h2>
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-text-secondary">
                    <th className="px-4 py-3 font-medium">Week</th>
                    <th className="px-4 py-3 font-medium">Headline</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {past.map((d) => (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-text-secondary">
                        {formatDate(d.week_start)} – {formatDate(d.week_end)}
                      </td>
                      <td className="px-4 py-3 text-text-primary">{d.headline}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/intelligence/${d.id}`} className="text-gold hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
