"use client";

import { useState } from "react";
import { SearchBox } from "./SearchBox";
import { CardPreviewModal } from "./CardPreviewModal";
import { getCardAction } from "@/lib/actions";
import { generationForDexId, GENERATION_RANGES } from "@/lib/pokedex";
import { useCollections } from "@/lib/storage";
import type { CardBrief } from "@/lib/tcgdex";

/**
 * Busca da home: selecionar uma carta não pede "em qual coleção?" — a home
 * não tem uma coleção "atual" (diferente de estar dentro de uma coleção
 * específica, onde o alvo já é óbvio). Em vez disso, descobre a geração do
 * Pokémon pelo dexId e registra direto na Pokédex certa.
 */
export function QuickRegisterSearch() {
  const [, setCollections] = useCollections();
  const [previewCard, setPreviewCard] = useState<CardBrief | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function flash(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleConfirm(card: CardBrief) {
    setPreviewCard(null);
    const detail = await getCardAction(card.id);
    const dexId = detail?.dexId?.[0];
    const generation = dexId != null ? generationForDexId(dexId) : null;

    if (!generation) {
      flash(`"${card.name}" não é um Pokémon de uma geração conhecida — registre pela página da carta.`);
      return;
    }

    const collectionId = `gen-${generation}`;
    setCollections((prev) => {
      const current = prev[collectionId];
      if (!current) return prev;
      return {
        ...prev,
        [collectionId]: { ...current, cards: { ...current.cards, [card.id]: (current.cards[card.id] ?? 0) + 1 } },
      };
    });
    const generationName = GENERATION_RANGES[generation].label.split(" (")[0];
    flash(`✓ Adicionado à ${generationName}.`);
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchBox onSelect={setPreviewCard} />

      {message && (
        <p className="rounded-2xl border border-success/25 bg-success/10 px-4 py-3 text-[13px] font-medium text-success">
          {message}
        </p>
      )}

      <CardPreviewModal
        card={previewCard}
        onClose={() => setPreviewCard(null)}
        confirmLabel="Registrar"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
