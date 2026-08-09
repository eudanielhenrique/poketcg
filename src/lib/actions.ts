"use server";

import { searchCards, getCard, getCardsBrief, searchSets, getSetCards, type CardDetail, type SetBrief } from "./tcgdex";

export async function searchCardsAction(query: string): Promise<CardDetail[]> {
  return searchCards(query);
}

export async function getCardAction(id: string): Promise<CardDetail | null> {
  return getCard(id);
}

export async function getCardsDetailAction(ids: string[]): Promise<CardDetail[]> {
  return getCardsBrief(ids);
}

export async function searchSetsAction(query: string): Promise<SetBrief[]> {
  return searchSets(query);
}

export async function getSetCardsAction(setId: string) {
  return getSetCards(setId);
}
