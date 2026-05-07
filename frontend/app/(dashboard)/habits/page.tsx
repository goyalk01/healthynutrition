"use client";

import { Activity } from "lucide-react";
import { HabitTracker } from "@/components/dashboard/HabitTracker";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { UI_CONSTANTS } from "@/config/constants";
import { useHabits } from "@/features/habits/hooks/useHabits";

export default function HabitsPage() {
  const habitsQuery = useHabits();

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

  if (!habitsQuery.data?.length) {
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
      {habitsQuery.data.map((habit) => (
        <HabitTracker
          key={habit.id}
          name={habit.name}
          progress={Math.min(100, habit.targetCount * UI_CONSTANTS.habitProgressPerTarget)}
        />
      ))}
    </div>
  );
}
