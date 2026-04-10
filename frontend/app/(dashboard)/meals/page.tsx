"use client";

import { motion } from "framer-motion";
import { MealCard } from "@/components/dashboard/MealCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { useMeals } from "@/hooks/useMeals";

export default function MealsPage() {
  const mealsQuery = useMeals();

  if (mealsQuery.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!mealsQuery.data?.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        No meals found. Add your first meal to start tracking.
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {mealsQuery.data.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </motion.div>
  );
}
