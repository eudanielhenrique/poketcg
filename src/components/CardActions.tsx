"use client";

import Link from "next/link";
import { useState } from "react";
import { useCollections, useDecks } from "@/lib/storage";

export function CardActions({ cardId }: { cardId: string }) {
  const [collections, setCollections] = useCollections();
  const [decks, setDecks] = useDecks();
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedDeck, setSelectedDeck] = useState("");
  const [justAddedTo, setJustAddedTo] = useState<string | null>(null);

  const collectionList = Object.values(collections);
  const deckList = Object.values(decks);

  function flashAdded(label: string) {
    setJustAddedTo(label);
    setTimeout(() => setJustAddedTo(null), 1600);
  }

  function addToCollection() {
    if (!selectedCollection) return;
    setCollections((prev) => ({
      ...prev,
      [selectedCollection]: {
        ...prev[selectedCollection],
        cards: { ...prev[selectedCollection].cards, [cardId]: (prev[selectedCollection].cards[cardId] ?? 0) + 1 },
      },
    }));
    flashAdded(collections[selectedCollection]?.name ?? "coleção");
  }

  function addToDeck() {
    if (!selectedDeck) return;
    setDecks((prev) => ({
      ...prev,
      [selectedDeck]: {
        ...prev[selectedDeck],
        cards: { ...prev[selectedDeck].cards, [cardId]: (prev[selectedDeck].cards[cardId] ?? 0) + 1 },
      },
    }));
    flashAdded(decks[selectedDeck]?.name ?? "deck");
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      {justAddedTo && (
        <p className="text-[13px] font-medium text-success">✓ adicionada a &ldquo;{justAddedTo}&rdquo;</p>
      )}

      <PickerRow
        label="Coleção"
        emptyHref="/collection"
        emptyLabel="ver coleções"
        items={collectionList}
        value={selectedCollection}
        onChange={setSelectedCollection}
        onAdd={addToCollection}
      />

      <PickerRow
        label="Deck"
        emptyHref="/decks"
        emptyLabel="criar um deck"
        items={deckList}
        value={selectedDeck}
        onChange={setSelectedDeck}
        onAdd={addToDeck}
      />
    </div>
  );
}

function PickerRow({
  label,
  items,
  value,
  onChange,
  onAdd,
  emptyHref,
  emptyLabel,
}: {
  label: string;
  items: { id: string; name: string }[];
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  emptyHref: string;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-[13px] text-muted">
        nenhum{label === "Deck" ? " deck" : "a coleção"} ainda —{" "}
        <Link href={emptyHref} className="text-accent underline decoration-accent/40 underline-offset-2">
          {emptyLabel}
        </Link>
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-xl border border-border bg-background/60 px-3 py-2 text-[13px] text-foreground transition-colors focus:border-border-strong"
      >
        <option value="">{label}…</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <button
        onClick={onAdd}
        disabled={!value}
        className="rounded-xl bg-surface-strong px-3.5 py-2 text-[13px] font-medium text-foreground transition-all duration-150 hover:bg-border-strong active:scale-95 disabled:opacity-30"
      >
        + adicionar
      </button>
    </div>
  );
}
