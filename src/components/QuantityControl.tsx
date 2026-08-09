"use client";

export function QuantityControl({
  qty,
  onChange,
}: {
  qty: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-full border border-border bg-surface p-1">
      <button
        onClick={() => onChange(qty - 1)}
        className="flex h-6 w-6 items-center justify-center rounded-full text-foreground/80 transition-all duration-150 hover:bg-surface-strong hover:text-foreground active:scale-90"
        aria-label="diminuir"
      >
        −
      </button>
      <span className="w-5 text-center text-[13px] tabular-nums text-foreground">{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        className="flex h-6 w-6 items-center justify-center rounded-full text-foreground/80 transition-all duration-150 hover:bg-surface-strong hover:text-foreground active:scale-90"
        aria-label="aumentar"
      >
        +
      </button>
    </div>
  );
}
