"use client";

import { SkeletonCard } from "./SkeletonCard";

type PageGridSkeletonProps = {
  columns?: "two" | "three";
  count?: number;
};

export function PageGridSkeleton({
  columns = "three",
  count = 3,
}: PageGridSkeletonProps) {
  const className =
    columns === "two" ? "grid gap-4 md:grid-cols-2" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
