"use server";

import { searchCards, getCard, getCardsBrief, type CardDetail } from "./tcgdex";

export async function searchCardsAction(query: string): Promise<CardDetail[]> {
  return searchCards(query);
}

export async function getCardAction(id: string): Promise<CardDetail | null> {
  return getCard(id);
}

export async function getCardsDetailAction(ids: string[]): Promise<CardDetail[]> {
  return getCardsBrief(ids);
}
