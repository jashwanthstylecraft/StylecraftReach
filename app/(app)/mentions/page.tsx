import { Header } from "@/components/layout/Header";
import { MentionFeed } from "@/components/intelligence/MentionFeed";
import { getMentionKeywordCounts, getMentions } from "@/lib/intelligence-data";

export default async function MentionsPage() {
  const [mentions, keywordCounts] = await Promise.all([getMentions(), getMentionKeywordCounts()]);

  return (
    <div>
      <Header title="Mentions" subtitle={`${mentions.length} tracked`} />
      <div className="p-8">
        <MentionFeed mentions={mentions} keywordCounts={keywordCounts} />
      </div>
    </div>
  );
}
