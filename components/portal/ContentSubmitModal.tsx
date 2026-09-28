"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const inputClass =
  "w-full rounded-md border border-portal-border bg-portal-bg px-3 py-2 text-sm text-portal-text-primary placeholder:text-portal-text-secondary focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-portal-text-secondary";
const primaryButtonClass =
  "w-full rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90 disabled:opacity-50";

export function ContentSubmitModal({
  deliverableId,
  campaignInfluencerId,
  description,
  onClose,
}: {
  deliverableId: string;
  campaignInfluencerId: string;
  description: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      setError("Paste a URL to your content");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/submit-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverableId,
          campaignInfluencerId,
          submittedUrl: url.trim(),
          caption,
          notes,
        }),
      });
      if (!res.ok) throw new Error();
      showToast("Content submitted for review", "success");
      router.refresh();
      onClose();
    } catch {
      setError("Couldn't submit — try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Submit content — ${description}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Content URL</label>
          <input
            className={inputClass}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instagram.com/reel/..."
          />
        </div>
        <div>
          <label className={labelClass}>Caption</label>
          <textarea
            className={inputClass}
            rows={2}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="The caption you used or plan to use"
          />
        </div>
        <div>
          <label className={labelClass}>Notes for the brand team</label>
          <textarea
            className={inputClass}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Submitting..." : "Submit for review"}
        </button>
      </form>
    </Modal>
  );
}
