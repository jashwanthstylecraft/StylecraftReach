"use client";

import { useEffect, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { InfluencerCard } from "./InfluencerCard";
import { AddInfluencerModal } from "./AddInfluencerModal";
import { updateCampaignInfluencerStage } from "@/lib/actions";
import { STAGES } from "@/lib/types";
import type {
  Campaign,
  CampaignInfluencerWithCampaign,
  CampaignInfluencerWithInfluencer,
  Stage,
} from "@/lib/types";

type Row = CampaignInfluencerWithInfluencer & CampaignInfluencerWithCampaign;

export function KanbanBoard({ rows, campaigns }: { rows: Row[]; campaigns: Campaign[] }) {
  const [items, setItems] = useState(rows);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalStage, setModalStage] = useState<Stage | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setItems(rows);
  }, [rows]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const newStage = over.id as Stage;
    const rowId = active.id as string;
    const row = items.find((r) => r.id === rowId);
    if (!row || row.stage === newStage) return;

    setItems((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, stage: newStage } : r))
    );
    startTransition(() => {
      updateCampaignInfluencerStage(rowId, newStage);
    });
  }

  const activeRow = items.find((r) => r.id === activeId);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              rows={items.filter((r) => r.stage === stage)}
              onAddInfluencer={() => setModalStage(stage)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeRow ? <InfluencerCard row={activeRow} dragging /> : null}
        </DragOverlay>
      </DndContext>
      {modalStage && (
        <AddInfluencerModal
          stage={modalStage}
          campaigns={campaigns}
          onClose={() => setModalStage(null)}
        />
      )}
    </>
  );
}
