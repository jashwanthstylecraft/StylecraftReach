export function RankedBarList({ items }: { items: { label: string; value: number }[] }) {
  const top = items.slice(0, 5);
  const max = Math.max(...top.map((i) => i.value), 1);

  return (
    <div className="space-y-2">
      {top.map((item) => (
        <div key={item.label} className="flex items-center gap-3 text-xs">
          <span className="w-28 shrink-0 truncate text-text-secondary">{item.label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full bg-gold"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right font-mono text-text-primary">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
