"use client";

import { useEffect } from "react";
import { SearchBox } from "./SearchBox";
import type { CardBrief } from "@/lib/tcgdex";

export function SearchModal({
  open,
  initialQuery = "",
  title,
  onClose,
  onSelect,
}: {
  open: boolean;
  initialQuery?: string;
  title: string;
  onClose: () => void;
  onSelect: (card: CardBrief) => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[55] bg-background sm:flex sm:items-center sm:justify-center sm:bg-black/60 sm:p-6 sm:backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full flex-col gap-5 overflow-y-auto p-5 sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-3xl sm:border sm:border-border sm:bg-surface sm:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          <button
            onClick={onClose}
            aria-label="fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-strong text-muted transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>
        <SearchBox key={initialQuery} initialQuery={initialQuery} onSelect={onSelect} />
      </div>
    </div>
  );
}
