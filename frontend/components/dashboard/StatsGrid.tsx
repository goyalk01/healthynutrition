"use client";

import { motion } from "framer-motion";
import { Activity, Flame, Droplets, Target } from "lucide-react";

type StatItem = {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
};

const ITEMS: StatItem[] = [
  { label: "Calories", value: "1,840", change: "+6%", icon: <Flame size={20} />, trend: "up" },
  { label: "Protein", value: "128g", change: "+9%", icon: <Target size={20} />, trend: "up" },
  { label: "Water", value: "2.4L", change: "+11%", icon: <Droplets size={20} />, trend: "up" },
  { label: "Habit Streak", value: "12 days", change: "+1", icon: <Activity size={20} />, trend: "neutral" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function StatsGrid() {
  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {ITEMS.map((item) => (
        <motion.article 
          key={item.label}
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card to-muted/20 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">{item.label}</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mix-blend-luminosity">
              {item.icon}
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <p className="text-3xl font-bold tracking-tight">{item.value}</p>
          </div>
          <div className="mt-2 text-xs">
            <span className="font-semibold text-emerald-500 dark:text-emerald-400">
              {item.change}
            </span>
            <span className="text-muted-foreground ml-1">vs last week</span>
          </div>
        </motion.article>
      ))}
    </motion.section>
  );
}
