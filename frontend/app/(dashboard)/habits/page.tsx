"use client";

import { HabitTracker } from "@/components/dashboard/HabitTracker";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { useHabits } from "@/hooks/useHabits";

export default function HabitsPage() {
  const habitsQuery = useHabits();

  if (habitsQuery.isLoading) {
    return <SkeletonTable rows={5} />;
  }

  if (!habitsQuery.data?.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        No habits tracked yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {habitsQuery.data.map((habit) => (
        <HabitTracker key={habit.id} name={habit.name} progress={Math.min(100, habit.targetCount * 20)} />
      ))}
    </div>
  );
}
