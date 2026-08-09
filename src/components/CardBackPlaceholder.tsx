export function CardBackPlaceholder({ label }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1a1330] via-[#0f0a1f] to-[#080611]">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent/40">
        <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-accent/40" />
        <span className="h-3.5 w-3.5 rounded-full border-2 border-accent/40 bg-[#0f0a1f]" />
      </div>
      {label && <span className="text-[11px] tabular-nums text-white/40">{label}</span>}
    </div>
  );
}
