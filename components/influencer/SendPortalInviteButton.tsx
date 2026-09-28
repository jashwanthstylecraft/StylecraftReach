"use client";

import { useState } from "react";
import { Send, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function SendPortalInviteButton({
  influencerId,
  influencerEmail,
  alreadyLinked,
}: {
  influencerId: string;
  influencerEmail: string | null;
  alreadyLinked: boolean;
}) {
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (alreadyLinked) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-success">
        <UserCheck className="h-3.5 w-3.5" />
        Portal account linked
      </span>
    );
  }

  async function handleInvite() {
    if (!influencerEmail) {
      showToast("Add an email address before inviting", "error");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/invite-influencer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencerId, email: influencerEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send invite");
      setSent(true);
      showToast(`Portal invite sent to ${influencerEmail}`, "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't send invite", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <button
      onClick={handleInvite}
      disabled={sending || sent}
      className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-elevated hover:text-text-primary disabled:opacity-50"
    >
      <Send className="h-3.5 w-3.5" />
      {sent ? "Invite sent" : sending ? "Sending..." : "Send portal invite"}
    </button>
  );
}
