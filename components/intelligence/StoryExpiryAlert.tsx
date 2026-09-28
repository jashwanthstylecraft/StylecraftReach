"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { CapturedContentFull } from "@/lib/intelligence-data";

export function StoryExpiryAlert({ stories }: { stories: CapturedContentFull[] }) {
  const { showToast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (stories.length === 0 || dismissed) return null;

  function handleCaptureNow() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/cron/capture-stories", { method: "POST" });
        if (!res.ok) throw new Error();
        showToast("Story capture triggered", "success");
        setDismissed(true);
      } catch {
        showToast("Couldn't trigger capture — try again", "error");
      }
    });
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
      <span className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        {stories.length} {stories.length === 1 ? "story" : "stories"} expiring in the next 6 hours
      </span>
      <button
        onClick={handleCaptureNow}
        disabled={isPending}
        className="rounded-md border border-warning/40 px-3 py-1 text-xs font-medium hover:bg-warning/20 disabled:opacity-50"
      >
        {isPending ? "Capturing..." : "Capture now"}
      </button>
    </div>
  );
}
