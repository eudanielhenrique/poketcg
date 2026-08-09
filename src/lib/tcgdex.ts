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
  if (!image) return undefined;
  // URL completa (veio do fallback pokemontcg.io) — usa direto, sem o sufixo de qualidade da TCGdex
  if (/\.(png|jpe?g|webp)$/i.test(image)) return image;
  return `${image}/${quality}.webp`;
}

/**
 * Fallback pontual: quando a TCGdex não tem imagem pra uma carta, tenta achar a
 * mesma carta (mesmo ID — os esquemas de ID coincidem pra boa parte dos sets)
 * na pokemontcg.io. Melhor-esforço só — nunca lança, nunca atrasa a resposta
 * principal além de ~1.5s, e não cobre sets muito novos/nichados (a cobertura
 * de lá é menor que a da TCGdex pra esses casos).
 */
async function fetchFallbackImage(id: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://api.pokemontcg.io/v2/cards/${encodeURIComponent(id)}`, {
      signal: AbortSignal.timeout(1500),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data?.data?.images?.large ?? data?.data?.images?.small ?? undefined;
  } catch {
    return undefined;
  }
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

/** separa "Charizard 4/102" ou "Pikachu 58" em nome + número impresso na carta */
function parseNameAndLocalId(query: string): { name: string; localId?: string } {
  const match = query.match(/^(.*\S)\s+(\d+)(?:\/\d+)?$/);
  if (match) return { name: match[1], localId: match[2] };
  return { name: query };
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

/** formata preço no padrão brasileiro (ex "US$ 818,65"), moeda de acordo com a fonte do dado (USD/EUR) */
export function formatPrice(price: { value: number; unit: string }): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: price.unit }).format(price.value);
  } catch {
    return `${price.value.toFixed(2)} ${price.unit}`;
  }
}

const MAX_SEARCH_RESULTS = 20;

async function listByName(name: string, localId?: string): Promise<CardBrief[]> {
  const params = new URLSearchParams({ name, "pagination:itemsPerPage": String(MAX_SEARCH_RESULTS) });
  if (localId) params.set("localId", localId);
  const res = await fetch(`${API_BASE}/${LANG}/cards?${params}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return res.json();
}

export async function searchCards(query: string): Promise<CardDetail[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (looksLikeCardId(trimmed)) {
    const card = await getCard(trimmed);
    return card ? [card] : [];
  }

  const { name, localId } = parseNameAndLocalId(trimmed);
  const briefs = await listByName(name, localId);
  // "Pikachu 58/102" com número que não bate em nenhuma carta — cai pro nome sem filtrar em vez de ficar vazio
  const chosen = briefs.length > 0 || !localId ? briefs : await listByName(name);

  return getCardsBrief(chosen.map((b) => b.id));
}

export async function getCard(id: string): Promise<CardDetail | null> {
  const res = await fetch(`${API_BASE}/${LANG}/cards/${encodeURIComponent(id)}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const card: CardDetail = await res.json();

  if (!card.image) {
    const fallback = await fetchFallbackImage(id);
    if (fallback) card.image = fallback;
  }

  return card;
}

export async function getCardsBrief(ids: string[]): Promise<CardDetail[]> {
  const cards = await Promise.all(ids.map((id) => getCard(id)));
  return cards.filter((c): c is CardDetail => c !== null);
}
