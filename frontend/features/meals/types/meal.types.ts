export type MealType =
  | "BREAKFAST"
  | "LUNCH"
  | "DINNER"
  | "SNACK"
  | "PRE_WORKOUT"
  | "POST_WORKOUT";

export type Meal = {
  id: string;
  name: string;
  description?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  tags: string[];
  createdAt: string;
};
