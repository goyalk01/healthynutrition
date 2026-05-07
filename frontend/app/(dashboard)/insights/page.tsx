"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageGridSkeleton } from "@/components/shared/PageGridSkeleton";
import { useRecommendations } from "@/features/recommendations/hooks/useRecommendations";

export default function InsightsPage() {
  const recommendationsQuery = useRecommendations();

  if (recommendationsQuery.isError) {
    return (
      <ErrorState
        title="Insights unavailable"
        description="We couldn't load recommendations right now."
        onRetry={() => {
          void recommendationsQuery.refetch();
        }}
      />
    );
  }

  if (recommendationsQuery.isLoading) {
    return <PageGridSkeleton columns="two" count={2} />;
  }

  if (!recommendationsQuery.data?.length) {
    return (
      <EmptyState
        icon={<Brain size={20} />}
        title="No insights generated yet"
        description="Generate recommendations to see explainable nutrition insights."
      />
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
