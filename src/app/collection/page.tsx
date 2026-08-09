"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCollections, type CardGroup } from "@/lib/storage";
import { getCardsDetailAction } from "@/lib/actions";
import { bestPrice, formatPrice, type CardDetail, type SetBrief } from "@/lib/tcgdex";
import { pokedexRange } from "@/lib/pokedex";
import { ProgressBar } from "@/components/ProgressBar";
import { SetPickerModal } from "@/components/SetPickerModal";

type Tab = "pokedex" | "sets" | "cartas";

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useCollections();
  const [tab, setTab] = useState<Tab>("pokedex");
  const [name, setName] = useState("");
  const [setPickerOpen, setSetPickerOpen] = useState(false);
  const [detailsById, setDetailsById] = useState<Record<string, CardDetail>>({});

  const list = useMemo(() => Object.values(collections), [collections]);
  const pokedexList = useMemo(
    () => list.filter((c) => c.generation != null).sort((a, b) => a.generation! - b.generation!),
    [list]
  );
  const setsList = useMemo(() => list.filter((c) => c.setId != null), [list]);
  const cartasList = useMemo(() => list.filter((c) => c.generation == null && c.setId == null), [list]);

  const allCardIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of list) for (const id of Object.keys(c.cards)) ids.add(id);
    return Array.from(ids);
  }, [list]);
  const allCardIdsKey = allCardIds.join(",");

  useEffect(() => {
    if (!allCardIdsKey) return;
    getCardsDetailAction(allCardIdsKey.split(",")).then((cards) => {
      const map: Record<string, CardDetail> = {};
      for (const c of cards) map[c.id] = c;
      setDetailsById(map);
    });
  }, [allCardIdsKey]);

  function cardsOf(collection: CardGroup): CardDetail[] {
    return Object.keys(collection.cards)
      .map((id) => detailsById[id])
      .filter((c): c is CardDetail => Boolean(c));
  }

  function valueOf(collection: CardGroup) {
    let total = 0;
    let unit: string | undefined;
    for (const card of cardsOf(collection)) {
      const price = bestPrice(card);
      if (price) {
        total += price.value * (collection.cards[card.id] ?? 0);
        unit = unit ?? price.unit;
      }
    }
    return unit ? formatPrice({ value: total, unit }) : null;
  }

  function speciesProgress(collection: CardGroup) {
    const species = pokedexRange(collection.generation!);
    const owned = new Set<number>();
    for (const card of cardsOf(collection)) for (const dex of card.dexId ?? []) owned.add(dex);
    return { value: species.filter((p) => owned.has(p.id)).length, total: species.length };
  }

  function createCartaCollection() {
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

  function selectSet(set: SetBrief) {
    const existing = setsList.find((c) => c.setId === set.id);
    setSetPickerOpen(false);
    if (existing) {
      router.push(`/collection/${existing.id}`);
      return;
    }
    const id = crypto.randomUUID();
    setCollections((prev) => ({
      ...prev,
      [id]: { id, name: set.name, cards: {}, setId: set.id, setTotal: set.cardCount?.official ?? 0 },
    }));
    router.push(`/collection/${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Coleção</h1>
        <p className="mt-1 text-[15px] text-muted">
          Pokédex é &ldquo;tenho pelo menos uma carta desse Pokémon&rdquo;. Sets é &ldquo;tenho esta impressão
          específica&rdquo;. Cartas são suas listas livres.
        </p>
      </div>

      <div className="flex gap-1 rounded-2xl border border-border bg-surface p-1">
        <TabButton active={tab === "pokedex"} onClick={() => setTab("pokedex")}>
          Pokédex
        </TabButton>
        <TabButton active={tab === "sets"} onClick={() => setTab("sets")}>
          Sets
        </TabButton>
        <TabButton active={tab === "cartas"} onClick={() => setTab("cartas")}>
          Cartas
        </TabButton>
      </div>

      {tab === "pokedex" && (
        <ul className="flex flex-col gap-2">
          {pokedexList.map((collection) => {
            const progress = speciesProgress(collection);
            const value = valueOf(collection);
            return (
              <li key={collection.id}>
                <Link
                  href={`/collection/${collection.id}`}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-surface px-4 py-3.5 transition-colors duration-150 hover:border-border-strong active:scale-[0.99]"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate font-medium text-foreground">{collection.name}</p>
                    {value && <span className="shrink-0 text-[13px] font-medium text-success">{value}</span>}
                  </div>
                  <ProgressBar value={progress.value} total={progress.total} />
                  <p className="text-[12px] text-muted">
                    {progress.value}/{progress.total} Pokémon
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {tab === "sets" && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setSetPickerOpen(true)}
            className="rounded-2xl bg-accent px-4 py-3 text-[15px] font-medium text-accent-foreground transition-transform duration-150 active:scale-95"
          >
            + Acompanhar set
          </button>

          {setsList.length === 0 ? (
            <p className="text-[15px] text-muted">nenhum set acompanhado ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {setsList.map((collection) => {
                const total = collection.setTotal ?? 0;
                const value = valueOf(collection);
                return (
                  <li
                    key={collection.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors duration-150 hover:border-border-strong active:scale-[0.99]"
                  >
                    <Link href={`/collection/${collection.id}`} className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate font-medium text-foreground">{collection.name}</p>
                        {value && <span className="shrink-0 text-[13px] font-medium text-success">{value}</span>}
                      </div>
                      <div className="mt-1.5">
                        <ProgressBar value={Object.keys(collection.cards).length} total={total} />
                      </div>
                      <p className="mt-1 text-[12px] text-muted">
                        {Object.keys(collection.cards).length}/{total} cartas
                      </p>
                    </Link>
                    <button
                      onClick={() => deleteCollection(collection.id)}
                      className="shrink-0 rounded-full px-2 py-1 text-[13px] text-danger/80 transition-colors hover:text-danger"
                    >
                      excluir
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {tab === "cartas" && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCartaCollection()}
              placeholder="Nome da nova coleção"
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-base text-foreground placeholder:text-muted focus:border-border-strong focus:outline-none"
            />
            <button
              onClick={createCartaCollection}
              className="rounded-xl bg-accent px-4 py-2.5 text-[15px] font-medium text-accent-foreground transition-transform duration-150 hover:bg-accent-hover active:scale-95"
            >
              Criar
            </button>
          </div>

          {cartasList.length === 0 ? (
            <p className="text-[15px] text-muted">nenhuma coleção ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {cartasList.map((collection) => (
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
      )}

      {setPickerOpen && <SetPickerModal onClose={() => setSetPickerOpen(false)} onSelect={selectSet} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl py-2 text-[13px] font-medium transition-colors duration-150 ${
        active ? "bg-surface-strong text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
