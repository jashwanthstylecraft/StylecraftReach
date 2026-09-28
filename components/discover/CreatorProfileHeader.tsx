import { Avatar } from "@/components/ui/Avatar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { formatFollowers } from "@/lib/utils";
import type { DiscoveryPlatform, ModashProfile } from "@/lib/modash/types";

function credibilityLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

export function CreatorProfileHeader({
  profile,
  platform,
}: {
  profile: ModashProfile;
  platform: DiscoveryPlatform;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={profile.fullName || profile.username} src={profile.profilePicUrl} size="lg" className="h-20 w-20 text-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary">{profile.fullName || profile.username}</h2>
            <PlatformBadge platform={platform} />
          </div>
          <p className="font-mono text-sm text-text-secondary">@{profile.username}</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
            <Stat label="Followers" value={formatFollowers(profile.followers)} />
            <Stat label="Engagement" value={`${profile.engagementRate}%`} />
            <Stat label="Location" value={profile.location} />
            <Stat
              label="Credibility"
              value={`${profile.credibilityScore}/100 · ${credibilityLabel(profile.credibilityScore)}`}
            />
          </div>
          {profile.biography && (
            <p className="mt-4 text-sm text-text-secondary">{profile.biography}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-text-secondary">
      <span className="text-text-muted">{label}:</span>{" "}
      <span className="font-medium text-text-primary">{value}</span>
    </span>
  );
}
