import { z } from "zod";

export const mealCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative().optional(),
  sugar: z.number().nonnegative().optional(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"]),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  isCustom: z.boolean().optional(),
});

export const mealUpdateSchema = mealCreateSchema.partial();

export const mealListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"]).optional(),
  tag: z.string().optional(),
});
