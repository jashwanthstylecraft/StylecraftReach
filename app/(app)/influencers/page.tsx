import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { Avatar } from "@/components/ui/Avatar";
import { getInfluencers } from "@/lib/data";
import { formatFollowers } from "@/lib/utils";

export default async function InfluencersPage() {
  const influencers = await getInfluencers();

  return (
    <div>
      <Header title="Influencers" subtitle={`${influencers.length} tracked`} />
      <div className="p-8">
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-secondary">
                <th className="px-4 py-3 font-medium">Influencer</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium">Followers</th>
                <th className="px-4 py-3 font-medium">Niche</th>
                <th className="px-4 py-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {influencers.map((inf) => (
                <tr
                  key={inf.id}
                  className="border-b border-border last:border-0 hover:bg-surface-elevated"
                >
                  <td className="px-4 py-3">
                    <Link href={`/influencers/${inf.id}`} className="flex items-center gap-2.5">
                      <Avatar name={inf.name} src={inf.avatar_url} size="sm" />
                      <div>
                        <p className="font-medium text-text-primary">{inf.name}</p>
                        <p className="font-mono text-xs text-text-secondary">{inf.handle}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <PlatformBadge platform={inf.platform} />
                  </td>
                  <td className="px-4 py-3 font-mono text-text-secondary">
                    {formatFollowers(inf.followers)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{inf.niche ?? "—"}</td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={inf.ai_score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
