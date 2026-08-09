import Image from "next/image";
import Link from "next/link";
import type { CardBrief } from "@/lib/tcgdex";
import { imageUrl } from "@/lib/tcgdex";
import { CardBackPlaceholder } from "./CardBackPlaceholder";

export function CardThumb({
  card,
  children,
  onClick,
}: {
  card: CardBrief;
  children?: React.ReactNode;
  /** quando informado, o thumbnail vira um botão (abre modal de preview) em vez de navegar pra /card/[id] */
  onClick?: () => void;
}) {
  const src = imageUrl(card.image, "low");

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
      <p className="mt-2 truncate text-[13px] font-medium text-foreground/90">{card.name}</p>
    </>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {onClick ? (
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
      )}
      {children}
    </div>
  );
}
