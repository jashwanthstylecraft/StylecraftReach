"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { AlertTriangle, Camera, CheckCircle2, Music2, PlaySquare, RefreshCw, X } from "lucide-react";
import { disconnectSocialAccount, syncTikTokConnection } from "@/lib/social-actions";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { SocialConnection, SocialPlatform } from "@/lib/affable-types";

const PLATFORM_META: Record<SocialPlatform, { label: string; icon: typeof Camera }> = {
  instagram: { label: "Instagram", icon: Camera },
  tiktok: { label: "TikTok", icon: Music2 },
  youtube: { label: "YouTube", icon: PlaySquare },
};

const ERROR_MESSAGES: Record<string, string> = {
  not_configured: "This platform's OAuth app isn't registered yet — no client ID/secret is configured in this environment.",
  oauth_not_implemented: "Credentials are configured, but the OAuth handshake for this platform hasn't been built yet.",
  oauth_denied: "The connection was cancelled or denied.",
  oauth_state_mismatch: "The connection request expired or didn't match — please try again.",
  oauth_exchange_failed: "TikTok rejected the connection request — check the app's client secret and redirect URI.",
};

export function SocialAccountsClient({
  connections,
  configured,
}: {
  connections: SocialConnection[];
  configured: Record<SocialPlatform, boolean>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const errorPlatform = searchParams.get("platform") as SocialPlatform | null;
  const errorCode = searchParams.get("error");
  const connectedPlatform = searchParams.get("connected") as SocialPlatform | null;

  function handleDisconnect(id: string) {
    startTransition(async () => {
      await disconnectSocialAccount(id);
      router.refresh();
    });
  }

  function handleSync(id: string) {
    startTransition(async () => {
      await syncTikTokConnection(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {connectedPlatform && (
        <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{PLATFORM_META[connectedPlatform].label} connected — pulling in real account stats now.</span>
        </div>
      )}
      {errorCode && errorPlatform && (
        <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>{PLATFORM_META[errorPlatform].label}:</strong> {ERROR_MESSAGES[errorCode] ?? "Connection failed."}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(Object.keys(PLATFORM_META) as SocialPlatform[]).map((platform) => {
          const meta = PLATFORM_META[platform];
          const Icon = meta.icon;
          const platformConnections = connections.filter((c) => c.platform === platform);

          return (
            <div key={platform} className="rounded-lg border border-border bg-surface p-5">
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-5 w-5 text-text-secondary" />
                <p className="font-medium text-text-primary">{meta.label}</p>
              </div>

              {platformConnections.length === 0 ? (
                <>
                  <p className="mb-3 text-xs text-text-secondary">No account connected.</p>
                  <a
                    href={`/api/social/connect/${platform}`}
                    className="inline-block w-full rounded-md border border-border px-3 py-1.5 text-center text-xs font-medium text-text-secondary hover:text-text-primary"
                  >
                    Connect {meta.label}
                  </a>
                  {!configured[platform] && (
                    <p className="mt-2 text-[11px] text-text-muted">
                      Requires {platform === "instagram" ? "META_APP_ID/SECRET" : platform === "tiktok" ? "TIKTOK_CLIENT_KEY/SECRET, ENCRYPTION_KEY, NEXT_PUBLIC_APP_URL" : "GOOGLE_CLIENT_ID/SECRET"} to be set.
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  {platformConnections.map((c) => (
                    <div key={c.id} className="rounded-md border border-border px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          {c.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 shrink-0 rounded-full bg-surface-elevated" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm text-text-primary">{c.account_name ?? c.account_id}</p>
                            <p className="truncate text-[11px] text-text-muted">
                              {c.last_synced_at ? `synced ${formatDateTime(c.last_synced_at)}` : `connected ${formatDate(c.connected_at)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {platform === "tiktok" && (
                            <button
                              onClick={() => handleSync(c.id)}
                              disabled={isPending}
                              title="Sync now"
                              className="text-text-muted hover:text-text-primary disabled:opacity-50"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button onClick={() => handleDisconnect(c.id)} disabled={isPending} className="text-text-muted hover:text-danger">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {(c.followers !== null || c.likes_count !== null || c.video_count !== null) && (
                        <div className="mt-2 flex gap-3 border-t border-border pt-2 text-[11px] text-text-secondary">
                          {c.followers !== null && <span>{c.followers.toLocaleString()} followers</span>}
                          {c.likes_count !== null && <span>{c.likes_count.toLocaleString()} likes</span>}
                          {c.video_count !== null && <span>{c.video_count.toLocaleString()} videos</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
