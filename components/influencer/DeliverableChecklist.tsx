"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { Check } from "lucide-react";
import { addDeliverable, toggleDeliverable } from "@/lib/actions";
import type { Deliverable } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";
import { inputClass, primaryButtonClass } from "@/components/ui/Modal";

export function DeliverableChecklist({
  campaignInfluencerId,
  deliverables,
}: {
  campaignInfluencerId: string;
  deliverables: Deliverable[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    const description = (formData.get("description") as string)?.trim();
    if (!description) return;
    const dueDate = (formData.get("due_date") as string) || null;
    startTransition(async () => {
      await addDeliverable(campaignInfluencerId, description, dueDate);
      formRef.current?.reset();
      router.refresh();
    });
  }

  function handleToggle(id: string, completed: boolean) {
    startTransition(async () => {
      await toggleDeliverable(id, completed);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">Deliverables</h3>
      <div className="space-y-2">
        {deliverables.length === 0 && (
          <p className="text-xs text-text-muted">No deliverables yet.</p>
        )}
        {deliverables.map((d) => (
          <div
            key={d.id}
            className="flex items-center gap-3 rounded-md border border-border bg-surface-elevated px-3 py-2"
          >
            <button
              onClick={() => handleToggle(d.id, !d.completed)}
              disabled={isPending}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                d.completed
                  ? "border-success bg-success/20 text-success"
                  : "border-border text-transparent hover:border-text-secondary"
              )}
              aria-label={d.completed ? "Mark incomplete" : "Mark complete"}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm",
                  d.completed ? "text-text-muted line-through" : "text-text-primary"
                )}
              >
                {d.description}
              </p>
              {d.due_date && (
                <p className="text-[11px] text-text-muted">Due {formatDate(d.due_date)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <form ref={formRef} action={handleAdd} className="mt-4 flex gap-2 border-t border-border pt-4">
        <input
          name="description"
          required
          className={cn(inputClass, "flex-1")}
          placeholder="e.g. 1x Reel"
        />
        <input name="due_date" type="date" className={inputClass} />
        <button type="submit" disabled={isPending} className={cn(primaryButtonClass, "w-auto shrink-0")}>
          Add
        </button>
      </form>
    </div>
  );
}
