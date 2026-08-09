import { SearchBox } from "@/components/SearchBox";
import { CardThumb } from "@/components/CardThumb";
import { getCardsBrief, bestPrice, type CardDetail } from "@/lib/tcgdex";

/** clássicos raros com dado de preço real na TCGdex — não é "mais procurada" (não temos analytics de busca), é preço de mercado de fato, ordenado do mais alto pro mais baixo */
const FEATURED_IDS = [
  "ecard3-146", // Charizard — Skyridge
  "swsh7-215", // Umbreon VMAX (alt art) — Evolving Skies
  "base1-4", // Charizard — Base Set
  "base4-4", // Charizard — Base Set 2
  "base5-4", // Dark Charizard — Team Rocket
  "base1-2", // Blastoise — Base Set
  "neo1-9", // Lugia — Neo Genesis
  "base1-15", // Venusaur — Base Set
];

export default async function Home() {
  const featuredCards = await getCardsBrief(FEATURED_IDS);
  const featured = featuredCards
    .map((card) => ({ card, price: bestPrice(card) }))
    .filter((f): f is { card: CardDetail; price: { value: number; unit: string } } => f.price !== null)
    .sort((a, b) => b.price.value - a.price.value);

  return (
    <div className="flex flex-col gap-10">
      <div className="max-w-xl">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground text-balance">
          Busque qualquer carta
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Veja detalhes, preço de mercado e registre na sua coleção ou num deck.
        </p>
      </div>

      <SearchBox />

      {featured.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-medium tracking-tight text-foreground">Cartas em destaque</h2>
            <p className="text-[13px] text-muted">clássicos raros, do preço de mercado mais alto pro mais baixo</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featured.map(({ card, price }) => (
              <CardThumb key={card.id} card={card}>
                <p className="text-[13px] font-medium text-success">
                  {price.value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  <span className="ml-1 text-[11px] text-success/70">{price.unit}</span>
                </p>
              </CardThumb>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
