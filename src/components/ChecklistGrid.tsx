import { useMemo } from "react";
import { CardThumb } from "./CardThumb";
import { QuantityControl } from "./QuantityControl";
import type { CardDetail } from "@/lib/tcgdex";

export interface ChecklistSlot {
  /** identifica o slot (nº da Pokédex como string, ou o id exato da carta no caso de um set) */
  key: string;
  label: string;
  badge: string;
  /** o que pré-preencher na busca ao tocar num slot vazio */
  seed: string;
}

export function ChecklistGrid({
  slots,
  cards,
  getSlotKeys,
  onPickEmpty,
  onQtyChange,
  qtyOf,
}: {
  slots: ChecklistSlot[];
  cards: CardDetail[];
  /** de quais slots essa carta é uma resposta válida (dexIds como string, ou o próprio id da carta) */
  getSlotKeys: (card: CardDetail) => string[];
  onPickEmpty: (slot: ChecklistSlot) => void;
  onQtyChange: (cardId: string, qty: number) => void;
  qtyOf: (cardId: string) => number;
}) {
  const bySlot = useMemo(() => {
    const map = new Map<string, CardDetail>();
    for (const card of cards) {
      for (const key of getSlotKeys(card)) map.set(key, card);
    }
    return map;
  }, [cards, getSlotKeys]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {slots.map((slot) => {
        const card = bySlot.get(slot.key);
        if (card) {
          return (
            <CardThumb key={slot.key} card={card}>
              <QuantityControl qty={qtyOf(card.id)} onChange={(next) => onQtyChange(card.id, next)} />
            </CardThumb>
          );
        }
        return (
          <button
            key={slot.key}
            onClick={() => onPickEmpty(slot)}
            className="flex flex-col gap-2.5 text-left active:scale-[0.98] transition-transform duration-150"
          >
            <div className="flex aspect-[5/7] w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-surface/40 transition-colors duration-200 hover:border-border-strong hover:bg-surface">
              <span className="text-[11px] tabular-nums text-muted">{slot.badge}</span>
              <span className="text-accent">+</span>
            </div>
            <p className="truncate text-[13px] text-muted">{slot.label}</p>
          </button>
        );
      })}
    </div>
  );
}
