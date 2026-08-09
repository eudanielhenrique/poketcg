"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getCardsDetailAction, getSetCardsAction } from "@/lib/actions";
import { bestPrice, formatPrice, type CardBrief, type CardDetail } from "@/lib/tcgdex";
import { pokedexRange } from "@/lib/pokedex";
import { CardThumb } from "@/components/CardThumb";
import { QuantityControl } from "@/components/QuantityControl";
import { SearchModal } from "@/components/SearchModal";
import { CardPreviewModal } from "@/components/CardPreviewModal";
import { ChecklistGrid, type ChecklistSlot } from "@/components/ChecklistGrid";
import { useCollections } from "@/lib/storage";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collections, setCollections] = useCollections();
  const [fetchedCards, setFetchedCards] = useState<CardDetail[]>([]);
  const [setRoster, setSetRoster] = useState<CardBrief[] | null>(null);
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

  useEffect(() => {
    if (!collection?.setId) return;
    getSetCardsAction(collection.setId).then((data) => setSetRoster(data?.cards ?? []));
  }, [collection?.setId]);

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
  const valueLabel = priceUnit ? formatPrice({ value: total, unit: priceUnit }) : null;

  const species = collection.generation ? pokedexRange(collection.generation) : [];
  const isSet = Boolean(collection.setId);

  const slots: ChecklistSlot[] = isSet
    ? (setRoster ?? []).map((c) => ({ key: c.id, label: c.name, badge: c.localId, seed: c.id }))
    : species.map((p) => ({ key: String(p.id), label: p.name, badge: `#${p.id}`, seed: p.name }));

  const getSlotKeys = isSet
    ? (card: CardDetail) => [card.id]
    : (card: CardDetail) => (card.dexId ?? []).map(String);

  const filterLower = filter.trim().toLowerCase();
  const visibleSlots = filterLower ? slots.filter((s) => s.label.toLowerCase().includes(filterLower)) : slots;
  const visibleCards = filterLower ? cards.filter((c) => c.name.toLowerCase().includes(filterLower)) : cards;
  const usesChecklist = species.length > 0 || isSet;
  const registeredCount = usesChecklist ? countRegistered(slots, cards, getSlotKeys) : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{collection.name}</h1>
          <p className="mt-1 text-[15px] text-muted">
            {isSet
              ? `${registeredCount}/${collection.setTotal ?? slots.length} cartas`
              : species.length > 0
                ? `${registeredCount}/${species.length} Pokémon registrados`
                : `${Object.values(collection.cards).reduce((a, b) => a + b, 0)} cartas registradas`}
          </p>
        </div>
        {valueLabel && (
          <p className="text-[15px] text-muted">
            valor estimado: <span className="font-medium text-success">{valueLabel}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {(usesChecklist || cards.length > 0) && (
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
              placeholder={isSet ? "Filtrar por nome da carta" : species.length > 0 ? "Filtrar por nome do Pokémon" : "Filtrar por nome da carta"}
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

      {usesChecklist ? (
        visibleSlots.length > 0 ? (
          <ChecklistGrid
            slots={visibleSlots}
            cards={cards}
            getSlotKeys={getSlotKeys}
            onPickEmpty={(slot) => setSearchQuery(slot.seed)}
            onQtyChange={setQty}
            qtyOf={(cardId) => collection.cards[cardId] ?? 0}
          />
        ) : (
          <p className="text-[15px] text-muted">nenhum resultado pra &ldquo;{filter}&rdquo;.</p>
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

function countRegistered(slots: ChecklistSlot[], cards: CardDetail[], getSlotKeys: (card: CardDetail) => string[]) {
  const ownedKeys = new Set<string>();
  for (const card of cards) for (const key of getSlotKeys(card)) ownedKeys.add(key);
  return slots.filter((s) => ownedKeys.has(s.key)).length;
}
