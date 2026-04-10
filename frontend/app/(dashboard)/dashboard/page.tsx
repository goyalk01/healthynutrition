"use client";

import { motion } from "framer-motion";
import { HabitTracker } from "@/components/dashboard/HabitTracker";
import { NutritionChart } from "@/components/dashboard/NutritionChart";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { useMeals } from "@/hooks/useMeals";

export default function DashboardPage() {
  const mealsQuery = useMeals();

  return (
    <div className="space-y-6">
      <StatsGrid />

      <div className="grid gap-6 xl:grid-cols-2">
        <NutritionChart protein={126} carbs={215} fat={68} />
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium">Habit Progress</p>
          <HabitTracker name="Water Intake" progress={78} />
          <HabitTracker name="Sleep 8h" progress={62} />
          <HabitTracker name="Movement" progress={84} />
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Meals</h2>
        {mealsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-sm text-muted-foreground">
              {mealsQuery.data?.length ? `${mealsQuery.data.length} meals loaded` : "No meals yet"}
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
}
