"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getCardsDetailAction } from "@/lib/actions";
import type { CardBrief, CardDetail } from "@/lib/tcgdex";
import { analyzeDeck } from "@/lib/deckAnalysis";
import { CardThumb } from "@/components/CardThumb";
import { QuantityControl } from "@/components/QuantityControl";
import { SearchModal } from "@/components/SearchModal";
import { DistBars } from "@/components/DistBars";
import { CardPreviewModal } from "@/components/CardPreviewModal";
import { useDecks } from "@/lib/storage";

export default function DeckPage() {
  const { id } = useParams<{ id: string }>();
  const [decks, setDecks] = useDecks();
  const [fetchedCards, setFetchedCards] = useState<CardDetail[]>([]);
  const [previewCard, setPreviewCard] = useState<CardBrief | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const deck = decks[id];
  const cardIds = useMemo(() => Object.keys(deck?.cards ?? {}), [deck]);
  const cardIdsKey = cardIds.join(",");

  useEffect(() => {
    if (!cardIdsKey) return;
    getCardsDetailAction(cardIdsKey.split(",")).then(setFetchedCards);
  }, [cardIdsKey]);

  const deckCards = deck?.cards;
  const cards = useMemo(
    () => fetchedCards.filter((c) => deckCards && c.id in deckCards),
    [fetchedCards, deckCards]
  );

  function setQty(cardId: string, qty: number) {
    setDecks((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const nextCards = { ...current.cards };
      if (qty <= 0) delete nextCards[cardId];
      else nextCards[cardId] = qty;
      return { ...prev, [id]: { ...current, cards: nextCards } };
    });
  }

  function addCard(cardId: string) {
    setDecks((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: { ...current, cards: { ...current.cards, [cardId]: (current.cards[cardId] ?? 0) + 1 } },
      };
    });
  }

  if (!deck) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted">deck não encontrado.</p>
        <Link href="/decks" className="text-accent underline underline-offset-2">
          voltar
        </Link>
      </div>
    );
  }

  const analysis = analyzeDeck(cards, deck.cards);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{deck.name}</h1>
        <p className="mt-1 text-[15px] text-muted">{analysis.totalCards} cartas</p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Por categoria">
          <DistBars data={analysis.byCategory} />
        </StatTile>
        <StatTile label="Por tipo">
          <DistBars data={analysis.byType} />
        </StatTile>
        <StatTile label="Curva de recuo">
          <DistBars data={analysis.retreatCurve} />
        </StatTile>
        <div className="flex flex-col gap-3">
          <StatTile label="HP médio" compact>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {analysis.avgHp ? analysis.avgHp.toFixed(0) : "—"}
            </p>
          </StatTile>
          <StatTile label="Preço estimado" compact>
            <p className="text-2xl font-semibold tracking-tight text-success">
              {analysis.priceUnit ? `${analysis.totalPrice.toFixed(2)}` : "—"}
              {analysis.priceUnit && <span className="ml-1 text-sm text-success/70">{analysis.priceUnit}</span>}
            </p>
          </StatTile>
        </div>
      </section>

      {cards.length > 0 && (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cards.map((card) => (
            <CardThumb key={card.id} card={card}>
              <QuantityControl qty={deck.cards[card.id] ?? 0} onChange={(next) => setQty(card.id, next)} />
            </CardThumb>
          ))}
        </section>
      )}

      <button
        onClick={() => setSearchOpen(true)}
        className="rounded-2xl bg-accent px-4 py-3 text-[15px] font-medium text-accent-foreground transition-transform duration-150 active:scale-95"
      >
        + Adicionar cartas
      </button>

      <SearchModal
        open={searchOpen}
        title="Adicionar cartas"
        onClose={() => setSearchOpen(false)}
        onSelect={(card) => {
          setSearchOpen(false);
          setPreviewCard(card);
        }}
      />

      <CardPreviewModal
        card={previewCard}
        onClose={() => setPreviewCard(null)}
        confirmLabel="Adicionar ao deck"
        onConfirm={(card) => {
          addCard(card.id);
          setPreviewCard(null);
        }}
      />
    </div>
  );
}

function StatTile({
  label,
  children,
  compact,
}: {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-surface ${compact ? "flex-1 p-4" : "p-4"}`}>
      <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      {children}
    </div>
  );
}
