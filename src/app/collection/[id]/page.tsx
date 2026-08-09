"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getCardsDetailAction } from "@/lib/actions";
import { bestPrice, type CardBrief, type CardDetail } from "@/lib/tcgdex";
import { pokedexRange, type PokedexEntry } from "@/lib/pokedex";
import { CardThumb } from "@/components/CardThumb";
import { QuantityControl } from "@/components/QuantityControl";
import { SearchModal } from "@/components/SearchModal";
import { CardPreviewModal } from "@/components/CardPreviewModal";
import { useCollections } from "@/lib/storage";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collections, setCollections] = useCollections();
  const [fetchedCards, setFetchedCards] = useState<CardDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<CardBrief | null>(null);
  const [filter, setFilter] = useState("");

  const collection = collections[id];
  const cardIds = useMemo(() => Object.keys(collection?.cards ?? {}), [collection]);
  const cardIdsKey = cardIds.join(",");

  useEffect(() => {
    if (!cardIdsKey) return;
    getCardsDetailAction(cardIdsKey.split(",")).then(setFetchedCards);
  }, [cardIdsKey]);

  const groupCards = collection?.cards;
  const cards = useMemo(
    () => fetchedCards.filter((c) => groupCards && c.id in groupCards),
    [fetchedCards, groupCards]
  );

  function setQty(cardId: string, qty: number) {
    setCollections((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const nextCards = { ...current.cards };
      if (qty <= 0) delete nextCards[cardId];
      else nextCards[cardId] = qty;
      return { ...prev, [id]: { ...current, cards: nextCards } };
    });
  }

  function addCard(cardId: string) {
    setCollections((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: { ...current, cards: { ...current.cards, [cardId]: (current.cards[cardId] ?? 0) + 1 } },
      };
    });
  }

  if (!collection) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted">coleção não encontrada.</p>
        <Link href="/collection" className="text-accent underline underline-offset-2">
          voltar
        </Link>
      </div>
    );
  }

  const total = cards.reduce((sum, card) => {
    const price = bestPrice(card);
    return sum + (price ? price.value * (collection.cards[card.id] ?? 0) : 0);
  }, 0);
  const priceUnit = cards.map(bestPrice).find(Boolean)?.unit;
  const species = collection.generation ? pokedexRange(collection.generation) : [];
  const filterLower = filter.trim().toLowerCase();
  const visibleSpecies = filterLower ? species.filter((p) => p.name.toLowerCase().includes(filterLower)) : species;
  const visibleCards = filterLower ? cards.filter((c) => c.name.toLowerCase().includes(filterLower)) : cards;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{collection.name}</h1>
          <p className="mt-1 text-[15px] text-muted">
            {species.length > 0
              ? `${countRegistered(species, cards)}/${species.length} Pokémon registrados`
              : `${Object.values(collection.cards).reduce((a, b) => a + b, 0)} cartas registradas`}
          </p>
        </div>
        {cards.length > 0 && (
          <p className="text-[15px] text-muted">
            valor estimado: <span className="font-medium text-success">{total.toFixed(2)} {priceUnit}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {(species.length > 0 || cards.length > 0) && (
          <div className="relative flex-1">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            >
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M18 18l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={species.length > 0 ? "Filtrar por nome do Pokémon" : "Filtrar por nome da carta"}
              className="w-full rounded-2xl border border-border bg-surface py-3 pl-11 pr-4 text-base text-foreground placeholder:text-muted transition-colors duration-200 focus:border-border-strong focus:outline-none"
            />
          </div>
        )}
        <button
          onClick={() => setSearchQuery("")}
          className="shrink-0 rounded-2xl bg-accent px-4 py-3 text-[15px] font-medium text-accent-foreground transition-transform duration-150 active:scale-95"
        >
          + Registrar
        </button>
      </div>

      {species.length > 0 ? (
        visibleSpecies.length > 0 ? (
          <PokedexGrid
            species={visibleSpecies}
            cards={cards}
            onPickEmpty={setSearchQuery}
            onQtyChange={setQty}
            qtyOf={(cardId) => collection.cards[cardId] ?? 0}
          />
        ) : (
          <p className="text-[15px] text-muted">nenhum Pokémon encontrado pra &ldquo;{filter}&rdquo;.</p>
        )
      ) : (
        cards.length > 0 &&
        (visibleCards.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {visibleCards.map((card) => (
              <CardThumb key={card.id} card={card}>
                <QuantityControl qty={collection.cards[card.id] ?? 0} onChange={(next) => setQty(card.id, next)} />
              </CardThumb>
            ))}
          </div>
        ) : (
          <p className="text-[15px] text-muted">nenhuma carta encontrada pra &ldquo;{filter}&rdquo;.</p>
        ))
      )}

      <SearchModal
        open={searchQuery !== null}
        initialQuery={searchQuery ?? ""}
        title="Registrar carta"
        onClose={() => setSearchQuery(null)}
        onSelect={(card) => {
          setSearchQuery(null);
          setPreviewCard(card);
        }}
      />

      <CardPreviewModal
        card={previewCard}
        onClose={() => setPreviewCard(null)}
        confirmLabel="Registrar nesta coleção"
        onConfirm={(card) => {
          addCard(card.id);
          setPreviewCard(null);
        }}
      />
    </div>
  );
}

function countRegistered(species: PokedexEntry[], cards: CardDetail[]) {
  const owned = new Set<number>();
  for (const card of cards) {
    for (const dex of card.dexId ?? []) owned.add(dex);
  }
  return species.filter((p) => owned.has(p.id)).length;
}

function PokedexGrid({
  species,
  cards,
  onPickEmpty,
  onQtyChange,
  qtyOf,
}: {
  species: PokedexEntry[];
  cards: CardDetail[];
  onPickEmpty: (name: string) => void;
  onQtyChange: (cardId: string, qty: number) => void;
  qtyOf: (cardId: string) => number;
}) {
  const byDex = useMemo(() => {
    const map = new Map<number, CardDetail>();
    for (const card of cards) {
      for (const dex of card.dexId ?? []) map.set(dex, card);
    }
    return map;
  }, [cards]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {species.map((p) => {
        const card = byDex.get(p.id);
        if (card) {
          return (
            <CardThumb key={p.id} card={card}>
              <QuantityControl qty={qtyOf(card.id)} onChange={(next) => onQtyChange(card.id, next)} />
            </CardThumb>
          );
        }
        return (
          <button
            key={p.id}
            onClick={() => onPickEmpty(p.name)}
            className="flex flex-col gap-2.5 text-left active:scale-[0.98] transition-transform duration-150"
          >
            <div className="flex aspect-[5/7] w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-surface/40 transition-colors duration-200 hover:border-border-strong hover:bg-surface">
              <span className="text-[11px] tabular-nums text-muted">#{p.id}</span>
              <span className="text-accent">+</span>
            </div>
            <p className="truncate text-[13px] text-muted">{p.name}</p>
          </button>
        );
      })}
    </div>
  );
}
