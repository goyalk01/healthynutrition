"use client";

import { motion } from "framer-motion";
import { Utensils } from "lucide-react";
import { MealCard } from "@/components/dashboard/MealCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageGridSkeleton } from "@/components/shared/PageGridSkeleton";
import { useMeals } from "@/features/meals/hooks/useMeals";

export default function MealsPage() {
  const mealsQuery = useMeals();

  if (mealsQuery.isError) {
    return (
      <ErrorState
        title="Meals unavailable"
        description="We couldn't load your meals right now."
        onRetry={() => {
          void mealsQuery.refetch();
        }}
      />
    );
  }

  if (mealsQuery.isLoading) {
    return <PageGridSkeleton columns="three" count={3} />;
  }

  if (!mealsQuery.data?.length) {
    return (
      <EmptyState
        icon={<Utensils size={20} />}
        title="No meals found"
        description="Add your first meal to start tracking nutrition trends."
      />
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
