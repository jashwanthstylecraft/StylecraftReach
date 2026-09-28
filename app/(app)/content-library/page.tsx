import { Header } from "@/components/layout/Header";
import { ContentLibraryGrid } from "@/components/intelligence/ContentLibraryGrid";
import { getCapturedContent, getExpiringStories } from "@/lib/intelligence-data";
import { getCampaigns } from "@/lib/data";

export default async function ContentLibraryPage() {
  const [content, expiringStories, campaigns] = await Promise.all([
    getCapturedContent(),
    getExpiringStories(),
    getCampaigns(),
  ]);

  return (
    <div>
      <Header title="Content library" subtitle={`${content.length} pieces captured`} />
      <div className="p-8">
        <ContentLibraryGrid content={content} expiringStories={expiringStories} campaigns={campaigns} />
      </div>
    </div>
  );
}
