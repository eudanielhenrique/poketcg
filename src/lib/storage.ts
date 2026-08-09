"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export interface CardGroup {
  id: string;
  name: string;
  cards: Record<string, number>;
}

export type CardGroups = Record<string, CardGroup>;

export type Deck = CardGroup;
export type Decks = CardGroups;
export type NamedCollection = CardGroup;
export type Collections = CardGroups;

export const DECKS_KEY = "poketcg:decks";
export const COLLECTIONS_KEY = "poketcg:collections";
const COLLECTIONS_SEEDED_KEY = "poketcg:collections:seeded";

/** Coleções pré-prontas por geração de Pokédex — pontos de partida, não listas fechadas: a pessoa registra ali qualquer carta que tiver do Pokémon correspondente. */
const GENERATION_PRESETS = [
  { name: "Geração 1 — Kanto (#1–151)" },
  { name: "Geração 2 — Johto (#152–251)" },
  { name: "Geração 3 — Hoenn (#252–386)" },
  { name: "Geração 4 — Sinnoh (#387–493)" },
  { name: "Geração 5 — Unova (#494–649)" },
  { name: "Geração 6 — Kalos (#650–721)" },
  { name: "Geração 7 — Alola (#722–809)" },
  { name: "Geração 8 — Galar (#810–905)" },
  { name: "Geração 9 — Paldea (#906–1025)" },
];

function defaultCollections(): Collections {
  const result: Collections = {};
  GENERATION_PRESETS.forEach((gen, i) => {
    const id = `gen-${i + 1}`;
    result[id] = { id, name: gen.name, cards: {} };
  });
  return result;
}

type Listener = () => void;
const listeners = new Set<Listener>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readCached<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  const value = raw ? (JSON.parse(raw) as T) : fallback;
  cache.set(key, { raw, value });
  return value;
}

function writeCached<T>(key: string, next: T) {
  window.localStorage.setItem(key, JSON.stringify(next));
  cache.set(key, { raw: window.localStorage.getItem(key), value: next });
  notify();
}

/**
 * Estado sincronizado com localStorage via useSyncExternalStore: servidor não
 * tem acesso a localStorage, então o snapshot do servidor é o fallback, e o
 * valor real chega no primeiro render do cliente sem efeito manual nem
 * mismatch de hidratação.
 */
export function useLocalState<T>(key: string, fallback: T) {
  const getClientSnapshot = useCallback(() => readCached(key, fallback), [key, fallback]);
  const getServerSnapshot = useCallback(() => fallback, [fallback]);
  const value = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const prev = readCached(key, fallback);
      const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
      writeCached(key, next);
    },
    [key, fallback]
  );

  return [value, setValue] as const;
}

const EMPTY_GROUPS: CardGroups = {};

export function useDecks() {
  return useLocalState<Decks>(DECKS_KEY, EMPTY_GROUPS);
}

/** Como useDecks, mas semeia as coleções por geração uma única vez, na primeira vez que o app roda neste navegador. */
export function useCollections() {
  const result = useLocalState<Collections>(COLLECTIONS_KEY, EMPTY_GROUPS);

  useEffect(() => {
    if (window.localStorage.getItem(COLLECTIONS_SEEDED_KEY)) return;
    window.localStorage.setItem(COLLECTIONS_SEEDED_KEY, "1");
    if (Object.keys(readCached(COLLECTIONS_KEY, EMPTY_GROUPS)).length === 0) {
      writeCached(COLLECTIONS_KEY, defaultCollections());
    }
  }, []);

  return result;
}
