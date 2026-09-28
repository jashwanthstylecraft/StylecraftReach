export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-surface-elevated" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded bg-surface-elevated" />
          <div className="h-3 w-1/2 rounded bg-surface-elevated" />
        </div>
      </div>
      <div className="mt-4 h-5 w-20 rounded bg-surface-elevated" />
      <div className="mt-3 h-3 w-full rounded bg-surface-elevated" />
      <div className="mt-2 h-3 w-3/4 rounded bg-surface-elevated" />
      <div className="mt-4 flex gap-2">
        <div className="h-7 flex-1 rounded-md bg-surface-elevated" />
        <div className="h-7 flex-1 rounded-md bg-surface-elevated" />
      </div>
    </div>
  );
}
