"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Utensils } from "lucide-react";
import { HabitTracker } from "@/components/dashboard/HabitTracker";
import { NutritionChart } from "@/components/dashboard/NutritionChart";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { MealCard } from "@/components/dashboard/MealCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageGridSkeleton } from "@/components/shared/PageGridSkeleton";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { UI_CONSTANTS } from "@/config/constants";
import { useMeals } from "@/features/meals/hooks/useMeals";
import { useHabits } from "@/features/habits/hooks/useHabits";

export default function DashboardPage() {
  const mealsQuery = useMeals();
  const habitsQuery = useHabits();

  const macros = useMemo(() => {
    if (!mealsQuery.data?.length) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    return mealsQuery.data.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [mealsQuery.data]);

  const activeHabits = habitsQuery.data?.filter((h) => h.isActive) ?? [];

  if (mealsQuery.isError || habitsQuery.isError) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        description="We couldn't load dashboard data right now."
        onRetry={() => {
          void Promise.all([mealsQuery.refetch(), habitsQuery.refetch()]);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <StatsGrid
        calories={Math.round(macros.calories)}
        protein={Math.round(macros.protein)}
        mealCount={mealsQuery.data?.length ?? 0}
        habitCount={activeHabits.length}
        isLoading={mealsQuery.isLoading || habitsQuery.isLoading}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {macros.protein + macros.carbs + macros.fat > 0 ? (
          <NutritionChart
            protein={Math.round(macros.protein)}
            carbs={Math.round(macros.carbs)}
            fat={Math.round(macros.fat)}
          />
        ) : (
          <EmptyState
            icon={<Utensils size={20} />}
            title="Macro breakdown not available"
            description="Log a few meals to unlock your nutrition chart."
          />
        )}

        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium">Habit Progress</p>
          {habitsQuery.isLoading ? (
            <SkeletonCard lines={2} />
          ) : activeHabits.length > 0 ? (
            activeHabits.slice(0, UI_CONSTANTS.dashboardHabitPreviewLimit).map((habit) => (
              <HabitTracker
                key={habit.id}
                name={habit.name}
                progress={Math.min(100, habit.targetCount * UI_CONSTANTS.habitProgressPerTarget)}
              />
            ))
          ) : (
            <EmptyState
              icon={<Activity size={18} />}
              title="No active habits"
              description="Activate at least one habit to view progress here."
            />
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Meals</h2>
        {mealsQuery.isLoading ? (
          <PageGridSkeleton columns="three" count={3} />
        ) : mealsQuery.data?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {mealsQuery.data.slice(0, UI_CONSTANTS.recentMealPreviewLimit).map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={<Utensils size={20} />}
            title="No meals yet"
            description="Add your first meal to start tracking daily progress."
          />
        )}
      </section>
    </div>
  );
}
