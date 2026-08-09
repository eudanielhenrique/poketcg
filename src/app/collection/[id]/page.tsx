"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getCardsDetailAction } from "@/lib/actions";
import { bestPrice, type CardDetail } from "@/lib/tcgdex";
import { CardThumb } from "@/components/CardThumb";
import { QuantityControl } from "@/components/QuantityControl";
import { SearchBox } from "@/components/SearchBox";
import { useCollections } from "@/lib/storage";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collections, setCollections] = useCollections();
  const [fetchedCards, setFetchedCards] = useState<CardDetail[]>([]);

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{collection.name}</h1>
          <p className="mt-1 text-[15px] text-muted">
            {Object.values(collection.cards).reduce((a, b) => a + b, 0)} cartas registradas
          </p>
        </div>
        {cards.length > 0 && (
          <p className="text-[15px] text-muted">
            valor estimado: <span className="font-medium text-success">{total.toFixed(2)} {priceUnit}</span>
          </p>
        )}
      </div>

      {cards.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cards.map((card) => (
            <CardThumb key={card.id} card={card}>
              <QuantityControl qty={collection.cards[card.id] ?? 0} onChange={(next) => setQty(card.id, next)} />
            </CardThumb>
          ))}
        </div>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium tracking-tight text-foreground">Registrar carta</h2>
        <SearchBox
          renderActions={(card) => (
            <button
              onClick={() => addCard(card.id)}
              className="w-full rounded-xl bg-surface-strong py-1.5 text-[13px] font-medium text-foreground transition-all duration-150 hover:bg-border-strong active:scale-95"
            >
              + registrar
            </button>
          )}
        />
      </section>
    </div>
  );
}
