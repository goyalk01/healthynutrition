"use client";

import { motion } from "framer-motion";
import { Activity, Flame, Utensils, Target } from "lucide-react";

type StatsGridProps = {
  calories: number;
  protein: number;
  mealCount: number;
  habitCount: number;
  isLoading?: boolean;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function StatsGrid({ calories, protein, mealCount, habitCount, isLoading }: StatsGridProps) {
  const items = [
    { label: "Calories", value: isLoading ? "—" : calories.toLocaleString(), icon: <Flame size={20} /> },
    { label: "Protein", value: isLoading ? "—" : `${protein}g`, icon: <Target size={20} /> },
    { label: "Meals Logged", value: isLoading ? "—" : String(mealCount), icon: <Utensils size={20} /> },
    { label: "Active Habits", value: isLoading ? "—" : String(habitCount), icon: <Activity size={20} /> },
  ];

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item) => (
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
        </motion.article>
      ))}
    </motion.section>
  );
}
