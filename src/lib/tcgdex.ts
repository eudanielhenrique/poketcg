const API_BASE = "https://api.tcgdex.net/v2";
const LANG = "en"; // pt-br cobre ~1.1k das 23k+ cartas do en — usar en garante a base completa

export interface CardBrief {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

export interface CardPricing {
  cardmarket?: { trend?: number; avg30?: number; unit: string };
  tcgplayer?: {
    normal?: { marketPrice?: number };
    holofoil?: { marketPrice?: number };
    "reverse-holofoil"?: { marketPrice?: number };
    unit: string;
  };
}

export interface CardDetail extends CardBrief {
  category: "Pokemon" | "Trainer" | "Energy";
  illustrator?: string;
  rarity?: string;
  dexId?: number[];
  hp?: number;
  types?: string[];
  stage?: string;
  evolveFrom?: string;
  retreat?: number;
  attacks?: { name: string; cost?: string[]; damage?: string | number; effect?: string }[];
  weaknesses?: { type: string; value?: string }[];
  effect?: string;
  trainerType?: string;
  energyType?: string;
  set: { id: string; name: string; logo?: string; symbol?: string; cardCount?: { official: number; total: number } };
  variants_detailed?: { type: string; pricing?: CardPricing }[];
}

export function imageUrl(image: string | undefined, quality: "low" | "high" = "high") {
  return image ? `${image}/${quality}.webp` : undefined;
}

/** código impresso na carta, ex "4/102" — null quando a API não informa o total do set */
export function cardCode(card: Pick<CardDetail, "localId" | "set">): string | null {
  const total = card.set.cardCount?.official;
  return total ? `${card.localId}/${total}` : null;
}

/** heurística pra reconhecer um ID direto da TCGdex (ex "base1-4", "swsh3-136") em vez de um nome */
function looksLikeCardId(query: string): boolean {
  return query.includes("-") && /\d/.test(query) && !/\s/.test(query);
}

/** melhor preço de mercado disponível pra carta (USD tcgplayer > EUR cardmarket), null se sem dado */
export function bestPrice(card: Pick<CardDetail, "variants_detailed">): { value: number; unit: string } | null {
  for (const v of card.variants_detailed ?? []) {
    const tcg = v.pricing?.tcgplayer;
    const market =
      tcg?.normal?.marketPrice ?? tcg?.holofoil?.marketPrice ?? tcg?.["reverse-holofoil"]?.marketPrice;
    if (market) return { value: market, unit: tcg!.unit };
    const cm = v.pricing?.cardmarket;
    if (cm?.trend) return { value: cm.trend, unit: cm.unit };
  }
  return null;
}

export async function searchCards(query: string): Promise<CardBrief[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (looksLikeCardId(trimmed)) {
    const card = await getCard(trimmed);
    if (card) return [card];
  }

  const url = `${API_BASE}/${LANG}/cards?name=${encodeURIComponent(trimmed)}&pagination:itemsPerPage=30`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getCard(id: string): Promise<CardDetail | null> {
  const res = await fetch(`${API_BASE}/${LANG}/cards/${encodeURIComponent(id)}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getCardsBrief(ids: string[]): Promise<CardDetail[]> {
  const cards = await Promise.all(ids.map((id) => getCard(id)));
  return cards.filter((c): c is CardDetail => c !== null);
}
