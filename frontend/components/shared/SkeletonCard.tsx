"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  const lineWidths = ["w-full", "w-[92%]", "w-[84%]", "w-[76%]", "w-[68%]"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={cn("rounded-xl border border-border bg-card p-5", className)}
    >
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-3 w-28 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className={cn("h-3 animate-pulse rounded bg-muted", lineWidths[index] || "w-2/3")} />
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
      </div>
    </motion.div>
  );
}
