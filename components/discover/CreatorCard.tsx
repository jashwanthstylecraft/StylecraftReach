import Link from "next/link";
import { Plus, X } from "lucide-react";
import { AiScoreBadge } from "./AiScoreBadge";
import { Avatar } from "@/components/ui/Avatar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { formatFollowers } from "@/lib/utils";
import { encodeDiscoveryId } from "@/lib/modash/types";
import type { AiScore, DiscoveryPlatform, ModashProfile } from "@/lib/modash/types";

export function CreatorCard({
  profile,
  platform,
  score,
  scoring,
  onAddToCampaign,
  onRemove,
}: {
  profile: ModashProfile;
  platform: DiscoveryPlatform;
  score: AiScore | null;
  scoring?: boolean;
  onAddToCampaign: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="relative flex flex-col rounded-lg border border-border bg-surface p-4">
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label="Remove from saved"
          className="absolute right-3 top-3 rounded p-1 text-text-muted hover:bg-surface-elevated hover:text-danger"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="flex items-start gap-3">
        <Avatar name={profile.fullName || profile.username} src={profile.profilePicUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">
            {profile.fullName || profile.username}
          </p>
          <p className="truncate font-mono text-xs text-text-secondary">@{profile.username}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <PlatformBadge platform={platform} />
            <span className="text-[11px] text-text-secondary">
              {formatFollowers(profile.followers)} · {profile.engagementRate}% ER
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <AiScoreBadge score={score} loading={scoring} />
      </div>

      {score && <p className="mt-2 line-clamp-2 text-xs text-text-secondary">{score.fitReason}</p>}

      <div className="mt-3 flex items-center justify-between text-[11px] text-text-muted">
        <span>Credibility {profile.credibilityScore}/100</span>
        <span>{profile.audience.topLocations[0]?.name ?? profile.location}</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-elevated">
        <div
          className="h-full bg-gold"
          style={{ width: `${Math.min(profile.credibilityScore, 100)}%` }}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/discover/${encodeDiscoveryId(platform, profile.userId)}`}
          className="flex-1 rounded-md border border-border px-3 py-1.5 text-center text-xs font-medium text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
        >
          View profile
        </Link>
        <button
          onClick={onAddToCampaign}
          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-background hover:bg-gold/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add to campaign
        </button>
      </div>
    </div>
  );
}
