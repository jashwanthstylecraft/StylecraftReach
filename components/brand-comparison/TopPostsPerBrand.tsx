import { DEFAULT_BRANDS } from "@/lib/affable-types";
import type { CapturedContentFull } from "@/lib/intelligence-data";

export function TopPostsPerBrand({ topPostsByBrand }: { topPostsByBrand: Record<string, CapturedContentFull[]> }) {
  const brandIds = Object.keys(topPostsByBrand).filter((id) => topPostsByBrand[id].length > 0);
  if (brandIds.length === 0) {
    return <p className="text-sm text-text-secondary">No captured content matches these filters yet.</p>;
  }

  return (
    <div className="space-y-3">
      {brandIds.map((brandId) => {
        const brand = DEFAULT_BRANDS.find((b) => b.id === brandId)!;
        return (
          <div key={brandId} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm font-medium text-text-primary">{brand.name}</span>
            <div className="flex gap-2 overflow-x-auto">
              {topPostsByBrand[brandId].map((post) => (
                <div key={post.id} className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface-elevated">
                  {post.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
