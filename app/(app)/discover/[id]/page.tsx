import { notFound } from "next/navigation";
import { Heart, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CreatorProfileHeader } from "@/components/discover/CreatorProfileHeader";
import { AiAnalysisCard } from "@/components/discover/AiAnalysisCard";
import { GenderDonut, AgeBarChart, LocationList } from "@/components/discover/AudienceCharts";
import { CreatorProfileActions } from "@/components/discover/CreatorProfileActions";
import { getCampaigns } from "@/lib/data";
import { getProfile } from "@/lib/modash/client";
import { scoreInfluencer } from "@/lib/ai-score";
import { decodeDiscoveryId } from "@/lib/modash/types";

export default async function CreatorPreviewPage({ params }: { params: { id: string } }) {
  const decoded = decodeDiscoveryId(params.id);
  if (!decoded) notFound();

  const [profile, campaigns] = await Promise.all([
    getProfile(decoded.platform, decoded.userId),
    getCampaigns(),
  ]);

  if (!profile) notFound();

  const score = await scoreInfluencer(profile);

  return (
    <div>
      <Header title={profile.fullName || profile.username} subtitle={`@${profile.username}`} />
      <div className="space-y-6 p-8 pb-4">
        <CreatorProfileHeader profile={profile} platform={decoded.platform} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <AiAnalysisCard score={score} />
          </div>
          <div className="space-y-4 rounded-lg border border-border bg-surface p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-text-primary">Audience breakdown</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs text-text-secondary">Gender split</p>
                <GenderDonut genderSplit={profile.audience.genderSplit} />
              </div>
              <div>
                <p className="mb-1 text-xs text-text-secondary">Age groups</p>
                <AgeBarChart ageGroups={profile.audience.ageGroups} />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-text-secondary">Top locations</p>
              <LocationList locations={profile.audience.topLocations} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Recent posts</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
            {profile.recentPosts.slice(0, 9).map((post) => (
              <a
                key={post.url}
                href={post.url}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden rounded-md bg-surface-elevated"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.thumbnail}
                  alt=""
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-70"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/60 px-1.5 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-0.5">
                    <Heart className="h-2.5 w-2.5" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageCircle className="h-2.5 w-2.5" /> {post.comments}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <CreatorProfileActions
        profile={profile}
        platform={decoded.platform}
        score={score}
        campaigns={campaigns}
      />
    </div>
  );
}
