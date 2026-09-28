"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { addCommunication } from "@/lib/actions";
import type { Communication, CommunicationType } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { inputClass, primaryButtonClass } from "@/components/ui/Modal";

const TYPE_LABELS: Record<CommunicationType, string> = {
  note: "Note",
  email: "Email",
  dm: "DM",
  call: "Call",
};

export function CommunicationLog({
  campaignInfluencerId,
  communications,
}: {
  campaignInfluencerId: string;
  communications: Communication[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<CommunicationType>("note");
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const content = (formData.get("content") as string)?.trim();
    if (!content) return;
    startTransition(async () => {
      await addCommunication(campaignInfluencerId, type, content);
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">Communication log</h3>
      <div className="max-h-80 space-y-3 overflow-y-auto scrollbar-thin pr-1">
        {communications.length === 0 && (
          <p className="text-xs text-text-muted">No communications logged yet.</p>
        )}
        {communications.map((c) => (
          <div key={c.id} className="rounded-md border border-border bg-surface-elevated p-3">
            <div className="flex items-center justify-between">
              <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] uppercase text-text-secondary">
                {TYPE_LABELS[c.type]}
              </span>
              <span className="text-[11px] text-text-muted">{formatDateTime(c.created_at)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-text-primary">{c.content}</p>
            {c.created_by && (
              <p className="mt-1 text-[11px] text-text-muted">— {c.created_by}</p>
            )}
          </div>
        ))}
      </div>
      <form ref={formRef} action={handleSubmit} className="mt-4 space-y-2 border-t border-border pt-4">
        <div className="flex gap-2">
          {(Object.keys(TYPE_LABELS) as CommunicationType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded px-2 py-1 text-xs ${
                type === t
                  ? "bg-gold/15 text-gold"
                  : "bg-surface-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <textarea
          name="content"
          rows={2}
          required
          className={inputClass}
          placeholder="Add a note, email summary, DM, or call log..."
        />
        <button type="submit" disabled={isPending} className={primaryButtonClass}>
          {isPending ? "Adding..." : "Add entry"}
        </button>
      </form>
    </div>
  );
}
