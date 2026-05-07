"use client";

import { Activity } from "lucide-react";
import { HabitTracker } from "@/components/dashboard/HabitTracker";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { UI_CONSTANTS } from "@/config/constants";
import { normalizeArray } from "@/shared/api/normalize";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { Habit } from "@/features/habits/types/habit.types";

export default function HabitsPage() {
  const habitsQuery = useHabits();
  const habits = normalizeArray<Habit>(habitsQuery.data);

  if (habitsQuery.isError) {
    return (
      <ErrorState
        title="Habits unavailable"
        description="We couldn't load your habits right now."
        onRetry={() => {
          void habitsQuery.refetch();
        }}
      />
    );
  }

  if (habitsQuery.isLoading) {
    return <SkeletonTable rows={5} />;
  }

  if (!habits.length) {
    return (
      <EmptyState
        icon={<Activity size={20} />}
        title="No habits tracked yet"
        description="Create daily habits to build consistency and unlock better recommendations."
      />
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitTracker
          key={habit.id}
          name={habit.name}
          progress={Math.min(100, habit.targetCount * UI_CONSTANTS.habitProgressPerTarget)}
        />
      ))}
    </div>
  );
}
