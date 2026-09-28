"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { InfluencerCard } from "./InfluencerCard";
import { stageAccentColor } from "@/components/ui/StageBadge";
import type {
  CampaignInfluencerWithCampaign,
  CampaignInfluencerWithInfluencer,
  Stage,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Row = CampaignInfluencerWithInfluencer & CampaignInfluencerWithCampaign;

export function KanbanColumn({
  stage,
  rows,
  onAddInfluencer,
}: {
  stage: Stage;
  rows: Row[];
  onAddInfluencer: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const accent = stageAccentColor(stage);

  return (
    <div
      className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-surface"
      style={{ borderTop: `2px solid ${accent}` }}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{stage}</span>
          <span className="rounded-full bg-surface-elevated px-1.5 py-0.5 font-mono text-[11px] text-text-secondary">
            {rows.length}
          </span>
        </div>
        <button
          onClick={onAddInfluencer}
          className="rounded p-1 text-text-secondary hover:bg-surface-elevated hover:text-gold"
          aria-label={`Add influencer to ${stage}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[140px] flex-1 flex-col gap-2 px-2 pb-3 transition-colors",
          isOver && "bg-surface-elevated/60"
        )}
      >
        {rows.map((row) => (
          <InfluencerCard key={row.id} row={row} />
        ))}
        {rows.length === 0 && (
          <p className="px-1 py-6 text-center text-xs text-text-muted">No influencers</p>
        )}
      </div>
    </div>
  );
}
