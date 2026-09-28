"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { simulateOnboardingComplete } from "@/lib/payments-actions";
import { PLATFORMS, type Influencer, type Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-portal-border bg-portal-bg px-3 py-2 text-sm text-portal-text-primary placeholder:text-portal-text-secondary focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-portal-text-secondary";
const primaryButtonClass =
  "w-full rounded-md bg-gold px-4 py-2.5 text-sm font-medium text-background hover:bg-gold/90 disabled:opacity-50";

export function OnboardingWizard({
  influencer,
  mockMode,
}: {
  influencer: Influencer;
  mockMode: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  const [handle, setHandle] = useState(influencer.handle);
  const [platform, setPlatform] = useState<Platform>(influencer.platform);
  const [niche, setNiche] = useState(influencer.niche ?? "");
  const [location, setLocation] = useState(influencer.location ?? "");
  const [bio, setBio] = useState(influencer.notes ?? "");

  const displayName = influencer.name.split(" ")[0];

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, platform, niche, location, notes: bio }),
      });
      if (!res.ok) throw new Error();
      setStep(3);
    } catch {
      showToast("Couldn't save your profile — try again", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleSimulateConnect() {
    startTransition(async () => {
      await simulateOnboardingComplete(influencer.id);
      showToast("Bank account connected (mock)", "success");
      setStep(4);
    });
  }

  async function handleConnectStripe() {
    const res = await fetch("/api/stripe/onboarding-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ influencerId: influencer.id }),
    });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 flex gap-1.5">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn("h-1.5 flex-1 rounded-full", s <= step ? "bg-gold" : "bg-portal-border")}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-semibold">Welcome to StylecraftReach, {displayName}!</h1>
          <p className="text-sm text-portal-text-secondary">
            You&apos;ve been invited to collaborate with StylecraftUS. Complete your profile to get
            started.
          </p>
          <button onClick={() => setStep(2)} className={primaryButtonClass}>
            Let&apos;s go →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Tell us about yourself</h2>
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
            <label className={labelClass}>Bio</label>
            <textarea className={inputClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className={primaryButtonClass}>
            {saving ? "Saving..." : "Continue →"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 text-center">
          <h2 className="text-lg font-semibold">Get paid directly to your bank</h2>
          <p className="text-sm text-portal-text-secondary">
            Connect your bank account to receive payments.
          </p>
          {mockMode ? (
            <button onClick={handleSimulateConnect} disabled={isPending} className={primaryButtonClass}>
              {isPending ? "Connecting..." : "Connect with Stripe (mock) →"}
            </button>
          ) : (
            <button onClick={handleConnectStripe} className={primaryButtonClass}>
              Connect with Stripe →
            </button>
          )}
          <p className="text-xs text-portal-text-secondary">Required to receive payments.</p>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-portal-success" />
          <h2 className="text-lg font-semibold">You&apos;re all set!</h2>
          <p className="text-sm text-portal-text-secondary">
            Your campaigns are ready. Let&apos;s make some content.
          </p>
          <button onClick={() => router.push("/portal")} className={primaryButtonClass}>
            Go to dashboard →
          </button>
        </div>
      )}
    </div>
  );
}
