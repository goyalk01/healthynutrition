export function HabitTracker({
  name,
  progress,
}: {
  name: string;
  progress: number;
}) {
  const widthClass =
    progress >= 100
      ? "w-full"
      : progress >= 90
        ? "w-[90%]"
        : progress >= 80
          ? "w-[80%]"
          : progress >= 70
            ? "w-[70%]"
            : progress >= 60
              ? "w-[60%]"
              : progress >= 50
                ? "w-1/2"
                : progress >= 40
                  ? "w-[40%]"
                  : progress >= 30
                    ? "w-[30%]"
                    : progress >= 20
                      ? "w-[20%]"
                      : progress >= 10
                        ? "w-[10%]"
                        : "w-0";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{progress}%</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 ${widthClass}`} />
      </div>
    </div>
  );
}
