import { bestPrice, type CardDetail } from "./tcgdex.ts";

export interface DeckAnalysis {
  totalCards: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  avgHp: number | null;
  retreatCurve: Record<string, number>;
  totalPrice: number;
  priceUnit: string | null;
}

/** cards: detalhes únicos das cartas; quantities: cardId -> qtd no deck */
export function analyzeDeck(cards: CardDetail[], quantities: Record<string, number>): DeckAnalysis {
  const byCategory: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const retreatCurve: Record<string, number> = {};
  let totalCards = 0;
  let hpSum = 0;
  let hpCount = 0;
  let totalPrice = 0;
  let priceUnit: string | null = null;

  for (const card of cards) {
    const qty = quantities[card.id] ?? 0;
    if (qty <= 0) continue;
    totalCards += qty;
    byCategory[card.category] = (byCategory[card.category] ?? 0) + qty;

    for (const type of card.types ?? []) {
      byType[type] = (byType[type] ?? 0) + qty;
    }

    if (card.category === "Pokemon") {
      if (typeof card.hp === "number") {
        hpSum += card.hp * qty;
        hpCount += qty;
      }
      const retreat = card.retreat ?? 0;
      const bucket = retreat >= 3 ? "3+" : String(retreat);
      retreatCurve[bucket] = (retreatCurve[bucket] ?? 0) + qty;
    }

    const price = bestPrice(card);
    if (price) {
      totalPrice += price.value * qty;
      priceUnit = priceUnit ?? price.unit;
    }
  }

  return {
    totalCards,
    byCategory,
    byType,
    avgHp: hpCount > 0 ? hpSum / hpCount : null,
    retreatCurve,
    totalPrice,
    priceUnit,
  };
}

