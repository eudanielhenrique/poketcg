import assert from "node:assert/strict";
import { guessSearchQuery } from "./scanCard.ts";

// nome + número, formato mais comum (cartas modernas)
assert.equal(guessSearchQuery("Basic Pokémon\nPikachu\n60 HP\n\n58/102\nCommon"), "Pikachu 58");

// só número reconhecido (nome ilegível/ruidoso no OCR)
assert.equal(guessSearchQuery("###\n4/102\nxx"), "4");

// só nome reconhecido (sem número no recorte)
assert.equal(guessSearchQuery("Charizard\nStage 2"), "Charizard");

// nada reconhecível — cai pra primeira linha não vazia
assert.equal(guessSearchQuery("123\n456"), "123");

// vazio
assert.equal(guessSearchQuery(""), "");

console.log("scanCard: ok");
