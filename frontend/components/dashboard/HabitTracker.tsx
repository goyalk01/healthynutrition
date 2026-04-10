"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function HabitTracker({
  name,
  progress,
}: {
  name: string;
  progress: number;
}) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-4 transition-all hover:bg-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-sm font-semibold tracking-tight">{name}</p>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-bold">{safeProgress}</span>
          <span className="text-xs font-medium text-muted-foreground">%</span>
        </div>
      </div>
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted/60 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${safeProgress}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
        />
      </div>
    </motion.div>
  );
}
