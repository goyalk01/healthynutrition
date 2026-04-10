import { Meal } from "@/types/meal.types";

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{meal.mealType}</p>
      <h3 className="mt-2 text-base font-semibold">{meal.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{meal.calories} kcal</p>
      <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
        <span>P {meal.protein}g</span>
        <span>C {meal.carbs}g</span>
        <span>F {meal.fat}g</span>
      </div>
    </article>
  );
}
