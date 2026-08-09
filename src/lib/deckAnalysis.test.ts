import assert from "node:assert/strict";
import { analyzeDeck } from "./deckAnalysis.ts";
import type { CardDetail } from "./tcgdex.ts";

const cards: CardDetail[] = [
  {
    id: "a",
    localId: "1",
    name: "A",
    category: "Pokemon",
    types: ["Fire"],
    hp: 100,
    retreat: 2,
    set: { id: "s", name: "S" },
    variants_detailed: [{ type: "normal", pricing: { tcgplayer: { normal: { marketPrice: 1.5 }, unit: "USD" } } }],
  },
  {
    id: "b",
    localId: "2",
    name: "B",
    category: "Trainer",
    set: { id: "s", name: "S" },
  },
];

const result = analyzeDeck(cards, { a: 3, b: 2 });
assert.equal(result.totalCards, 5);
assert.equal(result.byCategory.Pokemon, 3);
assert.equal(result.byCategory.Trainer, 2);
assert.equal(result.byType.Fire, 3);
assert.equal(result.avgHp, 100);
assert.equal(result.retreatCurve["2"], 3);
assert.equal(result.totalPrice, 4.5);
console.log("deckAnalysis: ok");
