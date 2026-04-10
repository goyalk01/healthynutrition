type StatItem = {
  label: string;
  value: string;
  change: string;
};

const ITEMS: StatItem[] = [
  { label: "Calories", value: "1,840", change: "+6%" },
  { label: "Protein", value: "128g", change: "+9%" },
  { label: "Water", value: "2.4L", change: "+11%" },
  { label: "Habit Streak", value: "12 days", change: "+1" },
];

export function StatsGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {ITEMS.map((item) => (
        <article key={item.label} className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          <p className="mt-1 text-xs text-emerald-500">{item.change}</p>
        </article>
      ))}
    </section>
  );
}
