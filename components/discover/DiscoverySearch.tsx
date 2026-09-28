"use client";

import { useState } from "react";
import { SearchX } from "lucide-react";
import { DiscoveryFilters, EMPTY_FILTERS } from "./DiscoveryFilters";
import { CreatorCard } from "./CreatorCard";
import { SkeletonCard } from "./SkeletonCard";
import { AddToCampaignModal } from "./AddToCampaignModal";
import type { AiScore, SearchFilters, SearchHistoryRow, SearchResult } from "@/lib/modash/types";
import type { Campaign } from "@/lib/types";

const RESULTS_PER_PAGE = 25;

export function DiscoverySearch({
  campaigns,
  recentSearches,
}: {
  campaigns: Campaign[];
  recentSearches: SearchHistoryRow[];
}) {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [scores, setScores] = useState<Record<string, AiScore>>({});
  const [scoringIds, setScoringIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalTarget, setModalTarget] = useState<SearchResult | null>(null);

  function scoreResults(newResults: SearchResult[]) {
    newResults.forEach((r) => {
      const id = r.profile.userId;
      setScoringIds((prev) => new Set(prev).add(id));
      fetch("/api/score-influencer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencer: r.profile }),
      })
        .then((res) => res.json())
        .then((score: AiScore) => setScores((prev) => ({ ...prev, [id]: score })))
        .catch(() => {})
        .finally(() =>
          setScoringIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          })
        );
    });
  }

  async function runSearch(nextPage: number, append: boolean, filterOverride?: SearchFilters) {
    setIsSearching(true);
    setError(null);
    try {
      const res = await fetch("/api/discover/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters: filterOverride ?? filters, page: nextPage }),
      });
      if (!res.ok) throw new Error("Search failed");
      const { results: newResults } = (await res.json()) as { results: SearchResult[] };
      setResults((prev) => (append ? [...prev, ...newResults] : newResults));
      setPage(nextPage);
      setHasSearched(true);
      scoreResults(newResults);
    } catch {
      setError("Search failed — check your API connection");
    } finally {
      setIsSearching(false);
    }
  }

  function applyRecentSearch(row: SearchHistoryRow) {
    setFilters(row.filters);
    runSearch(1, false, row.filters);
  }

  const showInitialSkeleton = isSearching && results.length === 0;
  const showEmptyState = hasSearched && !isSearching && results.length === 0 && !error;

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <DiscoveryFilters
        filters={filters}
        onChange={setFilters}
        onSearch={() => runSearch(1, false)}
        isSearching={isSearching}
      />

      <div className="min-w-0 flex-1">
        {recentSearches.length > 0 && results.length === 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-muted">Recent:</span>
            {recentSearches.map((s) => (
              <button
                key={s.id}
                onClick={() => applyRecentSearch(s)}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
              >
                {s.filters.keyword || s.filters.location || `${s.result_count ?? 0} results`}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            {error}{" "}
            <button onClick={() => runSearch(1, false)} className="underline">
              Retry
            </button>
          </div>
        )}

        {showInitialSkeleton && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {showEmptyState && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface py-16 text-center">
            <SearchX className="h-8 w-8 text-text-muted" />
            <p className="mt-3 text-sm text-text-secondary">No creators found — try wider filters</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((r) => (
                <CreatorCard
                  key={`${r.platform}-${r.profile.userId}`}
                  profile={r.profile}
                  platform={r.platform}
                  score={scores[r.profile.userId] ?? null}
                  scoring={scoringIds.has(r.profile.userId)}
                  onAddToCampaign={() => setModalTarget(r)}
                />
              ))}
            </div>
            {results.length % RESULTS_PER_PAGE === 0 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => runSearch(page + 1, true)}
                  disabled={isSearching}
                  className="rounded-md border border-border px-6 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary disabled:opacity-50"
                >
                  {isSearching ? "Loading..." : "Load 25 more"}
                </button>
              </div>
            )}
          </>
        )}

        {!hasSearched && !isSearching && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface py-16 text-center">
            <p className="text-sm text-text-secondary">Set your filters and search to discover creators.</p>
          </div>
        )}
      </div>

      {modalTarget && (
        <AddToCampaignModal
          profile={modalTarget.profile}
          platform={modalTarget.platform}
          score={scores[modalTarget.profile.userId] ?? null}
          campaigns={campaigns}
          onClose={() => setModalTarget(null)}
        />
      )}
    </div>
  );
}
