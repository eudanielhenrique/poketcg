"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCardAction } from "@/lib/actions";
import { bestPrice, cardCode, imageUrl, type CardBrief, type CardDetail } from "@/lib/tcgdex";

export function CardPreviewModal({
  card,
  onClose,
  onConfirm,
  confirmLabel,
}: {
  /** null = modal fechado */
  card: CardBrief | null;
  onClose: () => void;
  onConfirm: (card: CardBrief) => void;
  confirmLabel: string;
}) {
  const [detail, setDetail] = useState<CardDetail | null>(null);

  useEffect(() => {
    if (!card) return;
    getCardAction(card.id).then(setDetail);
  }, [card]);

  // ignora um detail de uma carta anterior enquanto o novo fetch não chega
  const resolvedDetail = detail?.id === card?.id ? detail : null;

  useEffect(() => {
    if (!card) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, onClose]);

  if (!card) return null;

  const src = imageUrl((resolvedDetail ?? card).image, "high");
  const price = resolvedDetail ? bestPrice(resolvedDetail) : null;
  const code = resolvedDetail ? cardCode(resolvedDetail) : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-sm flex-col gap-4 rounded-t-3xl border border-border bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-16px_48px_rgba(0,0,0,0.5)] sm:rounded-3xl sm:pb-5 sm:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight text-foreground">{card.name}</p>
            <p className="text-[13px] text-muted">
              {resolvedDetail
                ? `${resolvedDetail.set.name} · ${resolvedDetail.rarity ?? "raridade desconhecida"}`
                : "carregando…"}
              {code && <span className="ml-1.5 font-mono text-muted/70">#{code}</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-strong text-muted transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="relative mx-auto aspect-[5/7] w-40 overflow-hidden rounded-2xl border border-border bg-background/40">
          {src ? (
            <Image src={src} alt={card.name} fill sizes="160px" className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 px-3 text-center text-muted">
              <span className="text-xs">sem imagem</span>
              <span className="text-[11px] tabular-nums text-muted/70">#{card.localId}</span>
            </div>
          )}
        </div>

        {price && (
          <p className="mx-auto text-[15px] font-medium text-success">
            {price.value.toFixed(2)} <span className="text-success/70">{price.unit}</span>
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onConfirm(card)}
            className="rounded-xl bg-accent py-3 text-[15px] font-medium text-accent-foreground transition-transform duration-150 active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
          <Link
            href={`/card/${card.id}`}
            className="rounded-xl py-2 text-center text-[13px] text-muted transition-colors hover:text-foreground"
          >
            Ver carta completa
          </Link>
        </div>
      </div>
    </div>
  );
}
