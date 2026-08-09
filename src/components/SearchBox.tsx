"use client";

import { useEffect, useState } from "react";
import { searchCardsAction } from "@/lib/actions";
import type { CardBrief } from "@/lib/tcgdex";
import { CardThumb } from "./CardThumb";

export function SearchBox({
  renderActions,
  placeholder = "Buscar carta por nome (ex: Pikachu)",
  initialQuery = "",
}: {
  renderActions?: (card: CardBrief) => React.ReactNode;
  placeholder?: string;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CardBrief[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");

  useEffect(() => {
    if (!query.trim()) return;
    const timeout = setTimeout(() => {
      searchCardsAction(query).then((data) => {
        setResults(data);
        setSearchedQuery(query);
      });
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  const trimmed = query.trim();
  const loading = trimmed !== "" && trimmed !== searchedQuery.trim();
  const visibleResults = trimmed ? results : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        >
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M18 18l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-border bg-surface py-3.5 pl-11 pr-4 text-base text-foreground placeholder:text-muted transition-colors duration-200 focus:border-border-strong focus:outline-none"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-[1.5px] border-muted/40 border-t-accent" />
        )}
      </div>

      {visibleResults.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {visibleResults.map((card, i) => (
            <div
              key={card.id}
              className="animate-[card-in_0.35s_cubic-bezier(0.16,1,0.3,1)_backwards]"
              style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
            >
              <CardThumb card={card}>{renderActions?.(card)}</CardThumb>
            </div>
          ))}
        </div>
      )}
      {!loading && trimmed && visibleResults.length === 0 && (
        <p className="text-[15px] text-muted">nenhuma carta encontrada.</p>
      )}
    </div>
  );
}
