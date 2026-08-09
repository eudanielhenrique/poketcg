"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { GENERATION_RANGES } from "./pokedex";

export interface CardGroup {
  id: string;
  name: string;
  cards: Record<string, number>;
  /** só presente nas coleções pré-prontas por geração — dispara a visão de checklist de Pokédex */
  generation?: number;
  /** só presente em coleções de "Sets" — id do set na TCGdex, dispara a visão de checklist do set */
  setId?: string;
  /** total de cartas oficiais do set, capturado na criação (evita reconsultar toda hora) */
  setTotal?: number;
}

export type CardGroups = Record<string, CardGroup>;

export type Deck = CardGroup;
export type Decks = CardGroups;
export type NamedCollection = CardGroup;
export type Collections = CardGroups;

export const DECKS_KEY = "poketcg:decks";
export const COLLECTIONS_KEY = "poketcg:collections";
const COLLECTIONS_SEEDED_KEY = "poketcg:collections:seeded";

/** Coleções pré-prontas por geração de Pokédex — já vêm com todos os Pokémon da geração; a pessoa só escolhe qual carta tem de cada um. */
function defaultCollections(): Collections {
  const result: Collections = {};
  for (const [gen, range] of Object.entries(GENERATION_RANGES)) {
    const id = `gen-${gen}`;
    result[id] = { id, name: range.label, cards: {}, generation: Number(gen) };
  }
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
