"use client";

import { motion } from "framer-motion";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { useRecommendations } from "@/hooks/useRecommendations";

export default function InsightsPage() {
  const recommendationsQuery = useRecommendations();

  if (recommendationsQuery.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!recommendationsQuery.data?.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        No insights generated yet. Trigger your first recommendation.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {recommendationsQuery.data.map((item) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="mb-2 inline-flex rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
            AI {item.type}
          </div>
          <h3 className="text-base font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        </motion.article>
      ))}
    </div>
  );
}
