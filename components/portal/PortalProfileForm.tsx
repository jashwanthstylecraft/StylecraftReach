"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/Toast";
import { updateNotificationPrefs } from "@/lib/portal-actions";
import { PLATFORMS, type Influencer, type InfluencerNotificationPrefs, type Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-portal-border bg-portal-bg px-3 py-2 text-sm text-portal-text-primary placeholder:text-portal-text-secondary focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-portal-text-secondary";
const primaryButtonClass =
  "rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90 disabled:opacity-50";

export function PortalProfileForm({
  influencer,
  notificationPrefs,
}: {
  influencer: Influencer;
  notificationPrefs: InfluencerNotificationPrefs | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [handle, setHandle] = useState(influencer.handle);
  const [platform, setPlatform] = useState<Platform>(influencer.platform);
  const [niche, setNiche] = useState(influencer.niche ?? "");
  const [location, setLocation] = useState(influencer.location ?? "");
  const [bio, setBio] = useState(influencer.notes ?? "");
  const [email, setEmail] = useState(influencer.email ?? "");

  const [emailOnPayment, setEmailOnPayment] = useState(notificationPrefs?.email_on_payment ?? true);
  const [emailOnApproval, setEmailOnApproval] = useState(notificationPrefs?.email_on_approval ?? true);
  const [emailOnDeliverable, setEmailOnDeliverable] = useState(notificationPrefs?.email_on_deliverable ?? true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(notificationPrefs?.whatsapp_enabled ?? false);
  const [whatsappNumber, setWhatsappNumber] = useState(notificationPrefs?.whatsapp_number ?? "");

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, platform, niche, location, notes: bio, email }),
      });
      if (!res.ok) throw new Error();
      showToast("Profile updated", "success");
      router.refresh();
    } catch {
      showToast("Couldn't save profile", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleSaveNotifications() {
    startTransition(async () => {
      await updateNotificationPrefs({
        email_on_payment: emailOnPayment,
        email_on_approval: emailOnApproval,
        email_on_deliverable: emailOnDeliverable,
        whatsapp_number: whatsappEnabled ? whatsappNumber : null,
        whatsapp_enabled: whatsappEnabled,
      });
      showToast("Notification preferences saved", "success");
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-portal-border bg-portal-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-portal-text-secondary">Profile</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Handle</label>
            <input className={inputClass} value={handle} onChange={(e) => setHandle(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Platform</label>
            <div className="flex gap-1.5">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium",
                    platform === p
                      ? "border-gold/40 bg-gold/15 text-gold"
                      : "border-portal-border text-portal-text-secondary"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Niche</label>
            <input className={inputClass} value={niche} onChange={(e) => setNiche(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Contact email</label>
            <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <label className={labelClass}>Bio</label>
          <textarea className={inputClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <button onClick={handleSaveProfile} disabled={saving} className={cn(primaryButtonClass, "mt-3")}>
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>

      <div className="rounded-lg border border-portal-border bg-portal-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-portal-text-secondary">Notification preferences</h2>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emailOnPayment}
              onChange={(e) => setEmailOnPayment(e.target.checked)}
              className="accent-gold"
            />
            Email when payment is sent
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emailOnApproval}
              onChange={(e) => setEmailOnApproval(e.target.checked)}
              className="accent-gold"
            />
            Email when content is approved/rejected
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emailOnDeliverable}
              onChange={(e) => setEmailOnDeliverable(e.target.checked)}
              className="accent-gold"
            />
            Email when new deliverable is added
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={whatsappEnabled}
              onChange={(e) => setWhatsappEnabled(e.target.checked)}
              className="accent-gold"
            />
            WhatsApp alerts
          </label>
          {whatsappEnabled && (
            <input
              className={inputClass}
              placeholder="+1 555 555 5555"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
          )}
        </div>
        <button onClick={handleSaveNotifications} disabled={isPending} className={cn(primaryButtonClass, "mt-3")}>
          {isPending ? "Saving..." : "Save preferences"}
        </button>
      </div>
    </div>
  );
}
