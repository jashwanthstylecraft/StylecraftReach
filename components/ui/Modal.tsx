"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none";

export const labelClass = "mb-1 block text-xs font-medium text-text-secondary";

export const primaryButtonClass =
  "w-full rounded-md bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold/90 disabled:opacity-50";

export const secondaryButtonClass =
  "rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated";
