export function DistBars({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <p className="text-[13px] text-muted">—</p>;
  const max = Math.max(...entries.map(([, v]) => v));

  return (
    <div className="flex flex-col gap-1.5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="w-20 shrink-0 truncate text-[12px] text-muted">{key}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-strong">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
          <span className="w-5 shrink-0 text-right text-[12px] tabular-nums text-foreground/80">{value}</span>
        </div>
      ))}
    </div>
  );
}
