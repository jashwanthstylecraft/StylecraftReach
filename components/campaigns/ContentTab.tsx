import { ContentLibraryGrid } from "@/components/intelligence/ContentLibraryGrid";
import type { Campaign } from "@/lib/types";
import type { CapturedContentFull } from "@/lib/intelligence-data";
import type { CommunityListFull } from "@/lib/community-data";

export function ContentTab({
  campaign,
  content,
  communityLists,
}: {
  campaign: Campaign;
  content: CapturedContentFull[];
  communityLists: CommunityListFull[];
}) {
  return (
    <ContentLibraryGrid
      content={content}
      expiringStories={content.filter((c) => c.is_story && c.expires_at)}
      campaigns={[campaign]}
      communityLists={communityLists}
    />
  );
}
