import Image from "next/image";
import { notFound } from "next/navigation";
import { getCard, imageUrl, bestPrice } from "@/lib/tcgdex";
import { CardActions } from "@/components/CardActions";

const TYPE_COLORS: Record<string, string> = {
  Fire: "#ff6b4a",
  Water: "#4a9eff",
  Grass: "#5fd47a",
  Lightning: "#f0b429",
  Psychic: "#c77dff",
  Fighting: "#c76b3f",
  Darkness: "#7a7a8c",
  Metal: "#9ea7b3",
  Fairy: "#ff9ecf",
  Dragon: "#7a6bff",
  Colorless: "#b8b8bf",
};

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getCard(id);
  if (!card) notFound();

  const price = bestPrice(card);
  const src = imageUrl(card.image, "high");
  const glow = TYPE_COLORS[card.types?.[0] ?? ""] ?? "#f0b429";

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[300px_1fr]">
      <div className="relative mx-auto w-full max-w-[300px] md:mx-0">
        <div
          className="pointer-events-none absolute -inset-10 -z-10 rounded-full opacity-20 blur-3xl"
          style={{ background: glow }}
        />
        <div className="relative aspect-[5/7] w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6)]">
          {src && (
            <Image src={src} alt={card.name} fill sizes="300px" className="object-cover" unoptimized priority />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance">{card.name}</h1>
          <p className="mt-1.5 text-[15px] text-muted">
            {card.set.name} · {card.rarity ?? "raridade desconhecida"} · {card.category}
          </p>
        </div>

        {price && (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-success/25 bg-success/10 px-4 py-2">
            <span className="text-lg font-semibold tracking-tight text-success">{price.value.toFixed(2)}</span>
            <span className="text-[13px] text-success/70">{price.unit}</span>
          </div>
        )}

        {card.category === "Pokemon" && (
          <div className="flex flex-wrap gap-2">
            {card.hp && <Pill label="HP" value={String(card.hp)} />}
            {card.types?.map((t) => (
              <Pill key={t} label="Tipo" value={t} accent={TYPE_COLORS[t]} />
            ))}
            {card.stage && <Pill label="Estágio" value={card.stage} />}
            {typeof card.retreat === "number" && <Pill label="Recuo" value={String(card.retreat)} />}
          </div>
        )}

        {card.attacks && card.attacks.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-[13px] font-medium uppercase tracking-wide text-muted">Ataques</h2>
            {card.attacks.map((atk, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-medium text-foreground">{atk.name}</span>
                  {atk.damage && <span className="text-[15px] font-semibold tabular-nums text-accent">{atk.damage}</span>}
                </div>
                {atk.effect && <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{atk.effect}</p>}
              </div>
            ))}
          </div>
        )}

        {card.effect && (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="mb-1.5 text-[13px] font-medium uppercase tracking-wide text-muted">Efeito</h2>
            <p className="text-[13px] leading-relaxed text-foreground/90">{card.effect}</p>
          </div>
        )}

        <CardActions cardId={card.id} />
      </div>
    </div>
  );
}

function Pill({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5">
      {accent && <span className="h-2 w-2 rounded-full" style={{ background: accent }} />}
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
      <span className="text-[13px] font-medium text-foreground">{value}</span>
    </div>
  );
}
