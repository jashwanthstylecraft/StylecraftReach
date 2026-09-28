"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateTime, cn } from "@/lib/utils";
import type { PortalMessage } from "@/lib/types";
import type { InvitationRow } from "@/lib/campaigns-data";

export function ChatsTab({ rows }: { rows: InvitationRow[] }) {
  const [activeId, setActiveId] = useState<string | null>(rows[0]?.id ?? null);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    fetch(`/api/portal/messages?campaignInfluencerId=${activeId}`)
      .then((res) => res.json())
      .then((json) => setMessages(json.messages ?? []))
      .finally(() => setLoading(false));
  }, [activeId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    setSending(true);
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignInfluencerId: activeId, content: text.trim() }),
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

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface py-12 text-center text-sm text-text-secondary">
        No influencers in this campaign yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-surface md:grid-cols-[240px_1fr]">
      <div className="divide-y divide-border border-r border-border">
        {rows.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveId(r.id)}
            className={cn(
              "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm",
              activeId === r.id ? "bg-surface-elevated text-text-primary" : "text-text-secondary hover:bg-surface-elevated"
            )}
          >
            <Avatar name={r.influencer.name} src={r.influencer.avatar_url} size="sm" />
            <div className="min-w-0">
              <p className="truncate">{r.influencer.name}</p>
              <p className="truncate font-mono text-xs text-text-muted">{r.influencer.handle}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col p-4">
        <div className="max-h-96 flex-1 space-y-2 overflow-y-auto scrollbar-thin">
          {loading && <p className="text-sm text-text-secondary">Loading...</p>}
          {!loading && messages.length === 0 && <p className="text-sm text-text-secondary">No messages yet.</p>}
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.sender_role === "brand" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                  m.sender_role === "brand" ? "bg-gold/15 text-text-primary" : "bg-surface-elevated text-text-primary"
                )}
              >
                <p className="text-[11px] font-medium text-text-secondary">{m.sender_role === "brand" ? "Stylecraft" : m.sender_name}</p>
                <p>{m.content}</p>
                <p className="mt-1 text-[10px] text-text-muted">{formatDateTime(m.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="mt-3 flex gap-2 border-t border-border pt-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
          />
          <button type="submit" disabled={sending} className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90 disabled:opacity-50">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
