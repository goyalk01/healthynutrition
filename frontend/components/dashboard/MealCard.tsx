"use client";

import { Meal } from "@/types/meal.types";
import { motion } from "framer-motion";
import { Utensils, Flame, Droplet, Wheat } from "lucide-react";

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md dark:shadow-none dark:hover:shadow-primary/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 mix-blend-overlay transition-opacity hover:opacity-100" />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
            {meal.mealType.replace("_", " ")}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{meal.name}</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Utensils size={18} />
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-2 text-sm font-medium text-muted-foreground">
        <Flame size={16} className="text-orange-500" />
        <span>{meal.calories} <span className="text-xs text-muted-foreground/70">kcal</span></span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/50 pt-4 text-xs">
        <div className="flex flex-col items-center justify-center rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
          <span className="mb-1 font-bold">P</span>
          <span>{meal.protein}g</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
          <span className="mb-1 font-bold">C</span>
          <span>{meal.carbs}g</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2">
          <span className="mb-1 font-bold">F</span>
          <span>{meal.fat}g</span>
        </div>
      </div>
    </motion.article>
  );
}
