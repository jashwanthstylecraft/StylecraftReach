import Link from "next/link";
import { Search, Megaphone, Grid, Settings, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tile {
  href: string;
  title: string;
  description: string;
  icon: typeof Search;
  done: boolean;
}

export function GetStartedTiles({
  hasInfluencers,
  hasActiveCampaign,
  hasCapturedContent,
  hasSocialConnection,
}: {
  hasInfluencers: boolean;
  hasActiveCampaign: boolean;
  hasCapturedContent: boolean;
  hasSocialConnection: boolean;
}) {
  const tiles: Tile[] = [
    { href: "/discover", title: "Discover creators", description: "Search and score influencers with AI", icon: Search, done: hasInfluencers },
    { href: "/campaigns", title: "Launch a campaign", description: "Track outreach through to payout", icon: Megaphone, done: hasActiveCampaign },
    { href: "/content-library", title: "Capture content", description: "Pull in posts, reels, and stories", icon: Grid, done: hasCapturedContent },
    { href: "/settings/social-accounts", title: "Connect your accounts", description: "Link Instagram, TikTok, YouTube", icon: Settings, done: hasSocialConnection },
    { href: "/reports", title: "Build a report", description: "Save a snapshot to share with the team", icon: FolderKanban, done: false },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {tiles.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href}
          className="relative rounded-lg border border-border bg-surface p-4 transition-colors hover:border-gold/40"
        >
          {tile.done && (
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-success" title="Done" />
          )}
          <tile.icon className={cn("mb-2 h-5 w-5", tile.done ? "text-success" : "text-gold")} />
          <p className="text-sm font-medium text-text-primary">{tile.title}</p>
          <p className="mt-0.5 text-xs text-text-secondary">{tile.description}</p>
        </Link>
      ))}
    </div>
  );
}
