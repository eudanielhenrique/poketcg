"use client";

import Link from "next/link";
import { useState } from "react";
import { useCollections } from "@/lib/storage";

export default function CollectionsPage() {
  const [collections, setCollections] = useCollections();
  const [name, setName] = useState("");
  const list = Object.values(collections);

  function createCollection() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    setCollections((prev) => ({ ...prev, [id]: { id, name: trimmed, cards: {} } }));
    setName("");
  }

  function deleteCollection(id: string) {
    setCollections((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Coleções</h1>
        <p className="mt-1 text-[15px] text-muted">
          Já vêm algumas coleções por geração de Pokédex. Abra uma e registre as cartas que você tem — ou crie a sua.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createCollection()}
          placeholder="Nome da nova coleção"
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-[15px] text-foreground placeholder:text-muted focus:border-border-strong focus:outline-none"
        />
        <button
          onClick={createCollection}
          className="rounded-xl bg-accent px-4 py-2.5 text-[15px] font-medium text-accent-foreground transition-transform duration-150 hover:bg-accent-hover active:scale-95"
        >
          Criar
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-[15px] text-muted">nenhuma coleção ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((collection) => (
            <li
              key={collection.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors duration-150 hover:border-border-strong active:scale-[0.99]"
            >
              <Link href={`/collection/${collection.id}`} className="min-w-0 flex-1 py-0.5">
                <p className="truncate font-medium text-foreground">{collection.name}</p>
                <p className="text-[13px] text-muted">
                  {Object.values(collection.cards).reduce((a, b) => a + b, 0)} cartas
                </p>
              </Link>
              <button
                onClick={() => deleteCollection(collection.id)}
                className="shrink-0 rounded-full px-2 py-1 text-[13px] text-danger/80 transition-colors hover:text-danger"
              >
                excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
