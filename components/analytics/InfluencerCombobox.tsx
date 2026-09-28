"use client";

import { useMemo, useState } from "react";
import { inputClass, labelClass } from "@/components/ui/Modal";
import type { CampaignInfluencerWithCampaign, CampaignInfluencerWithInfluencer } from "@/lib/types";

type Row = CampaignInfluencerWithInfluencer & CampaignInfluencerWithCampaign;

export function InfluencerCombobox({
  rows,
  value,
  onChange,
  listId,
}: {
  rows: Row[];
  value: string;
  onChange: (campaignInfluencerId: string) => void;
  listId: string;
}) {
  const [text, setText] = useState("");

  const labelToId = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((r) => map.set(`${r.influencer.handle} — ${r.campaign.name}`, r.id));
    return map;
  }, [rows]);

  const selectedRow = rows.find((r) => r.id === value);

  return (
    <div>
      <label className={labelClass}>Influencer</label>
      <input
        list={listId}
        className={inputClass}
        placeholder="Search by handle..."
        defaultValue={selectedRow ? `${selectedRow.influencer.handle} — ${selectedRow.campaign.name}` : ""}
        onChange={(e) => {
          setText(e.target.value);
          const id = labelToId.get(e.target.value);
          if (id) onChange(id);
        }}
      />
      <datalist id={listId}>
        {rows.map((r) => (
          <option key={r.id} value={`${r.influencer.handle} — ${r.campaign.name}`} />
        ))}
      </datalist>
      {text && !labelToId.has(text) && (
        <p className="mt-1 text-[11px] text-text-muted">Pick an exact match from the list.</p>
      )}
    </div>
  );
}
