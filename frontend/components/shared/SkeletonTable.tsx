"use client";

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card p-4">
      <div className="mb-4 grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-muted" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
