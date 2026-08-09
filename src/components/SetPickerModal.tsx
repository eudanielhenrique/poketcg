"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { searchSetsAction } from "@/lib/actions";
import type { SetBrief } from "@/lib/tcgdex";

export function SetPickerModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (set: SetBrief) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SetBrief[]>([]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) return;
    const timeout = setTimeout(() => {
      searchSetsAction(query).then(setResults);
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

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
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Acompanhar set</h2>
          <button
            onClick={onClose}
            aria-label="fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-strong text-muted transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome do set (ex: Base Set, Evolving Skies)"
          className="w-full rounded-2xl border border-border bg-surface py-3.5 px-4 text-base text-foreground placeholder:text-muted transition-colors duration-200 focus:border-border-strong focus:outline-none"
        />

        {query.trim() && results.length === 0 && <p className="text-[15px] text-muted">nenhum set encontrado.</p>}

        <ul className="flex flex-col gap-2">
          {results.map((set) => (
            <li key={set.id}>
              <button
                onClick={() => onSelect(set)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left transition-colors duration-150 hover:border-border-strong active:scale-[0.99]"
              >
                {set.logo ? (
                  <div className="relative h-8 w-14 shrink-0">
                    <Image src={`${set.logo}.png`} alt={set.name} fill sizes="56px" className="object-contain" unoptimized />
                  </div>
                ) : (
                  <div className="h-8 w-14 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{set.name}</p>
                  {set.cardCount && <p className="text-[13px] text-muted">{set.cardCount.official} cartas</p>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
