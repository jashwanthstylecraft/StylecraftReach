"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Copy, Mail } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { simulateOnboardingComplete } from "@/lib/payments-actions";
import { formatDate } from "@/lib/utils";

export function StripeOnboardingBanner({
  influencerId,
  influencerName,
  influencerEmail,
  onboarded,
  onboardedAt,
  mockMode,
}: {
  influencerId: string;
  influencerName: string;
  influencerEmail: string | null;
  onboarded: boolean;
  onboardedAt: string | null;
  mockMode: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [fetchingLink, setFetchingLink] = useState(false);

  async function handleCopyLink() {
    setFetchingLink(true);
    try {
      const res = await fetch("/api/stripe/onboarding-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencerId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create onboarding link");
      await navigator.clipboard.writeText(json.url);
      showToast("Onboarding link copied", "success");
    } catch {
      showToast("Couldn't create onboarding link", "error");
    } finally {
      setFetchingLink(false);
    }
  }

  function handleSimulate() {
    startTransition(async () => {
      await simulateOnboardingComplete(influencerId);
      showToast(`${influencerName} is now onboarded (mock)`, "success");
      router.refresh();
    });
  }

  if (onboarded) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>
          Bank account connected · Payouts enabled
          {onboardedAt && <span className="ml-2 text-text-muted">Since {formatDate(onboardedAt)}</span>}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
      <div className="flex items-start gap-2 text-sm text-warning">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{influencerName} hasn&apos;t connected their bank account yet.</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={handleCopyLink}
          disabled={fetchingLink}
          className="flex items-center gap-1.5 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary disabled:opacity-50"
        >
          <Copy className="h-3.5 w-3.5" />
          {fetchingLink ? "Creating link..." : "Copy onboarding link"}
        </button>
        {influencerEmail && (
          <a
            href={`mailto:${influencerEmail}?subject=${encodeURIComponent(
              "Connect your account to get paid — StylecraftUS"
            )}&body=${encodeURIComponent(
              `Hi ${influencerName},\n\nConnect your bank account so we can send your payments:\n(copy the onboarding link above and paste it here)\n\nThanks,\nStylecraftUS`
            )}`}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
          >
            <Mail className="h-3.5 w-3.5" />
            Send via email
          </a>
        )}
        {mockMode && (
          <button
            onClick={handleSimulate}
            disabled={isPending}
            className="rounded-md border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-gold hover:bg-gold/20 disabled:opacity-50"
          >
            {isPending ? "Simulating..." : "Simulate onboarding complete (mock)"}
          </button>
        )}
      </div>
    </div>
  );
}
