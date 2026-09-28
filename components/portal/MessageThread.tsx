"use client";

import { useState } from "react";
import { formatDateTime, cn } from "@/lib/utils";
import type { PortalMessage } from "@/lib/types";

export function MessageThread({
  campaignInfluencerId,
  initialMessages,
  currentRole,
}: {
  campaignInfluencerId: string;
  initialMessages: PortalMessage[];
  currentRole: "brand" | "influencer";
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignInfluencerId, content: text.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, json.message]);
        setText("");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-lg border border-portal-border bg-portal-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-portal-text-secondary">Messages</h2>
      <div className="max-h-72 space-y-2 overflow-y-auto">
        {messages.length === 0 && <p className="text-sm text-portal-text-secondary">No messages yet.</p>}
        {messages.map((m) => {
          const isMine = m.sender_role === currentRole;
          return (
            <div key={m.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                  isMine ? "bg-gold/15 text-portal-text-primary" : "bg-portal-bg text-portal-text-primary"
                )}
              >
                <p className="text-[11px] font-medium text-portal-text-secondary">
                  {m.sender_role === "brand" ? "Stylecraft" : m.sender_name}
                </p>
                <p>{m.content}</p>
                <p className="mt-1 text-[10px] text-portal-text-secondary">{formatDateTime(m.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-portal-border bg-portal-bg px-3 py-2 text-sm text-portal-text-primary placeholder:text-portal-text-secondary focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
