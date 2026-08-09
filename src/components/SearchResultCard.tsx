import Image from "next/image";
import Link from "next/link";
import type { CardDetail } from "@/lib/tcgdex";
import { imageUrl, cardCode, bestPrice, formatPrice } from "@/lib/tcgdex";
import { CardBackPlaceholder } from "./CardBackPlaceholder";

export function SearchResultCard({ card, onClick }: { card: CardDetail; onClick?: () => void }) {
  const src = imageUrl(card.image, "low");
  const code = cardCode(card);
  const price = bestPrice(card);
  const rarity = card.rarity && card.rarity !== "None" ? card.rarity : null;

  const inner = (
    <>
      <div
        className="relative aspect-[5/7] w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:border-border-strong group-hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.55)]"
      >
        {src ? (
          <Image
            src={src}
            alt={card.name}
            fill
            sizes="200px"
            className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            unoptimized
          />
        ) : (
          <CardBackPlaceholder label={`#${card.localId}`} />
        )}
      </div>
      <div className="mt-2 flex flex-col gap-0.5">
        <p className="truncate text-[13px] font-medium text-foreground/90">{card.name}</p>
        <p className="truncate text-[11px] text-muted">
          {card.set.name}
          {code && <span className="text-muted/70"> · {code}</span>}
        </p>
        {rarity && <p className="truncate text-[11px] text-muted/70">{rarity}</p>}
        {price && <p className="mt-0.5 text-[12px] font-medium text-success">{formatPrice(price)}</p>}
      </div>
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left active:scale-[0.98] transition-transform duration-150"
    >
      {inner}
    </button>
  ) : (
    <Link href={`/card/${card.id}`} className="group active:scale-[0.98] transition-transform duration-150">
      {inner}
    </Link>
  );
}
