"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload } from "lucide-react";
import { Modal, primaryButtonClass } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createInfluencer } from "@/lib/actions";
import type { Platform } from "@/lib/types";
import { PLATFORMS } from "@/lib/types";

interface ParsedRow {
  handle: string;
  platform: Platform;
  email: string | null;
  notes: string | null;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const handleIdx = header.indexOf("handle");
  const platformIdx = header.indexOf("platform");
  const emailIdx = header.indexOf("email");
  const notesIdx = header.indexOf("notes");
  if (handleIdx === -1) return [];

  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const platformRaw = platformIdx >= 0 ? cells[platformIdx] : "";
    const platform = (PLATFORMS.find((p) => p.toLowerCase() === platformRaw.toLowerCase()) ?? "Instagram") as Platform;
    return {
      handle: cells[handleIdx] ?? "",
      platform,
      email: emailIdx >= 0 ? cells[emailIdx] || null : null,
      notes: notesIdx >= 0 ? cells[notesIdx] || null : null,
    };
  }).filter((r) => r.handle);
}

export function ImportCreatorsModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setRows(parseCSV(text));
  }

  async function handleImport() {
    setImporting(true);
    try {
      for (const row of rows) {
        await createInfluencer({
          name: row.handle.replace(/^@/, ""),
          handle: row.handle.startsWith("@") ? row.handle : `@${row.handle}`,
          platform: row.platform,
          followers: null,
          email: row.email,
          location: null,
          niche: null,
          notes: row.notes,
          ai_score: null,
        });
      }
      showToast(`Imported ${rows.length} creator(s)`, "success");
      router.refresh();
      onClose();
    } finally {
      setImporting(false);
    }
  }

  return (
    <Modal title="Import creators" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-text-secondary">
          CSV with columns: <span className="font-mono">handle, platform, email, notes</span> (only <span className="font-mono">handle</span> is required).
        </p>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border py-6 text-sm text-text-secondary hover:border-gold/40">
          <Upload className="h-4 w-4" />
          {fileName || "Choose a CSV file"}
          <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
        </label>
        {rows.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-md border border-border p-2 text-xs scrollbar-thin">
            {rows.map((r, i) => (
              <p key={i} className="text-text-secondary">
                {r.handle} · {r.platform}
              </p>
            ))}
          </div>
        )}
        <button onClick={handleImport} disabled={importing || rows.length === 0} className={primaryButtonClass}>
          {importing ? "Importing..." : `Import ${rows.length} creator(s)`}
        </button>
      </div>
    </Modal>
  );
}
