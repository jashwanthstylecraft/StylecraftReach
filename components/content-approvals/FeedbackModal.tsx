"use client";

import { useState } from "react";
import { Modal, inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";

export function FeedbackModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (feedback: string) => Promise<void>;
}) {
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(feedback.trim());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Request changes" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>What needs to change?</label>
          <textarea
            className={inputClass}
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. Please re-film with better lighting and mention the promo code."
          />
        </div>
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Sending..." : "Send feedback"}
        </button>
      </form>
    </Modal>
  );
}
