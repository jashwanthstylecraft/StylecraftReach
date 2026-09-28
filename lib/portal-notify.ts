import "server-only";

export type PortalNotificationType =
  | "content_approved"
  | "content_needs_revision"
  | "new_deliverable"
  | "new_message";

// All four portal n8n workflows (docs/n8n-workflows.md) share one webhook URL
// and route internally on `type` via an n8n Switch node, rather than needing
// four separate env vars for what the brief called "no new API keys needed."
export function notifyPortal(type: PortalNotificationType, payload: Record<string, unknown>) {
  if (!process.env.N8N_PORTAL_WEBHOOK_URL) return;
  fetch(process.env.N8N_PORTAL_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...payload }),
  }).catch(() => {});
}
