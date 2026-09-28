"use client";

import { useState, useTransition } from "react";
import { Modal, inputClass, labelClass, primaryButtonClass } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { logCampaignEmails } from "@/lib/campaign-emails-actions";
import type { EmailTemplateKind } from "@/lib/campaign-detail-types";
import type { Influencer } from "@/lib/types";

const TEMPLATES: Record<EmailTemplateKind, { subject: string; body: string }> = {
  invitation: {
    subject: "Partnership opportunity with {{brand}}",
    body: "Hi {{influencer_name}},\n\nWe'd love to partner with you on our {{campaign_name}} campaign.\n\nInterested? Reply to this email and we'll send over the full brief.",
  },
  reminder: {
    subject: "Following up — {{campaign_name}} partnership",
    body: "Hi {{influencer_name}},\n\nJust following up on our partnership opportunity for {{campaign_name}}. We'd love to hear from you!",
  },
  custom: { subject: "", body: "" },
};

function mergeTags(text: string, influencer: Influencer, campaignName: string) {
  return text.replace(/{{influencer_name}}/g, influencer.name).replace(/{{campaign_name}}/g, campaignName).replace(/{{brand}}/g, "Stylecraft");
}

export function SendMailsModal({
  recipients,
  campaignName,
  onClose,
}: {
  recipients: { campaignInfluencerId: string; influencer: Influencer }[];
  campaignName: string;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [template, setTemplate] = useState<EmailTemplateKind>("invitation");
  const [subject, setSubject] = useState(TEMPLATES.invitation.subject);
  const [body, setBody] = useState(TEMPLATES.invitation.body);
  const [sending, setSending] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleTemplateChange(next: EmailTemplateKind) {
    setTemplate(next);
    setSubject(TEMPLATES[next].subject);
    setBody(TEMPLATES[next].body);
  }

  function handleSend() {
    setSending(true);
    startTransition(async () => {
      await logCampaignEmails(
        recipients.map((r) => ({
          campaignInfluencerId: r.campaignInfluencerId,
          subject: mergeTags(subject, r.influencer, campaignName),
          body: mergeTags(body, r.influencer, campaignName),
        })),
        template
      );
      showToast(
        `Logged ${recipients.length} email(s) — no email provider is connected yet, so nothing was actually delivered`,
        "success"
      );
      setSending(false);
      onClose();
    });
  }

  return (
    <Modal title={`Send mails to ${recipients.length} influencer(s)`} onClose={onClose}>
      <div className="space-y-3">
        <div className="rounded-md border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning">
          No email provider is connected — this logs what would be sent as an audit trail, it does not deliver a real email.
        </div>
        <div>
          <label className={labelClass}>Template</label>
          <div className="flex gap-1.5">
            {(Object.keys(TEMPLATES) as EmailTemplateKind[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTemplateChange(t)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${template === t ? "bg-gold/15 text-gold" : "text-text-secondary"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Subject</label>
          <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Body</label>
          <textarea
            className={inputClass}
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-text-muted">
            Merge tags: {"{{influencer_name}}"}, {"{{campaign_name}}"}, {"{{brand}}"}
          </p>
        </div>
        <button onClick={handleSend} disabled={sending || isPending} className={primaryButtonClass}>
          {sending ? "Sending..." : `Send to ${recipients.length}`}
        </button>
      </div>
    </Modal>
  );
}
